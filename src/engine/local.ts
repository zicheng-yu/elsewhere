/** "Go like a local": where to stay, a day-by-day plan, and local customs for the chosen alternative. */
import { pct, percentile } from "../shared/format.ts";
import type {
	HeatCell,
	Hotspot,
	LocalPlan,
	Place,
	PlanDay,
	PlanPrefs,
	PlanSlot,
	PlanStop,
	PlanTargetRef,
	SearchArea,
	ZoomResult,
} from "../shared/types.ts";
import { customsFor } from "./content/customs.ts";
import { haversineKm, type LatLon } from "./geo.ts";
import { isSight, PLACE_TAG, SIGHT_TAGS, type QlooApi } from "./qloo/endpoints.ts";
import { tasteSignals } from "./zoom/shared.ts";

export interface PlanContext {
	api: QlooApi;
	hotspot: Hotspot;
	zooms: ZoomResult[];
}

interface ResolvedTarget {
	kind: "city" | "town";
	name: string;
	center: LatLon;
	area: SearchArea;
	countryCode?: string;
	population?: number;
	/** Places that must appear in the plan (the chosen quiet twins). */
	mustInclude: Place[];
	/** Short reason per must-include place. */
	reasons: Map<string, string>;
}

export class PlanTargetError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "PlanTargetError";
	}
}

function resolveTarget(ctx: PlanContext, ref: PlanTargetRef): ResolvedTarget {
	const home = ctx.hotspot.locality;
	const cityTarget = (twins: { twin: Place; reason: string }[]): ResolvedTarget => ({
		kind: "city",
		name: home.name,
		center: home,
		area: ctx.hotspot.area,
		countryCode: home.countryCode,
		population: home.population,
		mustInclude: twins.map((t) => t.twin),
		reasons: new Map(twins.map((t) => [t.twin.id, t.reason])),
	});

	if (ref.level === "hotspot" || ref.level === "city") {
		const city = ctx.zooms.find((z) => z.level === "city");
		const twins = city?.level === "city" ? city.items : [];
		const chosen = ref.itemId ? twins.filter((t) => t.id === ref.itemId) : twins;
		return cityTarget(
			chosen.map((t) => ({
				twin: t.twin,
				reason: `Quiet twin of ${t.original.name}: ${pct(t.score.components.find((c) => c.key === "soul")?.value)} soul match`,
			})),
		);
	}
	if (ref.level === "region") {
		const region = ctx.zooms.find((z) => z.level === "region");
		const town = region?.level === "region" ? region.items.find((t) => t.id === ref.itemId) : undefined;
		if (!town) throw new PlanTargetError("That day-trip town is not part of this journey.");
		return {
			kind: "town",
			name: town.town.name,
			center: town.town,
			area: { lat: town.town.lat, lon: town.town.lon, radiusKm: 6 },
			countryCode: town.places[0]?.countryCode ?? home.countryCode,
			mustInclude: town.places.slice(0, 2),
			reasons: new Map(town.places.slice(0, 2).map((p) => [p.id, `Shares the feel of ${home.name}'s crowded sights`])),
		};
	}
	const zoom = ctx.zooms.find((z) => z.level === ref.level);
	const twin = zoom && (zoom.level === "country" || zoom.level === "world") ? zoom.items.find((c) => c.id === ref.itemId) : undefined;
	if (!twin) throw new PlanTargetError("That city is not part of this journey.");
	return {
		kind: "city",
		name: twin.city.name,
		center: twin.city,
		area: { lat: twin.city.lat, lon: twin.city.lon, radiusKm: 8 },
		countryCode: twin.city.countryCode,
		population: twin.city.population,
		mustInclude: [],
		reasons: new Map(),
	};
}

function nearest<T extends LatLon>(from: LatLon, options: T[]): T | undefined {
	let best: T | undefined;
	let bestDistance = Number.POSITIVE_INFINITY;
	for (const option of options) {
		const d = haversineKm(from, option);
		if (d < bestDistance) {
			best = option;
			bestDistance = d;
		}
	}
	return best;
}

function stopNote(place: Place, reasons: Map<string, string>): string {
	const reason = reasons.get(place.id);
	if (reason) return reason;
	const parts = [place.categories[0]];
	if (place.affinity !== undefined) parts.push(`${pct(place.affinity)} taste match`);
	if (place.popularity !== undefined) parts.push(`${percentile(place.popularity)} popularity percentile`);
	return parts.filter(Boolean).join(" · ");
}

