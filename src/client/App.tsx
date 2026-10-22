import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import type { AgentEvent } from "../shared/events.ts";
import type { PlanPrefs, PlanTargetRef, RunModes, TripRequest } from "../shared/types.ts";
import { AgentTrace, FollowUp, Narrative } from "./components/AgentPanel.tsx";
import { BaselinePanel } from "./components/BaselinePanel.tsx";
import { EvidenceDrawer } from "./components/EvidenceDrawer.tsx";
import { HotspotHeader } from "./components/HotspotHeader.tsx";
import { IntakeForm } from "./components/IntakeForm.tsx";
import { LocalGuide } from "./components/LocalGuide.tsx";
import { Postcards } from "./components/Postcards.tsx";
import { ScenarioGrid } from "./components/ScenarioGrid.tsx";
import { Badge, Icon } from "./components/ui.tsx";
import { ZoomSection } from "./components/ZoomSection.tsx";
import { api, ApiError } from "./lib/api.ts";
import { emptyJourney, journeyReducer, type JourneyView } from "./lib/journey.ts";
import { navigate, useRoute } from "./lib/router.ts";

/** "anthropic/claude-haiku-5.5" → "Claude Haiku 5.5". */
function modelLabel(model: string): string {
	const name = model.split("/").at(-1) ?? model;
	return name.replace(/-(\d)/, " $1").replace(/-/g, " ").replace(/\b\p{L}/gu, (c) => c.toUpperCase()).replace(/Gpt/, "GPT");
}

function ModeBadges({ modes }: { modes?: RunModes }) {
	if (!modes) return null;
	return (
		<div className="flex flex-wrap gap-1.5">
			{modes.qloo === "mock" ? (
				<Badge tone="warning" title="This deployment answers from a synthetic demo world until the Qloo API key is configured.">
					Synthetic demo data
				</Badge>
			) : (
				<Badge tone="good">Live Qloo data</Badge>
			)}
			<span className="hidden sm:contents">
				{modes.agent === "scripted" ? (
					<Badge title="A deterministic planner calls the same tools as the language-model agent.">Scripted planner</Badge>
				) : (
					<Badge tone="good" title={modes.model ? `Language model: ${modes.model} (via OpenRouter)` : undefined}>
						AI agent{modes.model ? ` · ${modelLabel(modes.model)}` : ""}
					</Badge>
				)}
			</span>
		</div>
	);
}

function Header({ modes, busy }: { modes?: RunModes; busy: boolean }) {
	return (
		<header className="sticky top-0 z-20 border-b border-line/70 bg-paper/90 backdrop-blur-md">
			{busy ? (
				<div className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden" role="progressbar" aria-label="Working">
					<div className="h-full w-1/3 animate-[progress_1.4s_ease-in-out_infinite] bg-accent" />
				</div>
			) : null}
			<div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
				<a
					href="/"
					onClick={(event) => {
						event.preventDefault();
						navigate("/");
					}}
					className="font-serif text-[1.75rem] leading-none tracking-tight"
				>
					Elsewhere
				</a>
				<ModeBadges modes={modes} />
			</div>
		</header>
	);
}

function Footer({ modes }: { modes?: RunModes }) {
	return (
		<footer className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-x-10 gap-y-4 px-4 py-10 text-xs leading-relaxed text-muted sm:px-6 lg:px-8">
			<p className="max-w-3xl">
				Taste data: Qloo Insights API{modes?.qloo === "mock" ? " (this deployment currently uses a synthetic demo world)" : ""}. Popularity is Qloo's
				cultural-attention percentile, not a visitor count. Maps: © OpenStreetMap contributors, OpenFreeMap. Photos: Wikipedia (CC BY-SA). Built for
				the Qloo Agentic Hackathon.
			</p>
			<p className="font-serif text-lg text-ink italic">Spread, not shift: visit gently, spend locally.</p>
		</footer>
	);
}

