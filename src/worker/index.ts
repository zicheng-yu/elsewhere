import { Hono, type Context } from "hono";
import { streamSSE } from "hono/streaming";
import { z } from "zod";
import { BudgetExhaustedError, LlmError, runBaseline } from "../engine/agent/llm.ts";
import { continueJourney, FollowUpUnavailableError, planJourney, startJourney } from "../engine/agent/run.ts";
import type { JourneyState } from "../engine/agent/tools.ts";
import { PlanTargetError } from "../engine/local.ts";
import { QlooError } from "../engine/qloo/client.ts";
import { ResolveError } from "../engine/resolve.ts";
import type { AgentEvent, Emit } from "../shared/events.ts";
import { PERSONAS, SCENARIOS } from "../shared/scenarios.ts";
import type { JourneySnapshot, RunModes } from "../shared/types.ts";
import { clientIp, createApi, llmFor, log, resolveModes, type ResolvedModes } from "./runtime.ts";
import { sharePage } from "./share.ts";
import { loadJourney, saveJourney, type RecordedEvent } from "./store.ts";

type AppContext = Context<{ Bindings: Env }>;

const app = new Hono<{ Bindings: Env }>().basePath("/api");

const ZoomSchema = z.enum(["city", "region", "country", "world"]);
const Text = (max: number) => z.string().trim().min(1).max(max);

const TripRequestSchema = z.object({
	destination: Text(80),
	month: z.number().int().min(1).max(12).optional(),
	mustSees: z.array(Text(80)).max(6).default([]),
	favorites: z.array(Text(80)).max(8).default([]),
	vibes: z.array(Text(40)).max(6).default([]),
	flexibility: z.enum(["booked", "flexible"]).default("booked"),
	zooms: z.array(ZoomSchema).max(4).optional(),
	notes: z.string().trim().max(500).optional(),
	scenarioId: z.string().max(40).optional(),
});

const PlanRequestSchema = z.object({
	target: z.object({
		level: z.enum(["hotspot", "city", "region", "country", "world"]),
		itemId: z.string().max(200).optional(),
	}),
	prefs: z
		.object({
			quieter: z.boolean().optional(),
			extraVibes: z.array(Text(40)).max(4).optional(),
			days: z.number().int().min(1).max(3).optional(),
		})
		.default({}),
});

const MessageSchema = z.object({ message: Text(1000) });

function publicModes(modes: ResolvedModes): RunModes {
	return { qloo: modes.qloo, agent: modes.agent, model: modes.model };
}

/** The agent's model settings and spending guard for this request, when the agent is on. */
function agentFor(c: AppContext, modes: ResolvedModes) {
	return llmFor(c.env, modes, new URL(c.req.url).origin);
}

function snapshotOf(state: JourneyState, modes: RunModes, createdAt: number, narrative: string): JourneySnapshot {
	return {
		id: state.journeyId,
		createdAt,
		modes,
		request: state.request,
		hotspot: state.hotspot,
		zooms: state.zooms,
		plan: state.plan,
		narrative: narrative.trim(),
	};
}

/** Collects the streamed narration (scripted or LLM) so share links can show it. */
function transcriptCollector(previous = ""): { onEvent: (event: AgentEvent) => void; text: () => string } {
	let text = previous ? `${previous.trim()}\n\n` : "";
	return {
		onEvent: (event) => {
			if (event.type === "text.delta") text += event.text;
		},
		text: () => text,
	};
}

function errorEvent(error: unknown): AgentEvent {
	if (error instanceof ResolveError) {
		return error.suggestions.length > 0
			? { type: "clarify", question: `${error.message} Did you mean one of these?`, options: error.suggestions }
			: { type: "error", message: error.message, recoverable: true };
	}
	if (error instanceof QlooError) {
		const message = error.kind === "budget" ? "This journey needed more Qloo lookups than one run allows. Try fewer zoom levels." : `Qloo request failed (${error.kind}). Please try again shortly.`;
		return { type: "error", message, recoverable: true };
	}
	if (error instanceof PlanTargetError || error instanceof FollowUpUnavailableError || error instanceof BudgetExhaustedError) {
		return { type: "error", message: error.message, recoverable: true };
	}
	if (error instanceof LlmError) {
		return { type: "error", message: "The AI agent is unavailable right now. Please try again shortly.", recoverable: true };
	}
	return { type: "error", message: "Something went wrong while planning. Please try again.", recoverable: true };
}

