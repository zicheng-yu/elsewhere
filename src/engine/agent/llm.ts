/**
 * The LLM agent: a tool-calling loop over OpenRouter's OpenAI-compatible chat
 * completions API. The model calls Elsewhere's tools, which run the Qloo engine
 * and stream UI events, until it answers. Plain fetch and SSE parsing keep the
 * Worker bundle small and cheap to run.
 */
import { z } from "zod";
import type { TripRequest } from "../../shared/types.ts";
import { describeRequest, SYSTEM_PROMPT } from "./prompt.ts";
import { findDupesTool, planLocalTool, resolveTripTool, type ToolContext } from "./tools.ts";

export const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
export const DEFAULT_MODEL = "anthropic/claude-haiku-5.5";
export const DEFAULT_FALLBACK_MODELS = ["openai/gpt-6-luna"];
/** Text longer than this before any tool call is the answer, not a preamble, so it starts streaming. */
const PREAMBLE_CHARS = 200;
/** USD per million tokens for the default model, used only when a response carries no cost. */
const FALLBACK_PRICE = { input: 0.1, output: 0.5 };

export interface LlmConfig {
	apiKey: string;
	model: string;
	/** Tried in order when the primary model's providers fail (OpenRouter `models`). */
	fallbackModels: string[];
	/** Hard cap on model calls per turn; each tool round trip is one call. */
	maxCalls: number;
	maxTokens: number;
	reasoningEffort: "none" | "low" | "medium";
	/** Identifies the app in OpenRouter's dashboard. */
	appUrl?: string;
}

/** Spending guard, checked before every model call and fed with the cost of each. */
export interface Budget {
	allow(): Promise<boolean>;
	record(spend: { costUsd: number; tokens: number; model?: string }): Promise<void>;
}

export interface ToolCall {
	id: string;
	type: "function";
	function: { name: string; arguments: string };
}

export type ChatMessage =
	| { role: "user"; content: string }
	| { role: "assistant"; content: string | null; tool_calls?: ToolCall[] }
	| { role: "tool"; tool_call_id: string; content: string };

export interface TurnUsage {
	inputTokens: number;
	outputTokens: number;
	costUsd: number;
	calls: number;
	model?: string;
}

export class BudgetExhaustedError extends Error {
	constructor() {
		super("The AI agent has reached its spending cap for now; the deterministic planner still works.");
		this.name = "BudgetExhaustedError";
	}
}

export class LlmError extends Error {
	readonly status: number;

	constructor(status: number, message: string) {
		super(message);
		this.name = "LlmError";
		this.status = status;
	}
}

const levels = ["city", "region", "country", "world"] as const;

const TOOLS = {
	resolve_trip: {
		description:
			"Resolve the traveler's trip in Qloo: the destination, its crowded must-see sights, its seasons, the traveler's favorites (films, shows, artists, books, people, brands) and vibe words. Call once per journey, before find_dupes.",
		schema: z.object({
			destination: z.string().min(1).describe("City the traveler plans to visit, e.g. 'Kyoto' or 'Venice, Italy'"),
			month: z.number().int().min(1).max(12).optional().describe("Travel month, 1-12"),
			must_sees: z.array(z.string()).max(6).optional().describe("Specific sights the traveler planned to visit"),
			favorites: z.array(z.string()).max(8).optional().describe("Films, TV shows, artists, books, people or brands the traveler loves"),
			vibes: z.array(z.string()).max(6).optional().describe("Short vibe words, e.g. 'matcha', 'quiet', 'jazz'"),
			flexible: z.boolean().optional().describe("True if the traveler can change destination"),
		}),
	},
	find_dupes: {
		description:
			"Find taste-matched, less-crowded alternatives at one zoom level: 'city' = quieter twins of the crowded sights in the same city; 'region' = day-trip towns within about 120 km; 'country' = twin cities in the same country; 'world' = twin cities in other countries. Returns scored items with ids.",
		schema: z.object({
			level: z.enum(levels),
			extra_candidates: z
				.array(z.string())
				.max(4)
				.optional()
				.describe("Only for 'country' or 'world': lesser-known cities you believe share the destination's soul; Qloo scores them"),
		}),
	},
	plan_local: {
		description:
			"Plan the chosen alternative like a local: where to stay (from Qloo's taste heatmap), a day-by-day plan of taste-matched places, and local customs. Use level 'hotspot' to plan the original city with its quiet twins.",
		schema: z.object({
			level: z.enum(["hotspot", ...levels]),
			item_id: z.string().optional().describe("Id of the chosen item from find_dupes; omit for 'hotspot'"),
			quieter: z.boolean().optional().describe("Prefer less popular places"),
			extra_vibes: z.array(z.string()).max(4).optional().describe("Extra vibe words to emphasize"),
			days: z.number().int().min(1).max(3).optional(),
		}),
	},
} as const;