const HOW_IT_WORKS = [
	["Read the hotspot", "Qloo knows how popular a place is and which months are peak season."],
	["Find the same soul", "Qloo's taste graph finds places loved by the people who love your must-sees."],
	["Make it yours", "Your favorite films, music and books re-rank every candidate."],
	["Go like a local", "A taste heatmap picks your base; a plan and local customs follow."],
] as const;

function Home({ onStart, busy }: { onStart: (request: TripRequest) => void; busy: boolean }) {
	return (
		<main>
			<section className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-16 gap-y-12 px-4 pt-10 pb-16 sm:px-6 sm:pt-16 sm:pb-24 lg:px-8">
				<div className="min-w-0 flex-[1_1_30rem] space-y-7">
					<p className="eyebrow">An AI travel agent on Qloo's taste graph</p>
					<h1 className="font-serif text-[3.5rem] leading-[0.94] tracking-[-0.015em] sm:text-7xl lg:text-[5.75rem]">
						Same soul,
						<br />
						<em>fewer crowds.</em>
					</h1>
					<p className="max-w-xl text-lg leading-relaxed text-ink-2">
						Tell Elsewhere where you were headed and what you love. It finds the quieter temple across town, the day trip with the same feel, or a twin
						city across the world, then guides you there like a local.
					</p>
					<IntakeForm onSubmit={onStart} busy={busy} />
				</div>
				<div className="min-w-0 flex-[1_1_26rem]">
					<Postcards />
				</div>
			</section>

			<div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 sm:pb-28 lg:px-8">
				<ScenarioGrid onRun={onStart} busy={busy} />
			</div>

			<section aria-labelledby="how-title" className="bg-wash">
				<div className="mx-auto max-w-7xl space-y-10 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
					<h2 id="how-title" className="max-w-2xl font-serif text-4xl leading-[1.05] sm:text-[2.75rem]">
						Four steps from <em>where everyone goes</em> to where you'll love.
					</h2>
					<ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
						{HOW_IT_WORKS.map(([title, text], index) => (
							<li key={title} className="space-y-2.5 border-t border-line pt-4">
								<span className="block font-serif text-3xl leading-none text-accent italic">{String(index + 1).padStart(2, "0")}</span>
								<p className="font-semibold">{title}</p>
								<p className="text-sm leading-relaxed text-ink-2">{text}</p>
							</li>
						))}
					</ol>
				</div>
			</section>
		</main>
	);
}

