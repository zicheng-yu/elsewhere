/** Level 2 — day trip: nearby towns with the same feel, outside the crowded city. */
import { joinNames, km, percentile } from "../../shared/format.ts";
import type { Locality, Place, TownTwin, ZoomResult } from "../../shared/types.ts";
import { centroid, haversineKm } from "../geo.ts";
import { isSight, SIGHT_TAGS, twinCategories } from "../qloo/endpoints.ts";
import { buildScore, crowdRelief, mean, proximity, type ScorePart } from "../scoring.ts";
import { matchScore, normalizeName, slugify } from "../text.ts";
import { sharedTraits } from "../traits.ts";
import { characterMatch, quietness } from "./cities.ts";
import { similarDestinations, tasteAffinities, tasteSignals, type ZoomContext } from "./shared.ts";

/** How far a day trip may go. Small communities inside it belong to this level, not to the twin-city ones. */
export const DAY_TRIP_RADIUS_KM = 120;
/** Anything closer is the same urban area, not a day out. */
const MIN_DAY_TRIP_KM = 15;
/** A place this close to a town's center is that town's. */
const TOWN_RADIUS_KM = 8;
/** A place this close to a destination's center vouches for its location, whatever its address says (Saanen for Gstaad). */
const TOWN_CORE_KM = 4;
/** A nearby destination needs at least this much crowd relief to count as an escape (not Osaka for Kyoto). */
const MIN_TOWN_RELIEF = 0.3;

interface Town {
	name: string;
	lat: number;
	lon: number;
	country?: string;
	/** Qloo's destination entry for the town; towns found only through their places' addresses have none. */
	destination?: Locality;
	places: Place[];
}

