/**
 * Evaluate the engine across featured scenarios and personas.
 *
 *   node scripts/eval.ts                 # synthetic demo world
 *   QLOO_API_KEY=... node scripts/eval.ts --live [--scenario=kyoto-april]
 *
 * Checks that every level returns the right kind of alternative, that the
 * alternatives are less popular, and how often the top pick changes with taste.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { MemoryCache } from "../src/engine/qloo/cache.ts";
import { FileCache } from "./lib/file-cache.ts";
import { LiveTransport, QlooClient, type QlooTransport } from "../src/engine/qloo/client.ts";
import { QlooApi } from "../src/engine/qloo/endpoints.ts";
import { demoWorld } from "../src/engine/qloo/mock/demo-world.ts";
import { MockTransport } from "../src/engine/qloo/mock/transport.ts";
import { haversineKm } from "../src/engine/geo.ts";
import { resolveTrip } from "../src/engine/resolve.ts";
import { findCityTwins } from "../src/engine/zoom/cities.ts";
import { findSpotTwins } from "../src/engine/zoom/city.ts";
import { findDayTrips } from "../src/engine/zoom/region.ts";
import { PERSONAS, SCENARIOS } from "../src/shared/scenarios.ts";
import type { Hotspot, ZoomLevel, ZoomResult } from "../src/shared/types.ts";

const args = new Set(process.argv.slice(2));
const scenarioFilter = process.argv.find((a) => a.startsWith("--scenario="))?.split("=")[1];
const live = args.has("--live");
if (live && !process.env.QLOO_API_KEY) {
	console.error("--live needs QLOO_API_KEY");
	process.exit(1);
}

const transport: QlooTransport = live ? new LiveTransport({ apiKey: process.env.QLOO_API_KEY ?? "" }) : new MockTransport(demoWorld());
// Live runs reuse responses across runs (git-ignored .qloo-cache/http/); synthetic runs stay in memory.
const cache = live ? new FileCache() : new MemoryCache(5000);
let calls = 0;
const api = new QlooApi(new QlooClient({ transport, cache, onEvidence: (e) => (calls += e.cached ? 0 : 1) }));

function topName(result: ZoomResult): string | undefined {
	switch (result.level) {
		case "city":
			return result.items[0]?.twin.name;
		case "region":
			return result.items[0]?.town.name;
		default:
			return result.items[0]?.city.name;
	}
}

function levelChecks(result: ZoomResult, hotspot: Hotspot): { ok: boolean; issue?: string; crowdRelief: number[] } {
	const home = hotspot.locality;
	const relief = (key: "crowd") => (c: { key: string; value: number }) => c.key === key;
	switch (result.level) {
		case "city": {
			const bad = result.items.find((i) => haversineKm(i.twin, home) > 25 || (i.twin.popularity ?? 0) >= (i.original.popularity ?? 1));
			return { ok: !bad, issue: bad ? `${bad.twin.name} is outside the city or not quieter` : undefined, crowdRelief: result.items.map((i) => i.score.components.find(relief("crowd"))?.value ?? 0) };
		}
		case "region": {
			const bad = result.items.find((i) => i.distanceKm < 8 || i.distanceKm > 160);
			return { ok: !bad, issue: bad ? `${bad.town.name} at ${bad.distanceKm.toFixed(0)} km` : undefined, crowdRelief: result.items.map((i) => i.score.components.find(relief("crowd"))?.value ?? 0) };
		}
		default: {
			const same = (code?: string) => code !== undefined && code === home.countryCode;
			const bad = result.items.find((i) => (result.level === "country" ? !same(i.city.countryCode) : same(i.city.countryCode)));
			return { ok: !bad, issue: bad ? `${bad.city.name} is in the wrong country set` : undefined, crowdRelief: result.items.map((i) => i.score.components.find(relief("crowd"))?.value ?? 0) };
		}
	}
}

async function runLevel(level: ZoomLevel, hotspot: Hotspot, month?: number): Promise<ZoomResult> {
	const ctx = { api, hotspot, month };
	if (level === "city") return findSpotTwins(ctx);
	if (level === "region") return findDayTrips(ctx);
	return findCityTwins(ctx, level);
}

const rows: string[] = [];
let checks = 0;
let passed = 0;
const reliefs: number[] = [];
let personalizationCases = 0;
let personalizationChanged = 0;

for (const scenario of SCENARIOS.filter((s) => !scenarioFilter || s.id === scenarioFilter)) {
	const tastes = [
		{ label: "as written", favorites: scenario.request.favorites, vibes: scenario.request.vibes },
		...PERSONAS.map((p) => ({ label: p.label, favorites: p.favorites, vibes: p.vibes })),
	];
	const topByLevel = new Map<ZoomLevel, Set<string>>();
	for (const taste of tastes) {
		const started = Date.now();
		const before = calls;
		try {
			const hotspot = await resolveTrip(api, { ...scenario.request, favorites: taste.favorites, vibes: taste.vibes });
			const picks: string[] = [];
			for (const level of scenario.request.zooms ?? ["city", "region"]) {
				const result = await runLevel(level, hotspot, scenario.request.month);
				const check = levelChecks(result, hotspot);
				checks++;
				if (check.ok && result.items.length > 0) passed++;
				reliefs.push(...check.crowdRelief);
				const top = topName(result) ?? "—";
				picks.push(`${level}: ${top}${check.issue ? ` ⚠ ${check.issue}` : ""}${result.items.length === 0 ? " ⚠ empty" : ""}`);
				topByLevel.set(level, new Set([...(topByLevel.get(level) ?? []), top]));
			}
			rows.push(`| ${scenario.id} | ${taste.label} | ${picks.join("<br>")} | ${Date.now() - started} ms | ${calls - before} |`);
		} catch (error) {
			rows.push(`| ${scenario.id} | ${taste.label} | ERROR: ${error instanceof Error ? error.message : String(error)} | | |`);
		}
	}
	for (const tops of topByLevel.values()) {
		personalizationCases++;
		if (tops.size > 1) personalizationChanged++;
	}
}

const meanRelief = reliefs.length ? reliefs.reduce((a, b) => a + b, 0) / reliefs.length : 0;
const summary = [
	`# Elsewhere eval (${live ? "live Qloo" : "synthetic demo world"})`,
	``,
	`- Level checks passed: ${passed}/${checks}`,
	`- Mean crowd relief of returned alternatives: ${(meanRelief * 100).toFixed(0)}%`,
	`- Personalization: top pick changed with taste in ${personalizationChanged}/${personalizationCases} scenario-levels`,
	``,
	`| Scenario | Taste | Top pick per level | Time | Qloo calls |`,
	`| --- | --- | --- | --- | --- |`,
	...rows,
].join("\n");

console.log(summary);
await mkdir(".qloo-cache", { recursive: true });
const file = `.qloo-cache/eval-${live ? "live" : "mock"}-${new Date().toISOString().replace(/[:.]/g, "-")}.md`;
await writeFile(file, summary);
console.log(`\nSaved ${file}`);
