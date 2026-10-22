import { DEFAULT_FALLBACK_MODELS, DEFAULT_MODEL, type Budget, type LlmConfig } from "../engine/agent/llm.ts";
import { QlooApi } from "../engine/qloo/endpoints.ts";
import { D1Cache } from "../engine/qloo/cache.ts";
import { LiveTransport, QlooClient } from "../engine/qloo/client.ts";
import { demoWorld } from "../engine/qloo/mock/demo-world.ts";
import { MockTransport } from "../engine/qloo/mock/transport.ts";
import type { Evidence, RunModes } from "../shared/types.ts";
import { d1Budget } from "./store.ts";

export interface ResolvedModes extends RunModes {
	qlooKey?: string;
	llmKey?: string;
}

/** Live data and the LLM agent switch on only when both the mode and the secret are present. */
export function resolveModes(env: Env): ResolvedModes {
	const qlooKey = env.QLOO_API_KEY?.trim() || undefined;
	const llmKey = env.OPENROUTER_API_KEY?.trim() || undefined;
	const agent = env.AGENT_MODE === "llm" && llmKey ? "llm" : "scripted";
	return {
		qloo: env.QLOO_MODE === "live" && qlooKey ? "live" : "mock",
		agent,
		model: agent === "llm" ? env.LLM_MODEL?.trim() || DEFAULT_MODEL : undefined,
		qlooKey,
		llmKey,
	};
}

function numberOr(value: string | undefined, fallback: number): number {
	const n = Number(value);
	return Number.isFinite(n) && n >= 0 ? n : fallback;
}

/** The agent's model settings and spending guard, or nothing when the agent is off. */
export function llmFor(env: Env, modes: ResolvedModes, appUrl?: string): { config: LlmConfig; budget: Budget } | undefined {
	if (modes.agent !== "llm" || !modes.llmKey) return undefined;
	const fallbacks = env.LLM_FALLBACK_MODELS?.split(",").map((m) => m.trim()).filter(Boolean);
	return {
		config: {
			apiKey: modes.llmKey,
			model: modes.model ?? DEFAULT_MODEL,
			fallbackModels: fallbacks ?? DEFAULT_FALLBACK_MODELS,
			maxCalls: Math.max(2, Math.min(8, numberOr(env.LLM_MAX_CALLS, 5))),
			maxTokens: 1200,
			reasoningEffort: "none",
			appUrl,
		},
		budget: d1Budget(env.DB, { dailyUsd: numberOr(env.LLM_DAILY_USD, 0.5), totalUsd: numberOr(env.LLM_TOTAL_USD, 5) }),
	};
}

export function createApi(env: Env, modes: ResolvedModes, onEvidence?: (evidence: Evidence) => void, options: { cache?: boolean } = {}): QlooApi {
	if (modes.qloo === "live" && modes.qlooKey) {
		const client = new QlooClient({
			// The heaviest journey (four levels) needs about 35 Qloo fetches. With the agent, its model
			// calls (LLM_MAX_CALLS, at most 5) stay within the Free plan's 50 subrequests; the scripted
			// planner can use a few more.
			transport: new LiveTransport({ apiKey: modes.qlooKey, maxFetches: modes.agent === "llm" ? 44 : 46 }),
			// Autocomplete skips the cache: a write per keystroke buys nothing.
			cache: options.cache === false ? undefined : new D1Cache(env.DB),
			// Qloo allows caching on our own server; long enough to keep featured journeys warm through judging.
			cacheTtlSeconds: 60 * 24 * 3600,
			concurrency: 5,
			onEvidence,
		});
		return new QlooApi(client);
	}
	// Simulated latency keeps the streaming UI honest in mock mode.
	const client = new QlooClient({
		transport: new MockTransport(demoWorld(), { latencyMs: 90 }),
		concurrency: 5,
		onEvidence,
	});
	return new QlooApi(client);
}

export function clientIp(request: Request): string {
	return request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

export function log(level: "info" | "error", message: string, fields: Record<string, unknown> = {}): void {
	const line = JSON.stringify({ message, ...fields });
	if (level === "error") console.error(line);
	else console.log(line);
}
