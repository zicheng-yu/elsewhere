import { useLayoutEffect, useRef, useState } from "react";
import { monthName, percentile } from "../../shared/format.ts";
import { monthlyAttention } from "../../shared/trend.ts";
import type { SeasonInfo, TrendPoint } from "../../shared/types.ts";

type MonthTag = "peak" | "best" | "off";

const TAG_TEXT: Record<MonthTag, string> = {
	peak: "Peak tourism month (Qloo tag)",
	best: "Best month to visit (Qloo tag)",
	off: "Off-season (Qloo tag)",
};

const TAG_CELL: Record<MonthTag, string> = {
	peak: "bg-warning/25",
	best: "bg-good/15",
	off: "bg-wash",
};

function tagOf(season: SeasonInfo, month: number): MonthTag | undefined {
	if (season.peakMonths.includes(month)) return "peak";
	if (season.bestMonths.includes(month)) return "best";
	if (season.offSeasonMonths.includes(month)) return "off";
	return undefined;
}

/** Position of a date along a Jan–Dec axis in [0, 1], so a past-year series reads as one calendar year. */
function yearPosition(date: string): number {
	const day = new Date(`${date}T00:00:00Z`);
	const month = day.getUTCMonth();
	const length = new Date(Date.UTC(day.getUTCFullYear(), month + 1, 0)).getUTCDate();
	return (month + (day.getUTCDate() - 0.5) / length) / 12;
}

function Sparkline({ trend }: { trend: TrendPoint[] }) {
	const values = trend.map((p) => p.percentile);
	const lo = Math.min(...values);
	const hi = Math.max(...values);
	const pad = Math.max(0.002, (hi - lo) * 0.15);
	const bottom = lo - pad;
	const top = hi + pad;
	const points = trend
		.map((p) => [yearPosition(p.date) * 1200, 100 - ((p.percentile - bottom) / (top - bottom)) * 100] as const)
		.sort((a, b) => a[0] - b[0]);
	const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
	const first = points[0];
	const last = points.at(-1);
	const area = first && last ? `${line} L${last[0].toFixed(1)} 100 L${first[0].toFixed(1)} 100 Z` : "";
	return (
		<svg viewBox="0 0 1200 100" preserveAspectRatio="none" className="block h-9 w-full overflow-visible" aria-hidden="true">
			<path d={area} className="fill-viz-track" opacity={0.55} />
			<path d={line} fill="none" className="stroke-viz-fill" strokeWidth={2} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
		</svg>
	);
}

/**
 * Twelve months of crowd signals for the destination: Qloo's month tags as cells,
 * and, when the trending endpoint answers, the past year's weekly attention above them.
 */
export function CrowdCalendar({ season, trend, place }: { season: SeasonInfo; trend?: TrendPoint[]; place: string }) {
	const [active, setActive] = useState<number | undefined>();
	const [tipLeft, setTipLeft] = useState(0);
	const frame = useRef<HTMLDivElement>(null);
	const tipBox = useRef<HTMLDivElement>(null);
	// Center the tooltip over its month, kept inside the calendar's width.
	useLayoutEffect(() => {
		if (active === undefined || !frame.current || !tipBox.current) return;
		const width = frame.current.clientWidth;
		const tipWidth = tipBox.current.offsetWidth;
		setTipLeft(Math.max(0, Math.min(width - tipWidth, ((active + 0.5) / 12) * width - tipWidth / 2)));
	}, [active]);
	const monthly = monthlyAttention(trend);
	const hasTrend = (trend?.length ?? 0) > 0;
	const hasTags = season.peakMonths.length + season.bestMonths.length + season.offSeasonMonths.length > 0;
	if (!hasTrend && !hasTags) return null;

	const values = trend?.map((p) => p.percentile) ?? [];
	const range = hasTrend ? `${percentile(Math.min(...values))} to ${percentile(Math.max(...values))} percentile` : "";

	const describe = (index: number) => {
		const month = index + 1;
		const tag = tagOf(season, month);
		const parts = [monthName(month)];
		if (month === season.month) parts.push("your travel month");
		parts.push(tag ? TAG_TEXT[tag] : "Shoulder month");
		if (season.peakMonths.includes(month) && season.bestMonths.includes(month)) parts.push("also a best month to visit");
		const attention = monthly[index];
		if (attention !== undefined) parts.push(`weekly attention averaged the ${percentile(attention)} percentile`);
		return parts.join("; ");
	};

	const tip = active === undefined ? undefined : describe(active).split("; ");

	return (
		<figure className="space-y-1.5">
			<p className="text-xs text-muted">Crowd calendar</p>
			<div className="relative" ref={frame}>
				{hasTrend && trend ? <Sparkline trend={trend} /> : null}
				<ol className="grid grid-cols-12 gap-0.5" aria-label={`Crowd calendar for ${place}`}>
					{Array.from({ length: 12 }, (_, index) => {
						const month = index + 1;
						const tag = tagOf(season, month);
						const isTravel = month === season.month;
						return (
							<li key={month}>
								<button
									type="button"
									aria-label={describe(index)}
									onMouseEnter={() => setActive(index)}
									onMouseLeave={() => setActive(undefined)}
									onFocus={() => setActive(index)}
									onBlur={() => setActive(undefined)}
									className={`flex h-10 w-full flex-col items-center justify-center rounded-md text-[10px] leading-tight ${
										tag ? TAG_CELL[tag] : "border border-line"
									} ${isTravel ? "ring-2 ring-ink ring-offset-1 ring-offset-card" : ""}`}
								>
									<span className={isTravel ? "font-semibold text-ink" : "text-ink-2"}>{monthName(month).slice(0, 3)}</span>
									{tag ? <span className="text-[9px] text-ink-2">{tag}</span> : null}
								</button>
							</li>
						);
					})}
				</ol>
				{tip ? (
					<div
						ref={tipBox}
						className="pointer-events-none absolute bottom-full z-10 mb-1.5 w-max max-w-[min(15rem,100%)] rounded-lg border border-line bg-card px-2.5 py-1.5 text-xs shadow-sm"
						style={{ left: tipLeft }}
						aria-hidden="true"
					>
						<p className="font-medium text-ink">{tip[0]}</p>
						{tip.slice(1).map((line) => (
							<p key={line} className="text-ink-2">
								{line.charAt(0).toUpperCase() + line.slice(1)}
							</p>
						))}
					</div>
				) : null}
			</div>
			<figcaption className="text-[11px] leading-snug text-muted">
				Cells: Qloo month tags for {place}.{hasTrend ? ` Line: weekly attention over the past year, ${range} (not to zero).` : ""}
			</figcaption>
		</figure>
	);
}
