/**
 * Typed helpers for the Qloo endpoints Elsewhere uses. Parameter names follow
 * the official docs: GET only, every parameter in the query string.
 */
import type { HeatCell, Locality, Place, SearchArea, TagRef, TasteEntity } from "../../shared/types.ts";
import type { QlooClient } from "./client.ts";
import { compareTraitsOf, entitiesOf, heatCellsOf, tagsOf, toLocality, toPlace, toTaste } from "./normalize.ts";

export const ENTITY_TYPE = {
	locality: "urn:entity:locality",
	destination: "urn:entity:destination",
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

const category = (name: string) => `urn:tag:category:place:${name}`;

/** Qloo place categories (`urn:tag:category:place:*`). */
export const PLACE_TAG = {
	attraction: category("tourist_attraction"),
	landmark: category("historical_landmark"),
	museum: category("museum"),
	artMuseum: category("art_museum"),
	park: category("park"),
	garden: category("garden"),
	scenic: category("scenic_spot"),
	nature: category("natural_beauty_spot"),
	worship: category("place_of_worship"),
	religious: category("religious_institution"),
	restaurant: category("restaurant"),
	cafe: category("cafe"),
	bar: category("bar"),
	hotel: category("hotel"),
} as const;

export const SIGHT_TAGS = [PLACE_TAG.attraction, PLACE_TAG.landmark, PLACE_TAG.museum, PLACE_TAG.park, PLACE_TAG.garden, PLACE_TAG.scenic];

/** Categories too broad to say what kind of place something is. */
const GENERIC_TAGS = new Set<string>([PLACE_TAG.attraction, PLACE_TAG.worship, PLACE_TAG.religious, category("point_of_interest")]);
/** Outdoor categories are interchangeable for "the same feel": a garden can stand in for a bamboo grove. */
const NATURE_TAGS = [PLACE_TAG.scenic, PLACE_TAG.park, PLACE_TAG.garden, PLACE_TAG.nature, category("botanical_garden"), category("hiking_area")];
const MUSEUM_TAGS = [PLACE_TAG.museum, PLACE_TAG.artMuseum, category("history_museum")];

/** The categories a quieter twin of `place` should share. */
export function twinCategories(place: Place): string[] {
	const specific = place.tags.filter((tag) => tag.type === "urn:tag:category:place" && !GENERIC_TAGS.has(tag.id)).map((tag) => tag.id);
	if (specific.some((id) => NATURE_TAGS.includes(id))) return [...new Set([...specific, ...NATURE_TAGS])];
	if (specific.some((id) => MUSEUM_TAGS.includes(id))) return [...new Set([...specific, ...MUSEUM_TAGS])];
	return specific.length > 0 ? specific : [PLACE_TAG.attraction];
}

/** Primary genres that make a place a meal, a drink, a bed or a shop rather than a sight. */
const NOT_A_SIGHT = /restaurant|caf[eé]|coffee|\bbar\b|\bpub\b|izakaya|bistro|brasserie|bakery|noodle|ramen|sushi|hotel|hostel|\binn\b|lodging|apartment|store|\bshop\b|mall|supermarket|station|parking|rest stop|office|clinic|school|university|salon|rental|sports|stadium|athletic|arena|playground|gym\b|golf|tenant|convention|nursery|visitor cent|casino|agency|event venue|wedding|banquet|coworking/i;

const SIGHT_CATEGORY = /tourist_attraction|historical_landmark|museum|park|garden|scenic_spot|place_of_worship|temple|shrine|church|castle|palace|monument|viewpoint|natural_beauty/;
const FOOD_OR_BED_CATEGORY = /restaurant|cafe|coffee|:bar$|pub|hotel|lodging|store|shop/;

/** Names that give a place away even when its genre looks fine ("Yamashiro Sports Park" is filed as a park). */
const NOT_A_SIGHT_NAME = /sports park|stadium|shopping (mall|center|centre)|station\b|parking|outlet/i;

export function isSight(place: Place): boolean {
	if (NOT_A_SIGHT_NAME.test(place.name)) return false;
	if (place.genre) return !NOT_A_SIGHT.test(place.genre);
	// No genre: trust only a sight category (an untyped street address is not a sight).
	const categories = place.tags.filter((tag) => tag.type === "urn:tag:category:place").map((tag) => tag.id);
	return categories.some((id) => SIGHT_CATEGORY.test(id)) && !categories.some((id) => FOOD_OR_BED_CATEGORY.test(id));
}

export interface PlaceQuery {
	signalIds?: string[];
	signalTagIds?: string[];
	area?: SearchArea;
	/** Several circles at once (the towns of a day trip), instead of `area`. */
	areas?: { lat: number; lon: number; radiusKm: number }[];
	popularityMax?: number;
	popularityMin?: number;
	excludeIds?: string[];
	tagIds?: string[];
	tagOperator?: "union" | "intersection";
	excludeTagIds?: string[];
	/** Score exactly these entities against the signals. */
	resultIds?: string[];
	take?: number;
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
	return `POINT(${lon.toFixed(5)} ${lat.toFixed(5)})`;
}

/** Circles as one WKT MULTIPOLYGON, so a single query covers several towns. */
export function wktCircles(circles: { lat: number; lon: number; radiusKm: number }[], sides = 12): string {
	const polygons = circles.map(({ lat, lon, radiusKm }) => {
		const points = Array.from({ length: sides + 1 }, (_, i) => {
			const angle = (2 * Math.PI * (i % sides)) / sides;
			const dLat = (radiusKm / 111.32) * Math.sin(angle);
			const dLon = (radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180))) * Math.cos(angle);
			return `${(lon + dLon).toFixed(4)} ${(lat + dLat).toFixed(4)}`;
		});
		return `((${points.join(",")}))`;
	});
	return `MULTIPOLYGON(${polygons.join(",")})`;
}

