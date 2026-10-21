import { describe, expect, it } from "vitest";
import { runScriptedJourney, runScriptedPlan } from "../src/engine/agent/scripted.ts";
import type { JourneyState, ToolContext } from "../src/engine/agent/tools.ts";
import { haversineKm } from "../src/engine/geo.ts";
import { planLocal } from "../src/engine/local.ts";
import { QlooError } from "../src/engine/qloo/client.ts";
import { ResolveError, resolveDestination, resolveTrip } from "../src/engine/resolve.ts";
import { findCityTwins } from "../src/engine/zoom/cities.ts";
import { findSpotTwins } from "../src/engine/zoom/city.ts";
import { findDayTrips } from "../src/engine/zoom/region.ts";
import type { AgentEvent } from "../src/shared/events.ts";
import type { Evidence, TripRequest } from "../src/shared/types.ts";
import { testApi } from "./fixtures/test-world.ts";

const REQUEST: TripRequest = {
	destination: "Testa",
	month: 4,
	mustSees: ["Crowded Shrine", "Busy Temple"],
	favorites: ["Calm Film"],
	vibes: ["quiet"],
	flexibility: "flexible",
};

describe("mock transport", () => {
	it("rejects non-locality signals for locality output, like the real API", async () => {
		const api = testApi();
		const [film] = await api.searchTaste("Calm Film");
		await expect(api.client.get("/v2/insights", { "filter.type": "urn:entity:locality", "signal.interests.entities": [film?.id ?? ""] })).rejects.toBeInstanceOf(QlooError);
	});

	it("applies location, popularity and exclusion filters", async () => {
		const api = testApi();
		const [testa] = await api.searchLocalities("Testa");
		const [shrine] = await api.searchPlaces("Crowded Shrine");
		const places = await api.places({ signalIds: [shrine?.id ?? ""], location: testa?.id, popularityMax: 0.9, excludeIds: [shrine?.id ?? ""] });
		expect(places.length).toBeGreaterThan(0);
		for (const place of places) {
			expect(place.popularity ?? 1).toBeLessThanOrEqual(0.9);
			expect(place.id).not.toBe(shrine?.id);
			expect(place.city).toBe("Testa");
		}
	});
});

