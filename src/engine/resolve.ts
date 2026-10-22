import type { Hotspot, Locality, Place, SearchArea, TagRef, TasteEntity, TripRequest } from "../shared/types.ts";
import { haversineKm } from "./geo.ts";
import { isSight, twinCategories, type QlooApi } from "./qloo/endpoints.ts";
import { seasonInfo } from "./season.ts";
import { matchScore } from "./text.ts";

export class ResolveError extends Error {
	readonly suggestions: string[];

	constructor(message: string, suggestions: string[] = []) {
		super(message);
		this.name = "ResolveError";
		this.suggestions = suggestions;
	}
}

function best<T extends { name: string }>(query: string, items: T[], minScore: number, tieBreak: (item: T) => number): T | undefined {
	return items
		.map((item) => ({ item, score: matchScore(query, item.name) }))
		.filter(({ score }) => score >= minScore)
		.sort((a, b) => b.score - a.score || tieBreak(b.item) - tieBreak(a.item))[0]?.item;
}

export async function settle<T>(task: Promise<T>): Promise<T | undefined> {
	try {
		return await task;
	} catch {
		return undefined;
	}
}

/** Locality types that can't be the destination's city. Many cities carry no type at all. */
const NOT_A_CITY = new Set(["country", "state", "province", "region", "county", "district", "neighbourhood", "neighborhood", "suburb", "quarter", "island", "continent"]);
const isCityLike = (l: Locality) => !NOT_A_CITY.has(l.placeType ?? "");
/** A must-see is crowded by definition; entities below this are stubs or mislabeled. */
const MIN_SPOT_POPULARITY = 0.5;

/**
 * English names Qloo files under the local name: searching "Venice" finds only
 * the American Venices, "Venezia" finds Venice, Italy.
 */
const EXONYMS: Record<string, string> = {
	venice: "Venezia",
	florence: "Firenze",
	naples: "Napoli",
	milan: "Milano",
	turin: "Torino",
	genoa: "Genova",
	munich: "München",
	cologne: "Köln",
	vienna: "Wien",
	prague: "Praha",
	seville: "Sevilla",
	bruges: "Brugge",
	copenhagen: "København",
};
/** Search radius around a destination with no locality boundary. */
const DEFAULT_RADIUS_KM = 10;
/** A small town with few famous sights inside the circle gets a wider one (Interlaken → Lauterbrunnen). */
const MIN_SIGHTS_IN_LOCALITY = 8;
const WIDE_RADIUS_KM = 15;

function median(values: number[]): number | undefined {
	if (values.length === 0) return undefined;
	const sorted = [...values].sort((a, b) => a - b);
	return sorted[Math.floor(sorted.length / 2)];
}

/** The locality that is this destination's city: city-like, close by, and best by name. */
function pickLocality(query: string, localities: Locality[], destination: Locality | undefined): Locality | undefined {
	return localities
		.filter((l) => isCityLike(l) && (destination ? haversineKm(l, destination) <= 40 : matchScore(query, l.name) >= 0.6))
		.map((l) => ({ l, score: matchScore(query, l.name), km: destination ? haversineKm(l, destination) : 0 }))
		.sort((a, b) => b.score - a.score || a.km - b.km)[0]?.l;
}

export interface ResolvedDestination {
	/** English name, country and destination-level popularity when Qloo has a destination entity. */
	home: Locality;
	destinationId?: string;
	/**
	 * The city's administrative locality, which carries the month tags. Its search
	 * is slow (boundary polygons), so it resolves in the background when a
	 * destination entity already answers the question.
	 */
	locality: Promise<Locality | undefined>;
}

