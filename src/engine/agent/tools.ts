/**
 * The agent's tools. The scripted planner and the Claude agent call the same
 * functions: each one runs the engine, streams UI events, updates the journey
 * state and returns a compact JSON summary for the model.
 */
import type { Emit } from "../../shared/events.ts";
import { monthName, percentile } from "../../shared/format.ts";
import type {
	Hotspot,
	LocalPlan,
	PlanPrefs,
	PlanTargetRef,
	TripRequest,
	ZoomLevel,
	ZoomResult,
} from "../../shared/types.ts";
import { planLocal } from "../local.ts";
import type { QlooApi } from "../qloo/endpoints.ts";
import { resolveTrip } from "../resolve.ts";
import { findCityTwins } from "../zoom/cities.ts";
import { findSpotTwins } from "../zoom/city.ts";
import { findDayTrips } from "../zoom/region.ts";

export interface JourneyState {
	journeyId: string;
	request: TripRequest;
	hotspot?: Hotspot;
	zooms: ZoomResult[];
	plan?: LocalPlan;
	narrative: string[];
}

export interface ToolContext {
	api: QlooApi;
	emit: Emit;
	state: JourneyState;
}

/** Run a step and stream its progress to the agent trace. */
export async function traced<T>(
	ctx: ToolContext,
	label: string,
	task: () => Promise<T>,
	detail?: (result: T) => string,
): Promise<T> {
	const id = `step-${crypto.randomUUID().slice(0, 8)}`;
	const started = Date.now();
	ctx.emit({ type: "trace.step", id, label, status: "running" });
	try {
		const result = await task();
		ctx.emit({ type: "trace.step", id, label, status: "done", detail: detail?.(result), ms: Date.now() - started });
		return result;
	} catch (error) {
		ctx.emit({
			type: "trace.step",
			id,
			label,
			status: "error",
			detail: error instanceof Error ? error.message : String(error),
			ms: Date.now() - started,
		});
		throw error;
	}
}

const round2 = (value: number | undefined) => (value === undefined ? undefined : Math.round(value * 100) / 100);

/** Season facts for the model, or an explicit "unknown" so it never reads missing tags as "not peak". */
function seasonSummary(hotspot: Hotspot): Record<string, unknown> | string {
	const { season } = hotspot;
	const known = season.peakMonths.length + season.bestMonths.length + season.offSeasonMonths.length + season.worstMonths.length > 0;
	if (!known) return "Qloo has no month data for this destination";
	return {
		isPeakSeason: season.isPeak,
		isBestMonth: season.isBestMonth,
		isWorstMonth: season.isWorstMonth,
		peakMonths: season.peakMonths.map(monthName),
		bestMonths: season.bestMonths.map(monthName),
		eventsThisMonth: season.events,
		advisoriesThisMonth: season.advisories,
	};
}

/**
 * Results without per-place tags: the cards never read them, and dropping them
 * keeps streamed events and saved journeys small (cheaper to serialize).
 * The hotspot keeps its tags; later queries filter on the crowded spots' categories.
 */
function lean(result: ZoomResult): ZoomResult {
	const bare = <T extends { tags: unknown[] }>(place: T): T => ({ ...place, tags: [] });
	switch (result.level) {
		case "city":
			return { ...result, items: result.items.map((item) => ({ ...item, original: bare(item.original), twin: bare(item.twin) })) };
		case "region":
			return { ...result, items: result.items.map((item) => ({ ...item, places: item.places.map(bare) })) };
		default:
			return { ...result, items: result.items.map((item) => ({ ...item, city: bare(item.city), highlights: item.highlights.map(bare) })) };
	}
}

function leanPlan(plan: LocalPlan): LocalPlan {
	return { ...plan, days: plan.days.map((day) => ({ ...day, stops: day.stops.map((stop) => ({ ...stop, place: { ...stop.place, tags: [] } })) })) };
}

export async function resolveTripTool(ctx: ToolContext, request: TripRequest): Promise<Record<string, unknown>> {
	const hotspot = await traced(
		ctx,
		`Reading your trip to ${request.destination}`,
		() => resolveTrip(ctx.api, request),
		(h) => `${h.locality.name} · ${h.crowdedSpots.length} crowded spots · ${h.tasteProfile.length} favorites matched`,
	);
	ctx.state.request = request;
	ctx.state.hotspot = hotspot;
	ctx.emit({ type: "ui.hotspot", hotspot });
	return {
		destination: {
			name: hotspot.locality.name,
			country: hotspot.locality.country,
			popularityPercentile: percentile(hotspot.locality.popularity),
			travelMonth: monthName(hotspot.season.month) || undefined,
			season: seasonSummary(hotspot),
		},
		crowdedSpots: hotspot.crowdedSpots.map((s) => ({
			id: s.id,
			name: s.name,
			requestedAs: s.requestedAs,
			kind: s.genre,
			popularityPercentile: percentile(s.popularity),
		})),
		favoritesMatched: hotspot.tasteProfile.map((t) => `${t.name} (${t.kind})`),
		vibesMatched: hotspot.vibeTags.map((t) => t.name),
		unresolved: hotspot.unresolved,
	};
}

