/** Levels 3 and 4 — a twin city in the same country, or beyond its borders. */
import { km, percentile } from "../../shared/format.ts";
import type { CityTwin, Locality, Place, ZoomResult } from "../../shared/types.ts";
import { haversineKm } from "../geo.ts";
import { isSight, SIGHT_TAGS } from "../qloo/endpoints.ts";
import { buildScore, crowdRelief, proximity } from "../scoring.ts";
import { matchScore, normalizeName } from "../text.ts";
import { similarDestinations, tasteSignals, type ZoomContext } from "./shared.ts";

/** A twin closer than this is a day trip, not a different city to base a trip in. */
const MIN_TWIN_KM = 100;
/** Below this destination-popularity percentile Qloo knows too little about a place to vouch for it. */
const MIN_TWIN_POPULARITY = 0.15;
/** A tenth of the home city's attention is quiet enough; a still more obscure city is not better for it. */
const CROWD_RELIEF_FULL_AT = 10;
/** Destinations above this percentile are busy in their own right (London for Barcelona), whatever the home city. */
const BUSY_PERCENTILE = 0.9;
/** Candidates this close to a more similar one are the same city (wards, districts, suburbs). */
const SAME_CITY_KM = 15;
const HIGHLIGHT_RADIUS_KM = 8;
/** Candidates scored in full; Qloo's affinity order alone would cut good matches (Tainan for Kyoto). */
const SHORTLIST = 16;
/** Nearer twins are easier to swap in: proximity falls to zero at this distance. */
const PROXIMITY_KM = { country: 1500, world: 5000 } as const;
/** Score given up by each further twin from a country already listed abroad (not three Spanish towns for Lisbon). */
const REPEAT_COUNTRY_PENALTY = 0.08;

function sameCountry(a: Locality, b: Locality): boolean {
	if (a.countryCode && b.countryCode) return a.countryCode.toUpperCase() === b.countryCode.toUpperCase();
	return normalizeName(a.country ?? "") === normalizeName(b.country ?? "");
}

/**
 * Keep the most similar entry of each cluster (Tokyo over Shinjuku and Minato). Input is sorted by
 * affinity. Qloo often lists a city twice with very different popularity (Busan at the 76th and
 * the 96th percentile); the cluster takes its most popular reading, so an alias never passes for quiet.
 */
function dedupeClusters(candidates: Locality[]): Locality[] {
	const kept: Locality[] = [];
	for (const candidate of candidates) {
		const index = kept.findIndex((other) => haversineKm(other, candidate) < SAME_CITY_KM);
		const other = kept[index];
		if (!other) kept.push(candidate);
		else if ((candidate.popularity ?? 0) > (other.popularity ?? 0)) kept[index] = { ...other, popularity: candidate.popularity };
	}
	return kept;
}

/**
 * Qloo's destination genres ("Art & Culture", "Beaches", "Snow and Ski"), keyed by name: search
 * and insights spell some IDs differently ("for_the_history" and "history" for "For the History").
 */
function genresOf(locality: Locality): Map<string, string> {
	return new Map(locality.tags.filter((t) => t.type.includes("genre:destination")).map((t) => [t.name.toLowerCase(), t.name]));
}

/** The genres two destinations share. */
function genreOverlap(a: Locality, b: Locality): string[] {
	const genres = genresOf(a);
	return [...genresOf(b)].filter(([key]) => genres.has(key)).map(([, name]) => name);
}

/** How alike two destinations' genres are (cosine over the two sets); undefined when either has none. */
export function characterMatch(a: Locality, b: Locality): number | undefined {
	const size = genresOf(a).size * genresOf(b).size;
	return size === 0 ? undefined : genreOverlap(a, b).length / Math.sqrt(size);
}

/** Crowd relief for a twin city: quieter than home, and not a top destination itself. */
export function quietness(homePopularity: number | undefined, popularity: number | undefined): number | undefined {
	const relative = crowdRelief(homePopularity, popularity, CROWD_RELIEF_FULL_AT);
	if (relative === undefined || popularity === undefined) return relative;
	return Math.min(relative, Math.max(0, (1 - popularity) / (1 - BUSY_PERCENTILE)));
}

