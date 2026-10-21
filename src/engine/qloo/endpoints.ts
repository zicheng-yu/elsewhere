/**
 * Typed helpers for the Qloo endpoints Elsewhere uses. Parameter names follow
 * the official docs: GET only, every parameter in the query string.
 */
import type { HeatCell, Locality, Place, TagRef, TasteEntity } from "../../shared/types.ts";
import type { QlooClient } from "./client.ts";
import {
	compareTraitsOf,
	entitiesOf,
	heatCellsOf,
	tagsOf,
	toLocality,
	toPlace,
	toTaste,
	trendOf,
	type TrendPoint,
} from "./normalize.ts";

export const ENTITY_TYPE = {
	locality: "urn:entity:locality",
	place: "urn:entity:place",
	movie: "urn:entity:movie",
	tvShow: "urn:entity:tv_show",
	artist: "urn:entity:artist",
	person: "urn:entity:person",
	book: "urn:entity:book",
	brand: "urn:entity:brand",
	podcast: "urn:entity:podcast",
	heatmap: "urn:heatmap",
} as const;

/** Entity types a traveler might name as a favorite. */
export const TASTE_SEARCH_TYPES = [
	ENTITY_TYPE.movie,
	ENTITY_TYPE.tvShow,
	ENTITY_TYPE.artist,
	ENTITY_TYPE.person,
	ENTITY_TYPE.book,
	ENTITY_TYPE.brand,
	ENTITY_TYPE.podcast,
];

export const PLACE_TAG = {
	attraction: "urn:tag:genre:place:tourist_attraction",
	landmark: "urn:tag:genre:place:historical_landmark",
	museum: "urn:tag:genre:place:museum",
	park: "urn:tag:genre:place:park",
	gallery: "urn:tag:genre:place:art_gallery",
	restaurant: "urn:tag:genre:place:restaurant",
	cafe: "urn:tag:genre:place:restaurant:cafe",
	bar: "urn:tag:genre:place:restaurant:bar",
	hotel: "urn:tag:genre:place:hotel",
} as const;

export const SIGHT_TAGS = [PLACE_TAG.attraction, PLACE_TAG.landmark, PLACE_TAG.museum, PLACE_TAG.park, PLACE_TAG.gallery];
export const FOOD_DRINK_TAGS = [PLACE_TAG.restaurant, PLACE_TAG.cafe, PLACE_TAG.bar, PLACE_TAG.hotel];

export interface PlaceQuery {
	signalIds?: string[];
	signalTagIds?: string[];
	/** Locality Qloo ID or a WKT geometry (longitude first). */
	location?: string;
	radiusM?: number;
	excludeLocation?: string;
	popularityMax?: number;
	popularityMin?: number;
	excludeIds?: string[];
	tagIds?: string[];
	tagOperator?: "union" | "intersection";
	excludeTagIds?: string[];
	/** Score exactly these entities against the signals. */
	resultIds?: string[];
	/** Cap results per city before paging, so one call can cover several cities. */
	diversifyBy?: "properties.geocode.city" | "properties.geocode.metro";
	diversifyTake?: number;
	take?: number;
	explain?: boolean;
}

export interface Near {
	lat: number;
	lon: number;
	radiusMiles: number;
}

function isDefined<T>(value: T | undefined): value is T {
	return value !== undefined;
}

function clampTake(take: number | undefined, fallback: number): number {
	return Math.max(1, Math.min(50, Math.round(take ?? fallback)));
}

/** WKT point; WKT puts longitude first. */
export function wktPoint(lat: number, lon: number): string {
	return `POINT(${lon.toFixed(6)} ${lat.toFixed(6)})`;
}

/** WKT MULTIPOLYGON of circles (approximated by `sides`-gons), for one query that spans several cities. */
export function wktCircles(circles: { lat: number; lon: number; radiusKm: number }[], sides = 10): string {
	const polygons = circles.map(({ lat, lon, radiusKm }) => {
		const dLat = radiusKm / 111.32;
		const dLon = radiusKm / (111.32 * Math.max(0.1, Math.cos((lat * Math.PI) / 180)));
		const ring = Array.from({ length: sides + 1 }, (_, i) => {
			const angle = (2 * Math.PI * (i % sides)) / sides;
			return `${(lon + dLon * Math.cos(angle)).toFixed(4)} ${(lat + dLat * Math.sin(angle)).toFixed(4)}`;
		});
		return `((${ring.join(",")}))`;
	});
	return `MULTIPOLYGON(${polygons.join(",")})`;
}

export class QlooApi {
	readonly client: QlooClient;

	constructor(client: QlooClient) {
		this.client = client;
	}

	get mode(): "mock" | "live" {
		return this.client.mode;
	}

	async searchLocalities(query: string, take = 5): Promise<Locality[]> {
		const response = await this.client.get(
			"/search",
			{ query, types: [ENTITY_TYPE.locality], take },
			`Resolve destination "${query}"`,
		);
		return entitiesOf(response).map(toLocality).filter(isDefined);
	}