function JourneyScreen({
	view,
	selected,
	onPlan,
	onMessage,
	onShowEvidence,
	onRetry,
	onReplay,
}: {
	view: JourneyView;
	selected?: PlanTargetRef;
	onPlan: (target: PlanTargetRef, prefs?: PlanPrefs) => void;
	onMessage: (message: string) => void;
	onShowEvidence: () => void;
	onRetry: (destination: string) => void;
	onReplay: () => void;
}) {
	const running = view.status === "running";
	// Nothing to show but the problem: lead with it and a way forward.
	const deadEnd = !view.hotspot && !running && Boolean(view.error || view.clarify);
	const [copied, setCopied] = useState(false);
	const share = async () => {
		await navigator.clipboard?.writeText(window.location.href).catch(() => undefined);
		setCopied(true);
		setTimeout(() => setCopied(false), 1800);
	};

	return (
		<main className="mx-auto max-w-7xl space-y-8 px-4 pt-5 pb-12 sm:px-6 lg:px-8">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<button type="button" className="inline-flex min-h-9 items-center gap-1.5 text-sm text-ink-2 hover:text-ink" onClick={() => navigate("/")}>
					<Icon name="back" /> New journey
				</button>
				<div className="flex gap-2">
					{view.status === "done" && view.steps.length === 0 && view.journeyId ? (
						<button type="button" className="btn btn-quiet px-3.5 py-1.5 text-[0.8125rem]" onClick={onReplay}>
							<Icon name="sparkle" /> Replay the agent
						</button>
					) : null}
					{view.journeyId && view.hotspot ? (
						<button type="button" className="btn btn-quiet px-3.5 py-1.5 text-[0.8125rem]" onClick={share}>
							<Icon name="share" /> {copied ? "Link copied" : "Share"}
						</button>
					) : null}
				</div>
			</div>

			{deadEnd ? (
				<section role="alert" className="card mx-auto max-w-2xl space-y-5 p-6 sm:p-8">
					<div className="flex items-start gap-3">
						<Icon name="alert" className="mt-1.5 size-5 shrink-0 text-serious" />
						<div className="space-y-1.5">
							<h1 className="font-serif text-3xl sm:text-4xl">{view.clarify ? "Which place did you mean?" : "We couldn't read that trip"}</h1>
							<p className="text-sm text-ink-2">{view.clarify?.question ?? view.error}</p>
						</div>
					</div>
					{view.clarify && view.clarify.options.length > 0 ? (
						<div className="flex flex-wrap gap-2">
							{view.clarify.options.map((option) => (
								<button key={option} type="button" className="btn btn-quiet px-3 py-1.5 text-sm" onClick={() => onRetry(option)}>
									{option}
								</button>
							))}
						</div>
					) : null}
					<div className="flex flex-wrap items-center gap-3">
						<button type="button" className="btn btn-primary" onClick={() => navigate("/")}>
							Try another destination
						</button>
						<span className="text-xs text-muted">Tip: pick a city from the suggestions as you type.</span>
					</div>
					{view.steps.length > 0 ? (
						<AgentTrace steps={view.steps} thinking={view.thinking} running={false} evidenceCount={view.evidence.length} onShowEvidence={onShowEvidence} />
					) : null}
				</section>
			) : (
				<>
					{view.error ? (
						<div role="alert" className="card flex items-start gap-3 border-serious/40 p-4 text-sm">
							<Icon name="alert" className="mt-0.5 size-4 text-serious" />
							<span>{view.error}</span>
						</div>
					) : null}

					{view.clarify ? (
						<div className="card space-y-3 p-4">
							<p className="text-sm">{view.clarify.question}</p>
							<div className="flex flex-wrap gap-2">
								{view.clarify.options.map((option) => (
									<button key={option} type="button" className="btn btn-quiet px-3 py-1 text-sm" onClick={() => onRetry(option)}>
										{option}
									</button>
								))}
							</div>
						</div>
					) : null}

					{view.hotspot ? (
						<HotspotHeader hotspot={view.hotspot} />
					) : running ? (
						<div className="h-[clamp(21rem,34vw,28.75rem)] animate-pulse rounded-[1.75rem] bg-wash" aria-hidden="true" />
					) : null}

					<div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
						<div className="min-w-0 space-y-14">
							{view.hotspot ? (
								<ZoomSection
									hotspot={view.hotspot}
									zooms={view.zooms}
									running={running && view.activity === "journey"}
									planBusy={running}
									selected={selected}
									onPlan={(target) => onPlan(target)}
								/>
							) : null}
							{view.activity === "plan" && !view.plan ? (
								<div className="card flex items-center gap-3 p-6 text-sm text-ink-2">
									<Icon name="spinner" /> Planning it like a local…
								</div>
							) : null}
							{view.plan ? (
								<LocalGuide plan={view.plan} busy={running} onReplan={(prefs) => onPlan(view.plan?.target.ref ?? { level: "hotspot" }, prefs)} />
							) : null}
						</div>
						<aside className="space-y-4 lg:sticky lg:top-20 lg:self-start" aria-label="The agent">
							<Narrative text={view.narrative} running={running} />
							{view.steps.length > 0 ? (
								<AgentTrace
									steps={view.steps}
									thinking={view.thinking}
									running={running}
									evidenceCount={view.evidence.length}
									onShowEvidence={onShowEvidence}
								/>
							) : null}
							<FollowUp modes={view.modes} busy={running} onSend={onMessage} />
							<BaselinePanel request={view.request} />
						</aside>
					</div>
				</>
			)}
		</main>
	);
}

