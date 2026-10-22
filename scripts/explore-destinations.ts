/**
 * Exploration for tuning the twin-city and day-trip levels: the destinations
 * Qloo finds similar to a featured scenario's city (two pages, or those within
 * a day trip with --nearby), with country, popularity, affinity, distance and
 * genres. Uses the file cache.
 *
 *   node --env-file=.dev.vars.live scripts/explore-destinations.ts kyoto-april [--foreign] [--nearby]
 *   node --env-file=.dev.vars.live scripts/explore-destinations.ts kyoto-april --mode=tags|mixed|spots
 */
import { LiveTransport, QlooClient } from "../src/engine/qloo/client.ts";
import { QlooApi } from "../src/engine/qloo/endpoints.ts";
import { resolveTrip } from "../src/engine/resolve.ts";
import { percentile } from "../src/shared/format.ts";
import { SCENARIOS } from "../src/shared/scenarios.ts";
import { haversineKm } from "../src/engine/geo.ts";
import { DAY_TRIP_RADIUS_KM } from "../src/engine/zoom/region.ts";
import { similarDestinations } from "../src/engine/zoom/shared.ts";
import { FileCache } from "./lib/file-cache.ts";

const scenario = SCENARIOS.find((s) => s.id === process.argv[2]);
if (!scenario) throw new Error("unknown scenario");
const api = new QlooApi(new QlooClient({ transport: new LiveTransport({ apiKey: process.env.QLOO_API_KEY ?? "" }), cache: new FileCache() }));
const hotspot = await resolveTrip(api, scenario.request);
const home = hotspot.locality;
console.log(`${home.name} [${home.countryCode}] pop ${percentile(home.popularity)} id ${hotspot.destinationId} tags: ${home.tags.map((t) => t.name).join(", ")}`);
const [destination] = await api.searchDestinations(scenario.request.destination, 1);
const genreTags = (destination?.tags ?? []).filter((t) => t.type.includes("genre:destination"));
console.log(`genres: ${genreTags.map((t) => `${t.name} [${t.id}]`).join(", ")}`);
console.log(`vibes: ${hotspot.vibeTags.map((t) => t.id).join(", ")}`);
const mode = process.argv.find((a) => a.startsWith("--mode="))?.split("=")[1] ?? "entity";
// Some destinations are not valid signals (Seoul); the engine then uses the crowded sights.
const page = async (offset?: number) => {
	if (mode === "tags") return api.destinations({ signalTagIds: [...genreTags.map((t) => t.id), ...hotspot.vibeTags.map((t) => t.id)], take: 50, offset });
	if (mode === "mixed") return api.destinations({ signalIds: [hotspot.destinationId ?? ""], signalTagIds: [...genreTags.map((t) => t.id), ...hotspot.vibeTags.map((t) => t.id)], take: 50, offset });
	if (mode === "spots") return api.destinations({ signalIds: hotspot.crowdedSpots.map((s) => s.id), take: 50, offset });
	const byDestination = await api.destinations({ signalIds: [hotspot.destinationId ?? ""], take: 50, offset }).catch(() => []);
	return byDestination.length > 0 ? byDestination : api.destinations({ signalIds: hotspot.crowdedSpots.map((s) => s.id), take: 50, offset });
};
const nearby = process.argv.includes("--nearby");
const pages = nearby
	? await similarDestinations(api, hotspot, { area: { lat: hotspot.area.lat, lon: hotspot.area.lon, radiusKm: DAY_TRIP_RADIUS_KM }, take: 25, note: "Find towns nearby" })
	: [...(await page()), ...(await page(50))];
const foreign = process.argv.includes("--foreign");
pages.forEach((c, i) => {
	if (foreign && c.countryCode === home.countryCode) return;
	console.log(`${String(i + 1).padStart(3)} ${c.name.padEnd(26)} ${(c.countryCode ?? "?").padEnd(3)} pop ${percentile(c.popularity).padStart(6)} aff ${(c.affinity ?? 0).toFixed(3)} ${haversineKm(c, home).toFixed(0).padStart(6)} km · ${c.tags.map((t) => t.name).join(", ")}`);
});
