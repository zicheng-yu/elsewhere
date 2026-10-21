/**
 * Tolerant parsers from raw Qloo responses to domain types.
 *
 * The documentation shows both a flattened entity shape (`affinity`, `lat`) and
 * a nested one (`query.affinity`, `properties.*`, `location.*`), so every field
 * is read from several candidate paths. Verbose fields such as `akas` are
 * dropped here so they never reach the LLM.
 */
import type { HeatCell, Locality, Place, TagRef, TasteEntity, TasteKind } from "../../shared/types.ts";

type Obj = Record<string, unknown>;

function isObj(value: unknown): value is Obj {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function get(value: unknown, path: string): unknown {
	let current: unknown = value;
	for (const part of path.split(".")) {
		if (Array.isArray(current)) {
			const index = Number(part);
			current = Number.isInteger(index) ? current[index] : undefined;
		} else if (isObj(current)) {
			current = current[part];
		} else {
			return undefined;
		}
	}
	return current;
}

function first(value: unknown, ...paths: string[]): unknown {
	for (const path of paths) {
		const found = get(value, path);
		if (found !== undefined && found !== null && found !== "") return found;
	}
	return undefined;
}

function num(value: unknown): number | undefined {
	const n = typeof value === "string" ? Number(value) : value;
	return typeof n === "number" && Number.isFinite(n) ? n : undefined;
}

function str(value: unknown): string | undefined {
	if (typeof value === "number") return String(value);
	return typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;
}

/** "urn:tag:genre:place:tourist_attraction" → "Tourist attraction". */
export function humanizeTag(id: string): string {
	const last = id.split(":").at(-1) ?? id;
	const words = last.replace(/[_-]+/g, " ").trim();
	return words.charAt(0).toUpperCase() + words.slice(1);
}

export function toTags(raw: unknown): TagRef[] {
	if (!Array.isArray(raw)) return [];
	const tags: TagRef[] = [];
	for (const item of raw) {
		if (!isObj(item)) continue;
		const id = str(item.id) ?? str(item.tag_id) ?? str(item.urn);
		if (!id) continue;
		const name = str(item.name) ?? humanizeTag(id);
		const type = str(item.type) ?? id.split(":").slice(0, -1).join(":");
		tags.push({ id, name, type });
	}
	return tags;
}

function entityId(raw: Obj): string | undefined {
	return str(raw.entity_id) ?? str(raw.id) ?? str(raw.qloo_id);
}

function coordinates(raw: Obj): { lat: number; lon: number } | undefined {
	const lat = num(
		first(raw, "lat", "latitude", "location.lat", "location.latitude", "properties.geocode.lat", "properties.lat"),
	);
	const lon = num(
		first(
			raw,
			"lon",
			"lng",
			"longitude",
			"location.lon",
			"location.lng",
			"location.longitude",
			"properties.geocode.lon",
			"properties.lon",
		),
	);
	return lat === undefined || lon === undefined ? undefined : { lat, lon };
}

function imageUrl(raw: Obj): string | undefined {
	const candidate = str(first(raw, "properties.image.url", "image.url", "properties.images.0.url", "url"));
	if (!candidate) return undefined;
	return /images\.qloo\.com|\.(jpe?g|png|webp|avif)(\?|$)/i.test(candidate) ? candidate : undefined;
}

const PLACE_CATEGORY_TYPES = ["urn:tag:genre:place", "urn:tag:category:place"];

function placeCategories(tags: TagRef[]): string[] {
	const names = tags
		.filter((tag) => PLACE_CATEGORY_TYPES.some((type) => tag.type.startsWith(type)))
		.map((tag) => tag.name);
	return [...new Set(names)].slice(0, 3);
}

function lastSegment(text: string | undefined): string | undefined {
	return text?.split(",").at(-1)?.trim() || undefined;
}

export function toPlace(raw: unknown): Place | undefined {
	if (!isObj(raw)) return undefined;
	const id = entityId(raw);
	const name = str(raw.name);
	const coords = coordinates(raw);
	if (!id || !name || !coords) return undefined;
	const tags = toTags(first(raw, "tags", "properties.tags"));
	return {
		id,
		name,
		...coords,
		city: str(first(raw, "city", "properties.geocode.city", "properties.geocode.name", "geocode.name")),
		neighborhood: str(first(raw, "neighborhood", "properties.neighborhood", "properties.geocode.neighborhood")),
		country: str(first(raw, "country", "properties.geocode.country", "properties.country")),
		countryCode: str(first(raw, "country_code", "properties.geocode.country_code")),
		address: str(first(raw, "address", "properties.address", "disambiguation")),
		popularity: num(first(raw, "popularity", "properties.popularity")),
		affinity: num(first(raw, "query.affinity", "affinity")),
		rating: num(first(raw, "business_rating", "properties.business_rating", "properties.rating")),
		priceLevel: num(first(raw, "price_level", "properties.price_level")),
		imageUrl: imageUrl(raw),
		description: str(
			first(raw, "short_description", "properties.short_description", "description", "properties.description"),
		),
		categories: placeCategories(tags),
		tags,
	};
}

export function toLocality(raw: unknown): Locality | undefined {
	if (!isObj(raw)) return undefined;
	const id = entityId(raw);
	const name = str(raw.name);
	const coords = coordinates(raw);
	if (!id || !name || !coords) return undefined;
	const tags = toTags(first(raw, "tags", "properties.tags"));
	const disambiguation = str(first(raw, "disambiguation", "properties.disambiguation"));
	const genre = tags.find((tag) => tag.type.startsWith("urn:tag:genre:locality"));
	return {
		id,
		name,
		...coords,
		country: str(first(raw, "country", "properties.geocode.country")) ?? lastSegment(disambiguation),
		countryCode: str(first(raw, "country_code", "properties.geocode.country_code")),
		disambiguation,
		population: num(first(raw, "population", "properties.population")),
		popularity: num(first(raw, "popularity", "properties.popularity")),
		affinity: num(first(raw, "query.affinity", "affinity")),
		placeType: (str(first(raw, "place", "properties.place")) ?? genre?.name)?.toLowerCase(),
		tags,
		imageUrl: imageUrl(raw),
	};
}

const SUBTYPE_KINDS: Record<string, TasteKind> = {
	movie: "movie",
	tv_show: "tv_show",
	artist: "artist",
	person: "person",
	book: "book",
	brand: "brand",
	podcast: "podcast",
	videogame: "videogame",
	video_game: "videogame",
	place: "place",
};

export function toTaste(raw: unknown): TasteEntity | undefined {
	if (!isObj(raw)) return undefined;
	const id = entityId(raw);
	const name = str(raw.name);
	if (!id || !name) return undefined;
	const subtype = str(first(raw, "subtype", "types.0", "type")) ?? "";
	const kind = SUBTYPE_KINDS[subtype.split(":").at(-1) ?? ""] ?? "person";
	const year = str(
		first(raw, "properties.release_year", "properties.publication_year", "release_year", "properties.release_date"),
	);
	return { id, name, kind, subtitle: year?.slice(0, 4) ?? str(raw.disambiguation) };
}

/** Entity list from an insights (`results.entities`), search or entities (`results`) response. */
export function entitiesOf(response: unknown): unknown[] {
	const results = get(response, "results");
	if (Array.isArray(results)) return results;
	const entities = get(results, "entities");
	return Array.isArray(entities) ? entities : [];
}

export function heatCellsOf(response: unknown): HeatCell[] {
	const list = first(response, "results.heatmap", "results.entities");
	if (!Array.isArray(list)) return [];
	const cells: HeatCell[] = [];
	for (const item of list) {
		const geohash = str(first(item, "location.geohash", "geohash"));
		const lat = num(first(item, "location.latitude", "location.lat", "lat"));
		const lon = num(first(item, "location.longitude", "location.lon", "lon"));
		if (!geohash || lat === undefined || lon === undefined) continue;
		cells.push({
			geohash,
			lat,
			lon,
			affinity: num(first(item, "query.affinity", "affinity")) ?? 0,
			popularity: num(first(item, "query.popularity", "popularity")) ?? 0,
		});
	}
	return cells;
}

export function tagsOf(response: unknown): TagRef[] {
	const list = first(response, "results.tags", "results");
	return toTags(Array.isArray(list) ? list : []);
}

export interface TrendPoint {
	date: string;
	percentile: number;
}

export function trendOf(response: unknown): TrendPoint[] {
	const list = first(response, "results.trending", "results");
	if (!Array.isArray(list)) return [];
	const points: TrendPoint[] = [];
	for (const item of list) {
		const date = str(get(item, "date"));
		const percentile = num(first(item, "population_percentile", "percentile"));
		if (date && percentile !== undefined) points.push({ date, percentile });
	}
	return points.sort((a, b) => a.date.localeCompare(b.date));
}

/** Shared traits from an analysis/compare response, whatever list it returns. */
export function compareTraitsOf(response: unknown): string[] {
	const list = first(response, "results.tags", "results.entities", "results");
	if (!Array.isArray(list)) return [];
	const names: string[] = [];
	for (const item of list) {
		const name = str(get(item, "name")) ?? (str(get(item, "tag_id")) ? humanizeTag(String(get(item, "tag_id"))) : undefined);
		if (name) names.push(name);
	}
	return [...new Set(names)];
}
