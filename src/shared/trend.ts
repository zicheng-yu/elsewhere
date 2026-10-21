import type { TrendPoint } from "./types.ts";

/** Mean weekly attention per calendar month (index 0 is January); undefined where no week falls. */
export function monthlyAttention(trend: TrendPoint[] = []): (number | undefined)[] {
	const sums = Array.from({ length: 12 }, () => ({ total: 0, count: 0 }));
	for (const point of trend) {
		const bucket = sums[Number(point.date.slice(5, 7)) - 1];
		if (!bucket) continue;
		bucket.total += point.percentile;
		bucket.count++;
	}
	return sums.map(({ total, count }) => (count > 0 ? total / count : undefined));
}

/** Busiest and quietest calendar months (1–12) by mean weekly attention. */
export function attentionExtremes(trend?: TrendPoint[]): { busiest?: number; quietest?: number } {
	let busiest: { month: number; value: number } | undefined;
	let quietest: { month: number; value: number } | undefined;
	monthlyAttention(trend).forEach((value, index) => {
		if (value === undefined) return;
		if (!busiest || value > busiest.value) busiest = { month: index + 1, value };
		if (!quietest || value < quietest.value) quietest = { month: index + 1, value };
	});
	return busiest && quietest && busiest.month !== quietest.month ? { busiest: busiest.month, quietest: quietest.month } : {};
}
