/**
 * The Claude agent loop: the SDK tool runner drives the conversation while the
 * tools stream UI events. Inactive until an Anthropic API key is configured.
 */
import Anthropic from "@anthropic-ai/sdk";
import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import type { TripRequest } from "../../shared/types.ts";
import { describeRequest, SYSTEM_PROMPT } from "./prompt.ts";
import { findDupesTool, planLocalTool, resolveTripTool, type ToolContext } from "./tools.ts";

export const CLAUDE_MODEL = "claude-opus-5-5";
const THINKING_UPDATES_BETA = "thinking-display-updates-2026-08-18";
const FALLBACK_BETA = "server-side-fallback-2026-07-01";

/** USD per million tokens for claude-opus-5-5 (cache writes use the 5-minute rate). */
const PRICE = { input: 4, output: 20, cacheRead: 0.2, cacheWrite: 5 };

export type ConversationMessage = Anthropic.Beta.BetaMessageParam;

export interface TurnUsage {
	inputTokens: number;
	outputTokens: number;
	costUsd: number;
}

class TruncatedToolInput extends Error {}

async function runTool(task: () => Promise<Record<string, unknown>>): Promise<string> {
	try {
		return JSON.stringify(await task());
	} catch (error) {
		return JSON.stringify({ error: error instanceof Error ? error.message : String(error) });
	}
}

function buildTools(ctx: ToolContext) {
	const resolveTrip = betaZodTool({
		name: "resolve_trip",
		description:
			"Resolve the traveler's trip in Qloo: the destination city, its crowded must-see sights, the traveler's favorites (films, shows, artists, books, people, brands) and vibe words. Call once per journey, before find_dupes.",
		inputSchema: z.object({
			destination: z.string().min(1).describe("City the traveler plans to visit, e.g. 'Kyoto'"),
			month: z.number().int().min(1).max(12).optional().describe("Travel month, 1-12"),
			must_sees: z.array(z.string()).max(6).optional().describe("Specific sights the traveler planned to visit"),
			favorites: z
				.array(z.string())
				.max(8)
				.optional()
				.describe("Films, TV shows, artists, books, people or brands the traveler loves"),
			vibes: z.array(z.string()).max(6).optional().describe("Short vibe words, e.g. 'matcha', 'quiet', 'jazz'"),
			flexible: z.boolean().optional().describe("True if the traveler can change destination"),
		}),
		run: (input) =>
			runTool(() => {
				const request: TripRequest = {
					...ctx.state.request,
					destination: input.destination,
					month: input.month ?? ctx.state.request.month,
					mustSees: input.must_sees ?? ctx.state.request.mustSees,
					favorites: input.favorites ?? ctx.state.request.favorites,
					vibes: input.vibes ?? ctx.state.request.vibes,
					flexibility: input.flexible === undefined ? ctx.state.request.flexibility : input.flexible ? "flexible" : "booked",
				};
				return resolveTripTool(ctx, request);
			}),
	});

	const findDupes = betaZodTool({
		name: "find_dupes",
		description:
			"Find taste-matched, less-crowded alternatives at one zoom level: 'city' = quieter twins of the crowded sights in the same city; 'region' = day-trip towns within about 150 km; 'country' = twin cities in the same country; 'world' = twin cities in other countries. Returns scored items with ids.",
		inputSchema: z.object({
			level: z.enum(["city", "region", "country", "world"]),
			extra_candidates: z
				.array(z.string())
				.max(4)
				.optional()
				.describe("Only for 'country' or 'world': lesser-known city names you believe share the destination's soul"),
		}),
		run: (input) => runTool(() => findDupesTool(ctx, { level: input.level, extraCandidates: input.extra_candidates })),
	});

	const planLocal = betaZodTool({
		name: "plan_local",
		description:
			"Plan the chosen alternative like a local: where to stay (from Qloo's taste heatmap), a day-by-day plan of taste-matched places, and local customs. Use level 'hotspot' to plan the original city with its quiet twins.",
		inputSchema: z.object({
			level: z.enum(["hotspot", "city", "region", "country", "world"]),
			item_id: z.string().optional().describe("Id of the chosen item from find_dupes; omit for 'hotspot'"),
			quieter: z.boolean().optional().describe("Prefer less popular places"),
			extra_vibes: z.array(z.string()).max(4).optional().describe("Extra vibe words to emphasize"),
			days: z.number().int().min(1).max(3).optional(),
		}),
		run: (input) =>
			runTool(() =>
				planLocalTool(ctx, {
					level: input.level,
					itemId: input.item_id,
					quieter: input.quieter,
					extraVibes: input.extra_vibes,
					days: input.days,
				}),
			),
	});

	// Stream tool inputs as they are generated; the runner validates them against the Zod schemas.
	return [resolveTrip, findDupes, planLocal].map((tool) => ({ ...tool, eager_input_streaming: true }));
}

