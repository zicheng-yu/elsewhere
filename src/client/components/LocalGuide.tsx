import { lazy, Suspense, useMemo, useState } from "react";
import { pct } from "../../shared/format.ts";
import type { LocalPlan, PlanPrefs, PlanSlot } from "../../shared/types.ts";
import { MapLegend } from "./MapLegend.tsx";
import type { MapPoint } from "./MapView.tsx";
import { Icon } from "./ui.tsx";

const MapView = lazy(() => import("./MapView.tsx"));

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

	return (
		<section id="guide" className="space-y-6 scroll-mt-24" aria-label={`Go like a local in ${plan.target.name}`}>
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div className="space-y-1">
					<p className="eyebrow">Go like a local</p>
					<h2 className="font-serif text-3xl">{plan.target.name}</h2>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<button
						type="button"
						className="btn btn-quiet"
						aria-pressed={plan.quieter}
						onClick={() => onReplan({ quieter: !plan.quieter, days: plan.days.length })}
						disabled={busy}
					>
						<Icon name="leaf" /> {plan.quieter ? "Quieter: on" : "Make it quieter"}
					</button>
					<form
						className="input flex w-56 items-center gap-2 py-1.5"
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
						<button type="submit" className="text-ink-2" disabled={busy || !vibe.trim()} aria-label="Re-plan with this vibe">
							{busy ? <Icon name="spinner" /> : <Icon name="arrow" />}
						</button>
					</form>
				</div>
			</div>

			{plan.stayArea ? (
				<div className="card flex items-start gap-3 p-4">
					<Icon name="pin" className="mt-0.5 size-5 text-viz-fill" />
					<p className="text-sm">
						<span className="font-medium">Base yourself around {plan.stayArea.label}.</span>{" "}
						<span className="text-ink-2">Qloo's heatmap shows your taste concentrating there ({pct(plan.stayArea.affinity)} affinity).</span>
					</p>
				</div>
			) : null}

			{plan.days.length > 1 ? (
				<div role="tablist" aria-label="Days" className="flex gap-2">
					{plan.days.map((d, index) => (
						<button
							key={d.title}
							type="button"
							role="tab"
							aria-selected={index === day}
							onClick={() => setDay(index)}
							className={`rounded-full border px-3 py-1 text-sm ${index === day ? "border-ink bg-ink text-card" : "border-line text-ink-2"}`}
						>
							Day {index + 1}
						</button>
					))}
				</div>
			) : null}

			<div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
				<ol className="space-y-3" aria-label={current?.title}>
					{current?.stops.map((stop, index) => (
						<li key={`${stop.place.id}-${index}`} className="card grid grid-cols-[2rem_1fr] gap-3 p-4">
							<span className="grid size-7 place-items-center rounded-full bg-ink text-xs font-semibold text-card">{index + 1}</span>
							<div className="space-y-0.5">
								<p className="text-xs text-muted">{SLOT_LABELS[stop.slot]}</p>
								<p className="font-medium">{stop.place.name}</p>
								<p className="text-sm text-ink-2">{stop.note}</p>
							</div>
						</li>
					))}
				</ol>
				<div className="space-y-3">
					<Suspense fallback={<div className="h-[26rem] rounded-2xl border border-line bg-wash" />}>
						<MapView heat={plan.heat} points={stops} route={stops} stayArea={stayArea} height="26rem" ariaLabel={`Map of ${current?.title ?? "the plan"}`} />
					</Suspense>
					<MapLegend heat={plan.heat.length > 0} stops />
				</div>
			</div>

			{plan.customs.length > 0 ? (
				<div className="space-y-3">
					<h3 className="font-serif text-2xl">Local customs</h3>
					<div className="grid gap-3 sm:grid-cols-2">
						{plan.customs.map((note) => (
							<div key={note.topic} className="card p-4">
								<p className="text-sm font-medium">{note.topic}</p>
								<p className="mt-1 text-sm text-ink-2">{note.text}</p>
							</div>
						))}
					</div>
					<p className="text-xs text-muted">General guidance written for Elsewhere. Local rules change; check current local information.</p>
				</div>
			) : null}

			{plan.goodGuest.length > 0 ? (
				<div className="card space-y-2 p-5">
					<h3 className="flex items-center gap-2 font-medium">
						<Icon name="leaf" className="size-4 text-good" /> Be a good guest
					</h3>
					<ul className="list-disc space-y-1 pl-5 text-sm text-ink-2">
						{plan.goodGuest.map((tip) => (
							<li key={tip}>{tip}</li>
						))}
					</ul>
				</div>
			) : null}
		</section>
	);
}
