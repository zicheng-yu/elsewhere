/**
 * CPU cost of a journey with every Qloo response already in memory: the part of
 * the work that counts toward the Workers CPU limit (network waits do not).
 *
 *   node scripts/cpu-bench.ts kyoto-april
 */
import { readFile, readdir } from "node:fs/promises";
import { runScriptedJourney, runScriptedPlan } from "../src/engine/agent/scripted.ts";
import type { JourneyState, ToolContext } from "../src/engine/agent/tools.ts";
import { MemoryCache } from "../src/engine/qloo/cache.ts";
import { QlooClient, type QlooTransport } from "../src/engine/qloo/client.ts";
import { QlooApi } from "../src/engine/qloo/endpoints.ts";
import { SCENARIOS } from "../src/shared/scenarios.ts";

const scenario = SCENARIOS.find((s) => s.id === (process.argv[2] ?? "kyoto-april"));
if (!scenario) throw new Error("unknown scenario");
// Raw JSON strings, as KV would hand them over; parsing them is part of the measured work.
const texts = new Map<string, string>();
for (const file of await readdir(".qloo-cache/http")) {
	const entry = JSON.parse(await readFile(`.qloo-cache/http/${file}`, "utf8")) as { key: string; value: unknown };
	texts.set(entry.key, JSON.stringify(entry.value));
}
const cache = {
	get: async (key: string) => {
		const text = texts.get(key);
		return text === undefined ? undefined : JSON.parse(text);
	},
	put: async () => {},
};
const offline: QlooTransport = { mode: "live", get: async (path) => { throw new Error(`not cached: ${path}`); } };
void MemoryCache;

async function once(): Promise<number> {
	const api = new QlooApi(new QlooClient({ transport: offline, cache }));
	const state: JourneyState = { journeyId: "bench", request: { ...scenario!.request, zooms: ["city", "region", "country", "world"] }, zooms: [], narrative: [] };
	const ctx: ToolContext = { api, emit: (e) => JSON.stringify(e), state };
	const t = process.cpuUsage();
	await runScriptedJourney(ctx);
	await runScriptedPlan(ctx, { level: "city", itemId: state.zooms.find((z) => z.level === "city")?.items[0]?.id }, {});
	const used = process.cpuUsage(t);
	return (used.user + used.system) / 1000;
}
const runs: number[] = [];
for (let i = 0; i < 8; i++) runs.push(await once());
console.log(`journey + plan CPU, ms: first ${runs[0]?.toFixed(1)} · then ${runs.slice(1).map((r) => r.toFixed(1)).join(", ")}`);
console.log(`cached payload: ${(Array.from(texts.values()).reduce((n, t) => n + t.length, 0) / 1024).toFixed(0)} KB across ${texts.size} responses`);