function costOf(usage: { input: number; output: number; cacheRead: number; cacheWrite: number }): TurnUsage {
	const costUsd =
		(usage.input * PRICE.input +
			usage.output * PRICE.output +
			usage.cacheRead * PRICE.cacheRead +
			usage.cacheWrite * PRICE.cacheWrite) /
		1_000_000;
	return {
		inputTokens: usage.input + usage.cacheRead + usage.cacheWrite,
		outputTokens: usage.output,
		costUsd: Math.round(costUsd * 10_000) / 10_000,
	};
}

export interface ClaudeTurnOptions {
	apiKey: string;
	ctx: ToolContext;
	history: ConversationMessage[];
	userMessage: string;
	signal?: AbortSignal;
}

/** Run one user turn through the agent loop. Returns the updated conversation. */
export async function runClaudeTurn(options: ClaudeTurnOptions): Promise<{ messages: ConversationMessage[]; usage: TurnUsage }> {
	const { ctx } = options;
	const client = new Anthropic({ apiKey: options.apiKey, maxRetries: 2 });
	const totals = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };

	let runner = client.beta.messages.toolRunner(
		{
			model: CLAUDE_MODEL,
			max_tokens: 16000,
			system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
			messages: [...options.history, { role: "user", content: options.userMessage }],
			tools: buildTools(ctx),
			thinking: { type: "adaptive", display: "updates" },
			output_config: { effort: "medium" },
			betas: [THINKING_UPDATES_BETA, FALLBACK_BETA],
			fallbacks: "default",
			max_iterations: 10,
			stream: true,
		},
		{ signal: options.signal },
	);

	for (let attempt = 0; ; attempt++) {
		try {
			for await (const messageStream of runner) {
				for await (const event of messageStream) {
					if (event.type !== "content_block_delta") continue;
					if (event.delta.type === "text_delta") ctx.emit({ type: "text.delta", text: event.delta.text });
					else if (event.delta.type === "thinking_delta" && event.delta.thinking) {
						ctx.emit({ type: "thinking.update", text: event.delta.thinking });
					}
				}
				const message = await messageStream.finalMessage();
				attempt = 0;
				totals.input += message.usage.input_tokens;
				totals.output += message.usage.output_tokens;
				totals.cacheRead += message.usage.cache_read_input_tokens ?? 0;
				totals.cacheWrite += message.usage.cache_creation_input_tokens ?? 0;
				if (message.stop_reason === "refusal") {
					ctx.emit({ type: "error", message: "The agent declined this request.", recoverable: true });
					break;
				}
				if (message.stop_reason === "max_tokens" && message.content.some((block) => block.type === "tool_use")) {
					throw new TruncatedToolInput("A tool call was cut off by the output limit.");
				}
			}
			break;
		} catch (error) {
			if (error instanceof Anthropic.APIError || error instanceof TruncatedToolInput || attempt >= 2) throw error;
			// The SDK could not parse a streamed tool input; re-issue the turn from the history so far.
			runner = client.beta.messages.toolRunner({ ...runner.params }, { signal: options.signal });
		}
	}

	return { messages: [...runner.params.messages], usage: costOf(totals) };
}

/** Same model, same request, no Qloo tools: the "why not just an LLM?" comparison. */
export async function runBaseline(apiKey: string, request: TripRequest): Promise<string> {
	const client = new Anthropic({ apiKey, maxRetries: 2 });
	const response = await client.beta.messages.create({
		model: CLAUDE_MODEL,
		max_tokens: 4000,
		system: "You are a helpful travel assistant. Answer from your own knowledge, concisely, in plain sentences.",
		messages: [
			{
				role: "user",
				content: `${describeRequest(request)}\n\nSuggest three less crowded alternatives that match my taste, at whatever distance makes sense: other spots in the same city, a day trip, or another city. For each, explain why in one or two sentences.`,
			},
		],
		output_config: { effort: "medium" },
		betas: [FALLBACK_BETA],
		fallbacks: "default",
	});
	if (response.stop_reason === "refusal") return "The model declined this request.";
	return response.content
		.flatMap((block) => (block.type === "text" ? [block.text] : []))
		.join("\n")
		.trim();
}