type ToolName = keyof typeof TOOLS;

const TOOL_DEFINITIONS = Object.entries(TOOLS).map(([name, tool]) => {
	const { $schema: _ignored, ...parameters } = z.toJSONSchema(tool.schema) as Record<string, unknown>;
	return { type: "function" as const, function: { name, description: tool.description, parameters } };
});

async function runTool(ctx: ToolContext, name: string, rawArguments: string): Promise<string> {
	const tool = TOOLS[name as ToolName];
	if (!tool) return JSON.stringify({ error: `Unknown tool ${name}` });
	let input: unknown;
	try {
		input = JSON.parse(rawArguments || "{}");
	} catch {
		return JSON.stringify({ error: "The tool arguments were not valid JSON (possibly cut off). Call the tool again with complete arguments." });
	}
	const parsed = tool.schema.safeParse(input);
	if (!parsed.success) return JSON.stringify({ error: `Invalid arguments: ${parsed.error.message}` });
	try {
		const result = await dispatch(ctx, name as ToolName, parsed.data);
		return JSON.stringify(result);
	} catch (error) {
		return JSON.stringify({ error: error instanceof Error ? error.message : String(error) });
	}
}

function dispatch(ctx: ToolContext, name: ToolName, input: Record<string, unknown>): Promise<Record<string, unknown>> {
	switch (name) {
		case "resolve_trip": {
			const args = input as z.infer<typeof TOOLS.resolve_trip.schema>;
			const base = ctx.state.request;
			const request: TripRequest = {
				...base,
				destination: args.destination,
				month: args.month ?? base.month,
				mustSees: args.must_sees ?? base.mustSees,
				favorites: args.favorites ?? base.favorites,
				vibes: args.vibes ?? base.vibes,
				flexibility: args.flexible === undefined ? base.flexibility : args.flexible ? "flexible" : "booked",
			};
			return resolveTripTool(ctx, request);
		}
		case "find_dupes": {
			const args = input as z.infer<typeof TOOLS.find_dupes.schema>;
			return findDupesTool(ctx, { level: args.level, extraCandidates: args.extra_candidates });
		}
		case "plan_local": {
			const args = input as z.infer<typeof TOOLS.plan_local.schema>;
			return planLocalTool(ctx, { level: args.level, itemId: args.item_id, quieter: args.quieter, extraVibes: args.extra_vibes, days: args.days });
		}
	}
}

/** Data events from an SSE body. OpenRouter interleaves ": OPENROUTER PROCESSING" comments, which are skipped. */
async function* sseData(body: ReadableStream<Uint8Array>): AsyncGenerator<Record<string, unknown>> {
	const reader = body.getReader();
	const decoder = new TextDecoder();
	let buffer = "";
	try {
		for (;;) {
			const { value, done } = await reader.read();
			if (done) return;
			buffer += decoder.decode(value, { stream: true });
			for (let newline = buffer.indexOf("\n"); newline >= 0; newline = buffer.indexOf("\n")) {
				const line = buffer.slice(0, newline).trim();
				buffer = buffer.slice(newline + 1);
				if (!line.startsWith("data:")) continue;
				const data = line.slice(5).trim();
				if (data === "[DONE]") return;
				try {
					yield JSON.parse(data) as Record<string, unknown>;
				} catch {
					// A malformed event is skipped rather than ending the stream.
				}
			}
		}
	} finally {
		reader.releaseLock();
	}
}

