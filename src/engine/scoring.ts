import type { DupeScore, ScoreComponent, ScoreKey, ZoomLevel } from "../shared/types.ts";

/** Dupe Score weights per zoom level. Missing components are dropped and the rest renormalized. */
export const WEIGHTS: Record<ZoomLevel, Partial<Record<ScoreKey, number>>> = {
	city: { soul: 0.4, taste: 0.3, crowd: 0.25, proximity: 0.05 },
	region: { soul: 0.35, taste: 0.3, crowd: 0.2, proximity: 0.15 },
	country: { soul: 0.4, taste: 0.3, crowd: 0.2, season: 0.1 },
	world: { soul: 0.4, taste: 0.3, crowd: 0.2, season: 0.1 },
};

export const SCORE_LABELS: Record<ScoreKey, string> = {
	soul: "Soul match",
	taste: "Your taste",
	crowd: "Crowd relief",
	proximity: "Proximity",
	season: "Season fit",
};

function clamp01(value: number): number {
	return Math.min(1, Math.max(0, value));
}

/**
 * Crowd relief from two popularity percentiles. It compares the tail shares:
 * the 99.5th percentile leaves 0.5% above it, the 62nd leaves 38%, a 76× ratio.
 * Score = log10(ratio) / 2, so 10× → 0.5 and 100× → 1.
 */
export function crowdRelief(fromPopularity: number | undefined, toPopularity: number | undefined): number | undefined {
	if (fromPopularity === undefined || toPopularity === undefined) return undefined;
	const tailFrom = Math.max(0.001, 1 - fromPopularity);
	const tailTo = Math.max(0.001, 1 - toPopularity);
	return clamp01(Math.log10(tailTo / tailFrom) / 2);
}

/** 1 at zero distance, 0 at `scaleKm` or beyond. */
export function proximity(distanceKm: number, scaleKm: number): number {
	return clamp01(1 - distanceKm / scaleKm);
}

export interface ScorePart {
	value: number | undefined;
	source: string;
}

export function buildScore(level: ZoomLevel, parts: Partial<Record<ScoreKey, ScorePart>>): DupeScore {
	const weights = WEIGHTS[level];
	const available = (Object.keys(weights) as ScoreKey[]).filter(
		(key) => parts[key]?.value !== undefined && Number.isFinite(parts[key]?.value),
	);
	const weightSum = available.reduce((sum, key) => sum + (weights[key] ?? 0), 0) || 1;
	const components: ScoreComponent[] = available.map((key) => ({
		key,
		label: SCORE_LABELS[key],
		value: clamp01(parts[key]?.value ?? 0),
		weight: (weights[key] ?? 0) / weightSum,
		source: parts[key]?.source ?? "",
	}));
	const total = components.reduce((sum, c) => sum + c.value * c.weight, 0);
	return { total: Math.round(total * 1000) / 1000, components };
}

export function mean(values: number[]): number | undefined {
	const finite = values.filter(Number.isFinite);
	return finite.length === 0 ? undefined : finite.reduce((a, b) => a + b, 0) / finite.length;
}
