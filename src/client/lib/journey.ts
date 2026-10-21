import type { AgentEvent } from "../../shared/events.ts";
import type {
	Evidence,
	Hotspot,
	JourneySnapshot,
	LocalPlan,
	RunModes,
	TripRequest,
	ZoomLevel,
	ZoomResult,
} from "../../shared/types.ts";

export interface TraceStep {
	id: string;
	label: string;
	status: "running" | "done" | "error";
	detail?: string;
	ms?: number;
}

export interface JourneyView {
	journeyId?: string;
	modes?: RunModes;
	request?: TripRequest;
	status: "idle" | "running" | "done" | "error";
	/** What is running: the initial search, a plan, or a follow-up. */
	activity?: "journey" | "plan" | "message";
	steps: TraceStep[];
	thinking: string;
	narrative: string;
	hotspot?: Hotspot;
	zooms: Partial<Record<ZoomLevel, ZoomResult>>;
	plan?: LocalPlan;
	evidence: Evidence[];
	error?: string;
	clarify?: { question: string; options: string[] };
	costUsd?: number;
}

export const emptyJourney: JourneyView = {
	status: "idle",
	steps: [],
	thinking: "",
	narrative: "",
	zooms: {},
	evidence: [],
};

export type JourneyAction =
	| { type: "event"; event: AgentEvent }
	| { type: "begin"; activity: "journey" | "plan" | "message"; request?: TripRequest; userMessage?: string }
	| { type: "failed"; message: string }
	/** The stream ended; settle a run that never received "done" (e.g. it failed server-side). */
	| { type: "settled" }
	| { type: "snapshot"; snapshot: JourneySnapshot }
	| { type: "reset" };

function applyEvent(state: JourneyView, event: AgentEvent): JourneyView {
	switch (event.type) {
		case "run.start":
			return { ...state, journeyId: event.journeyId, modes: event.modes, request: event.request, status: "running" };
		case "trace.step": {
			const existing = state.steps.findIndex((step) => step.id === event.id);
			const step: TraceStep = { id: event.id, label: event.label, status: event.status, detail: event.detail, ms: event.ms };
			const steps = existing >= 0 ? state.steps.map((s, i) => (i === existing ? step : s)) : [...state.steps, step];
			return { ...state, steps };
		}
		case "thinking.update":
			return { ...state, thinking: (state.thinking + event.text).slice(-600) };
		case "text.delta":
			return { ...state, narrative: state.narrative + event.text };
		case "ui.hotspot":
			return { ...state, hotspot: event.hotspot };
		case "ui.zoom":
			return { ...state, zooms: { ...state.zooms, [event.result.level]: event.result } };
		case "ui.plan":
			return { ...state, plan: event.plan };
		case "evidence":
			return { ...state, evidence: [...state.evidence, event.evidence] };
		case "clarify":
			return { ...state, clarify: { question: event.question, options: event.options } };
		case "error":
			return { ...state, error: event.message, status: event.recoverable ? state.status : "error" };
		case "done": {
			const cost = event.usage ? (state.costUsd ?? 0) + event.usage.costUsd : state.costUsd;
			return { ...state, journeyId: event.journeyId, status: "done", activity: undefined, thinking: "", costUsd: cost };
		}
	}
}

export function journeyReducer(state: JourneyView, action: JourneyAction): JourneyView {
	switch (action.type) {
		case "event":
			return applyEvent(state, action.event);
		case "begin": {
			if (action.activity === "journey") {
				return { ...emptyJourney, status: "running", activity: "journey", request: action.request };
			}
			const narrative = action.userMessage
				? `${state.narrative}${state.narrative ? "\n\n" : ""}› ${action.userMessage}\n\n`
				: state.narrative;
			return { ...state, status: "running", activity: action.activity, error: undefined, clarify: undefined, narrative };
		}
		case "failed":
			return { ...state, status: "error", activity: undefined, error: action.message };
		case "snapshot": {
			const { snapshot } = action;
			const zooms: Partial<Record<ZoomLevel, ZoomResult>> = {};
			for (const zoom of snapshot.zooms) zooms[zoom.level] = zoom;
			return {
				...emptyJourney,
				journeyId: snapshot.id,
				modes: snapshot.modes,
				request: snapshot.request,
				status: "done",
				narrative: snapshot.narrative,
				hotspot: snapshot.hotspot,
				zooms,
				plan: snapshot.plan,
			};
		}
		case "settled":
			return state.status === "running" ? { ...state, status: state.error ? "error" : "done", activity: undefined, thinking: "" } : state;
		case "reset":
			return emptyJourney;
	}
}
