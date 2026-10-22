import { pct, percentile } from "../../shared/format.ts";
import type { DupeScore } from "../../shared/types.ts";

/** Dupe Score breakdown: one meter per component, value in text ink, source on hover/focus. */
export function ScoreMeters({ score, showTotal = true }: { score: DupeScore; showTotal?: boolean }) {
	return (
		<div className="space-y-2">
			{showTotal ? (
				<div className="flex items-baseline justify-between">
					<span className="text-sm text-ink-2">Dupe Score</span>
					<span className="text-2xl font-semibold">{Math.round(score.total * 100)}</span>
				</div>
			) : null}
			<ul className="space-y-1.5">
				{score.components.map((component) => (
					<li key={component.key} className="grid grid-cols-[6rem_1fr_2.25rem] items-center gap-2.5 text-xs" title={component.source}>
						<span className="text-ink-2">{component.label}</span>
						<span
							role="meter"
							aria-label={`${component.label}: ${pct(component.value)}. ${component.source}`}
							aria-valuemin={0}
							aria-valuemax={100}
							aria-valuenow={Math.round(component.value * 100)}
							className="relative h-1 overflow-hidden rounded-full bg-meter-track"
						>
							<span className="absolute inset-y-0 left-0 rounded-full bg-meter" style={{ width: `${Math.max(2, component.value * 100)}%` }} />
						</span>
						<span className="tabular text-right text-ink">{pct(component.value)}</span>
					</li>
				))}
			</ul>
			<p className="text-[11px] leading-snug text-muted">
				Weighted: {score.components.map((c) => `${c.label.toLowerCase()} ${Math.round(c.weight * 100)}%`).join(" · ")}
			</p>
		</div>
	);
}

/** The total as a pill that sits on a card's photo. */
export function ScorePill({ score }: { score: DupeScore }) {
	return (
		<span className="absolute top-3 left-3 inline-flex items-baseline gap-1.5 rounded-full bg-card/95 px-3 py-1.5 text-xs text-ink-2">
			Dupe Score <strong className="text-[0.95rem] font-semibold text-ink">{Math.round(score.total * 100)}</strong>
		</span>
	);
}

/**
 * Before → after popularity percentiles on a shared 0–100 track (a small dumbbell).
 * The card heading already names both places, so the caption carries only the values.
 */
export function PopularityShift({ from, to, fromLabel, toLabel }: { from?: number; to?: number; fromLabel: string; toLabel: string }) {
	if (from === undefined || to === undefined) return null;
	const x = (p: number) => `${Math.min(100, Math.max(0, p * 100))}%`;
	const left = Math.min(from, to);
	const width = Math.abs(from - to);
	return (
		<figure className="space-y-1.5">
			<figcaption className="flex items-baseline justify-between gap-2 text-xs">
				<span className="text-ink-2">Popularity</span>
				<span className="tabular flex items-center gap-1.5 text-ink" aria-hidden="true">
					<span className="inline-block size-2 rounded-full bg-viz-muted" title={fromLabel} />
					{percentile(from)}
					<span className="text-muted">→</span>
					<span className="inline-block size-2 rounded-full bg-viz-accent" title={toLabel} />
					{percentile(to)}
				</span>
			</figcaption>
			<div
				className="relative mx-1.5 h-3"
				role="img"
				aria-label={`Popularity: ${fromLabel} at the ${percentile(from)} percentile, ${toLabel} at the ${percentile(to)} percentile`}
			>
				<span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-line" />
				<span className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-viz-muted/60" style={{ left: x(left), width: `${width * 100}%` }} />
				<span
					className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-viz-muted ring-2 ring-card"
					style={{ left: x(from) }}
				/>
				<span
					className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-viz-accent ring-2 ring-card"
					style={{ left: x(to) }}
				/>
			</div>
		</figure>
	);
}
