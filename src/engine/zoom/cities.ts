/** Levels 3 and 4 — a twin city in the same country, or beyond its borders. */
import { km, monthName, percentile } from "../../shared/format.ts";
import type { CityTwin, Locality, Place, SeasonInfo, ZoomResult } from "../../shared/types.ts";
import { haversineKm } from "../geo.ts";
import { PLACE_TAG, wktCircles, type QlooApi } from "../qloo/endpoints.ts";
import { buildScore, crowdRelief, mean } from "../scoring.ts";
import { seasonInfo, seasonScore } from "../season.ts";
import { matchScore, normalizeName } from "../text.ts";
import { sharedTraits, traitNames } from "../traits.ts";
import { DAY_TRIP_RADIUS_KM } from "./region.ts";
import { tasteSignals, type ZoomContext } from "./shared.ts";

/** Below this distance a candidate is part of the hotspot's own metro area (covered by day trips). */
const SAME_METRO_KM = 40;
const SMALL_COMMUNITY = 20_000;
/** Villages are day trips, not twin cities. */
const MIN_TWIN_POPULATION = 5_000;

function sameCountry(a: Locality, b: Locality): boolean {
	if (a.countryCode && b.countryCode) return a.countryCode.toUpperCase() === b.countryCode.toUpperCase();
	return normalizeName(a.country ?? "") === normalizeName(b.country ?? "");
}

function isCityLike(locality: Locality): boolean {
	return !locality.placeType || !/neighbou?rhood|suburb|district/.test(locality.placeType);
}

/** Jaccard overlap of character traits, used when a candidate has no Qloo affinity (agent-proposed). */
function traitOverlap(a: Locality, b: Locality): number | undefined {
	const left = new Set(traitNames(a.tags).map((t) => t.toLowerCase()));
	const right = new Set(traitNames(b.tags).map((t) => t.toLowerCase()));
	if (left.size === 0 || right.size === 0) return undefined;
	let shared = 0;
	for (const trait of left) if (right.has(trait)) shared++;
	return shared / (left.size + right.size - shared);
}

const CITY_RADIUS_KM = 10;

/**
 * Taste fit for every candidate city in ONE query, so affinities are comparable
 * across cities (Qloo scores are relative to each query). The query covers all
 * candidates with a MULTIPOLYGON and caps results per city with diversify.by.
 */
async function placesByCity(
	api: QlooApi,
	cities: Locality[],
	signals: { signalIds: string[]; signalTagIds?: string[] },
): Promise<Map<string, Place[]>> {
	const byCity = new Map<string, Place[]>(cities.map((city) => [city.id, []]));
	if (cities.length === 0) return byCity;
	const places = await api
		.places(
			{
				...signals,
				location: wktCircles(cities.map((c) => ({ lat: c.lat, lon: c.lon, radiusKm: CITY_RADIUS_KM }))),
				excludeTagIds: [PLACE_TAG.hotel],
				diversifyBy: "properties.geocode.city",
				diversifyTake: 5,
				take: 50,
			},
			"Score every candidate city against your taste in one query",
		)
		.catch(() => [] as Place[]);
	for (const place of places) {
		let nearest: Locality | undefined;
		let best = Number.POSITIVE_INFINITY;
		for (const city of cities) {
			const d = haversineKm(place, city);
			if (d < best) {
				best = d;
				nearest = city;
			}
		}
		if (nearest && best <= CITY_RADIUS_KM * 1.5) byCity.get(nearest.id)?.push(place);
	}
	return byCity;
}

function seasonSource(info: SeasonInfo): string {
	if (info.month === undefined) return "No travel month given";
	const month = monthName(info.month);
	if (info.isPeak) return `${month} is a peak tourism month here (Qloo month tags)`;
	if (info.isBestMonth) return `${month} is one of the best months to visit (Qloo month tags)`;
	if (info.isOffSeason) return `${month} is off-season here (Qloo month tags)`;
	return `${month} is a shoulder month here (Qloo month tags)`;
}