/** Find the destination: Qloo's destination entity, plus the city locality for seasons. */
export async function resolveDestination(api: QlooApi, destination: string): Promise<ResolvedDestination> {
	// "Lisbon, Portugal" and "Lisbon Portugal" fall back to the city part when the whole query misses.
	const attempts = [destination, destination.split(",")[0], destination.replace(/\s+\S+$/, "")]
		.map((query) => query?.trim() ?? "")
		.filter((query, index, all) => query.length >= 2 && all.indexOf(query) === index);
	const seen: string[] = [];
	for (const query of attempts) {
		const exonym = EXONYMS[query.toLowerCase()];
		// The locality search is slow; start it now, with the city part only ("Kyoto, Japan" → "Kyoto").
		const cityName = (exonym ?? query.split(",")[0] ?? query).trim();
		const localitySearch = settle(api.searchLocalities(cityName, 3)).then((list) => list ?? []);
		const [destinations, local] = await Promise.all([
			settle(api.searchDestinations(query, 5)),
			exonym ? settle(api.searchDestinations(exonym, 3)) : Promise.resolve(undefined),
		]);
		// A hit under the local name counts as an exact match for the English one.
		const viaExonym = exonym ? (local ?? []).filter((d) => matchScore(exonym, d.name) >= 0.9).map((d) => ({ ...d, name: titleCase(query) })) : [];
		const found = best(query, [...viaExonym, ...(destinations ?? [])], 0.6, (d) => d.popularity ?? 0);
		seen.push(...(destinations ?? []).map((d) => d.name));
		if (found) {
			return { home: { ...found, kind: "destination" }, destinationId: found.id, locality: localitySearch.then((list) => pickLocality(cityName, list, found)) };
		}
		// No destination entity: the locality is all there is, so wait for it.
		const localities = await localitySearch;
		seen.push(...localities.filter(isCityLike).map((l) => l.name));
		const locality = pickLocality(cityName, localities, undefined);
		if (!locality) continue;
		const name = matchScore(query, locality.name) >= 0.8 ? locality.name : titleCase(query);
		return { home: { ...locality, name }, locality: Promise.resolve(locality) };
	}
	throw new ResolveError(`Couldn't find "${destination}" as a destination in Qloo.`, [...new Set(seen)].slice(0, 3));
}

function titleCase(text: string): string {
	return text.replace(/\b\p{L}/gu, (c) => c.toUpperCase());
}

function sharesCategory(a: Place, b: Place): boolean {
	const categories = new Set(twinCategories(a));
	return twinCategories(b).some((id) => categories.has(id));
}

/**
 * A must-see as an entity insights accepts. Search sometimes returns a stub
 * without popularity that insights rejects as a signal; then the nearest
 * popular sight of the same kind stands in (Fushimi Inari Taisha → its
 * Senbon Torii gates).
 */
async function resolveSpot(api: QlooApi, name: string, sights: Place[], near: { lat: number; lon: number }): Promise<Place | undefined> {
	const listed = best(name, sights, 0.75, (p) => p.popularity ?? 0);
	if (listed) return listed;
	// Same-name restaurants, hotels and subway stations are not the sight the traveler meant.
	const found = ((await settle(api.searchPlaces(name, { ...near, radiusMiles: 25 }, 6))) ?? []).filter(isSight);
	const valid = best(name, found.filter((p) => (p.popularity ?? 0) >= MIN_SPOT_POPULARITY), 0.6, (p) => p.popularity ?? 0);
	if (valid) return valid;
	const stub = best(name, found, 0.6, () => 0);
	if (!stub) return undefined;
	const listedNearby = sights.filter((s) => haversineKm(s, stub) <= 0.8 && sharesCategory(s, stub));
	const nearby =
		listedNearby.length > 0
			? listedNearby
			: ((await settle(api.places({ area: { lat: stub.lat, lon: stub.lon, radiusKm: 0.8 }, tagIds: twinCategories(stub), take: 5 }, `Find ${name} in Qloo's graph`))) ?? []).filter(
					(s) => (s.popularity ?? 0) >= MIN_SPOT_POPULARITY && isSight(s) && sharesCategory(s, stub),
				);
	const standIn = nearby.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))[0];
	return standIn ? { ...standIn, requestedAs: name } : undefined;
}

