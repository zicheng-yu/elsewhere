import type { Hotspot, Locality, SearchArea } from "../../shared/types.ts";
import type { QlooApi } from "../qloo/endpoints.ts";

export interface ZoomContext {
	api: QlooApi;
	hotspot: Hotspot;
	month?: number;
}

export function tasteSignals(hotspot: Hotspot): { signalIds: string[]; signalTagIds: string[] } {
	return {
		signalIds: hotspot.tasteProfile.map((entity) => entity.id),
		signalTagIds: hotspot.vibeTags.map((tag) => tag.id),
	};
}

/** How strongly each candidate matches the traveler's favorites and vibes (Qloo affinity), by ID. */
export async function tasteAffinities(api: QlooApi, hotspot: Hotspot, ids: string[]): Promise<Map<string, number>> {
	const { signalIds, signalTagIds } = tasteSignals(hotspot);
	const affinities = new Map<string, number>();
	if (ids.length === 0 || signalIds.length + signalTagIds.length === 0) return affinities;
	const unique = [...new Set(ids)];
	// With tag signals, Qloo returns only a few of a long result list (3 of 45), so score at most 30 at a time.
	for (let i = 0; i < unique.length; i += 30) {
		const chunk = unique.slice(i, i + 30);
		const scored = await api.places(
			{ signalIds, signalTagIds, resultIds: chunk, take: chunk.length },
			"Score candidates against your taste",
		);
		for (const place of scored) {
			if (place.affinity !== undefined) affinities.set(place.id, place.affinity);
		}
	}
	return affinities;
}

/** Hotspots whose destination Qloo rejected as a signal, so later levels skip straight to its sights. */
const invalidDestinationSignal = new WeakSet<Hotspot>();

/**
 * Destinations Qloo finds similar to the trip's destination, optionally within an area. Some
 * destinations from search are not valid insights signals (Seoul); the city's crowded sights then
 * stand for it.
 */
export async function similarDestinations(
	api: QlooApi,
	hotspot: Hotspot,
	options: { area?: SearchArea; take: number; offset?: number; note?: string },
): Promise<Locality[]> {
	const query = (signalIds: string[]) => api.destinations({ signalIds, ...options });
	const spotIds = hotspot.crowdedSpots.map((spot) => spot.id);
	if (hotspot.destinationId && !invalidDestinationSignal.has(hotspot)) {
		try {
			return await query([hotspot.destinationId]);
		} catch {
			invalidDestinationSignal.add(hotspot);
		}
	}
	return spotIds.length > 0 ? query(spotIds).catch(() => []) : [];
}
