import { describe, expect, it } from "vitest";
import { geohashBounds, geohashCenter, geohashEncode, haversineKm } from "../src/engine/geo.ts";
import { toSearchParams } from "../src/engine/qloo/client.ts";
import { heatCellsOf, toLocality, toPlace, toTaste } from "../src/engine/qloo/normalize.ts";
import { buildScore, crowdRelief, proximity } from "../src/engine/scoring.ts";
import { seasonInfo, seasonScore } from "../src/engine/season.ts";
import { matchScore } from "../src/engine/text.ts";
import { percentile } from "../src/shared/format.ts";
import type { Locality } from "../src/shared/types.ts";

describe("normalize", () => {
	it("reads the flattened place shape from the schema docs", () => {
		const place = toPlace({
			entity_id: "477972BC-8855-4C3D-87D0-6A56CB03B56E",
			name: "Brooklyn Bridge Park",
			url: "https://images.qloo.com/i/477972BC-420x-auto.jpg",
			city: "New York",
			lat: 40.7022422,
			lon: -73.9958601,
			business_rating: 4.8,
			popularity: 0.9999,
			affinity: 0.9279,
			tags: [{ id: "urn:tag:category:place:park", name: "Park", type: "urn:tag:category:place" }],
		});
		expect(place).toMatchObject({ name: "Brooklyn Bridge Park", city: "New York", rating: 4.8, affinity: 0.9279, popularity: 0.9999 });
		expect(place?.imageUrl).toContain("images.qloo.com");
		expect(place?.categories).toEqual(["Park"]);
	});

	it("reads the nested shape (query.affinity, location, properties)", () => {
		const place = toPlace({
			entity_id: "X",
			name: "Nested Place",
			location: { lat: 1.5, lon: 2.5 },
			query: { affinity: 0.81 },
			properties: { business_rating: 4.1, image: { url: "https://example.com/a.jpg" }, geocode: { country_code: "JP" } },
			tags: [{ tag_id: "urn:tag:genre:place:tourist_attraction", name: "Tourist Attraction", type: "urn:tag:genre:place" }],
		});
		expect(place).toMatchObject({ lat: 1.5, lon: 2.5, affinity: 0.81, rating: 4.1, countryCode: "JP" });
		expect(place?.imageUrl).toBe("https://example.com/a.jpg");
		expect(place?.tags[0]?.id).toBe("urn:tag:genre:place:tourist_attraction");
	});

	it("derives locality country from the disambiguation path", () => {
		const locality = toLocality({
			entity_id: "L",
			name: "New York City",
			place: "city",
			lat: 40.66,
			lon: -73.94,
			popularity: 0.9996,
			disambiguation: "New York, New York, United States of America",
			tags: [],
		});
		expect(locality).toMatchObject({ country: "United States of America", placeType: "city" });
	});

	it("maps taste subtypes and years", () => {
		expect(toTaste({ entity_id: "T", name: "Spirited Away", subtype: "urn:entity:movie", properties: { release_year: 2001 } })).toMatchObject({
			kind: "movie",
			subtitle: "2001",
		});
	});

	it("reads heatmap cells", () => {
		const cells = heatCellsOf({
			results: { heatmap: [{ location: { latitude: 40.74, longitude: -73.98, geohash: "dr5ru2" }, query: { affinity: 0.4, popularity: 0.2 } }] },
		});
		expect(cells).toEqual([{ geohash: "dr5ru2", lat: 40.74, lon: -73.98, affinity: 0.4, popularity: 0.2 }]);
	});
});

describe("client", () => {
	it("builds deterministic query strings", () => {
		const params = toSearchParams({ take: 5, "filter.type": "urn:entity:place", empty: "", list: ["a", "b"], none: undefined, skip: [] });
		expect(params.toString()).toBe("filter.type=urn%3Aentity%3Aplace&list=a%2Cb&take=5");
	});
});

describe("scoring", () => {
	it("measures crowd relief on tail shares", () => {
		expect(crowdRelief(0.995, 0.62)).toBeCloseTo(Math.log10(0.38 / 0.005) / 2, 5);
		expect(crowdRelief(0.9, 0.95)).toBe(0);
		expect(crowdRelief(undefined, 0.5)).toBeUndefined();
	});

	it("renormalizes weights over available components", () => {
		const score = buildScore("city", {
			soul: { value: 0.9, source: "s" },
			taste: { value: undefined, source: "t" },
			crowd: { value: 0.6, source: "c" },
			proximity: { value: 1, source: "p" },
		});
		expect(score.components.map((c) => c.key)).toEqual(["soul", "crowd", "proximity"]);
		expect(score.components.reduce((sum, c) => sum + c.weight, 0)).toBeCloseTo(1, 6);
		expect(score.total).toBeCloseTo((0.4 * 0.9 + 0.25 * 0.6 + 0.05 * 1) / 0.7, 2);
	});

	it("scales proximity", () => {
		expect(proximity(0, 15)).toBe(1);
		expect(proximity(30, 15)).toBe(0);
	});
});

describe("season", () => {
	const locality: Locality = {
		id: "K",
		name: "Kyoto",
		lat: 35,
		lon: 135.7,
		tags: [
			{ id: "urn:tag:peak_tourism_month:qloo:april", name: "April", type: "urn:tag:peak_tourism_month:qloo" },
			{ id: "urn:tag:best_month_for_travel:qloo:may", name: "May", type: "urn:tag:best_month_for_travel:qloo" },
			{ id: "urn:tag:april_event:qloo:miyako_odori", name: "Miyako Odori", type: "urn:tag:april_event:qloo" },
		],
	};

	it("reads month tags", () => {
		const april = seasonInfo(locality, 4);
		expect(april).toMatchObject({ isPeak: true, isBestMonth: false, events: ["Miyako Odori"], peakMonths: [4], bestMonths: [5] });
		expect(seasonScore(april)).toBeLessThan(seasonScore(seasonInfo(locality, 5)) ?? 0);
		expect(seasonScore(seasonInfo(locality, undefined))).toBeUndefined();
	});
});

describe("geo and text", () => {
	it("round-trips geohashes", () => {
		const hash = geohashEncode(40.742306, -74.003494, 7);
		const b = geohashBounds(hash);
		expect(40.742306).toBeGreaterThanOrEqual(b.minLat);
		expect(40.742306).toBeLessThanOrEqual(b.maxLat);
		expect(haversineKm(geohashCenter(hash), { lat: 40.742306, lon: -74.003494 })).toBeLessThan(0.2);
	});

	it("matches names fuzzily", () => {
		expect(matchScore("Sacre Coeur", "Sacré-Cœur Basilica")).toBeGreaterThanOrEqual(0.8);
		expect(matchScore("St Mark's Square", "St. Mark's Square")).toBe(1);
		expect(matchScore("Fushimi Inari", "Kinkaku-ji")).toBe(0);
	});

	it("formats percentiles", () => {
		expect(percentile(0.995)).toBe("99.5th");
		expect(percentile(0.62)).toBe("62nd");
		expect(percentile(0.11)).toBe("11th");
	});
});
