/**
 * CPU time and D1 queries of a journey plus a plan, replayed from the
 * git-ignored .qloo-cache/http/ responses: first through an empty D1 cache (a
 * cold journey, every response fetched), then from the warm cache. Network
 * waits do not count toward the Workers CPU limit; D1 is an in-memory SQLite
 * here, so its work is included and the numbers run slightly high.
 *
 *   node scripts/cpu-bench.ts kyoto-april [--memory]
 *
 * --memory serves cached responses from memory (one JSON.parse each, as D1
 * hands over its text) to separate the engine's CPU from SQLite's.
 */
import { readFile, readdir } from "node:fs/promises";
import { runScriptedJourney, runScriptedPlan } from "../src/engine/agent/scripted.ts";
import type { JourneyState, ToolContext } from "../src/engine/agent/tools.ts";
import { D1Cache } from "../src/engine/qloo/cache.ts";
import { CACHE_VERSION, QlooClient, type QlooTransport } from "../src/engine/qloo/client.ts";
import { QlooApi } from "../src/engine/qloo/endpoints.ts";
import { SCENARIOS } from "../src/shared/scenarios.ts";
import { sqliteD1 } from "../test/fixtures/sqlite-d1.ts";

const scenario = SCENARIOS.find((s) => s.id === (process.argv[2] ?? "kyoto-april"));
if (!scenario) throw new Error("unknown scenario");
// Recorded (already trimmed) responses by request, served the way the transport would.
const prefix = `${CACHE_VERSION}:live:`;
const recorded = new Map<string, string>();
for (const file of await readdir(".qloo-cache/http")) {
	const entry = JSON.parse(await readFile(`.qloo-cache/http/${file}`, "utf8")) as { key: string; value: unknown };
	if (entry.key.startsWith(prefix)) recorded.set(entry.key.slice(prefix.length), JSON.stringify(entry.value));
}
let missing = 0;
const transport: QlooTransport = {
	mode: "live",
	get: async (path, params) => {
		const text = recorded.get(`${path}?${params}`);
		if (text === undefined) {
			missing++;
			throw new Error(`not recorded: ${path}`);
		}
		return JSON.parse(text);
	},
};
const db = sqliteD1();

const memory = process.argv.includes("--memory");
const texts = new Map<string, string>();
const memoryCache = {
	stats: { lookups: 0, hits: 0, writes: 0, queries: 0 },
	get: async (key: string) => {
		const text = texts.get(key);
		return text === undefined ? undefined : JSON.parse(text);
	},
	put: async (key: string, value: unknown) => void texts.set(key, JSON.stringify(value)),
	flush: async () => memoryCache.stats,
};

async function once(): Promise<{ cpuMs: number; queries: number; hits: number; lookups: number; writes: number }> {
	const cache = memory ? memoryCache : new D1Cache(db);
	const api = new QlooApi(new QlooClient({ transport, cache }));
	const state: JourneyState = { journeyId: "bench", request: { ...scenario!.request, zooms: ["city", "region", "country", "world"] }, zooms: [], narrative: [] };
	const ctx: ToolContext = { api, emit: (e) => JSON.stringify(e), state };
	const t = process.cpuUsage();
	await runScriptedJourney(ctx);
	await runScriptedPlan(ctx, { level: "city", itemId: state.zooms.find((z) => z.level === "city")?.items[0]?.id }, {});
	const used = process.cpuUsage(t);
	const stats = await cache.flush();
	return { cpuMs: (used.user + used.system) / 1000, ...stats };
}

const runs = [];
for (let i = 0; i < 8; i++) runs.push(await once());
const [cold, ...warm] = runs;
console.log(`cold cache: ${cold?.queries} D1 queries (${cold?.lookups} lookups, ${cold?.writes} writes)${missing ? ` · ${missing} responses not recorded` : ""}`);
console.log(`warm cache: ${warm[0]?.queries} D1 queries (${warm[0]?.hits}/${warm[0]?.lookups} hits)`);
console.log(`journey + plan CPU, ms: cold ${cold?.cpuMs.toFixed(1)} · warm ${warm.map((r) => r.cpuMs.toFixed(1)).join(", ")}`);
console.log(`cached payload: ${(Array.from(recorded.values()).reduce((n, t) => n + t.length, 0) / 1024).toFixed(0)} KB across ${recorded.size} recorded responses`);