/** Orders twins by score, discounting each one by the twins already ahead of it from the same country. */
function spreadOut(items: CityTwin[], penalty: number): CityTwin[] {
	const ranked: CityTwin[] = [];
	const rest = [...items];
	while (rest.length > 0) {
		const value = (item: CityTwin) => item.score.total - penalty * ranked.filter((r) => sameCountry(r.city, item.city)).length;
		const best = rest.reduce((top, item, i) => (value(item) > value(rest[top] ?? item) ? i : top), 0);
		ranked.push(...rest.splice(best, 1));
	}
	return ranked;
}

/** The country a twin's highlights agree on, when most of them name one. */
function highlightCountry(places: Place[]): { code: string; name?: string } | undefined {
	const located = places.filter((p) => p.countryCode);
	const counts = new Map<string, number>();
	for (const place of located) counts.set(place.countryCode?.toUpperCase() ?? "", (counts.get(place.countryCode?.toUpperCase() ?? "") ?? 0) + 1);
	const [code, count] = [...counts].sort((a, b) => b[1] - a[1])[0] ?? [];
	if (!code || !count || located.length < 2 || count <= located.length / 2) return undefined;
	return { code, name: located.find((p) => p.countryCode?.toUpperCase() === code)?.country };
}

export async function findCityTwins(
	ctx: ZoomContext,
	level: "country" | "world",
	options: { extraCandidates?: string[]; maxResults?: number } = {},
): Promise<Extract<ZoomResult, { level: "country" | "world" }>> {
	const { api, hotspot } = ctx;
	const home = hotspot.locality;
	const where = level === "country" ? `elsewhere in ${home.country ?? "the country"}` : "beyond the border";
	if (!hotspot.destinationId) {
		return { level, items: [], note: `Qloo has no destination entry for ${home.name}, so twin cities are unavailable.` };
	}

	const passes = (candidate: Locality) => {
		const distanceKm = haversineKm(candidate, home);
		return (
			candidate.id !== hotspot.destinationId &&
			(level === "country" ? sameCountry(candidate, home) : !sameCountry(candidate, home)) &&
			distanceKm >= MIN_TWIN_KM &&
			// A twin should take pressure off, not add to it, and be known well enough to recommend.
			(candidate.popularity ?? 0) < (home.popularity ?? 1) &&
			(candidate.popularity ?? 1) >= MIN_TWIN_POPULARITY
		);
	};

	// The same query serves both levels, so the client sends it once.
	const similarTo = (offset?: number) =>
		similarDestinations(api, hotspot, { take: 50, offset, note: offset ? "More destinations with a similar soul" : undefined });
	let similar = await similarTo();
	if (level === "world" && similar.filter(passes).length < 6) {
		// Big countries fill the first page with domestic look-alikes.
		similar = [...similar, ...(await similarTo(50))];
	}
	const shortlist: { city: Locality; origin: "qloo" | "agent" }[] = dedupeClusters(
		similar.filter((c) => c.id !== hotspot.destinationId && haversineKm(c, home) >= SAME_CITY_KM),
	)
		.filter(passes)
		.slice(0, SHORTLIST)
		.map((city) => ({ city, origin: "qloo" }));

	for (const name of options.extraCandidates ?? []) {
		const found = await api.searchDestinations(name, 3).catch(() => []);
		const match = found.find((c) => matchScore(name, c.name) >= 0.8);
		if (match && passes(match) && !shortlist.some((s) => s.city.id === match.id)) {
			shortlist.push({ city: match, origin: "agent" });
		}
	}
	if (shortlist.length === 0) return { level, items: [], note: `No twin cities found ${where}.` };

	// Agent-proposed cities have no affinity to the home city yet; score the whole shortlist against it.
	const needSoul = shortlist.filter((s) => s.city.affinity === undefined).map((s) => s.city.id);
	const { signalIds } = tasteSignals(hotspot);
	const [soulScores, tasteScores] = await Promise.all([
		needSoul.length > 0
			? api.destinations({ signalIds: [hotspot.destinationId], resultIds: needSoul, take: needSoul.length, note: "Score proposed cities against the original" })
			: Promise.resolve([]),
		signalIds.length > 0
			? api
					.destinations({ signalIds, resultIds: shortlist.map((s) => s.city.id), take: shortlist.length, note: "Score candidate cities against your taste" })
					.catch(() => [])
			: Promise.resolve([]),
	]);
	const soulById = new Map(soulScores.map((c) => [c.id, c.affinity]));
	const tasteById = new Map(tasteScores.map((c) => [c.id, c.affinity]));

	const items: CityTwin[] = shortlist.map(({ city, origin }) => {
		const soul = city.affinity ?? soulById.get(city.id);
		const shared = genreOverlap(home, city);
		const distanceKm = haversineKm(home, city);
		const score = buildScore(level, {
			soul: { value: soul, source: `Qloo destination affinity to ${home.name}` },
			character: {
				value: characterMatch(home, city),
				source: shared.length > 0 ? `Qloo destination genres shared with ${home.name}: ${shared.join(", ")}` : `No Qloo destination genres in common with ${home.name}`,
			},
			taste: { value: tasteById.get(city.id), source: "Qloo destination affinity to your favorites" },
			crowd: {
				value: quietness(home.popularity, city.popularity),
				source: `Destination popularity ${percentile(home.popularity)} → ${percentile(city.popularity)} percentile`,
			},
			proximity: { value: proximity(distanceKm, PROXIMITY_KM[level]), source: `${km(distanceKm)} from ${home.name}` },
		});
		return {
			id: `city:${city.id}`,
			city: { ...city, affinity: soul },
			score,
			distanceKm,
			sharedTraits: shared.slice(0, 4),
			highlights: [],
			smallCommunity: false,
			origin,
		};
	});

	items.sort((a, b) => b.score.total - a.score.total);
	const maxResults = options.maxResults ?? 3;

	// What the traveler would actually do there. The places also vouch for the
	// destination: an entry whose sights all sit in another city is mislocated.
	const highlightSignals = signalIds.length > 0 ? signalIds : hotspot.crowdedSpots.map((s) => s.id);
	const contenders = (level === "world" ? spreadOut(items, REPEAT_COUNTRY_PENALTY) : items).slice(0, maxResults + 2);
	await Promise.all(
		contenders.map(async (item) => {
			const places = await api
				.places(
					{
						signalIds: highlightSignals,
						area: { lat: item.city.lat, lon: item.city.lon, radiusKm: HIGHLIGHT_RADIUS_KM },
						tagIds: SIGHT_TAGS,
						take: 6,
					},
					`What ${item.city.name} has for you`,
				)
				.catch(() => []);
			item.highlights = places.filter(isSight).slice(0, 4);
		}),
	);
	for (const item of contenders) {
		// Qloo files the odd destination under the wrong country (Batam under Singapore); its places know better.
		const where = highlightCountry(item.highlights);
		if (where && where.code !== item.city.countryCode?.toUpperCase()) {
			item.city = { ...item.city, countryCode: where.code, country: where.name ?? item.city.country };
		}
	}
	// A twin needs something to do there, in the city Qloo says it is.
	const located = (item: CityTwin) =>
		passes(item.city) && item.highlights.length > 0 && item.highlights.some((p) => !p.city || matchScore(item.city.name, p.city) >= 0.6);
	const top = contenders
		.filter(located)
		.slice(0, maxResults)
		.sort((a, b) => b.score.total - a.score.total);

	// The character the leading twin shares with home.
	await Promise.all(
		top.slice(0, 1).map(async (item) => {
			const traits = await api.compare([hotspot.destinationId ?? ""], [item.city.id], 12).catch(() => []);
			item.sharedTraits = [...new Set([...traits, ...item.sharedTraits])].slice(0, 4);
		}),
	);

	return {
		level,
		items: top,
		note: `${top.length} ${top.length === 1 ? "city" : "cities"} ${where}, at least ${km(MIN_TWIN_KM)} away.`,
	};
}