export async function findCityTwins(
	ctx: ZoomContext,
	level: "country" | "world",
	options: { extraCandidates?: string[]; lovedLocalityIds?: string[]; maxResults?: number } = {},
): Promise<Extract<ZoomResult, { level: "country" | "world" }>> {
	const { api, hotspot, month } = ctx;
	const home = hotspot.locality;

	const passes = (candidate: Locality) => {
		const distanceKm = haversineKm(candidate, home);
		const population = candidate.population ?? Number.POSITIVE_INFINITY;
		return (
			candidate.id !== home.id &&
			isCityLike(candidate) &&
			population >= MIN_TWIN_POPULATION &&
			distanceKm >= SAME_METRO_KM &&
			// A small community within day-trip range is a day trip, not a twin city.
			!(distanceKm < DAY_TRIP_RADIUS_KM && population < SMALL_COMMUNITY) &&
			(level === "country" ? sameCountry(candidate, home) : !sameCountry(candidate, home))
		);
	};

	const similar = await api.similarLocalities({ signalIds: [home.id, ...(options.lovedLocalityIds ?? [])], take: 50 });
	const shortlist: { locality: Locality; origin: "qloo" | "agent" }[] = similar
		.filter(passes)
		.sort((a, b) => (b.affinity ?? 0) - (a.affinity ?? 0))
		.slice(0, 7)
		.map((locality) => ({ locality, origin: "qloo" }));

	for (const name of options.extraCandidates ?? []) {
		const found = await api.searchLocalities(name, 3).catch(() => []);
		const match = found.find((l) => matchScore(name, l.name) >= 0.8);
		if (match && passes(match) && !shortlist.some((s) => s.locality.id === match.id)) {
			shortlist.push({ locality: match, origin: "agent" });
		}
	}

	const { signalIds, signalTagIds } = tasteSignals(hotspot);
	const hasTaste = signalIds.length + signalTagIds.length > 0;
	const cityPlaces = await placesByCity(
		api,
		shortlist.map((s) => s.locality),
		hasTaste ? { signalIds, signalTagIds } : { signalIds: [home.id] },
	);

	const items: CityTwin[] = await Promise.all(
		shortlist.map(async ({ locality, origin }) => {
			const details =
				locality.tags.length > 0 ? locality : ((await api.localityDetails(locality.id).catch(() => undefined)) ?? locality);
			const city = { ...locality, ...details, affinity: locality.affinity };
			const places = (cityPlaces.get(city.id) ?? []).sort((a, b) => (b.affinity ?? 0) - (a.affinity ?? 0));
			const season = seasonInfo(city, month);
			const score = buildScore(level, {
				soul: {
					value: city.affinity ?? traitOverlap(home, city),
					source:
						city.affinity !== undefined
							? `Qloo locality affinity to ${home.name}`
							: `Shared character traits with ${home.name} (proposed by the agent)`,
				},
				taste: {
					value: hasTaste && places.length > 0 ? mean(places.slice(0, 5).map((p) => p.affinity ?? Number.NaN)) : undefined,
					source: `Mean Qloo affinity of ${city.name}'s top places to your favorites`,
				},
				crowd: {
					value: crowdRelief(home.popularity, city.popularity),
					source: `Popularity ${percentile(home.popularity)} → ${percentile(city.popularity)} percentile`,
				},
				season: { value: seasonScore(season), source: seasonSource(season) },
			});
			return {
				id: `city:${city.id}`,
				city,
				score,
				distanceKm: haversineKm(home, city),
				sharedTraits: sharedTraits(home.tags, city.tags),
				season,
				highlights: places.slice(0, 4),
				smallCommunity: (city.population ?? Number.POSITIVE_INFINITY) < SMALL_COMMUNITY,
				origin,
			};
		}),
	);

	items.sort((a, b) => b.score.total - a.score.total);
	const top = items.slice(0, options.maxResults ?? 3);

	// Fill in shared traits from Qloo's compare endpoint where tags alone found too few.
	await Promise.all(
		top.map(async (item) => {
			if (item.sharedTraits.length >= 2) return;
			const traits = await api.compare([home.id], [item.city.id], 6).catch(() => []);
			item.sharedTraits = [...new Set([...item.sharedTraits, ...traits])].slice(0, 4);
		}),
	);

	const where = level === "country" ? `elsewhere in ${home.country ?? "the country"}` : "beyond the border";
	return {
		level,
		items: top,
		note: top.length === 0 ? `No twin cities found ${where}.` : `${top.length} cities ${where}, at least ${km(SAME_METRO_KM)} away.`,
	};
}