export function App() {
	const route = useRoute();
	const [view, dispatch] = useReducer(journeyReducer, emptyJourney);
	const [modes, setModes] = useState<RunModes | undefined>();
	const [selected, setSelected] = useState<PlanTargetRef | undefined>();
	const [evidenceOpen, setEvidenceOpen] = useState(false);
	const controller = useRef<AbortController | undefined>(undefined);

	useEffect(() => {
		api
			.health()
			.then((health) => setModes(health.modes))
			.catch(() => undefined);
	}, []);

	useEffect(() => {
		if (route.name !== "journey" || view.journeyId === route.id) return;
		api
			.journey(route.id)
			.then((snapshot) => dispatch({ type: "snapshot", snapshot }))
			.catch(() => dispatch({ type: "failed", message: "That journey could not be found." }));
	}, [route, view.journeyId]);

	const onEvent = useCallback((event: AgentEvent) => {
		dispatch({ type: "event", event });
		if (event.type === "run.start") navigate(`/j/${event.journeyId}`);
	}, []);

	const run = useCallback(async (task: (signal: AbortSignal) => Promise<void>) => {
		controller.current?.abort();
		const current = new AbortController();
		controller.current = current;
		try {
			await task(current.signal);
			if (!current.signal.aborted) dispatch({ type: "settled" });
		} catch (error) {
			if (current.signal.aborted) return;
			dispatch({ type: "failed", message: error instanceof ApiError ? error.message : "The connection dropped. Please try again." });
		}
	}, []);

	const start = useCallback(
		(request: TripRequest) => {
			setSelected(undefined);
			dispatch({ type: "begin", activity: "journey", request });
			window.scrollTo({ top: 0 });
			void run((signal) => api.startJourney(request, onEvent, signal));
		},
		[run, onEvent],
	);

	const plan = useCallback(
		(target: PlanTargetRef, prefs: PlanPrefs = {}) => {
			if (!view.journeyId) return;
			const id = view.journeyId;
			setSelected(target);
			dispatch({ type: "begin", activity: "plan" });
			void run(async (signal) => {
				await api.plan(id, target, prefs, onEvent, signal);
				document.getElementById("guide")?.scrollIntoView({ behavior: "smooth", block: "start" });
			});
		},
		[view.journeyId, run, onEvent],
	);

	const message = useCallback(
		(text: string) => {
			if (!view.journeyId) return;
			const id = view.journeyId;
			dispatch({ type: "begin", activity: "message", userMessage: text });
			void run((signal) => api.message(id, text, onEvent, signal));
		},
		[view.journeyId, run, onEvent],
	);

	const replay = useCallback(async () => {
		if (!view.journeyId) return;
		const events = await api.events(view.journeyId).catch(() => []);
		if (events.length === 0) return;
		dispatch({ type: "begin", activity: "journey", request: view.request });
		let previous = 0;
		for (const { t, e } of events) {
			await new Promise((resolve) => setTimeout(resolve, Math.min(700, Math.max(0, (t - previous) / 2))));
			previous = t;
			dispatch({ type: "event", event: e });
		}
	}, [view.journeyId, view.request]);

	const currentModes = view.modes ?? modes;
	const busy = view.status === "running";

	return (
		<>
			<Header modes={currentModes} busy={busy} />
			{route.name === "home" ? (
				<Home onStart={start} busy={busy} />
			) : (
				<JourneyScreen
					view={view}
					selected={selected}
					onPlan={plan}
					onMessage={message}
					onShowEvidence={() => setEvidenceOpen(true)}
					onRetry={(destination) => view.request && start({ ...view.request, destination })}
					onReplay={() => void replay()}
				/>
			)}
			<Footer modes={currentModes} />
			<EvidenceDrawer open={evidenceOpen} evidence={view.evidence} mock={currentModes?.qloo === "mock"} onClose={() => setEvidenceOpen(false)} />
		</>
	);
}