/** Resolve a trip request into a hotspot: the destination, its crowded spots, its seasons and the traveler's taste. */
export async function resolveTrip(api: QlooApi, request: TripRequest): Promise<Hotspot> {
	const { home, destinationId, locality } = await resolveDestination(api, request.destination);
	// A circle around the destination: no wait for the locality's boundary, and a resort town's
	// sights just outside its border still count.
	const area: SearchArea = { lat: home.lat, lon: home.lon, radiusKm: DEFAULT_RADIUS_KM };
	const unresolved: string[] = [];
	const sightsReady = settle(api.topSights(area, 30)).then(async (list) => {
		if ((list?.length ?? 0) >= MIN_SIGHTS_IN_LOCALITY) return list ?? [];
		area.radiusKm = WIDE_RADIUS_KM;
		return (await settle(api.topSights(area, 30))) ?? list ?? [];
	});
	// Seasons come from the locality, scored against a related signal (never itself).
	const profile = locality.then(async (city) => {
		const signal = destinationId ?? (await sightsReady)[0]?.id;
		return city && signal ? settle(api.localityProfile(city.id, signal)) : undefined;
	});
	const [sights, favorites, vibes] = await Promise.all([
		sightsReady,
		Promise.all(
			request.favorites.map(async (name) => {
				const found = await settle(api.searchTaste(name, 4));
				const match = found && best(name, found, 0.5, () => 0);
				if (!match) unresolved.push(name);
				return match;
			}),
		),
		Promise.all(
			request.vibes.map(async (word) => {
				const tag = (await settle(api.searchTags(word, 2)))?.[0];
				if (!tag) unresolved.push(word);
				return tag;
			}),
		),
	]);

	// Popular sights cluster downtown; a locality's centroid can sit in the hills.
	const center = sights.length >= 3 ? { lat: median(sights.slice(0, 15).map((s) => s.lat)) ?? home.lat, lon: median(sights.slice(0, 15).map((s) => s.lon)) ?? home.lon } : home;
	area.lat = center.lat;
	area.lon = center.lon;

	const [spots, cityProfile] = await Promise.all([
		Promise.all(
			request.mustSees.map(async (name) => {
				const spot = await resolveSpot(api, name, sights, center);
				if (!spot) unresolved.push(name);
				return spot;
			}),
		),
		profile,
	]);

	const crowdedSpots: Place[] = uniqueById(spots.filter((s): s is Place => s !== undefined));
	for (const sight of sights) {
		if (crowdedSpots.length >= 3 || (crowdedSpots.length >= 2 && request.mustSees.length > 0)) break;
		if (!crowdedSpots.some((s) => s.id === sight.id)) crowdedSpots.push(sight);
	}

	// Destination search results name the country but carry no ISO code; the city's own sights have both.
	const reference = sights.find((s) => s.countryCode);
	return {
		locality: {
			...home,
			lat: center.lat,
			lon: center.lon,
			country: reference?.country ?? home.country,
			countryCode: home.countryCode ?? reference?.countryCode,
			region: reference?.region ?? home.region,
			// The destination's genres (character) and the city's month tags (seasons).
			tags: uniqueById([...home.tags, ...(cityProfile?.tags ?? [])]),
		},
		destinationId,
		area,
		season: seasonInfo(cityProfile, request.month),
		crowdedSpots: crowdedSpots.slice(0, 4),
		tasteProfile: uniqueById(favorites.filter((f): f is TasteEntity => f !== undefined)),
		vibeTags: uniqueById(vibes.filter((v): v is TagRef => v !== undefined)),
		unresolved,
	};
}

function uniqueById<T extends { id: string }>(items: T[]): T[] {
	const seen = new Set<string>();
	return items.filter((item) => (seen.has(item.id) ? false : (seen.add(item.id), true)));
}
