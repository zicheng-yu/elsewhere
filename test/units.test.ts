import { afterEach, describe, expect, it, vi } from "vitest";
import { geohashBounds, geohashCenter, geohashEncode, haversineKm } from "../src/engine/geo.ts";
import { LiveTransport, QlooClient, QlooError, toSearchParams } from "../src/engine/qloo/client.ts";
import { compareTraitsOf, heatCellsOf, invalidSignalsOf, toLocality, toPlace, toTaste } from "../src/engine/qloo/normalize.ts";
import { slimResponse } from "../src/engine/qloo/slim.ts";
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

describe("real response shapes", () => {
	it("trims bulky fields but keeps what the engine reads", () => {
		const tag = (id: string, name: string) => ({ tag_id: id, name, type: id.split(":").slice(0, -1).join(":"), value: id });
		// Character tags count against the cap; season and category tags must survive it.
		const filler = Array.from({ length: 60 }, (_, i) => tag(`urn:tag:ambience:qloo:mood_${i}`, `Mood ${i}`));
		const slim = slimResponse({
			success: true,
			results: {
				entities: [
					{
						entity_id: "L1",
						name: "京都市",
						popularity: 0.99,
						location: { lat: 35, lon: 135.7 },
						properties: {
							boundaries: "POLYGON((0 0, 1 1, 1 0, 0 0))".repeat(1000),
							akas: [
								{ language: "ja", value: "京都市" },
								{ language: "sv", value: "Kyoto" },
							],
							ancestors: [{ entity_id: "C1", name: "日本", place: "country", admin_level: 2 }],
							place: "city",
						},
						tags: [
							...filler,
							tag("urn:tag:category:place:shinto_shrine", "Shinto shrine"),
							tag("urn:tag:peak_tourism_month:qloo:april", "April"),
							tag("urn:tag:off_season_month:qloo:january", "January"),
							tag("urn:tag:april_event:qloo:hanami", "Hanami"),
						],
					},
				],
			},
		}) as { results: { entities: Record<string, unknown>[] } };
		const entity = slim.results.entities[0] ?? {};
		expect(JSON.stringify(entity)).not.toContain("POLYGON");
		const tags = entity.tags as { id: string }[];
		// Category and season tags survive the cap on other tag families.
		expect(tags.map((t) => t.id)).toContain("urn:tag:category:place:shinto_shrine");
		expect(tags.map((t) => t.id)).toContain("urn:tag:peak_tourism_month:qloo:april");
		expect(tags.map((t) => t.id)).toContain("urn:tag:off_season_month:qloo:january");
		expect(tags.map((t) => t.id)).toContain("urn:tag:april_event:qloo:hanami");
		expect(tags.length).toBeLessThan(20);
		const locality = toLocality(entity);
		expect(locality?.name).toBe("Kyoto");
		expect(locality?.country).toBe("日本");
		expect(locality?.placeType).toBe("city");
	});

	it("cleans destination names and reads geocodes", () => {
		const destination = toLocality({
			entity_id: "D1",
			name: "Nagoya-shi",
			subtype: "urn:entity:destination",
			location: { lat: 35.18, lon: 136.9 },
			popularity: 0.46,
			properties: { geocode: { name: "Nagoya", country_code: "jp" } },
		});
		expect(destination).toMatchObject({ kind: "destination", name: "Nagoya", countryCode: "JP" });
		expect(toLocality({ entity_id: "D2", name: "Busan 釜山", types: ["urn:entity:destination"], location: { lat: 35.1, lon: 129 } })?.name).toBe("Busan");
	});

	it("keeps character traits from compare and drops transport and demographics", () => {
		const traits = compareTraitsOf({
			results: {
				entities: [
					{ tag_id: "urn:tag:transport:qloo:buses", name: "Buses", subtype: "urn:tag:transport:qloo", query: { score: 0.9 } },
					{ tag_id: "urn:tag:characteristic:qloo:historic", name: "Historic", subtype: "urn:tag:characteristic:qloo", query: { score: 0.7 } },
					{ tag_id: "urn:tag:demographic_characteristic:qloo:middle_class", name: "Middle-Class", subtype: "urn:tag:demographic_characteristic:qloo", query: { score: 0.8 } },
					{ tag_id: "urn:tag:scenery:qloo:rivers", name: "Rivers", subtype: "urn:tag:scenery:qloo", query: { score: 0.6 } },
				],
			},
		});
		expect(traits).toEqual(["Historic", "Rivers"]);
	});

	it("reports signals Qloo did not recognize", () => {
		expect(invalidSignalsOf({ warnings: [{ type: "not_found", "signal.interests.entities": ["X1"] }] })).toEqual(["X1"]);
		expect(invalidSignalsOf({ results: {} })).toEqual([]);
	});
});

describe("client", () => {
	afterEach(() => vi.unstubAllGlobals());

	it("stops fetching once the run's subrequest budget is spent, and shares identical requests in flight", async () => {
		const fetchSpy = vi.fn(async () => new Response(JSON.stringify({ results: [] }), { headers: { "Content-Type": "application/json" } }));
		vi.stubGlobal("fetch", fetchSpy);
		const client = new QlooClient({ transport: new LiveTransport({ apiKey: "k", maxFetches: 2 }) });
		await Promise.all([client.get("/search", { query: "a" }), client.get("/search", { query: "a" })]);
		expect(fetchSpy).toHaveBeenCalledTimes(1);
		await client.get("/search", { query: "b" });
		await expect(client.get("/search", { query: "c" })).rejects.toMatchObject({ kind: "budget" });
		expect(fetchSpy).toHaveBeenCalledTimes(2);
		expect(QlooError).toBeDefined();
	});

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
			{ id: "urn:tag:april_event_type:qloo:cultural", name: "Cultural", type: "urn:tag:april_event_type:qloo" },
			{ id: "urn:tag:april_travel_advisory:qloo:allergy_season", name: "Allergy Season", type: "urn:tag:april_travel_advisory:qloo" },
			{ id: "urn:tag:worst_month_for_travel:qloo:august", name: "August", type: "urn:tag:worst_month_for_travel:qloo" },
		],
	};

	it("reads month, event and advisory tags", () => {
		const april = seasonInfo(locality, 4);
		// Event types ("Cultural") are categories, not events.
		expect(april).toMatchObject({ isPeak: true, isBestMonth: false, events: ["Miyako Odori"], advisories: ["Allergy Season"], peakMonths: [4], bestMonths: [5], worstMonths: [8] });
		expect(april.calendar?.[3]?.events).toEqual(["Miyako Odori"]);
		expect(seasonInfo(locality, 8).isWorstMonth).toBe(true);
		expect(seasonScore(april)).toBeLessThan(seasonScore(seasonInfo(locality, 5)) ?? 0);
		expect(seasonScore(seasonInfo(locality, undefined))).toBeUndefined();
		expect(seasonInfo(undefined, 4)).toMatchObject({ peakMonths: [], calendar: undefined });
	});
});

describe("name matching", () => {
	it("forgives small typos but not different places", () => {
		expect(matchScore("Kyto", "Kyoto")).toBeGreaterThanOrEqual(0.5);
		expect(matchScore("Barcelonna", "Barcelona")).toBeGreaterThanOrEqual(0.5);
		expect(matchScore("Paris", "Parma")).toBeLessThan(0.5);
		expect(matchScore("Rome", "Rouen")).toBeLessThan(0.5);
		expect(matchScore("Fushimi Inari", "Fushimi Inari Taisha")).toBe(0.9);
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