function buildDays(
	target: ResolvedTarget,
	start: LatLon,
	pools: { sights: Place[]; food: Place[]; cafes: Place[]; bars: Place[] },
	dayCount: number,
): PlanDay[] {
	const used = new Set<string>();
	const take = (pool: Place[], from: LatLon, prefer?: Place[]): Place | undefined => {
		const preferred = prefer?.filter((p) => !used.has(p.id)) ?? [];
		const choice = preferred[0] ?? nearest(from, pool.filter((p) => !used.has(p.id)));
		if (choice) used.add(choice.id);
		return choice;
	};

	const sights = [...target.mustInclude, ...pools.sights.filter((p) => !target.mustInclude.some((m) => m.id === p.id))];
	const days: PlanDay[] = [];
	for (let day = 0; day < dayCount; day++) {
		const stops: PlanStop[] = [];
		let cursor: LatLon = start;
		const add = (slot: PlanSlot, place: Place | undefined) => {
			if (!place) return;
			stops.push({ slot, place, note: stopNote(place, target.reasons) });
			cursor = place;
		};
		const preferredSights = day === 0 ? target.mustInclude : target.mustInclude.slice(1);
		add("morning", take(sights, cursor, preferredSights));
		add("lunch", take(pools.food, cursor));
		add("afternoon", take(sights, cursor, preferredSights));
		add("coffee", take(pools.cafes, cursor));
		add("dinner", take(pools.food, cursor));
		add("evening", take(pools.bars, cursor));
		if (stops.length > 0) {
			days.push({ title: dayCount === 1 ? `A day in ${target.name}` : `Day ${day + 1} in ${target.name}`, stops });
		}
	}
	return days;
}

function stayArea(heat: HeatCell[], places: Place[]): LocalPlan["stayArea"] {
	const top = [...heat].sort((a, b) => b.affinity - a.affinity)[0];
	if (!top) return undefined;
	const near = places
		.filter((p) => p.neighborhood)
		.map((p) => ({ place: p, d: haversineKm(top, p) }))
		.sort((a, b) => a.d - b.d)[0];
	const label = near && near.d < 3 ? (near.place.neighborhood ?? near.place.name) : near ? `Near ${near.place.name}` : "City centre";
	return { label, lat: top.lat, lon: top.lon, geohash: top.geohash, affinity: top.affinity };
}

export async function planLocal(ctx: PlanContext, ref: PlanTargetRef, prefs: PlanPrefs = {}): Promise<LocalPlan> {
	const { api, hotspot } = ctx;
	const target = resolveTarget(ctx, ref);
	const taste = tasteSignals(hotspot);

	const extraTags = (
		await Promise.all((prefs.extraVibes ?? []).map((word) => api.searchTags(word, 1).catch(() => [])))
	).flat();
	const signalTagIds = [...new Set([...taste.signalTagIds, ...extraTags.map((t) => t.id)])];
	// With no stated taste, the crowded originals stand for it: same soul, elsewhere.
	const fallbackIds = target.mustInclude.length > 0 ? target.mustInclude.map((p) => p.id) : hotspot.crowdedSpots.map((p) => p.id);
	const signals = {
		signalIds: taste.signalIds.length > 0 || signalTagIds.length > 0 ? taste.signalIds : fallbackIds,
		signalTagIds,
	};
	const area = { area: target.area };
	const quieter = prefs.quieter ?? false;

	const [heat, sightResults, food, cafes, bars] = await Promise.all([
		api.heatmap({ ...area, ...signals }).catch(() => [] as HeatCell[]),
		api.places({ ...signals, ...area, tagIds: SIGHT_TAGS, popularityMax: quieter ? 0.85 : 0.97, take: 16 }, "Sights that fit your taste"),
		api.places(
			{
				...signals,
				...area,
				tagIds: [PLACE_TAG.restaurant],
				excludeTagIds: [PLACE_TAG.cafe, PLACE_TAG.bar, PLACE_TAG.hotel],
				popularityMax: quieter ? 0.9 : undefined,
				take: 8,
			},
			"Where to eat",
		),
		api.places({ ...signals, ...area, tagIds: [PLACE_TAG.cafe], excludeTagIds: [PLACE_TAG.hotel], take: 6 }, "Cafés and teahouses"),
		api.places({ ...signals, ...area, tagIds: [PLACE_TAG.bar], excludeTagIds: [PLACE_TAG.hotel], take: 4 }, "Evening spots"),
	]);
	const sights = sightResults.filter(isSight);

	const all = [...target.mustInclude, ...sights, ...food, ...cafes, ...bars];
	const stay = stayArea(heat, all);
	const start = stay ?? target.center;
	const dayCount = Math.max(1, Math.min(3, prefs.days ?? (target.kind === "town" ? 1 : 2)));
	const days = buildDays(target, start, { sights, food, cafes, bars }, dayCount);

	const customs = customsFor(target.countryCode, target.name);
	const goodGuest =
		(target.population ?? Number.POSITIVE_INFINITY) < 20_000
			? [`${target.name} is a small community: visit gently, stay a night rather than day-tripping, and spend locally.`, ...customs.goodGuest].slice(0, 4)
			: customs.goodGuest;

	return {
		target: { name: target.name, lat: target.center.lat, lon: target.center.lon, kind: target.kind, ref },
		stayArea: stay,
		heat,
		days,
		customs: customs.notes,
		goodGuest,
		quieter,
	};
}
