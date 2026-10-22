import { useLayoutEffect, useRef, useState } from "react";
import { monthName } from "../../shared/format.ts";
import type { SeasonInfo } from "../../shared/types.ts";

type MonthTag = "peak" | "best" | "worst" | "off";

const TAG_TEXT: Record<MonthTag, string> = {
	peak: "Peak tourism month (Qloo tag)",
	best: "Best month to visit (Qloo tag)",
	worst: "Worst month for travel, usually weather (Qloo tag)",
	off: "Off-season (Qloo tag)",
};

const TAG_LABEL: Record<MonthTag, string> = { peak: "Peak", best: "Best", worst: "Worst", off: "Off-season" };

const TAG_CELL: Record<MonthTag, string> = {
	peak: "bg-warning/30",
	best: "bg-good/15",
	worst: "bg-serious/20",
	off: "bg-wash",
};

function tagOf(season: SeasonInfo, month: number): MonthTag | undefined {
	if (season.peakMonths.includes(month)) return "peak";
	if (season.bestMonths.includes(month)) return "best";
	if (season.worstMonths.includes(month)) return "worst";
	if (season.offSeasonMonths.includes(month)) return "off";
	return undefined;
}

/** Twelve months of crowd signals for the destination: Qloo's month tags, with each month's events on hover or focus. */
export function CrowdCalendar({ season, place }: { season: SeasonInfo; place: string }) {
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
	const used = (["peak", "best", "worst", "off"] as const).filter((tag) =>
		Array.from({ length: 12 }, (_, i) => tagOf(season, i + 1)).includes(tag),
	);
	if (used.length === 0) return null;

	const describe = (index: number) => {
		const month = index + 1;
		const tag = tagOf(season, month);
		const parts = [monthName(month)];
		if (month === season.month) parts.push("your travel month");
		parts.push(tag ? TAG_TEXT[tag] : "Shoulder month");
		if (season.peakMonths.includes(month) && season.bestMonths.includes(month)) parts.push("also a best month to visit");
		const events = season.calendar?.[index]?.events ?? [];
		if (events.length > 0) parts.push(`events: ${events.join(", ")}`);
		return parts.join("; ");
	};

	const tip = active === undefined ? undefined : describe(active).split("; ");

	return (
		<figure className="space-y-3">
			<div className="relative" ref={frame}>
				<ol className="grid grid-cols-12 gap-1" aria-label={`Crowd calendar for ${place}`}>
					{Array.from({ length: 12 }, (_, index) => {
						const month = index + 1;
						const tag = tagOf(season, month);
						const isTravel = month === season.month;
						const hasEvent = (season.calendar?.[index]?.events.length ?? 0) > 0;
						return (
							<li key={month}>
								<button
									type="button"
									aria-label={describe(index)}
									onMouseEnter={() => setActive(index)}
									onMouseLeave={() => setActive(undefined)}
									onFocus={() => setActive(index)}
									onBlur={() => setActive(undefined)}
									className={`relative flex h-14 w-full flex-col items-center justify-end rounded-lg pb-1.5 text-[11px] leading-none ${
										tag ? TAG_CELL[tag] : "border border-line"
									} ${isTravel ? "ring-2 ring-ink ring-offset-2 ring-offset-card" : ""}`}
								>
									{hasEvent ? <span className="absolute top-1.5 size-1 rounded-full bg-ink-2" /> : null}
									<span className={isTravel ? "font-semibold text-ink" : "text-ink-2"}>{monthName(month).slice(0, 1)}</span>
								</button>
							</li>
						);
					})}
				</ol>
				{tip ? (
					<div
						ref={tipBox}
						className="pointer-events-none absolute bottom-full z-10 mb-2 w-max max-w-[min(16rem,100%)] rounded-xl border border-line bg-card px-3 py-2 text-xs shadow-sm"
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
			<figcaption className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
				{used.map((tag) => (
					<span key={tag} className="inline-flex items-center gap-1.5">
						<span className={`inline-block size-2.5 rounded-sm ${TAG_CELL[tag]}`} />
						{TAG_LABEL[tag]}
					</span>
				))}
				{season.calendar ? (
					<span className="inline-flex items-center gap-1.5">
						<span className="inline-block size-1 rounded-full bg-ink-2" />
						Event
					</span>
				) : null}
				<span>Qloo month tags</span>
			</figcaption>
		</figure>
	);
}