export async function findDayTrips(
	ctx: ZoomContext,
	options: { radiusKm?: number; maxTowns?: number } = {},
): Promise<Extract<ZoomResult, { level: "region" }>> {
	const { api, hotspot } = ctx;
	const radiusKm = options.radiusKm ?? DAY_TRIP_RADIUS_KM;
	const maxTowns = options.maxTowns ?? 4;
	const home = hotspot.locality;
	const center = hotspot.area;
	const spots = hotspot.crowdedSpots;
	const taste = tasteSignals(hotspot);
	const useSpots = spots.length > 0;
	const signals = { signalIds: useSpots ? spots.map((spot) => spot.id) : taste.signalIds, signalTagIds: useSpots ? undefined : taste.signalTagIds };

	const homeName = normalizeName(home.name);
	// A town that hosts one of the crowded must-sees is part of the crush, not an escape from it.
	const crowdedTowns = new Set(spots.flatMap((spot) => (spot.city ? [normalizeName(spot.city)] : [])));
	const excluded = (name: string, at: { lat: number; lon: number }) => {
		const key = normalizeName(name);
		return key === homeName || crowdedTowns.has(key) || haversineKm(at, center) < MIN_DAY_TRIP_KM;
	};

	// Qloo's destinations around the city are the towns travelers know (Giverny, Fontainebleau). The
	// ones that share the city's character and take pressure off go on; the best get a look at their places.
	const nearby = await similarDestinations(api, hotspot, { area: { lat: center.lat, lon: center.lon, radiusKm }, take: 25, note: `Find towns within ${radiusKm} km` });
	const towns: Town[] = [];
	// Towns too busy in their own right stay out, also when their places' addresses name them later.
	const busy = new Set<string>();
	for (const destination of nearby) {
		if ((quietness(home.popularity, destination.popularity) ?? 1) < MIN_TOWN_RELIEF) {
			busy.add(normalizeName(destination.name));
			continue;
		}
		if (destination.id === hotspot.destinationId || excluded(destination.name, destination) || !characterMatch(home, destination)) continue;
		if (towns.some((town) => normalizeName(town.name) === normalizeName(destination.name) || haversineKm(town, destination) < TOWN_RADIUS_KM)) continue;
		towns.push({ name: destination.name, lat: destination.lat, lon: destination.lon, country: destination.country, destination, places: [] });
	}
	const preliminary = (town: Town) => destinationScore(town, center, radiusKm, home, undefined).total;
	const shortlist = towns.sort((a, b) => preliminary(b) - preliminary(a)).slice(0, maxTowns + 2);
	if (shortlist.length > 0) {
		const places = await api.places(
			{ ...signals, areas: shortlist.map((town) => ({ lat: town.lat, lon: town.lon, radiusKm: TOWN_RADIUS_KM })), tagIds: SIGHT_TAGS, popularityMax: 0.98, excludeIds: spots.map((spot) => spot.id), take: 50 },
			`Find places in ${joinNames(shortlist.map((town) => town.name))}`,
		);
		for (const place of places.filter(isSight)) {
			const nearest = shortlist.map((town) => ({ town, km: haversineKm(town, place) })).sort((a, b) => a.km - b.km)[0];
			if (nearest && nearest.km <= TOWN_RADIUS_KM) nearest.town.places.push(place);
		}
	}
	// A destination is where Qloo says it is when its places carry its name or sit at its center
	// (Lacoste, listed in the middle of Paris, would not).
	const known = shortlist.filter((town) =>
		town.places.some((place) => !place.city || matchScore(town.name, place.city) >= 0.6 || haversineKm(town, place) <= TOWN_CORE_KM),
	);

	// Too few known towns: fall back on places near the city, grouped by the town their address names.
	const others: Town[] = [];
	if (known.length < maxTowns) {
		const candidates = await api.places(
			{ ...signals, area: { lat: center.lat, lon: center.lon, radiusKm }, tagIds: [...new Set(spots.flatMap(twinCategories))], popularityMax: 0.98, excludeIds: spots.map((spot) => spot.id), take: 50 },
			`Find places within ${radiusKm} km that share ${home.name}'s feel`,
		);
		const byName = new Map<string, Town>();
		for (const place of candidates.filter(isSight)) {
			// "Sintra (Santa Maria e São Miguel, ...)" → "Sintra": geocoders append parishes.
			const name = (place.city ?? place.neighborhood)?.replace(/\s*\(.*\)\s*$/, "").trim();
			if (!name || excluded(name, place) || busy.has(normalizeName(name)) || known.some((town) => normalizeName(town.name) === normalizeName(name))) continue;
			const town = byName.get(normalizeName(name)) ?? { name, lat: place.lat, lon: place.lon, country: place.country, places: [] };
			town.places.push(place);
			byName.set(normalizeName(name), town);
		}
		others.push(...byName.values());
	}

	// Only the best few places of the towns that can still make the list count toward a score.
	const best = (town: Town) => [...town.places].sort((a, b) => (b.affinity ?? 0) - (a.affinity ?? 0)).slice(0, 3);
	const contenders = [...known, ...others.sort((a, b) => (mean(best(b).map((p) => p.affinity ?? Number.NaN)) ?? 0) - (mean(best(a).map((p) => p.affinity ?? Number.NaN)) ?? 0)).slice(0, maxTowns)];
	const tasteByPlace = await tasteAffinities(api, hotspot, contenders.flatMap((town) => best(town).map((p) => p.id)));
	const spotPopularity = mean(spots.map((spot) => spot.popularity ?? Number.NaN)) ?? home.popularity;
	const spotNames = joinNames(spots.map((spot) => spot.name).slice(0, 3)) || home.name;
	const spotTags = spots.flatMap((spot) => spot.tags);

	const toItem = (town: Town): TownTwin => {
		const places = [...town.places].sort((a, b) => (b.affinity ?? 0) - (a.affinity ?? 0));
		const top = places.slice(0, 3);
		const townCenter = town.destination ? town : centroid(places);
		const distanceKm = haversineKm(townCenter, center);
		const townPopularity = mean(top.map((p) => p.popularity ?? Number.NaN));
		const placeParts = {
			soul: { value: mean(top.map((p) => p.affinity ?? Number.NaN)), source: `Mean Qloo affinity of ${town.name}'s best places to ${spotNames}` },
			taste: { value: mean(top.map((p) => tasteByPlace.get(p.id) ?? Number.NaN)), source: "Mean Qloo affinity of those places to your favorites and vibes" },
			crowd: { value: crowdRelief(spotPopularity, townPopularity), source: `Popularity ${percentile(spotPopularity)} → ${percentile(townPopularity)} percentile` },
		};
		return {
			id: `town:${slugify(town.name)}`,
			town: { name: town.name, lat: townCenter.lat, lon: townCenter.lon, country: town.country ?? places[0]?.country },
			places: places.slice(0, 4),
			score: town.destination ? destinationScore(town, center, radiusKm, home, placeParts) : buildScore("region", { ...placeParts, proximity: proximityPart(distanceKm, radiusKm, home) }),
			distanceKm,
			sharedTraits: sharedTraits(spotTags, top.flatMap((p) => p.tags)),
		};
	};
	// Towns Qloo knows as destinations come first, unless their places are busy too; the rest fill the gaps.
	const byScore = (a: TownTwin, b: TownTwin) => b.score.total - a.score.total;
	const quiet = (item: TownTwin) => (item.score.components.find((c) => c.key === "crowd")?.value ?? 1) >= MIN_TOWN_RELIEF;
	const knownItems = known.map(toItem);
	const items = [
		...knownItems.filter(quiet).sort(byScore),
		...[...knownItems.filter((item) => !quiet(item)), ...contenders.filter((town) => !town.destination).map(toItem)].sort(byScore),
	].slice(0, maxTowns);
	return {
		level: "region",
		items,
		note: items.length === 0 ? `No day-trip twins found within ${radiusKm} km.` : undefined,
	};
}

function proximityPart(distanceKm: number, radiusKm: number, home: Locality): ScorePart {
	return { value: proximity(distanceKm, radiusKm), source: `${km(distanceKm)} from ${home.name}` };
}

/**
 * Score for a town Qloo knows as a destination: its affinity to the city, shared character and
 * relief at the destination level, plus its places' taste fit and crowds once they are known.
 */
function destinationScore(
	town: Town,
	center: { lat: number; lon: number },
	radiusKm: number,
	home: Locality,
	places: { soul: ScorePart; taste: ScorePart; crowd: ScorePart } | undefined,
) {
	const destination = town.destination;
	const relief = quietness(home.popularity, destination?.popularity);
	const placeRelief = places?.crowd.value;
	return buildScore("region", {
		// Destinations found through the city's sights (when its own entry is not a valid signal) carry no affinity.
		soul: destination?.affinity !== undefined ? { value: destination.affinity, source: `Qloo destination affinity to ${home.name}` } : places?.soul,
		character: { value: destination ? characterMatch(home, destination) : undefined, source: `Qloo destination genres shared with ${home.name}` },
		taste: places?.taste,
		crowd: {
			// The town's own standing, and that of the places it would send you to.
			value: placeRelief === undefined || relief === undefined ? (relief ?? placeRelief) : Math.min(relief, placeRelief),
			source: `${town.name} is at the ${percentile(destination?.popularity)} destination-popularity percentile${places ? `; ${places.crowd.source.toLowerCase()} for its places` : ""}`,
		},
		proximity: proximityPart(haversineKm(town, center), radiusKm, home),
	});
}
