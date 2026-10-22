/**
 * Key-day validation: run the queries Elsewhere depends on against the live
 * Qloo hackathon API and write a "data reality" report.
 *
 *   QLOO_API_KEY=... node scripts/validate-qloo.ts [--destination=Kyoto] [--spot="Fushimi Inari Taisha"]
 *
 * Raw responses go to .qloo-cache/validation/<timestamp>/ (git-ignored; never commit Qloo data).
 */
import { mkdir, writeFile } from "node:fs/promises";
import { LiveTransport, QlooClient, toSearchParams, type QlooParams } from "../src/engine/qloo/client.ts";
import { ENTITY_TYPE, QlooApi, wktPoint } from "../src/engine/qloo/endpoints.ts";
import { entitiesOf, heatCellsOf, toLocality } from "../src/engine/qloo/normalize.ts";
import { seasonInfo } from "../src/engine/season.ts";
import { SCENARIOS } from "../src/shared/scenarios.ts";

const args = new Map(
	process.argv.slice(2).map((arg) => {
		const [key, ...rest] = arg.replace(/^--/, "").split("=");
		return [key ?? "", rest.join("=") || "true"];
	}),
);
const apiKey = process.env.QLOO_API_KEY;
if (!apiKey) {
	console.error("Set QLOO_API_KEY first (never commit it).");
	process.exit(1);
}

const destination = args.get("destination") ?? "Kyoto";
const spotName = args.get("spot") ?? "Fushimi Inari Taisha";
const twinCity = args.get("twin") ?? "Kanazawa";
const transport = new LiveTransport({ apiKey, baseUrl: args.get("base-url") });
const client = new QlooClient({ transport });
const api = new QlooApi(client);
const outDir = `.qloo-cache/validation/${new Date().toISOString().replace(/[:.]/g, "-")}`;
await mkdir(outDir, { recursive: true });

interface CheckResult {
	name: string;
	ok: boolean;
	summary: string;
}
const results: CheckResult[] = [];

async function raw(name: string, path: string, params: QlooParams): Promise<unknown> {
	const data = await transport.get(path, toSearchParams(params));
	await writeFile(`${outDir}/${name}.json`, JSON.stringify({ path, params, data }, null, 2));
	return data;
}

async function check(name: string, run: () => Promise<string>): Promise<void> {
	const started = Date.now();
	try {
		const summary = await run();
		results.push({ name, ok: true, summary: `${summary} (${Date.now() - started} ms)` });
		console.log(`✔ ${name}: ${summary}`);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		results.push({ name, ok: false, summary: message });
		console.log(`✘ ${name}: ${message}`);
	}
}

function keysOf(data: unknown): string {
	const first = entitiesOf(data)[0];
	return first && typeof first === "object" ? Object.keys(first).sort().join(", ") : "(no entities)";
}

let cityId = "";
let cityLatLon = { lat: 0, lon: 0 };
let spotId = "";
let twinIds: string[] = [];
let twinCityId = "";

await check("1. Resolve destination locality", async () => {
	const data = await raw("01-search-locality", "/search", { query: destination, types: [ENTITY_TYPE.locality], take: 5 });
	const found = entitiesOf(data).map(toLocality).filter((l) => l !== undefined);
	const city = found[0];
	if (!city) throw new Error("no locality returned");
	cityId = city.id;
	cityLatLon = { lat: city.lat, lon: city.lon };
	return `${found.map((l) => `${l.name} [${l.disambiguation ?? "?"}]`).join(" | ")} · keys: ${keysOf(data)}`;
});

await check("2. Most popular sights (search sort_by=popularity)", async () => {
	const data = await raw("02-top-attractions", "/search", {
		types: [ENTITY_TYPE.place],
		"filter.location": `${cityLatLon.lat},${cityLatLon.lon}`,
		"filter.radius": 15,
		"filter.tags": ["urn:tag:genre:place:tourist_attraction", "urn:tag:genre:place:historical_landmark"],
		sort_by: "popularity",
		take: 10,
	});
	return entitiesOf(data)
		.map((e) => `${(e as { name?: string }).name} (${(e as { popularity?: number }).popularity ?? "?"})`)
		.join(", ");
});

await check("3. Resolve the crowded spot", async () => {
	const found = await api.searchPlaces(spotName, { ...cityLatLon, radiusMiles: 30 }, 5);
	const spot = found[0];
	if (!spot) throw new Error("spot not found");
	spotId = spot.id;
	return `${spot.name} · popularity ${spot.popularity} · tags: ${spot.tags.map((t) => t.id).slice(0, 6).join(", ")}`;
});

await check("4. Quiet twins (place signal + city + popularity cap)", async () => {
	const data = await raw("04-quiet-twins", "/v2/insights", {
		"filter.type": ENTITY_TYPE.place,
		"signal.interests.entities": [spotId],
		"filter.location": cityId,
		"filter.popularity.max": 0.9,
		"filter.exclude.entities": [spotId],
		"feature.explainability": true,
		take: 15,
	});
	const twins = entitiesOf(data) as { entity_id: string; name: string; popularity?: number; query?: { affinity?: number } }[];
	twinIds = twins.map((t) => t.entity_id);
	return twins.slice(0, 8).map((t) => `${t.name} (aff ${t.query?.affinity?.toFixed(2)}, pop ${t.popularity?.toFixed(2)})`).join(", ");
});

