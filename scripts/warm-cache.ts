/**
 * Run every featured scenario against a deployment, then plan the top pick of
 * each zoom level, so the Qloo responses a visitor is most likely to need are
 * already in the cache (and each run is recorded as a replayable journey).
 *
 *   node scripts/warm-cache.ts [--base=https://elsewhere.zichengyu.com] [--scripted] [--scenario=kyoto-april] [--no-plans] [--personas]
 *
 * --scripted runs the deterministic planner (no model calls): the agent asks
 * Qloo for the same things, so it warms the cache for free.
 *
 * --personas runs each featured journey once per taste profile as well, so the
 * visitors who follow the testing instructions and swap the profile hit warm data.
 */
import type { AgentEvent } from "../src/shared/events.ts";
import { PERSONAS, SCENARIOS } from "../src/shared/scenarios.ts";
import type { ZoomResult } from "../src/shared/types.ts";

const arg = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
const base = arg("base") ?? "https://elsewhere.zichengyu.com";
const query = process.argv.includes("--scripted") ? "?planner=scripted" : "";
const scenarioId = arg("scenario");
const plans = !process.argv.includes("--no-plans");
const personas = process.argv.includes("--personas");
/** The Worker allows 8 runs a minute per IP. */
const PAUSE_MS = 8000;

async function run(path: string, body: unknown): Promise<{ events: AgentEvent[]; ms: number; status: number }> {
	const started = Date.now();
	const response = await fetch(`${base}${path}${query}`, {
		method: "POST",
		headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
		body: JSON.stringify(body),
	});
	const events: AgentEvent[] = [];
	if (!response.ok || !response.body) return { events, ms: Date.now() - started, status: response.status };
	const decoder = new TextDecoder();
	let buffer = "";
	for await (const chunk of response.body) {
		buffer += decoder.decode(chunk, { stream: true });
		for (let boundary = buffer.indexOf("\n\n"); boundary >= 0; boundary = buffer.indexOf("\n\n")) {
			const frame = buffer.slice(0, boundary);
			buffer = buffer.slice(boundary + 2);
			const data = frame.split("\n").find((line) => line.startsWith("data:"))?.slice(5).trim();
			if (data && data !== "{}") events.push(JSON.parse(data) as AgentEvent);
		}
	}
	return { events, ms: Date.now() - started, status: response.status };
}

function summary(events: AgentEvent[], ms: number, status: number): string {
	const errors = events.filter((e) => e.type === "error").map((e) => (e.type === "error" ? e.message : ""));
	const evidence = events.flatMap((e) => (e.type === "evidence" ? [e.evidence] : []));
	const fetched = evidence.filter((e) => !e.cached).length;
	if (status !== 200) return `✘ HTTP ${status}`;
	return `${errors.length ? "⚠" : "✔"} ${(ms / 1000).toFixed(1)} s · ${evidence.length} Qloo lookups, ${fetched} fetched${errors.length ? ` · ${errors.join("; ")}` : ""}`;
}

const pause = () => new Promise((resolve) => setTimeout(resolve, PAUSE_MS));

for (const scenario of SCENARIOS.filter((s) => !scenarioId || s.id === scenarioId)) {
	if (personas) {
		for (const persona of PERSONAS) {
			const request = { ...scenario.request, favorites: persona.favorites, vibes: persona.vibes };
			const warming = await run("/api/journeys", request);
			console.log(`${scenario.id} · ${persona.label}: ${summary(warming.events, warming.ms, warming.status)}`);
			await pause();
		}
		continue;
	}
	const journey = await run("/api/journeys", scenario.request);
	const journeyId = journey.events.find((e) => e.type === "run.start")?.journeyId;
	console.log(`${scenario.id}: ${summary(journey.events, journey.ms, journey.status)}${journeyId ? ` · ${base}/j/${journeyId}` : ""}`);
	await pause();
	if (!plans || !journeyId) continue;
	const zooms = journey.events.flatMap((e): ZoomResult[] => (e.type === "ui.zoom" ? [e.result] : []));
	for (const zoom of zooms) {
		const top = zoom.items[0];
		if (!top) continue;
		const plan = await run(`/api/journeys/${journeyId}/plan`, { target: { level: zoom.level, itemId: top.id }, prefs: {} });
		console.log(`  plan ${zoom.level} (${top.id}): ${summary(plan.events, plan.ms, plan.status)}`);
		await pause();
	}
}
