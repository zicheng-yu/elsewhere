import type { Hotspot, Locality, Place, TagRef, TasteEntity, TripRequest, TrendPoint } from "../shared/types.ts";
import { ENTITY_TYPE, type QlooApi } from "./qloo/endpoints.ts";
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

async function settle<T>(task: Promise<T>): Promise<T | undefined> {
	try {
		return await task;
	} catch {
		return undefined;
	}
}

export async function resolveDestination(api: QlooApi, destination: string): Promise<Locality> {
	// "Lisbon, Portugal" and "Lisbon Portugal" fall back to the city part when the whole query misses.
	const attempts = [destination, destination.split(",")[0], destination.replace(/\s+\S+$/, "")]
		.map((query) => query?.trim() ?? "")
		.filter((query, index, all) => query.length >= 2 && all.indexOf(query) === index);
	const seen: string[] = [];
	for (const query of attempts) {
		const candidates = await api.searchLocalities(query, 6);
		seen.push(...candidates.map((c) => c.name));
		const chosen = best(query, candidates, 0.5, (l) => l.popularity ?? 0);
		if (!chosen) continue;
		// Search results can be sparse; the entities endpoint returns the full tag set (months, events).
		const details = await settle(api.localityDetails(chosen.id));
		return details && details.tags.length >= chosen.tags.length ? { ...chosen, ...details } : chosen;
	}
	throw new ResolveError(`Couldn't find "${destination}" as a city in Qloo.`, [...new Set(seen)].slice(0, 3));
}

const DAY_MS = 24 * 3600 * 1000;

/** The destination's weekly attention over the past year; empty when the endpoint isn't available. */
async function pastYearTrend(api: QlooApi, locality: Locality, now: Date): Promise<TrendPoint[]> {
	const end = new Date(now.getTime() - DAY_MS);
	const start = new Date(end.getTime() - 364 * DAY_MS);
	const day = (date: Date) => date.toISOString().slice(0, 10);
	return (await settle(api.trending(ENTITY_TYPE.locality, locality.id, day(start), day(end)))) ?? [];
}

/** Resolve a trip request into a hotspot: the destination, its crowded spots, and the traveler's taste. */
export async function resolveTrip(api: QlooApi, request: TripRequest, now = new Date()): Promise<Hotspot> {
	const locality = await resolveDestination(api, request.destination);
	const near = { lat: locality.lat, lon: locality.lon, radiusMiles: 30 };
	const unresolved: string[] = [];

	const [spots, favorites, vibes, trend] = await Promise.all([
		Promise.all(
			request.mustSees.map(async (name) => {
				const found = await settle(api.searchPlaces(name, near, 4));
				const match = found && best(name, found, 0.5, (p) => p.popularity ?? 0);
				if (!match) unresolved.push(name);
				return match;
			}),
		),
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
				const found = await settle(api.searchTags(word, 2));
				const tag = found?.[0];
				if (!tag) unresolved.push(word);
				return tag;
			}),
		),
		pastYearTrend(api, locality, now),
	]);

	const crowdedSpots: Place[] = uniqueById(spots.filter((s): s is Place => s !== undefined));
	if (crowdedSpots.length < 2) {
		const top = (await settle(api.topAttractions({ ...near, radiusMiles: 15 }, 6))) ?? [];
		for (const place of top) {
			if (crowdedSpots.length >= 3) break;
			if (!crowdedSpots.some((s) => s.id === place.id)) crowdedSpots.push(place);
		}
	}

	return {
		locality,
		season: seasonInfo(locality, request.month),
		trend: trend.length >= 8 ? trend : undefined,
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