await check("5. Taste fit differs across personas (filter.results.entities)", async () => {
	const personas = [["Spirited Away", "Ryuichi Sakamoto"], ["In the Mood for Love", "Mariya Takeuchi"]];
	const rankings: string[] = [];
	for (const favorites of personas) {
		const ids = (await Promise.all(favorites.map((f) => api.searchTaste(f, 1)))).flat().map((t) => t.id);
		const scored = await api.places({ signalIds: ids, resultIds: twinIds.slice(0, 15), take: 15 });
		rankings.push(scored.slice(0, 3).map((p) => `${p.name} ${p.affinity?.toFixed(2)}`).join(", "));
	}
	return rankings.map((r, i) => `persona ${i + 1}: ${r}`).join(" || ");
});

await check("6. Day trips (POINT + radius, exclude the city)", async () => {
	const data = await raw("06-day-trips", "/v2/insights", {
		"filter.type": ENTITY_TYPE.place,
		"signal.interests.entities": [spotId],
		"filter.location": wktPoint(cityLatLon.lat, cityLatLon.lon),
		"filter.location.radius": 120_000,
		"filter.exclude.location": cityId,
		"filter.popularity.max": 0.975,
		take: 30,
	});
	const towns = new Map<string, number>();
	for (const e of entitiesOf(data) as { city?: string; properties?: { geocode?: { city?: string } } }[]) {
		const town = e.city ?? e.properties?.geocode?.city ?? "?";
		towns.set(town, (towns.get(town) ?? 0) + 1);
	}
	return [...towns.entries()].map(([town, n]) => `${town}×${n}`).join(", ");
});

let homeDestinationId = "";
await check("7. Similar destinations (destination → destination)", async () => {
	const [home] = await api.searchDestinations(destination, 3);
	if (!home) throw new Error("no destination entity");
	homeDestinationId = home.id;
	const similar = await api.destinations({ signalIds: [home.id], take: 30 });
	const twin = similar.find((d) => d.name.toLowerCase() === twinCity.toLowerCase());
	if (twin) twinCityId = twin.id;
	return similar.slice(0, 12).map((d) => `${d.name} [${d.countryCode ?? "?"}] ${d.popularity?.toFixed(2)}`).join(", ");
});

await check("8. filter.popularity.max on localities", async () => {
	const data = await raw("08-localities-popularity-cap", "/v2/insights", {
		"filter.type": ENTITY_TYPE.locality,
		"signal.interests.entities": [cityId],
		"filter.popularity.max": 0.9,
		take: 20,
	});
	const pops = entitiesOf(data).map(toLocality).map((l) => l?.popularity ?? Number.NaN);
	return `max popularity returned: ${Math.max(...pops.filter(Number.isFinite)).toFixed(3)} over ${pops.length} results`;
});

await check("9. Heatmap (city + taste signal), default and neighborhood boundary", async () => {
	const film = (await api.searchTaste("Spirited Away", 1))[0];
	const base = { "filter.type": ENTITY_TYPE.heatmap, "filter.location": cityId, "signal.interests.entities": [film?.id ?? spotId] };
	const cells = heatCellsOf(await raw("09-heatmap", "/v2/insights", base));
	const neighborhoods = heatCellsOf(await raw("09b-heatmap-neighborhood", "/v2/insights", { ...base, "output.heatmap.boundary": "neighborhood" }));
	return `${cells.length} geohash cells (precision ${cells[0]?.geohash.length ?? "?"}) · neighborhood boundary: ${neighborhoods.length} cells`;
});

await check("10. Locality month tags (search, then insights with filter.results.entities)", async () => {
	const city = (await api.searchLocalities(destination, 3))[0];
	if (!city || !homeDestinationId) throw new Error("no locality or destination");
	const profile = await api.localityProfile(city.id, homeDestinationId);
	const season = seasonInfo(profile, 4);
	return `${profile?.tags.length ?? 0} tags · peak ${season.peakMonths} · best ${season.bestMonths} · worst ${season.worstMonths} · April events ${season.events.join("/")}`;
});

await check("11. Compare taste DNA (destinations)", async () => {
	if (!twinCityId) throw new Error(`${twinCity} was not among similar destinations; pass --twin=<name>`);
	const traits = await api.compare([homeDestinationId], [twinCityId], 12);
	return traits.join(", ") || "(no traits)";
});

await check("12. Tag search (semantic)", async () => {
	const tags = await api.searchTags("temple", 5);
	return tags.map((t) => `${t.name} [${t.id}]`).join(", ");
});

await check("14. Featured scenario destinations resolve", async () => {
	const rows: string[] = [];
	for (const scenario of SCENARIOS) {
		const found = await api.searchDestinations(scenario.request.destination, 3);
		rows.push(`${scenario.request.destination}→${found[0] ? `${found[0].name} [${found[0].country ?? "?"}]` : "MISSING"}`);
	}
	return rows.join(", ");
});

const report = [
	`# Qloo data reality report`,
	``,
	`Run ${new Date().toISOString()} against ${client.mode} API · destination ${destination} · spot ${spotName}`,
	``,
	...results.map((r) => `- ${r.ok ? "✔" : "✘"} **${r.name}**: ${r.summary}`),
	``,
	`Raw responses: ${outDir}/ (git-ignored).`,
].join("\n");
await writeFile(`${outDir}/report.md`, report);
console.log(`\nReport: ${outDir}/report.md`);
