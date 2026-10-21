/** Entry points that pick the scripted planner or the Claude agent. */
import type { Emit } from "../../shared/events.ts";
import type { PlanPrefs, PlanTargetRef } from "../../shared/types.ts";
import type { QlooApi } from "../qloo/endpoints.ts";
import { runClaudeTurn, type ConversationMessage, type TurnUsage } from "./claude.ts";
import { describeRequest } from "./prompt.ts";
import { runScriptedJourney, runScriptedPlan } from "./scripted.ts";
import type { JourneyState, ToolContext } from "./tools.ts";

export interface AgentDeps {
	api: QlooApi;
	emit: Emit;
	state: JourneyState;
	agent: "scripted" | "claude";
	anthropicKey?: string;
	history?: ConversationMessage[];
	signal?: AbortSignal;
}

export interface AgentOutcome {
	history?: ConversationMessage[];
	usage?: TurnUsage;
}

function claudeKey(deps: AgentDeps): string | undefined {
	return deps.agent === "claude" ? deps.anthropicKey : undefined;
}

export async function startJourney(deps: AgentDeps): Promise<AgentOutcome> {
	const ctx: ToolContext = { api: deps.api, emit: deps.emit, state: deps.state };
	const apiKey = claudeKey(deps);
	if (apiKey) {
		const { messages, usage } = await runClaudeTurn({
			apiKey,
			ctx,
			history: [],
			userMessage: describeRequest(deps.state.request),
			signal: deps.signal,
		});
		return { history: messages, usage };
	}
	await runScriptedJourney(ctx);
	return {};
}

export async function planJourney(deps: AgentDeps, target: PlanTargetRef, prefs: PlanPrefs): Promise<AgentOutcome> {
	const ctx: ToolContext = { api: deps.api, emit: deps.emit, state: deps.state };
	const apiKey = claudeKey(deps);
	if (apiKey && deps.history) {
		const choice = [
			`Plan it like a local: level=${target.level}`,
			target.itemId ? `item_id=${target.itemId}` : "",
			prefs.quieter ? "quieter=true" : "",
			prefs.extraVibes?.length ? `extra_vibes=${prefs.extraVibes.join(", ")}` : "",
			prefs.days ? `days=${prefs.days}` : "",
		]
			.filter(Boolean)
			.join("; ");
		const { messages, usage } = await runClaudeTurn({
			apiKey,
			ctx,
			history: deps.history,
			userMessage: choice,
			signal: deps.signal,
		});
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
	const apiKey = claudeKey(deps);
	if (!apiKey || !deps.history) throw new FollowUpUnavailableError();
	const ctx: ToolContext = { api: deps.api, emit: deps.emit, state: deps.state };
	const { messages, usage } = await runClaudeTurn({ apiKey, ctx, history: deps.history, userMessage: message, signal: deps.signal });
	return { history: messages, usage };
}
