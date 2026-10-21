/** Level 1 — same city: quieter twins of the crowded spots. */
import { km, percentile } from "../../shared/format.ts";
import type { Place, SpotTwin, ZoomResult } from "../../shared/types.ts";
import { haversineKm } from "../geo.ts";
import { FOOD_DRINK_TAGS, SIGHT_TAGS } from "../qloo/endpoints.ts";
import { buildScore, crowdRelief, proximity } from "../scoring.ts";
import { sharedTraits } from "../traits.ts";
import { tasteAffinities, tasteSignals, type ZoomContext } from "./shared.ts";

/** Sight genre tags the spot carries, used to keep twins in the same category. */
function sightTagsOf(place: Place): string[] {
	return place.tags.map((tag) => tag.id).filter((id) => SIGHT_TAGS.includes(id as (typeof SIGHT_TAGS)[number]));
}

export async function findSpotTwins(
	ctx: ZoomContext,
	options: { perSpot?: number } = {},
): Promise<Extract<ZoomResult, { level: "city" }>> {
	const { api, hotspot } = ctx;
	const spots = hotspot.crowdedSpots;
	if (spots.length === 0) {
		return { level: "city", items: [], note: "No crowded spots were found to swap." };
	}
	const excludeIds = spots.map((spot) => spot.id);

	const discovered = await Promise.all(
		spots.map(async (spot) => {
			const cap = Math.min(0.95, Math.max(0.5, (spot.popularity ?? 0.99) - 0.05));
			const base = {
				signalIds: [spot.id],
				location: hotspot.locality.id,
				popularityMax: cap,
				excludeIds,
				excludeTagIds: FOOD_DRINK_TAGS,
				take: 15,
			};
			const sameCategory = sightTagsOf(spot);
			let candidates = await api.places(
				{ ...base, tagIds: sameCategory.length > 0 ? sameCategory : SIGHT_TAGS },
				`Quiet twins of ${spot.name}`,
			);
			if (candidates.length < 3) {
				candidates = await api.places({ ...base, tagIds: SIGHT_TAGS }, `Quiet twins of ${spot.name} (any sight)`);
			}
			return { spot, candidates };
		}),
	);

	const { signalIds, signalTagIds } = tasteSignals(hotspot);
	const [taste, heat] = await Promise.all([
		tasteAffinities(
			api,
			hotspot,
			discovered.flatMap(({ candidates }) => candidates.map((c) => c.id)),
		),
		// Where the traveler's taste concentrates in the city, drawn under the crowded spots and their twins.
		signalIds.length + signalTagIds.length > 0
			? api.heatmap({ location: hotspot.locality.id, signalIds, signalTagIds }).catch(() => undefined)
			: Promise.resolve(undefined),
	]);

	const pairs = discovered.flatMap(({ spot, candidates }) =>
		candidates.map((twin) => {
			const distanceKm = haversineKm(spot, twin);
			const score = buildScore("city", {
				soul: { value: twin.affinity, source: `Qloo place affinity to ${spot.name}` },
				taste: { value: taste.get(twin.id), source: "Qloo affinity to your favorites and vibes" },
				crowd: {
					value: crowdRelief(spot.popularity, twin.popularity),
					source: `Popularity ${percentile(spot.popularity)} → ${percentile(twin.popularity)} percentile`,
				},
				proximity: { value: proximity(distanceKm, 15), source: `${km(distanceKm)} from ${spot.name}` },
			});
			return { spot, twin, score, distanceKm };
		}),
	);

	const perSpot = options.perSpot ?? 2;
	const used = new Set<string>();
	const counts = new Map<string, number>();
	const items: SpotTwin[] = [];
	for (const pair of pairs.sort((a, b) => b.score.total - a.score.total)) {
		if (used.has(pair.twin.id) || (counts.get(pair.spot.id) ?? 0) >= perSpot) continue;
		used.add(pair.twin.id);
		counts.set(pair.spot.id, (counts.get(pair.spot.id) ?? 0) + 1);
		items.push({
			id: `${pair.spot.id}:${pair.twin.id}`,
			original: pair.spot,
			twin: pair.twin,
			score: pair.score,
			distanceKm: pair.distanceKm,
			sharedTraits: sharedTraits(pair.spot.tags, pair.twin.tags),
		});
	}

	const order = new Map(spots.map((spot, i) => [spot.id, i]));
	items.sort((a, b) => (order.get(a.original.id) ?? 0) - (order.get(b.original.id) ?? 0) || b.score.total - a.score.total);
	const missing = spots.filter((spot) => !counts.has(spot.id)).map((spot) => spot.name);
	return {
		level: "city",
		items,
		note: missing.length > 0 ? `No quieter twin found for ${missing.join(", ")}.` : undefined,
		heat,
	};
}
