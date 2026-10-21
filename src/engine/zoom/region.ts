/** Level 2 — day trip: nearby towns with the same feel, outside the crowded city. */
import { joinNames, km, percentile } from "../../shared/format.ts";
import type { Place, TownTwin, ZoomResult } from "../../shared/types.ts";
import { centroid, haversineKm } from "../geo.ts";
import { FOOD_DRINK_TAGS, SIGHT_TAGS, wktPoint } from "../qloo/endpoints.ts";
import { buildScore, crowdRelief, mean, proximity } from "../scoring.ts";
import { normalizeName, slugify } from "../text.ts";
import { sharedTraits } from "../traits.ts";
import { tasteAffinities, tasteSignals, type ZoomContext } from "./shared.ts";

/** How far a day trip may go. Small communities inside it belong to this level, not to the twin-city ones. */
export const DAY_TRIP_RADIUS_KM = 150;
/** Anything closer is the same urban area, not a day out. */
const MIN_DAY_TRIP_KM = 12;

export async function findDayTrips(
	ctx: ZoomContext,
	options: { radiusKm?: number; maxTowns?: number } = {},
): Promise<Extract<ZoomResult, { level: "region" }>> {
	const { api, hotspot } = ctx;
	const radiusKm = options.radiusKm ?? DAY_TRIP_RADIUS_KM;
	const home = hotspot.locality;
	const spots = hotspot.crowdedSpots;
	const taste = tasteSignals(hotspot);
	const useSpots = spots.length > 0;

	const candidates = await api.places(
		{
			signalIds: useSpots ? spots.map((spot) => spot.id) : taste.signalIds,
			signalTagIds: useSpots ? undefined : taste.signalTagIds,
			location: wktPoint(home.lat, home.lon),
			radiusM: radiusKm * 1000,
			excludeLocation: home.id,
			popularityMax: 0.975,
			tagIds: SIGHT_TAGS,
			excludeTagIds: FOOD_DRINK_TAGS,
			take: 50,
		},
		`Find towns within ${radiusKm} km that share ${home.name}'s feel`,
	);

	const homeName = normalizeName(home.name);
	// A town that hosts one of the crowded must-sees is part of the crush, not an escape from it.
	const crowdedTowns = new Set(spots.flatMap((spot) => (spot.city ? [normalizeName(spot.city)] : [])));
	const towns = new Map<string, Place[]>();
	for (const place of candidates) {
		const town = place.city ?? place.neighborhood;
		if (!town || normalizeName(town) === homeName || crowdedTowns.has(normalizeName(town))) continue;
		if (haversineKm(place, home) < MIN_DAY_TRIP_KM) continue;
		towns.set(town, [...(towns.get(town) ?? []), place]);
	}

	const tasteByPlace = await tasteAffinities(api, hotspot, candidates.map((c) => c.id));
	const spotPopularity = mean(spots.map((spot) => spot.popularity ?? Number.NaN)) ?? home.popularity;
	const spotNames = joinNames(spots.map((spot) => spot.name).slice(0, 3)) || home.name;
	const spotTags = spots.flatMap((spot) => spot.tags);

	const items: TownTwin[] = [...towns.entries()].map(([name, places]) => {
		places.sort((a, b) => (b.affinity ?? 0) - (a.affinity ?? 0));
		const top = places.slice(0, 3);
		const center = centroid(places);
		const distanceKm = haversineKm(center, home);
		const townPopularity = mean(top.map((p) => p.popularity ?? Number.NaN));
		const score = buildScore("region", {
			soul: {
				value: mean(top.map((p) => p.affinity ?? Number.NaN)),
				source: `Mean Qloo affinity of ${name}'s best places to ${spotNames}`,
			},
			taste: {
				value: mean(top.map((p) => tasteByPlace.get(p.id) ?? Number.NaN)),
				source: "Mean Qloo affinity of those places to your favorites and vibes",
			},
			crowd: {
				value: crowdRelief(spotPopularity, townPopularity),
				source: `Popularity ${percentile(spotPopularity)} → ${percentile(townPopularity)} percentile`,
			},
			proximity: { value: proximity(distanceKm, radiusKm), source: `${km(distanceKm)} from ${home.name}` },
		});
		return {
			id: `town:${slugify(name)}`,
			town: { name, lat: center.lat, lon: center.lon, country: places[0]?.country },
			places: places.slice(0, 4),
			score,
			distanceKm,
			sharedTraits: sharedTraits(spotTags, top.flatMap((p) => p.tags)),
		};
	});

	items.sort((a, b) => b.score.total - a.score.total);
	return {
		level: "region",
		items: items.slice(0, options.maxTowns ?? 4),
		note: items.length === 0 ? `No day-trip twins found within ${radiusKm} km.` : undefined,
	};
}
