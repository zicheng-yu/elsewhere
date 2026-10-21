import type { Hotspot } from "../../shared/types.ts";
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
	for (let i = 0; i < unique.length; i += 50) {
		const chunk = unique.slice(i, i + 50);
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
