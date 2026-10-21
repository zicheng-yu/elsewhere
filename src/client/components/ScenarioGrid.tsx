import { useState } from "react";
import { monthName } from "../../shared/format.ts";
import { PERSONAS, SCENARIOS, type Scenario } from "../../shared/scenarios.ts";
import { ZOOM_LEVELS, type TripRequest } from "../../shared/types.ts";
import { Icon } from "./ui.tsx";

function ScenarioCard({ scenario, onRun, busy }: { scenario: Scenario; onRun: (request: TripRequest) => void; busy: boolean }) {
	const [persona, setPersona] = useState<string>("as-written");
	const run = () => {
		const chosen = PERSONAS.find((p) => p.id === persona);
		onRun(chosen ? { ...scenario.request, favorites: chosen.favorites, vibes: chosen.vibes } : scenario.request);
	};
	const levels = ZOOM_LEVELS.filter((l) => scenario.request.zooms?.includes(l.id)).map((l) => l.label);
	return (
		<article className="card flex flex-col gap-3 p-5">
			<div className="space-y-1">
				<p className="eyebrow">{monthName(scenario.request.month)}</p>
				<h3 className="font-serif text-xl">{scenario.title}</h3>
				<p className="text-sm text-ink-2">{scenario.blurb}</p>
			</div>
			<p className="text-xs text-muted">{scenario.context}</p>
			<p className="text-xs text-ink-2">{levels.join(" · ")}</p>
			<div className="mt-auto space-y-3">
				<label className="block text-xs text-ink-2">
					Taste
					<select className="input mt-1 py-1.5 text-sm" value={persona} onChange={(event) => setPersona(event.target.value)}>
						<option value="as-written">{scenario.request.favorites.join(", ")}</option>
						{PERSONAS.map((p) => (
							<option key={p.id} value={p.id}>
								{p.label}: {p.favorites.slice(0, 2).join(", ")}
							</option>
						))}
					</select>
				</label>
				<button type="button" className="btn btn-quiet w-full" onClick={run} disabled={busy}>
					<Icon name="arrow" /> Run this journey
				</button>
			</div>
		</article>
	);
}

export function ScenarioGrid({ onRun, busy }: { onRun: (request: TripRequest) => void; busy: boolean }) {
	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{SCENARIOS.map((scenario) => (
				<ScenarioCard key={scenario.id} scenario={scenario} onRun={onRun} busy={busy} />
			))}
		</div>
	);
}