	async searchPlaces(query: string, near?: Near, take = 5): Promise<Place[]> {
		const response = await this.client.get(
			"/search",
			{
				query,
				types: [ENTITY_TYPE.place],
				"filter.location": near ? `${near.lat},${near.lon}` : undefined,
				"filter.radius": near ? Math.min(100, near.radiusMiles) : undefined,
				take,
			},
			`Resolve place "${query}"`,
		);
		return entitiesOf(response).map(toPlace).filter(isDefined);
	}

	async searchTaste(query: string, take = 5): Promise<TasteEntity[]> {
		const response = await this.client.get(
			"/search",
			{ query, types: TASTE_SEARCH_TYPES, take },
			`Resolve favorite "${query}"`,
		);
		return entitiesOf(response).map(toTaste).filter(isDefined);
	}

	/** The most popular sights near a point: the likely crowded must-sees. */
	async topAttractions(near: Near, take = 8): Promise<Place[]> {
		const response = await this.client.get(
			"/search",
			{
				types: [ENTITY_TYPE.place],
				"filter.location": `${near.lat},${near.lon}`,
				"filter.radius": Math.min(100, near.radiusMiles),
				"filter.tags": [PLACE_TAG.attraction, PLACE_TAG.landmark],
				sort_by: "popularity",
				take,
			},
			"Find the most popular sights",
		);
		return entitiesOf(response).map(toPlace).filter(isDefined);
	}

	async searchTags(query: string, take = 3): Promise<TagRef[]> {
		const response = await this.client.get(
			"/v2/tags",
			{ "filter.query": query, "feature.semantic_search": true, take },
			`Match vibe "${query}" to tags`,
		);
		return tagsOf(response);
	}

	async localityDetails(id: string): Promise<Locality | undefined> {
		const response = await this.client.get("/entities", { entity_ids: [id] }, "Load locality details");
		return entitiesOf(response).map(toLocality).find(isDefined);
	}

	/** Cities with a similar soul. Locality output only accepts locality signals. */
	async similarLocalities(options: { signalIds: string[]; take?: number; popularityMax?: number }): Promise<Locality[]> {
		const response = await this.client.get(
			"/v2/insights",
			{
				"filter.type": ENTITY_TYPE.locality,
				"signal.interests.entities": options.signalIds,
				"filter.popularity.max": options.popularityMax,
				take: clampTake(options.take, 30),
			},
			"Find cities with a similar soul",
		);
		return entitiesOf(response).map(toLocality).filter(isDefined);
	}

	async places(query: PlaceQuery, note?: string): Promise<Place[]> {
		const response = await this.client.get(
			"/v2/insights",
			{
				"filter.type": ENTITY_TYPE.place,
				"signal.interests.entities": query.signalIds,
				"signal.interests.tags": query.signalTagIds,
				"filter.location": query.location,
				"filter.location.radius": query.radiusM,
				"filter.exclude.location": query.excludeLocation,
				"filter.popularity.max": query.popularityMax,
				"filter.popularity.min": query.popularityMin,
				"filter.exclude.entities": query.excludeIds,
				"filter.tags": query.tagIds,
				"operator.filter.tags": query.tagIds?.length ? (query.tagOperator ?? "union") : undefined,
				"filter.exclude.tags": query.excludeTagIds,
				"filter.results.entities": query.resultIds,
				"diversify.by": query.diversifyBy,
				"diversify.take": query.diversifyBy ? query.diversifyTake : undefined,
				"feature.explainability": query.explain ? true : undefined,
				take: clampTake(query.take, 20),
			},
			note,
		);
		return entitiesOf(response).map(toPlace).filter(isDefined);
	}

	async heatmap(options: {
		location: string;
		radiusM?: number;
		signalIds?: string[];
		signalTagIds?: string[];
		boundary?: string;
	}): Promise<HeatCell[]> {
		const response = await this.client.get(
			"/v2/insights",
			{
				"filter.type": ENTITY_TYPE.heatmap,
				"filter.location": options.location,
				"filter.location.radius": options.radiusM,
				"signal.interests.entities": options.signalIds,
				"signal.interests.tags": options.signalTagIds,
				"output.heatmap.boundary": options.boundary,
			},
			"Map where your taste concentrates",
		);
		return heatCellsOf(response);
	}

	async compare(aIds: string[], bIds: string[], take = 10): Promise<string[]> {
		const response = await this.client.get(
			"/v2/analysis/compare",
			{ "a.signal.interests.entities": aIds, "b.signal.interests.entities": bIds, take },
			"Compare taste DNA",
		);
		return compareTraitsOf(response);
	}

	async trending(type: string, entityId: string, start: string, end: string): Promise<TrendPoint[]> {
		const response = await this.client.get(
			"/v2/trending",
			{
				"filter.type": type,
				"signal.interests.entities": [entityId],
				"filter.start_date": start,
				"filter.end_date": end,
				take: 50,
			},
			"Load popularity trend",
		);
		return trendOf(response);
	}
}