describe("engine on the test world", () => {
	it("resolves the trip", async () => {
		const evidence: Evidence[] = [];
		const hotspot = await resolveTrip(testApi((e) => evidence.push(e)), REQUEST);
		expect(hotspot.locality.name).toBe("Testa");
		expect(hotspot.season.isPeak).toBe(true);
		expect(hotspot.season.events).toEqual(["Blossom Festival"]);
		expect(hotspot.crowdedSpots.map((s) => s.name)).toEqual(["Crowded Shrine", "Busy Temple"]);
		expect(hotspot.tasteProfile.map((t) => t.name)).toEqual(["Calm Film"]);
		expect(hotspot.vibeTags.map((t) => t.name)).toEqual(["Quiet"]);
		expect(hotspot.trend?.length).toBeGreaterThanOrEqual(52);
		expect(hotspot.trend?.every((p) => p.percentile >= 0 && p.percentile <= 1)).toBe(true);
		expect(evidence.every((e) => e.ok)).toBe(true);
	});

	it("resolves a destination written with its country or a typo", async () => {
		const api = testApi();
		expect((await resolveDestination(api, "Testa, Testland")).name).toBe("Testa");
		expect((await resolveDestination(api, "Quiettn Testland")).name).toBe("Quietton");
		await expect(resolveDestination(api, "Atlantis")).rejects.toBeInstanceOf(ResolveError);
	});

	it("finds quieter twins in the same city", async () => {
		const api = testApi();
		const hotspot = await resolveTrip(api, REQUEST);
		const result = await findSpotTwins({ api, hotspot, month: 4 });
		expect(result.items.length).toBeGreaterThan(0);
		for (const item of result.items) {
			expect(item.twin.popularity ?? 1).toBeLessThan(item.original.popularity ?? 0);
			expect(haversineKm(item.twin, hotspot.locality)).toBeLessThan(15);
			expect(item.score.total).toBeGreaterThan(0);
			expect(item.score.components.map((c) => c.key)).toEqual(["soul", "taste", "crowd", "proximity"]);
		}
		expect(result.heat?.length).toBeGreaterThan(0);
	});

	it("finds day trips outside the city", async () => {
		const api = testApi();
		const hotspot = await resolveTrip(api, REQUEST);
		const result = await findDayTrips({ api, hotspot, month: 4 });
		expect(result.items.map((t) => t.town.name)).toContain("Nearby Village");
		expect(result.items.every((t) => t.town.name !== "Testa")).toBe(true);
	});

	it("skips day-trip towns that host one of the crowded must-sees", async () => {
		const api = testApi();
		const hotspot = await resolveTrip(api, REQUEST);
		const [first, ...rest] = hotspot.crowdedSpots;
		if (!first) throw new Error("expected a crowded spot");
		const crowdedVillage = { ...hotspot, crowdedSpots: [{ ...first, city: "Nearby Village" }, ...rest] };
		const result = await findDayTrips({ api, hotspot: crowdedVillage, month: 4 });
		expect(result.items.map((t) => t.town.name)).not.toContain("Nearby Village");
	});

	it("separates same-country and cross-border twins", async () => {
		const api = testApi();
		const hotspot = await resolveTrip(api, REQUEST);
		const country = await findCityTwins({ api, hotspot, month: 4 }, "country");
		const world = await findCityTwins({ api, hotspot, month: 4 }, "world");
		expect(country.items.map((c) => c.city.name)).toContain("Quietton");
		expect(country.items.every((c) => c.city.countryCode === "ZZ")).toBe(true);
		expect(world.items.map((c) => c.city.name)).toEqual(["Farland"]);
		const quietton = country.items.find((c) => c.city.name === "Quietton");
		expect(quietton?.season.isBestMonth).toBe(true);
	});

	it("plans the chosen alternative like a local", async () => {
		const api = testApi();
		const hotspot = await resolveTrip(api, REQUEST);
		const city = await findSpotTwins({ api, hotspot, month: 4 });
		const plan = await planLocal({ api, hotspot, zooms: [city] }, { level: "city", itemId: city.items[0]?.id });
		expect(plan.target.name).toBe("Testa");
		expect(plan.days.length).toBe(2);
		expect(plan.days[0]?.stops[0]?.place.id).toBe(city.items[0]?.twin.id);
		expect(plan.stayArea).toBeDefined();
		expect(plan.customs.length).toBeGreaterThan(0);
	});
});

describe("scripted planner", () => {
	it("streams the hotspot, every requested level, and narration", async () => {
		const events: AgentEvent[] = [];
		const state: JourneyState = { journeyId: "j1", request: { ...REQUEST, zooms: ["city", "region", "country", "world"] }, zooms: [], narrative: [] };
		const ctx: ToolContext = { api: testApi(), emit: (e) => events.push(e), state };
		// Asked out of order: narration still reads nearest first.
		state.request.zooms = ["world", "city", "country", "region"];
		await runScriptedJourney(ctx);
		const types = events.map((e) => e.type);
		expect(types.indexOf("ui.hotspot")).toBeLessThan(types.indexOf("ui.zoom"));
		const levels = events.flatMap((e) => (e.type === "ui.zoom" ? [e.result.level] : []));
		expect(levels.sort()).toEqual(["city", "country", "region", "world"]);
		expect(state.narrative.join(" ")).toContain("peak season");
		const order = ["Same city.", "Day trip.", "Same country.", "Beyond borders."].map((lead) => state.narrative.findIndex((p) => p.startsWith(lead)));
		expect(order.every((index) => index > 0)).toBe(true);
		expect([...order].sort((a, b) => a - b)).toEqual(order);
		expect(events.some((e) => e.type === "trace.step" && e.status === "error")).toBe(false);

		await runScriptedPlan(ctx, { level: "country", itemId: state.zooms.find((z) => z.level === "country")?.items[0]?.id }, { quieter: true });
		expect(state.plan?.target.name).toBe("Quietton");
		expect(state.plan?.quieter).toBe(true);
	});
});
