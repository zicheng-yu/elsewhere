import type {
	Evidence,
	Hotspot,
	LocalPlan,
	RunModes,
	TripRequest,
	ZoomResult,
} from "./types.ts";

/** Server-sent events streamed from the agent to the client. */
export type AgentEvent =
	| { type: "run.start"; runId: string; journeyId: string; modes: RunModes; request: TripRequest }
	| {
			type: "trace.step";
			id: string;
			label: string;
			status: "running" | "done" | "error";
			detail?: string;
			ms?: number;
	  }
	| { type: "thinking.update"; text: string }
	| { type: "text.delta"; text: string }
	| { type: "ui.hotspot"; hotspot: Hotspot }
	| { type: "ui.zoom"; result: ZoomResult }
	| { type: "ui.plan"; plan: LocalPlan }
	| { type: "evidence"; evidence: Evidence }
	| { type: "clarify"; question: string; options: string[] }
	| { type: "error"; message: string; recoverable: boolean }
	| {
			type: "done";
			runId: string;
			journeyId: string;
			ms: number;
			usage?: { inputTokens: number; outputTokens: number; costUsd: number };
	  };

export type AgentEventType = AgentEvent["type"];

export type Emit = (event: AgentEvent) => void;