/** Location filter for an area: the Qloo locality when known, else a circle. */
export function areaParams(area: SearchArea | undefined): Record<string, string | number | undefined> {
	if (!area) return {};
	if (area.localityId) return { "filter.location": area.localityId };
	return { "filter.location": wktPoint(area.lat, area.lon), "filter.location.radius": Math.round(area.radiusKm * 1000) };
}

export class QlooApi {
	readonly client: QlooClient;

	constructor(client: QlooClient) {
		this.client = client;
	}

	get mode(): "mock" | "live" {
		return this.client.mode;
	}

	/** Travel destinations: English names, a country and a popularity that compares destinations. */
	async searchDestinations(query: string, take = 5): Promise<Locality[]> {
		const response = await this.client.get(
			"/search",
			{ query, types: [ENTITY_TYPE.destination], take },
			`Find destination "${query}"`,
		);
		return entitiesOf(response).map(toLocality).filter(isDefined);
	}

	/** Administrative localities: precise boundaries for place filters, and month tags. */
	async searchLocalities(query: string, take = 3): Promise<Locality[]> {
		const response = await this.client.get(
			"/search",
			{ query, types: [ENTITY_TYPE.locality], take },
			`Find the city boundary for "${query}"`,
		);
		return entitiesOf(response).map(toLocality).filter(isDefined);
	}

	/**
	 * A locality with its full tag set (peak and best months, events, advisories).
	 * Search results carry no month tags, so score the locality itself against a
	 * related signal (a locality is never returned for its own signal).
	 */
	async localityProfile(localityId: string, signalId: string): Promise<Locality | undefined> {
		const response = await this.client.get(
			"/v2/insights",
			{
				"filter.type": ENTITY_TYPE.locality,
				"signal.interests.entities": [signalId],
				"filter.results.entities": [localityId],
				take: 1,
			},
			"Read the destination's seasons",
		);
		return entitiesOf(response).map(toLocality).find(isDefined);
	}