async function rateLimited(c: AppContext): Promise<boolean> {
	const { success } = await c.env.RATE_LIMITER.limit({ key: clientIp(c.req.raw) });
	return !success;
}

/**
 * Stream agent events as server-sent events. Writes are chained so events keep
 * their order, a heartbeat keeps idle connections open, and every event is
 * recorded for replays.
 */
function streamRun(
	c: AppContext,
	recorded: RecordedEvent[],
	run: (emit: Emit, signal: AbortSignal) => Promise<void>,
	onEvent?: (event: AgentEvent) => void,
): Response {
	return streamSSE(c, async (stream) => {
		const controller = new AbortController();
		stream.onAbort(() => controller.abort());
		const offset = recorded.at(-1)?.t ?? 0;
		const started = Date.now();
		let chain = Promise.resolve();
		const emit: Emit = (event) => {
			recorded.push({ t: offset + Date.now() - started, e: event });
			onEvent?.(event);
			chain = chain
				.then(() => stream.writeSSE({ event: event.type, data: JSON.stringify(event) }))
				.catch(() => undefined);
		};
		const heartbeat = setInterval(() => {
			chain = chain.then(() => stream.writeSSE({ event: "ping", data: "{}" })).catch(() => undefined);
		}, 15_000);
		try {
			await run(emit, controller.signal);
		} catch (error) {
			log("error", "run failed", { error: error instanceof Error ? error.message : String(error) });
			emit(errorEvent(error));
		} finally {
			clearInterval(heartbeat);
			await chain;
		}
	});
}

app.get("/health", (c) => c.json({ ok: true, service: "elsewhere", modes: publicModes(resolveModes(c.env)) }));

app.get("/scenarios", (c) => {
	c.header("Cache-Control", "public, max-age=300");
	return c.json({ scenarios: SCENARIOS, personas: PERSONAS });
});

app.get("/search", async (c) => {
	const q = c.req.query("q")?.trim() ?? "";
	const kind = c.req.query("kind") ?? "destination";
	if (q.length < 2 || q.length > 80) return c.json({ results: [] });
	const api = createApi(c.env, resolveModes(c.env), undefined, { cache: false });
	try {
		if (kind === "destination") {
			const found = await api.searchDestinations(q, 6);
			return c.json({
				results: found.map((d) => ({ id: d.id, name: d.name, subtitle: [d.region, d.country].filter(Boolean).join(", "), lat: d.lat, lon: d.lon })),
			});
		}
		if (kind === "place") {
			const lat = Number(c.req.query("lat"));
			const lon = Number(c.req.query("lon"));
			const near = Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon, radiusMiles: 30 } : undefined;
			const found = await api.searchPlaces(q, near, 6);
			return c.json({ results: found.map((p) => ({ id: p.id, name: p.name, subtitle: [p.categories[0], p.city].filter(Boolean).join(" · ") })) });
		}
		if (kind === "taste") {
			const found = await api.searchTaste(q, 6);
			return c.json({ results: found.map((t) => ({ id: t.id, name: t.name, subtitle: [t.kind.replace("_", " "), t.subtitle].filter(Boolean).join(" · ") })) });
		}
		if (kind === "vibe") {
			const found = await api.searchTags(q, 6);
			return c.json({ results: found.map((t) => ({ id: t.id, name: t.name, subtitle: "Vibe" })) });
		}
		return c.json({ error: "unknown_kind" }, 400);
	} catch (error) {
		log("error", "search failed", { kind, error: error instanceof Error ? error.message : String(error) });
		return c.json({ results: [] });
	}
});