const ZOOM_LABELS: Record<ZoomLevel, string> = {
	city: "Finding quieter twins in the same city",
	region: "Scouting day trips with the same feel",
	country: "Looking for a twin city in the same country",
	world: "Searching beyond borders for the same soul",
};

function summarizeZoom(result: ZoomResult): Record<string, unknown> {
	const scores = (score: { total: number; components: { key: string; value: number }[] }) =>
		Object.fromEntries([["total", round2(score.total)], ...score.components.map((c) => [c.key, round2(c.value)])]);
	switch (result.level) {
		case "city":
			return {
				level: "city",
				note: result.note,
				items: result.items.map((item) => ({
					id: item.id,
					insteadOf: `${item.original.name} (${percentile(item.original.popularity)} pct)`,
					twin: `${item.twin.name} (${percentile(item.twin.popularity)} pct)`,
					categories: item.twin.categories,
					distanceKm: round2(item.distanceKm),
					scores: scores(item.score),
					sharedTraits: item.sharedTraits,
				})),
			};
		case "region":
			return {
				level: "region",
				note: result.note,
				items: result.items.map((item) => ({
					id: item.id,
					town: item.town.name,
					distanceKm: Math.round(item.distanceKm),
					bestPlaces: item.places.map((p) => `${p.name} (${percentile(p.popularity)} pct)`),
					scores: scores(item.score),
					sharedTraits: item.sharedTraits,
				})),
			};
		case "country":
		case "world":
			return {
				level: result.level,
				note: result.note,
				items: result.items.map((item) => ({
					id: item.id,
					city: `${item.city.name}, ${item.city.country ?? ""}`.replace(/, $/, ""),
					origin: item.origin,
					distanceKm: Math.round(item.distanceKm),
					popularityPercentile: percentile(item.city.popularity),
					scores: scores(item.score),
					sharedTraits: item.sharedTraits,
					highlights: item.highlights.map((p) => p.name),
					smallCommunity: item.smallCommunity,
				})),
			};
	}
}

export async function findDupesTool(
	ctx: ToolContext,
	input: { level: ZoomLevel; extraCandidates?: string[] },
): Promise<Record<string, unknown>> {
	const hotspot = ctx.state.hotspot;
	if (!hotspot) throw new Error("Call resolve_trip before find_dupes.");
	const zoomCtx = { api: ctx.api, hotspot, month: ctx.state.request.month };
	const result = await traced(
		ctx,
		ZOOM_LABELS[input.level],
		(): Promise<ZoomResult> => {
			switch (input.level) {
				case "city":
					return findSpotTwins(zoomCtx);
				case "region":
					return findDayTrips(zoomCtx);
				case "country":
				case "world":
					return findCityTwins(zoomCtx, input.level, { extraCandidates: input.extraCandidates });
			}
		},
		(r) => (r.items.length > 0 ? `${r.items.length} alternatives` : (r.note ?? "none found")),
	).then(lean);
	ctx.state.zooms = [...ctx.state.zooms.filter((z) => z.level !== result.level), result];
	ctx.emit({ type: "ui.zoom", result });
	return summarizeZoom(result);
}

export async function planLocalTool(
	ctx: ToolContext,
	input: PlanTargetRef & PlanPrefs,
): Promise<Record<string, unknown>> {
	const hotspot = ctx.state.hotspot;
	if (!hotspot) throw new Error("Call resolve_trip before plan_local.");
	const { level, itemId, ...prefs } = input;
	const plan = await traced(
		ctx,
		"Planning it like a local",
		() => planLocal({ api: ctx.api, hotspot, zooms: ctx.state.zooms }, { level, itemId }, prefs),
		(p) => `${p.target.name} · ${p.days.length} day${p.days.length === 1 ? "" : "s"}`,
	).then(leanPlan);
	ctx.state.plan = plan;
	ctx.emit({ type: "ui.plan", plan });
	return {
		target: plan.target.name,
		stayArea: plan.stayArea?.label,
		days: plan.days.map((day) => ({
			title: day.title,
			stops: day.stops.map((stop) => `${stop.slot}: ${stop.place.name} (${percentile(stop.place.popularity)} pct)`),
		})),
		customs: plan.customs,
		goodGuest: plan.goodGuest,
	};
}
