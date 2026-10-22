import { afterEach, describe, expect, it, vi } from "vitest";
import { BudgetExhaustedError, runLlmTurn, type Budget, type LlmConfig } from "../src/engine/agent/llm.ts";
import type { JourneyState, ToolContext } from "../src/engine/agent/tools.ts";
import type { AgentEvent } from "../src/shared/events.ts";
import { testApi } from "./fixtures/test-world.ts";

const CONFIG: LlmConfig = { apiKey: "test", model: "test/model", fallbackModels: [], maxCalls: 4, maxTokens: 500, reasoningEffort: "none" };

/** A streamed OpenRouter response made of SSE data events (with a keep-alive comment, as OpenRouter sends). */
function sse(events: unknown[]): Response {
	const body = [": OPENROUTER PROCESSING", ...events.map((e) => `data: ${JSON.stringify(e)}`), "data: [DONE]", ""].join("\n\n");
	return new Response(body, { headers: { "Content-Type": "text/event-stream" } });
}

const toolCall = (index: number, id: string, name: string, args: string) => ({ choices: [{ delta: { tool_calls: [{ index, id, type: "function", function: { name, arguments: args } }] } }] });
const argsChunk = (index: number, args: string) => ({ choices: [{ delta: { tool_calls: [{ index, function: { arguments: args } }] } }] });
const finish = (reason: string, cost: number) => ({ model: "test/model", choices: [{ delta: {}, finish_reason: reason }], usage: { prompt_tokens: 1000, completion_tokens: 50, cost } });

function budget(allowed = true): Budget & { spent: number[] } {
	const spent: number[] = [];
	return {
		spent,
		allow: async () => allowed,
		allowTurn: async () => ({ ok: allowed, reason: allowed ? undefined : "budget" }),
		record: async ({ costUsd }) => void spent.push(costUsd),
	};
}

function context(): { ctx: ToolContext; events: AgentEvent[]; state: JourneyState } {
	const events: AgentEvent[] = [];
	const state: JourneyState = {
		journeyId: "j1",
		request: { destination: "Testa", month: 4, mustSees: ["Crowded Shrine", "Busy Temple"], favorites: ["Calm Film"], vibes: ["quiet"], flexibility: "booked" },
		zooms: [],
		narrative: [],
	};
	return { ctx: { api: testApi(), emit: (e) => events.push(e), state }, events, state };
}

afterEach(() => vi.unstubAllGlobals());

describe("LLM agent loop", () => {
	it("assembles streamed tool calls, runs tools in parallel and ends on the model's summary", async () => {
		const bodies: Record<string, unknown>[] = [];
		const responses = [
			// A short preamble, then arguments that arrive in fragments across deltas.
			sse([{ choices: [{ delta: { content: "Let me look that up." } }] }, toolCall(0, "c1", "resolve_trip", '{"destination":"Te'), argsChunk(0, 'sta","month":4}'), finish("tool_calls", 0.0002)]),
			sse([toolCall(0, "c2", "find_dupes", '{"level":"city"}'), toolCall(1, "c3", "find_dupes", '{"level":"region"}'), finish("tool_calls", 0.0003)]),
			sse([{ choices: [{ delta: { content: "Same soul, " } }] }, { choices: [{ delta: { content: "fewer crowds." } }] }, finish("stop", 0.0004)]),
		];
		vi.stubGlobal("fetch", async (_url: string, init: RequestInit) => {
			bodies.push(JSON.parse(String(init.body)) as Record<string, unknown>);
			return responses.shift() ?? sse([finish("stop", 0)]);
		});
		const { ctx, events, state } = context();
		const spend = budget();
		const { messages, usage } = await runLlmTurn({ config: CONFIG, budget: spend, ctx, history: [], userMessage: "Plan Testa" });

		expect(usage.calls).toBe(3);
		expect(usage.costUsd).toBeCloseTo(0.0009, 6);
		expect(spend.spent).toEqual([0.0002, 0.0003, 0.0004]);
		expect(state.hotspot?.locality.name).toBe("Testa");
		expect(state.zooms.map((z) => z.level).sort()).toEqual(["city", "region"]);
		expect(events.filter((e) => e.type === "ui.zoom")).toHaveLength(2);
		// The preamble stays in the conversation but never reaches the UI.
		expect(events.filter((e) => e.type === "text.delta").map((e) => (e.type === "text.delta" ? e.text : "")).join("")).toBe("Same soul, fewer crowds.\n\n");
		expect(messages[1]).toMatchObject({ role: "assistant", content: "Let me look that up." });
		// Tool results go back to the model with matching call IDs.
		expect(messages.filter((m) => m.role === "tool").map((m) => (m.role === "tool" ? m.tool_call_id : ""))).toEqual(["c1", "c2", "c3"]);
		expect(bodies[0]).toMatchObject({ model: "test/model", stream: true, tool_choice: "auto", reasoning: { effort: "none" } });
	});

	it("forces a written answer on the last allowed call and reports bad tool arguments to the model", async () => {
		const bodies: Record<string, unknown>[] = [];
		vi.stubGlobal("fetch", async (_url: string, init: RequestInit) => {
			const body = JSON.parse(String(init.body)) as Record<string, unknown>;
			bodies.push(body);
			return body.tool_choice === "none"
				? sse([{ choices: [{ delta: { content: "Done." } }] }, finish("stop", 0)])
				: sse([toolCall(0, `c${bodies.length}`, "find_dupes", '{"level":"nowhere"}'), finish("tool_calls", 0)]);
		});
		const { ctx } = context();
		const { messages } = await runLlmTurn({ config: { ...CONFIG, maxCalls: 2 }, budget: budget(), ctx, history: [], userMessage: "go" });
		expect(bodies.map((b) => b.tool_choice)).toEqual(["auto", "none"]);
		const toolReply = messages.find((m) => m.role === "tool");
		expect(toolReply?.role === "tool" && JSON.parse(toolReply.content).error).toMatch(/Invalid arguments/);
	});

	it("stops before calling the model when the budget is spent", async () => {
		const fetchSpy = vi.fn();
		vi.stubGlobal("fetch", fetchSpy);
		const { ctx } = context();
		await expect(runLlmTurn({ config: CONFIG, budget: budget(false), ctx, history: [], userMessage: "go" })).rejects.toBeInstanceOf(BudgetExhaustedError);
		expect(fetchSpy).not.toHaveBeenCalled();
	});
});
