import { lazy, Suspense, useMemo, useState } from "react";
import { pct } from "../../shared/format.ts";
import type { LocalPlan, PlanPrefs, PlanSlot } from "../../shared/types.ts";
import { MapLegend } from "./MapLegend.tsx";
import type { MapPoint } from "./MapView.tsx";
import { PlacePhoto, placeSubject } from "./PlacePhoto.tsx";
import { Icon } from "./ui.tsx";

const MapView = lazy(() => import("./MapView.tsx"));

const MOSAIC_ORDER: PlanSlot[] = ["morning", "afternoon", "evening", "coffee", "lunch", "dinner"];

const SLOT_LABELS: Record<PlanSlot, string> = {
	morning: "Morning",
	lunch: "Lunch",
	afternoon: "Afternoon",
	coffee: "Coffee",
	dinner: "Dinner",
	evening: "Evening",
};

export function LocalGuide({ plan, busy, onReplan }: { plan: LocalPlan; busy: boolean; onReplan: (prefs: PlanPrefs) => void }) {
	const [day, setDay] = useState(0);
	const [vibe, setVibe] = useState("");
	const current = plan.days[Math.min(day, plan.days.length - 1)];

	const stops = useMemo<MapPoint[]>(
		() =>
			(current?.stops ?? []).map((stop, index) => ({
				id: `${stop.place.id}-${index}`,
				lat: stop.place.lat,
				lon: stop.place.lon,
				label: stop.place.name,
				kind: "stop",
				order: index + 1,
			})),
		[current],
	);
	const stayArea = useMemo(() => (plan.stayArea ? { geohash: plan.stayArea.geohash } : undefined), [plan.stayArea]);

	// Sights photograph best, so they lead; the mosaic keeps the first three that found a photo.
	const featured = [...(current?.stops ?? [])]
		.filter((stop, index, all) => all.findIndex((s) => s.place.id === stop.place.id) === index)
		.sort((a, b) => MOSAIC_ORDER.indexOf(a.slot) - MOSAIC_ORDER.indexOf(b.slot))
		.slice(0, 6);
	const dayCount = plan.days.length === 1 ? "One day" : `${plan.days.length} days`;

	return (
		<section id="guide" className="scroll-mt-24 space-y-8" aria-label={`Go like a local in ${plan.target.name}`}>
			<div className="flex flex-wrap items-end justify-between gap-5">
				<div className="space-y-2">
					<p className="eyebrow">Go like a local</p>
					<h2 className="font-serif text-[3.25rem] leading-[0.95] tracking-[-0.01em] sm:text-6xl">
						{plan.target.name}
						{plan.quieter ? <em>, quietly</em> : null}
					</h2>
					<p className="text-[0.95rem] text-ink-2">{dayCount}, planned around your taste</p>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<button
						type="button"
						className={`btn btn-quiet min-h-11 ${plan.quieter ? "border-ink bg-wash" : ""}`}
						aria-pressed={plan.quieter}
						onClick={() => onReplan({ quieter: !plan.quieter, days: plan.days.length })}
						disabled={busy}
					>
						<Icon name="leaf" /> {plan.quieter ? "Quieter: on" : "Make it quieter"}
					</button>
					<form
						className="flex min-h-11 w-60 items-center gap-1.5 rounded-full border border-line bg-card p-1 pl-4 focus-within:border-ink"
						onSubmit={(event) => {
							event.preventDefault();
							if (!vibe.trim()) return;
							onReplan({ quieter: plan.quieter, extraVibes: [vibe.trim()], days: plan.days.length });
							setVibe("");
						}}
					>
						<input
							className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
							placeholder="Add a vibe: jazz, books…"
							value={vibe}
							onChange={(event) => setVibe(event.target.value)}
							aria-label="Add a vibe and re-plan"
						/>
						<button
							type="submit"
							className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-paper disabled:opacity-40"
							disabled={busy || !vibe.trim()}
							aria-label="Re-plan with this vibe"
						>
							{busy ? <Icon name="spinner" /> : <Icon name="arrow" />}
						</button>
					</form>
				</div>
			</div>

			{featured.length > 0 ? (
				<div className="flex h-[clamp(13.75rem,26vw,23.75rem)] gap-2.5 empty:hidden [&>*]:min-w-0 [&>*]:flex-1 [&>*:first-child]:flex-[2] [&>*:nth-child(n+4)]:hidden">
					{featured.map((stop) => (
						<PlacePhoto key={stop.place.id} subject={placeSubject(stop.place)} stamp="none" credit="top-right" className="rounded-3xl">
							<span className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] truncate rounded-full bg-card/95 px-3 py-1.5 text-[0.8125rem] font-medium text-ink">
								{(current?.stops.findIndex((s) => s.place.id === stop.place.id) ?? 0) + 1} · {stop.place.name}
							</span>
						</PlacePhoto>
					))}
				</div>
			) : null}

			{plan.stayArea ? (
				<div className="flex items-start gap-3.5 rounded-[1.25rem] bg-wash p-4">
					<span className="grid size-10 shrink-0 place-items-center rounded-full bg-card text-viz-fill">
						<Icon name="pin" className="size-5" />
					</span>
					<p className="pt-2 text-[0.95rem] leading-relaxed">
						<span className="font-semibold">Base yourself around {plan.stayArea.label}.</span>{" "}
						<span className="text-ink-2">Qloo's heatmap shows your taste concentrating there ({pct(plan.stayArea.affinity)} affinity).</span>
					</p>
				</div>
			) : null}

			{plan.days.length > 1 ? (
				<div role="tablist" aria-label="Days" className="segmented">
					{plan.days.map((d, index) => (
						<button key={d.title} type="button" role="tab" aria-selected={index === day} onClick={() => setDay(index)} className="segment" title={d.title}>
							Day {index + 1}
						</button>
					))}
				</div>
			) : null}

			<div className="grid gap-8 xl:grid-cols-2">
				<ol aria-label={current?.title}>
					{current?.stops.map((stop, index) => (
						<li key={`${stop.place.id}-${index}`} className="grid grid-cols-[1.75rem_5rem_minmax(0,1fr)] gap-4 sm:grid-cols-[1.75rem_7rem_minmax(0,1fr)]">
							<div className="flex flex-col items-center gap-1.5">
								<span className="grid size-7 shrink-0 place-items-center rounded-full bg-ink text-xs font-semibold text-paper">{index + 1}</span>
								{index < current.stops.length - 1 ? <span className="w-px flex-1 bg-line" /> : null}
							</div>
							<div className="pb-7">
								<PlacePhoto subject={placeSubject(stop.place)} stamp="icon" credit={false} className="aspect-[4/3] w-full rounded-[0.875rem]" />
							</div>
							<div className="min-w-0 space-y-1 pb-7">
								<p className="text-xs text-muted">{SLOT_LABELS[stop.slot]}</p>
								<p className="font-serif text-[1.6rem] leading-[1.1]">{stop.place.name}</p>
								<p className="text-sm leading-relaxed text-ink-2">{stop.note}</p>
								{stop.place.categories[0] || stop.place.neighborhood ? (
									<p className="pt-0.5 text-xs text-muted">{[stop.place.categories[0], stop.place.neighborhood].filter(Boolean).join(" · ")}</p>
								) : null}
							</div>
						</li>
					))}
				</ol>
				<div className="space-y-3 xl:sticky xl:top-20 xl:self-start">
					<Suspense fallback={<div className="h-[30rem] rounded-[1.375rem] border border-line bg-wash" />}>
						<MapView heat={plan.heat} points={stops} route={stops} stayArea={stayArea} height="30rem" ariaLabel={`Map of ${current?.title ?? "the plan"}`} />
					</Suspense>
					<MapLegend heat={plan.heat.length > 0} stops />
				</div>
			</div>

			{plan.customs.length + plan.goodGuest.length > 0 ? (
				<div className="space-y-5 border-t border-line pt-8">
					<div className="space-y-1.5">
						<h3 className="font-serif text-[2.5rem] leading-none">Be a good guest in {plan.target.name}</h3>
						<p className="text-sm text-ink-2">Local customs worth knowing before you go.</p>
					</div>
					{plan.customs.length > 0 ? (
						<div className="grid gap-3.5 sm:grid-cols-2">
							{plan.customs.map((note) => (
								<div key={note.topic} className="space-y-2 rounded-[1.25rem] bg-wash p-5">
									<p className="text-[0.95rem] font-semibold">{note.topic}</p>
									<p className="text-sm leading-relaxed text-ink-2">{note.text}</p>
								</div>
							))}
						</div>
					) : null}
					{plan.goodGuest.length > 0 ? (
						<ul className="card space-y-3 p-5">
							{plan.goodGuest.map((tip) => (
								<li key={tip} className="grid grid-cols-[1.25rem_1fr] gap-3 text-sm leading-relaxed">
									<Icon name="check" className="mt-0.5 size-4.5 text-good" />
									<span>{tip}</span>
								</li>
							))}
						</ul>
					) : null}
					<p className="text-xs text-muted">General guidance written for Elsewhere. Local rules change; check current local information.</p>
				</div>
			) : null}
		</section>
	);
}