interface Usage {
	prompt_tokens?: number;
	completion_tokens?: number;
	cost?: number;
}

interface Completion {
	content: string;
	/** Whether any of the text reached the UI (it is held back when it turns out to be a preamble). */
	shown: boolean;
	toolCalls: ToolCall[];
	finishReason?: string;
	usage?: Usage;
	model?: string;
}

function headers(config: LlmConfig): Record<string, string> {
	return {
		Authorization: `Bearer ${config.apiKey}`,
		"Content-Type": "application/json",
		...(config.appUrl ? { "HTTP-Referer": config.appUrl, "X-Title": "Elsewhere" } : {}),
	};
}

async function failure(response: Response): Promise<LlmError> {
	const body = (await response.text().catch(() => "")).slice(0, 300);
	return new LlmError(response.status, `OpenRouter ${response.status}: ${body}`);
}

/** One streamed model call. Text streams to the UI as it arrives; tool calls are assembled from their deltas. */
async function complete(config: LlmConfig, messages: unknown[], ctx: ToolContext, options: { allowTools: boolean; signal?: AbortSignal }): Promise<Completion> {
	const response = await fetch(OPENROUTER_URL, {
		method: "POST",
		headers: headers(config),
		body: JSON.stringify({
			model: config.model,
			models: [config.model, ...config.fallbackModels],
			messages,
			tools: TOOL_DEFINITIONS,
			// The last allowed call must answer in words, so the turn never ends on a dangling tool call.
			tool_choice: options.allowTools ? "auto" : "none",
			parallel_tool_calls: true,
			max_tokens: config.maxTokens,
			reasoning: { effort: config.reasoningEffort },
			stream: true,
		}),
		signal: options.signal,
	});
	if (!response.ok || !response.body) throw await failure(response);

	const result: Completion = { content: "", shown: false, toolCalls: [] };
	const slots: { id: string; name: string; arguments: string }[] = [];
	// Text before a tool call is a preamble ("Let me look that up"); the trace already shows the
	// tools, so hold text back until it is clearly the answer, and drop it if a tool call follows.
	let held = "";
	let streaming = false;
	const show = (text: string) => ctx.emit({ type: "text.delta", text });
	for await (const event of sseData(response.body)) {
		const error = event.error as { message?: string; code?: number } | undefined;
		if (error) throw new LlmError(error.code ?? 500, `OpenRouter: ${error.message ?? "stream error"}`);
		if (typeof event.model === "string") result.model = event.model;
		if (event.usage) result.usage = event.usage as Usage;
		const choice = (event.choices as { delta?: Record<string, unknown>; finish_reason?: string }[] | undefined)?.[0];
		if (!choice) continue;
		if (choice.finish_reason) result.finishReason = choice.finish_reason;
		const delta = choice.delta ?? {};
		if (typeof delta.content === "string" && delta.content) {
			result.content += delta.content;
			if (streaming) show(delta.content);
			else if (slots.length === 0) {
				held += delta.content;
				if (held.length > PREAMBLE_CHARS) {
					streaming = true;
					show(held);
				}
			}
		}
		if (typeof delta.reasoning === "string" && delta.reasoning) ctx.emit({ type: "thinking.update", text: delta.reasoning });
		for (const call of (delta.tool_calls as { index?: number; id?: string; function?: { name?: string; arguments?: string } }[] | undefined) ?? []) {
			const slot = (slots[call.index ?? 0] ??= { id: "", name: "", arguments: "" });
			if (call.id) slot.id = call.id;
			if (call.function?.name && !slot.name) slot.name = call.function.name;
			if (call.function?.arguments) slot.arguments += call.function.arguments;
		}
	}
	if (!streaming && held && slots.length === 0) {
		streaming = true;
		show(held);
	}
	result.shown = streaming;
	result.toolCalls = slots
		.filter((slot) => slot?.name)
		.map((slot, i) => ({ id: slot.id || `call_${i}`, type: "function" as const, function: { name: slot.name, arguments: slot.arguments } }));
	return result;
}

