/** Levels 3 and 4 — a twin city in the same country, or beyond its borders. */
import { km, percentile } from "../../shared/format.ts";
import type { CityTwin, Locality, ZoomResult } from "../../shared/types.ts";
import { haversineKm } from "../geo.ts";
import { isSight, SIGHT_TAGS } from "../qloo/endpoints.ts";
import { buildScore, crowdRelief } from "../scoring.ts";
import { matchScore, normalizeName } from "../text.ts";
import { tasteSignals, type ZoomContext } from "./shared.ts";

/** A domestic twin closer than this is a day trip, not a different city to base a trip in. */
const MIN_COUNTRY_TWIN_KM = 100;
/** Candidates this close to a more similar one are the same city (wards, districts, suburbs). */
const SAME_CITY_KM = 15;
const HIGHLIGHT_RADIUS_KM = 8;

function sameCountry(a: Locality, b: Locality): boolean {
	if (a.countryCode && b.countryCode) return a.countryCode.toUpperCase() === b.countryCode.toUpperCase();
	return normalizeName(a.country ?? "") === normalizeName(b.country ?? "");
}

/** Keep the most similar entry of each cluster (Tokyo over Shinjuku and Minato). Input is sorted by affinity. */
function dedupeClusters(candidates: Locality[]): Locality[] {
	const kept: Locality[] = [];
	for (const candidate of candidates) {
		if (!kept.some((other) => haversineKm(other, candidate) < SAME_CITY_KM)) kept.push(candidate);
	}
	return kept;
}

/** Shared genres from the destinations' own tags, when the compare endpoint finds nothing. */
function genreOverlap(a: Locality, b: Locality): string[] {
	const genres = new Set(a.tags.filter((t) => t.type.includes("genre:destination")).map((t) => t.name));
	return b.tags.filter((t) => t.type.includes("genre:destination") && genres.has(t.name)).map((t) => t.name);
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
			(level === "country" ? sameCountry(candidate, home) && distanceKm >= MIN_COUNTRY_TWIN_KM : !sameCountry(candidate, home)) &&
			// A twin should take pressure off, not add to it.
			(candidate.popularity ?? 0) < (home.popularity ?? 1)
		);
	};

	// The same query serves both levels, so the client sends it once. Some
	// destinations from search are not valid insights signals (Seoul); then
	// the city's crowded sights stand for it.
	const spotIds = hotspot.crowdedSpots.map((s) => s.id);
	const similarTo = async (offset?: number) => {
		const page = (signalIds: string[]) => api.destinations({ signalIds, take: 50, offset, note: offset ? "More destinations with a similar soul" : undefined });
		const byDestination = await page([hotspot.destinationId ?? ""]).catch(() => []);
		return byDestination.length > 0 || spotIds.length === 0 ? byDestination : page(spotIds).catch(() => []);
	};
	let similar = await similarTo();
	if (level === "world" && similar.filter((c) => c.countryCode && home.countryCode && c.countryCode !== home.countryCode).length < 5) {
		// Big countries fill the first page with domestic look-alikes.
		similar = [...similar, ...(await similarTo(50))];
	}
	const shortlist: { city: Locality; origin: "qloo" | "agent" }[] = dedupeClusters(
		similar.filter((c) => c.id !== hotspot.destinationId && haversineKm(c, home) >= SAME_CITY_KM),
	)
		.filter(passes)
		.slice(0, 10)
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
		const score = buildScore(level, {
			soul: { value: soul, source: `Qloo destination affinity to ${home.name}` },
			taste: { value: tasteById.get(city.id), source: "Qloo destination affinity to your favorites" },
			crowd: {
				value: crowdRelief(home.popularity, city.popularity),
				source: `Destination popularity ${percentile(home.popularity)} → ${percentile(city.popularity)} percentile`,
			},
		});
		return {
			id: `city:${city.id}`,
			city: { ...city, affinity: soul },
			score,
			distanceKm: haversineKm(home, city),
			sharedTraits: genreOverlap(home, city).slice(0, 4),
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
	const contenders = items.slice(0, maxResults + 2);
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
	const located = (item: CityTwin) =>
		item.highlights.length === 0 || item.highlights.some((p) => !p.city || matchScore(item.city.name, p.city) >= 0.6);
	const top = contenders.filter(located).slice(0, maxResults);

	// The character each leading twin shares with home.
	await Promise.all(
		top.slice(0, 2).map(async (item) => {
			const traits = await api.compare([hotspot.destinationId ?? ""], [item.city.id], 12).catch(() => []);
			item.sharedTraits = [...new Set([...traits, ...item.sharedTraits])].slice(0, 4);
		}),
	);

	return {
		level,
		items: top,
		note: `${top.length} ${top.length === 1 ? "city" : "cities"} ${where}${level === "country" ? `, at least ${km(MIN_COUNTRY_TWIN_KM)} away` : ""}.`,
	};
}