app.post("/journeys", async (c) => {
	const parsed = TripRequestSchema.safeParse(await c.req.json().catch(() => null));
	if (!parsed.success) return c.json({ error: "invalid_request", issues: parsed.error.issues.slice(0, 5) }, 400);
	if (await rateLimited(c)) return c.json({ error: "rate_limited", message: "Too many journeys at once. Try again in a minute." }, 429);

	const modes = resolveModes(c.env);
	const journeyId = crypto.randomUUID();
	const runId = crypto.randomUUID();
	const createdAt = Date.now();
	const state: JourneyState = { journeyId, request: parsed.data, zooms: [], narrative: [] };
	const recorded: RecordedEvent[] = [];
	const transcript = transcriptCollector();

	return streamRun(c, recorded, async (emit, signal) => {
		const api = createApi(c.env, modes, (evidence) => emit({ type: "evidence", evidence }));
		emit({ type: "run.start", runId, journeyId, modes: publicModes(modes), request: parsed.data });
		const started = Date.now();
		let outcome: Awaited<ReturnType<typeof startJourney>> = {};
		try {
			outcome = await startJourney({ api, emit, state, llm: agentFor(c, modes), signal });
		} finally {
			if (state.hotspot) {
				await saveJourney(c.env.DB, {
					snapshot: snapshotOf(state, publicModes(modes), createdAt, transcript.text()),
					conversation: outcome.history,
					events: recorded,
				}).catch((error) => log("error", "save failed", { journeyId, error: String(error) }));
			}
		}
		log("info", "journey complete", { journeyId, modes: publicModes(modes), ms: Date.now() - started, usage: outcome.usage });
		emit({ type: "done", runId, journeyId, ms: Date.now() - started, usage: outcome.usage });
	}, transcript.onEvent);
});

app.get("/journeys/:id", async (c) => {
	const journey = await loadJourney(c.env.DB, c.req.param("id"));
	if (!journey) return c.json({ error: "not_found" }, 404);
	return c.json({ snapshot: journey.snapshot });
});

app.get("/journeys/:id/events", async (c) => {
	const journey = await loadJourney(c.env.DB, c.req.param("id"));
	if (!journey) return c.json({ error: "not_found" }, 404);
	return c.json({ events: journey.events });
});

app.post("/journeys/:id/plan", async (c) => {
	const parsed = PlanRequestSchema.safeParse(await c.req.json().catch(() => null));
	if (!parsed.success) return c.json({ error: "invalid_request" }, 400);
	const journey = await loadJourney(c.env.DB, c.req.param("id"));
	if (!journey?.snapshot.hotspot) return c.json({ error: "not_found" }, 404);
	if (await rateLimited(c)) return c.json({ error: "rate_limited" }, 429);

	const modes = resolveModes(c.env);
	const { snapshot } = journey;
	const state: JourneyState = {
		journeyId: snapshot.id,
		request: snapshot.request,
		hotspot: snapshot.hotspot,
		zooms: snapshot.zooms,
		plan: snapshot.plan,
		narrative: snapshot.narrative ? [snapshot.narrative] : [],
	};
	const runId = crypto.randomUUID();
	const recorded = journey.events;
	const transcript = transcriptCollector(snapshot.narrative);

	return streamRun(c, recorded, async (emit, signal) => {
		const api = createApi(c.env, modes, (evidence) => emit({ type: "evidence", evidence }));
		const started = Date.now();
		let outcome: Awaited<ReturnType<typeof planJourney>> = { history: journey.conversation };
		try {
			outcome = await planJourney(
				{ api, emit, state, llm: agentFor(c, modes), history: journey.conversation, signal },
				parsed.data.target,
				parsed.data.prefs,
			);
		} finally {
			await saveJourney(c.env.DB, {
				snapshot: snapshotOf(state, snapshot.modes, snapshot.createdAt, transcript.text()),
				conversation: outcome.history,
				events: recorded,
			}).catch((error) => log("error", "save failed", { journeyId: snapshot.id, error: String(error) }));
		}
		emit({ type: "done", runId, journeyId: snapshot.id, ms: Date.now() - started, usage: outcome.usage });
	}, transcript.onEvent);
});

