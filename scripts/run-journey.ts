/**
 * Run one journey end to end against live Qloo (cached in .qloo-cache/http/) and
 * print what each level found, the Qloo calls made, and the CPU time spent in
 * the engine (network waits excluded), a proxy for the Workers CPU limit.
 *
 *   node --env-file=.dev.vars scripts/run-journey.ts kyoto-april [--plan=city] [--quiet]
 *   node --env-file=.dev.vars scripts/run-journey.ts --destination=Porto --month=6 --must="Livraria Lello" --love="Amália Rodrigues"
 */
import { runScriptedJourney, runScriptedPlan } from "../src/engine/agent/scripted.ts";
import type { JourneyState, ToolContext } from "../src/engine/agent/tools.ts";
import { LiveTransport, QlooClient } from "../src/engine/qloo/client.ts";
import { QlooApi } from "../src/engine/qloo/endpoints.ts";
import { percentile } from "../src/shared/format.ts";
import { SCENARIOS } from "../src/shared/scenarios.ts";
import type { AgentEvent } from "../src/shared/events.ts";
import type { TripRequest, ZoomLevel } from "../src/shared/types.ts";
import { FileCache } from "./lib/file-cache.ts";

const apiKey = process.env.QLOO_API_KEY;
if (!apiKey) {
	console.error("Set QLOO_API_KEY (node --env-file=.dev.vars ...).");
	process.exit(1);
}
const args = new Map(
	process.argv.slice(2).map((arg) => {
		const [key, ...rest] = arg.replace(/^--/, "").split("=");
		return [key ?? "", rest.join("=") || "true"];
	}),
);
const scenarioId = process.argv.slice(2).find((a) => !a.startsWith("--"));
const scenario = SCENARIOS.find((s) => s.id === scenarioId);
const list = (key: string) => (args.get(key) ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const request: TripRequest = scenario
	? { ...scenario.request, zooms: ["city", "region", "country", "world"] }
	: {
			destination: args.get("destination") ?? "Kyoto",
			month: Number(args.get("month") ?? 0) || undefined,
			mustSees: list("must"),
			favorites: list("love"),
			vibes: list("vibes"),
			flexibility: "flexible",
			zooms: ["city", "region", "country", "world"],
		};

let calls = 0;
let cached = 0;
const api = new QlooApi(
	new QlooClient({
		transport: new LiveTransport({ apiKey }),
		cache: new FileCache(),
		onEvidence: (e) => {
			if (e.cached) cached++;
			else calls++;
			if (!e.ok) console.log(`  ✘ ${e.endpoint} ${e.note ?? ""}`);
			else if (!e.cached && args.has("timing")) console.log(`  ${String(e.ms).padStart(6)} ms  ${e.endpoint}  ${e.note ?? ""}  (${e.resultCount} results)`);
		},
	}),
);
const events: AgentEvent[] = [];
const state: JourneyState = { journeyId: "dev", request, zooms: [], narrative: [] };
const ctx: ToolContext = { api, emit: (e) => events.push(e), state };

const cpu0 = process.cpuUsage();
const t0 = Date.now();
await runScriptedJourney(ctx);
const cpu = process.cpuUsage(cpu0);
const hotspot = state.hotspot;
if (!hotspot) {
	console.log(events.filter((e) => e.type === "error" || e.type === "clarify"));
	process.exit(1);
}
const { locality, season } = hotspot;
console.log(`\n${locality.name}, ${locality.region ?? "?"}, ${locality.country ?? "?"} [${locality.countryCode ?? "?"}] · popularity ${percentile(locality.popularity)} · area ${hotspot.area.localityId ? "locality" : "circle"} · destination ${hotspot.destinationId ? "yes" : "no"}`);
console.log(`season: peak ${season.peakMonths} best ${season.bestMonths} off ${season.offSeasonMonths} worst ${season.worstMonths} · this month: events ${season.events.join("/")} advisories ${season.advisories.join("/")}`);
console.log(`spots: ${hotspot.crowdedSpots.map((s) => `${s.name}${s.requestedAs ? ` (for ${s.requestedAs})` : ""} ${percentile(s.popularity)} [${s.genre}]`).join(" | ")}`);
console.log(`taste: ${hotspot.tasteProfile.map((t) => t.name).join(", ")} · vibes: ${hotspot.vibeTags.map((t) => `${t.name} [${t.id}]`).join(", ")} · unresolved: ${hotspot.unresolved.join(", ")}`);
for (const zoom of state.zooms) {
	console.log(`\n## ${zoom.level}${zoom.note ? ` — ${zoom.note}` : ""}`);
	for (const item of zoom.items) {
		const parts = item.score.components.map((c) => `${c.key} ${Math.round(c.value * 100)}`).join(" ");
		if (zoom.level === "city" && "twin" in item) console.log(`  ${item.original.name} → ${item.twin.name} [${item.twin.genre}] ${percentile(item.twin.popularity)} · ${item.distanceKm.toFixed(1)} km · ${Math.round(item.score.total * 100)} (${parts})`);
		if (zoom.level === "region" && "town" in item) console.log(`  ${item.town.name} ${item.distanceKm.toFixed(0)} km · ${Math.round(item.score.total * 100)} (${parts}) · ${item.places.map((p) => p.name).join(", ")}`);
		if ((zoom.level === "country" || zoom.level === "world") && "city" in item) console.log(`  ${item.city.name}, ${item.city.country ?? item.city.countryCode} ${item.distanceKm.toFixed(0)} km · ${percentile(item.city.popularity)} · ${Math.round(item.score.total * 100)} (${parts}) · traits ${item.sharedTraits.join("/")} · ${item.highlights.map((p) => p.name).join(", ")}`);
	}
}
if (args.get("narrate") === "true") console.log(`\n${state.narrative.join("\n\n")}`);

const planLevel = args.get("plan") as ZoomLevel | undefined;
if (planLevel) {
	const zoom = state.zooms.find((z) => z.level === planLevel);
	await runScriptedPlan(ctx, { level: planLevel, itemId: zoom?.items[0]?.id }, { quieter: args.has("quiet") });
	const plan = state.plan;
	if (plan) {
		console.log(`\n## plan: ${plan.target.name} · stay ${plan.stayArea?.label ?? "-"} · ${plan.heat.length} heat cells`);
		for (const day of plan.days) console.log(`  ${day.title}: ${day.stops.map((s) => `${s.slot} ${s.place.name}`).join(" → ")}`);
		console.log(`  customs: ${plan.customs.map((c) => c.topic).join(", ")}`);
	}
}
console.log(`\n${calls} Qloo calls (${cached} cached) · ${Date.now() - t0} ms wall · ${((cpu.user + cpu.system) / 1000).toFixed(1)} ms CPU (includes TLS in Node)`);