	/** Destinations with a similar soul, or the given destinations scored against the signals. */
	async destinations(options: {
		signalIds?: string[];
		signalTagIds?: string[];
		resultIds?: string[];
		/** Only destinations inside this circle (towns for a day trip). */
		area?: SearchArea;
		take?: number;
		offset?: number;
		note?: string;
	}): Promise<Locality[]> {
		const response = await this.client.get(
			"/v2/insights",
			{
				"filter.type": ENTITY_TYPE.destination,
				"signal.interests.entities": options.signalIds,
				"signal.interests.tags": options.signalTagIds,
				...areaParams(options.area),
				"filter.results.entities": options.resultIds,
				take: clampTake(options.take, 30),
				offset: options.offset,
			},
			options.note ?? "Find destinations with a similar soul",
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
			`Find "${query}"`,
		);
		return entitiesOf(response).map(toPlace).filter(isDefined);
	}

	async searchTaste(query: string, take = 5): Promise<TasteEntity[]> {
		const response = await this.client.get(
			"/search",
			{ query, types: TASTE_SEARCH_TYPES, take },
			`Find favorite "${query}"`,
		);
		return entitiesOf(response).map(toTaste).filter(isDefined);
	}

	/** Place-relevant tags for a vibe word ("quiet" → ambience and noise-level tags). */
	async searchTags(query: string, take = 3): Promise<TagRef[]> {
		const response = await this.client.get(
			"/v2/tags",
			{
				"filter.query": query,
				"feature.semantic_search": true,
				"filter.parents.types": ENTITY_TYPE.place,
				take,
			},
			`Match vibe "${query}" to tags`,
		);
		return tagsOf(response);
	}

	async places(query: PlaceQuery, note?: string): Promise<Place[]> {
		const response = await this.client.get(
			"/v2/insights",
			{
				"filter.type": ENTITY_TYPE.place,
				"signal.interests.entities": query.signalIds,
				"signal.interests.tags": query.signalTagIds,
				...(query.areas?.length ? { "filter.location": wktCircles(query.areas) } : areaParams(query.area)),
				"filter.popularity.max": query.popularityMax,
				"filter.popularity.min": query.popularityMin,
				"filter.exclude.entities": query.excludeIds,
				"filter.tags": query.tagIds,
				"operator.filter.tags": query.tagIds?.length ? (query.tagOperator ?? "union") : undefined,
				"filter.exclude.tags": query.excludeTagIds,
				"filter.results.entities": query.resultIds,
				take: clampTake(query.take, 20),
			},
			note,
		);
		return entitiesOf(response).map(toPlace).filter(isDefined);
	}

	/** The most popular sights in an area, with IDs that insights accepts as signals. */
	async topSights(area: SearchArea, take = 30): Promise<Place[]> {
		const sights = await this.places({ area, tagIds: [PLACE_TAG.attraction], take }, "List the most popular sights");
		return sights.filter(isSight);
	}

	async heatmap(options: { area: SearchArea; signalIds?: string[]; signalTagIds?: string[] }): Promise<HeatCell[]> {
		const response = await this.client.get(
			"/v2/insights",
			{
				"filter.type": ENTITY_TYPE.heatmap,
				...areaParams(options.area),
				"signal.interests.entities": options.signalIds,
				"signal.interests.tags": options.signalTagIds,
			},
			"Map where your taste concentrates",
		);
		return heatCellsOf(response);
	}

	/** Shared character of two entities, strongest first. */
	async compare(aIds: string[], bIds: string[], take = 12): Promise<string[]> {
		const response = await this.client.get(
			"/v2/analysis/compare",
			{ "a.signal.interests.entities": aIds, "b.signal.interests.entities": bIds, take },
			"Compare taste DNA",
		);
		return compareTraitsOf(response);
	}
}
