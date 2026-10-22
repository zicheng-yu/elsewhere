import { useState } from "react";
import { monthName } from "../../shared/format.ts";
import { PERSONAS, SCENARIOS, type Persona, type Scenario } from "../../shared/scenarios.ts";
import type { TripRequest } from "../../shared/types.ts";
import { SCENARIO_COVERS } from "../lib/covers.ts";
import { Icon } from "./ui.tsx";

function ScenarioCard({ scenario, persona, onRun, busy }: { scenario: Scenario; persona?: Persona; onRun: (request: TripRequest) => void; busy: boolean }) {
	const cover = SCENARIO_COVERS[scenario.id];
	const run = () => onRun(persona ? { ...scenario.request, favorites: persona.favorites, vibes: persona.vibes } : scenario.request);
	return (
		<article className="group relative flex flex-col gap-4">
			<div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-frame">
				{cover ? (
					<img src={cover.url} alt={cover.alt} loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.035]" />
				) : null}
				<span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-card/95 px-2.5 py-1 text-xs font-semibold text-ink">
					<Icon name="calendar" className="size-3.5" />
					{monthName(scenario.request.month)}
				</span>
				{cover ? (
					<a href={cover.pageUrl} target="_blank" rel="noreferrer" className="photo-credit right-2.5 bottom-2.5 z-10">
						Wikipedia
					</a>
				) : null}
			</div>
			<div className="space-y-1.5 px-0.5">
				<h3 className="font-serif text-[1.75rem] leading-[1.05]">
					<button
						type="button"
						onClick={run}
						disabled={busy}
						className="text-left after:absolute after:inset-0 after:rounded-[1.25rem] after:content-[''] hover:underline hover:decoration-1 hover:underline-offset-4 disabled:cursor-not-allowed"
					>
						{scenario.title}
					</button>
				</h3>
				<p className="text-sm leading-relaxed text-ink-2">{scenario.blurb}</p>
				<p className="flex gap-2 pt-1 text-xs leading-relaxed text-muted">
					<span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
					<span className="line-clamp-2">{scenario.context}</span>
				</p>
			</div>
		</article>
	);
}

export function ScenarioGrid({ onRun, busy }: { onRun: (request: TripRequest) => void; busy: boolean }) {
	const [personaId, setPersonaId] = useState<string>("as-written");
	const persona = PERSONAS.find((p) => p.id === personaId);
	return (
		<section aria-labelledby="featured" className="space-y-9">
			<div className="flex flex-wrap items-end justify-between gap-6 border-t border-line pt-10">
				<div className="max-w-2xl space-y-2.5">
					<p className="eyebrow">Featured journeys</p>
					<h2 id="featured" className="font-serif text-[2.5rem] leading-none sm:text-5xl">
						Start from an overtouristed classic
					</h2>
					<p className="text-[0.95rem] leading-relaxed text-ink-2">
						Each one is a real hotspot; every alternative is computed live. Swap the taste to see the picks change.
					</p>
				</div>
				<div className="space-y-2">
					<div className="segmented" role="group" aria-label="Taste for every journey">
						{[{ id: "as-written", label: "As written" }, ...PERSONAS].map((p) => (
							<button key={p.id} type="button" className="segment" aria-pressed={personaId === p.id} onClick={() => setPersonaId(p.id)}>
								{p.label}
							</button>
						))}
					</div>
					<p className="max-w-md pl-2 text-xs text-muted">
						{persona ? `${persona.favorites.join(", ")} · ${persona.vibes.join(", ")}` : "Each journey keeps the taste it was written with."}
					</p>
				</div>
			</div>
			<div className="grid gap-x-6 gap-y-11 sm:grid-cols-2 lg:grid-cols-4">
				{SCENARIOS.map((scenario) => (
					<ScenarioCard key={scenario.id} scenario={scenario} persona={persona} onRun={onRun} busy={busy} />
				))}
			</div>
		</section>
	);
}
