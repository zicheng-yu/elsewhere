/** Entry points that pick the scripted planner or the LLM agent. */
import type { Emit } from "../../shared/events.ts";
import type { PlanPrefs, PlanTargetRef } from "../../shared/types.ts";
import type { QlooApi } from "../qloo/endpoints.ts";
import { BudgetExhaustedError, runLlmTurn, type Budget, type ChatMessage, type LlmConfig, type TurnUsage } from "./llm.ts";
import { describeRequest } from "./prompt.ts";
import { runScriptedJourney, runScriptedPlan } from "./scripted.ts";
import type { JourneyState, ToolContext } from "./tools.ts";

export interface AgentDeps {
	api: QlooApi;
	emit: Emit;
	state: JourneyState;
	/** Present only when the LLM agent is configured. */
	llm?: { config: LlmConfig; budget: Budget };
	history?: ChatMessage[];
	signal?: AbortSignal;
}

export interface AgentOutcome {
	history?: ChatMessage[];
	usage?: TurnUsage;
}

/** Tell the traveler, in the agent trace, why the deterministic planner is answering instead. */
function pausedNotice(emit: Emit): void {
	emit({
		type: "trace.step",
		id: `step-${crypto.randomUUID().slice(0, 8)}`,
		label: "AI agent paused: its spending cap is reached, so the scripted planner answers",
		status: "done",
	});
}

/** The LLM agent when it is configured and within budget; otherwise the scripted planner. */
async function agentFor(deps: AgentDeps): Promise<AgentDeps["llm"]> {
	if (!deps.llm) return undefined;
	if (await deps.llm.budget.allow()) return deps.llm;
	pausedNotice(deps.emit);
	return undefined;
}

export async function startJourney(deps: AgentDeps): Promise<AgentOutcome> {
	const ctx: ToolContext = { api: deps.api, emit: deps.emit, state: deps.state };
	const llm = await agentFor(deps);
	if (llm) {
		const { messages, usage } = await runLlmTurn({ ...llm, ctx, history: [], userMessage: describeRequest(deps.state.request), signal: deps.signal });
		return { history: messages, usage };
	}
	await runScriptedJourney(ctx);
	return {};
}

export async function planJourney(deps: AgentDeps, target: PlanTargetRef, prefs: PlanPrefs): Promise<AgentOutcome> {
	const ctx: ToolContext = { api: deps.api, emit: deps.emit, state: deps.state };
	const llm = deps.history ? await agentFor(deps) : undefined;
	if (llm && deps.history) {
		const choice = [
			`Plan it like a local: level=${target.level}`,
			target.itemId ? `item_id=${target.itemId}` : "",
			prefs.quieter ? "quieter=true" : "",
			prefs.extraVibes?.length ? `extra_vibes=${prefs.extraVibes.join(", ")}` : "",
			prefs.days ? `days=${prefs.days}` : "",
		]
			.filter(Boolean)
			.join("; ");
		const { messages, usage } = await runLlmTurn({ ...llm, ctx, history: deps.history, userMessage: choice, signal: deps.signal });
		return { history: messages, usage };
	}
	await runScriptedPlan(ctx, target, prefs);
	return { history: deps.history };
}

export class FollowUpUnavailableError extends Error {
	constructor() {
		super("Free-form follow-ups need the LLM agent, which is not configured on this deployment.");
		this.name = "FollowUpUnavailableError";
	}
}

export async function continueJourney(deps: AgentDeps, message: string): Promise<AgentOutcome> {
	if (!deps.llm || !deps.history) throw new FollowUpUnavailableError();
	if (!(await deps.llm.budget.allow())) throw new BudgetExhaustedError();
	const ctx: ToolContext = { api: deps.api, emit: deps.emit, state: deps.state };
	const { messages, usage } = await runLlmTurn({ ...deps.llm, ctx, history: deps.history, userMessage: message, signal: deps.signal });
	return { history: messages, usage };
}