app.post("/journeys/:id/messages", async (c) => {
	const parsed = MessageSchema.safeParse(await c.req.json().catch(() => null));
	if (!parsed.success) return c.json({ error: "invalid_request" }, 400);
	const modes = resolveModes(c.env);
	if (modes.agent !== "llm") {
		return c.json({ error: "agent_unavailable", message: new FollowUpUnavailableError().message }, 409);
	}
	const journey = await loadJourney(c.env.DB, c.req.param("id"));
	if (!journey?.snapshot.hotspot) return c.json({ error: "not_found" }, 404);
	if (await rateLimited(c)) return c.json({ error: "rate_limited" }, 429);

	const { snapshot } = journey;
	const state: JourneyState = {
		journeyId: snapshot.id,
		request: snapshot.request,
		hotspot: snapshot.hotspot,
		zooms: snapshot.zooms,
		plan: snapshot.plan,
		narrative: snapshot.narrative ? [snapshot.narrative] : [],
	};
	const runId = crypto.randomUUID();
	const recorded = journey.events;
	const transcript = transcriptCollector(snapshot.narrative);

	return streamRun(c, recorded, async (emit, signal) => {
		const api = createApi(c.env, modes, (evidence) => emit({ type: "evidence", evidence }));
		const started = Date.now();
		let outcome: Awaited<ReturnType<typeof continueJourney>> = { history: journey.conversation };
		try {
			outcome = await continueJourney(
				{ api, emit, state, llm: agentFor(c, modes), history: journey.conversation, signal },
				parsed.data.message,
			);
		} finally {
			await saveJourney(c.env.DB, {
				snapshot: snapshotOf(state, snapshot.modes, snapshot.createdAt, transcript.text()),
				conversation: outcome.history,
				events: recorded,
			}).catch((error) => log("error", "save failed", { journeyId: snapshot.id, error: String(error) }));
		}
		emit({ type: "done", runId, journeyId: snapshot.id, ms: Date.now() - started, usage: outcome.usage });
	}, transcript.onEvent);
});

app.post("/baseline", async (c) => {
	const parsed = TripRequestSchema.safeParse(await c.req.json().catch(() => null));
	if (!parsed.success) return c.json({ error: "invalid_request" }, 400);
	const modes = resolveModes(c.env);
	const llm = agentFor(c, modes);
	if (!llm) {
		return c.json({ available: false, reason: "The LLM-only comparison runs once the language model is configured." });
	}
	if (await rateLimited(c)) return c.json({ error: "rate_limited" }, 429);
	const cacheKey = `baseline:v2:${llm.config.model}:${JSON.stringify(parsed.data)}`;
	const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(cacheKey));
	const key = `baseline:${[...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("")}`;
	const cached = await c.env.QLOO_CACHE.get(key);
	if (cached) return c.json({ available: true, text: cached, cached: true });
	try {
		const { text } = await runBaseline(llm.config, llm.budget, parsed.data);
		c.executionCtx.waitUntil(c.env.QLOO_CACHE.put(key, text, { expirationTtl: 30 * 24 * 3600 }));
		return c.json({ available: true, text, cached: false, model: llm.config.model });
	} catch (error) {
		if (error instanceof BudgetExhaustedError) return c.json({ available: false, reason: error.message });
		log("error", "baseline failed", { error: error instanceof Error ? error.message : String(error) });
		return c.json({ available: false, reason: "The comparison model is unavailable right now." }, 502);
	}
});

app.notFound((c) => c.json({ error: "not_found" }, 404));

app.onError((err, c) => {
	log("error", "unhandled error", { path: c.req.path, error: err.message });
	return c.json({ error: "internal_error" }, 500);
});

export default {
	fetch(request, env, ctx) {
		const share = /^\/j\/([0-9a-f-]{36})\/?$/i.exec(new URL(request.url).pathname);
		if (share?.[1]) return sharePage(request, env, share[1]);
		return app.fetch(request, env, ctx);
	},
} satisfies ExportedHandler<Env>;