function costOf(usage: Usage | undefined): number {
	if (typeof usage?.cost === "number") return usage.cost;
	return ((usage?.prompt_tokens ?? 0) * FALLBACK_PRICE.input + (usage?.completion_tokens ?? 0) * FALLBACK_PRICE.output) / 1_000_000;
}

export interface LlmTurnOptions {
	config: LlmConfig;
	budget: Budget;
	ctx: ToolContext;
	history: ChatMessage[];
	userMessage: string;
	signal?: AbortSignal;
}

/** Run one user turn through the agent loop. Returns the conversation (without the system prompt) and its cost. */
export async function runLlmTurn(options: LlmTurnOptions): Promise<{ messages: ChatMessage[]; usage: TurnUsage }> {
	const { config, budget, ctx } = options;
	const messages: ChatMessage[] = [...options.history, { role: "user", content: options.userMessage }];
	const usage: TurnUsage = { inputTokens: 0, outputTokens: 0, costUsd: 0, calls: 0 };

	for (let call = 0; call < config.maxCalls; call++) {
		if (!(await budget.allow())) throw new BudgetExhaustedError();
		const result = await complete(config, [{ role: "system", content: SYSTEM_PROMPT }, ...messages], ctx, {
			allowTools: call < config.maxCalls - 1,
			signal: options.signal,
		});
		const cost = costOf(result.usage);
		usage.calls++;
		usage.inputTokens += result.usage?.prompt_tokens ?? 0;
		usage.outputTokens += result.usage?.completion_tokens ?? 0;
		usage.costUsd += cost;
		usage.model = result.model ?? usage.model;
		await budget.record({ costUsd: cost, tokens: (result.usage?.prompt_tokens ?? 0) + (result.usage?.completion_tokens ?? 0), model: result.model });

		messages.push({ role: "assistant", content: result.content || null, ...(result.toolCalls.length > 0 ? { tool_calls: result.toolCalls } : {}) });
		if (result.toolCalls.length === 0) break;
		// Text already shown before these tools gets a paragraph break from what follows.
		if (result.shown) ctx.emit({ type: "text.delta", text: "\n\n" });
		const outputs = await Promise.all(result.toolCalls.map((tc) => runTool(ctx, tc.function.name, tc.function.arguments)));
		messages.push(...outputs.map((content, i) => ({ role: "tool" as const, tool_call_id: result.toolCalls[i]?.id ?? `call_${i}`, content })));
	}

	// End on a paragraph break, as the scripted planner does, so the next turn's text starts fresh.
	if (messages.some((m) => m.role === "assistant" && m.content && !m.tool_calls)) ctx.emit({ type: "text.delta", text: "\n\n" });
	usage.costUsd = Math.round(usage.costUsd * 1e6) / 1e6;
	return { messages, usage };
}

/** Same model, same request, no Qloo tools: the "why not just ask an LLM?" comparison. */
export async function runBaseline(config: LlmConfig, budget: Budget, request: TripRequest): Promise<{ text: string; costUsd: number }> {
	if (!(await budget.allow())) throw new BudgetExhaustedError();
	const response = await fetch(OPENROUTER_URL, {
		method: "POST",
		headers: headers(config),
		body: JSON.stringify({
			model: config.model,
			models: [config.model, ...config.fallbackModels],
			max_tokens: 700,
			reasoning: { effort: config.reasoningEffort },
			messages: [
				{ role: "system", content: "You are a helpful travel assistant. Answer from your own knowledge, concisely, in plain sentences." },
				{
					role: "user",
					content: `${describeRequest(request)}\n\nSuggest three less crowded alternatives that match my taste, at whatever distance makes sense: other spots in the same city, a day trip, or another city. For each, explain why in one or two sentences.`,
				},
			],
		}),
	});
	if (!response.ok) throw await failure(response);
	const data = (await response.json()) as { choices?: { message?: { content?: string } }[]; usage?: Usage; model?: string };
	const costUsd = costOf(data.usage);
	await budget.record({ costUsd, tokens: (data.usage?.prompt_tokens ?? 0) + (data.usage?.completion_tokens ?? 0), model: data.model });
	return { text: data.choices?.[0]?.message?.content?.trim() || "The model returned no answer.", costUsd };
}
