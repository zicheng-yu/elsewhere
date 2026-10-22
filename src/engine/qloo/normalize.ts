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
	const genre = str(first(raw, "properties.primary_genre.name"));
	return {
		id,
		name,
		...coords,
		city: cityName(str(first(raw, "city", "properties.geocode.city", "properties.geocode.name", "geocode.name"))),
		neighborhood: str(first(raw, "neighborhood", "properties.neighborhood", "properties.geocode.neighborhood")),
		region: str(first(raw, "admin1_region", "properties.geocode.admin1_region")),
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
		genre,
		categories: [...new Set([...(genre ? [genre] : []), ...placeCategories(tags)])].slice(0, 3),
		tags,
	};
}

const LATIN = /^[\p{Script=Latin}\p{N}\p{P}\p{Zs}]+$/u;

/** Geocoders sometimes name a city after its prefecture ("Osaka Prefecture"); keep the city part. */
function cityName(name: string | undefined): string | undefined {
	return name?.replace(/\s+(Prefecture|Province|Metropolis)$/i, "").trim() || undefined;
}

/**
 * A readable name for a locality. Qloo names administrative localities in the
 * local script ("京都市"), so prefer an English alias, then any Latin-script alias.
 */
export function displayName(raw: Obj): string | undefined {
	const name = str(raw.name);
	const akas = Array.isArray(get(raw, "properties.akas")) ? (get(raw, "properties.akas") as unknown[]) : [];
	const alias = (test: (language: string, value: string) => boolean) =>
		akas.map((aka) => [str(get(aka, "language")) ?? "", str(get(aka, "value")) ?? ""] as const).find(([language, value]) => value && test(language, value))?.[1];
	if (name && LATIN.test(name)) return name;
	return alias((language) => /^en(_|$)/.test(language)) ?? alias((_, value) => LATIN.test(value)) ?? name;
}

function ancestor(raw: Obj, place: string): Obj | undefined {
	const ancestors = get(raw, "properties.ancestors");
	return Array.isArray(ancestors) ? (ancestors.find((a) => isObj(a) && a.place === place) as Obj | undefined) : undefined;
}

/** "Nagoya-shi" → "Nagoya", "Busan 釜山" → "Busan": destination names sometimes carry a suffix or a local-script echo. */
function cleanDestinationName(name: string): string {
	const latin = name.split(/\s+/).filter((part) => LATIN.test(part)).join(" ");
	return (latin || name).replace(/-(shi|si|gun|ku)$/i, "").trim();
}

export function toLocality(raw: unknown): Locality | undefined {
	if (!isObj(raw)) return undefined;
	const id = entityId(raw);
	const isDestination = /destination/.test(str(first(raw, "subtype", "types.0", "type")) ?? "");
	const rawName = displayName(raw);
	const name = rawName && isDestination ? cleanDestinationName(rawName) : rawName;
	const coords = coordinates(raw);
	if (!id || !name || !coords) return undefined;
	const tags = toTags(first(raw, "tags", "properties.tags"));
	const disambiguation = str(first(raw, "disambiguation", "properties.disambiguation"));
	const genre = tags.find((tag) => tag.type.startsWith("urn:tag:genre:locality"));
	const kind = isDestination ? "destination" : "locality";
	return {
		id,
		kind,
		name,
		...coords,
		country:
			str(first(raw, "country", "properties.country", "properties.geocode.country")) ??
			str(ancestor(raw, "country")?.name) ??
			(kind === "locality" ? lastSegment(disambiguation) : undefined),
		countryCode: str(first(raw, "country_code", "properties.geocode.country_code"))?.toUpperCase(),
		disambiguation: disambiguation && disambiguation !== name ? disambiguation : undefined,
		region: str(first(raw, "admin1_region", "properties.geocode.admin1_region")) ?? str(ancestor(raw, "state")?.name),
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

/** Trait families worth showing as shared character; transport, demographics and climate are noise. */
const TRAIT_SUBTYPES = /(characteristic|culture|scenery|activity|photogenic_spot|popular_food_item|culinary_experience|unusual_attraction|flora|ideal_traveler|genre:destination)/;
const NOISE_SUBTYPES = /(transport|demographic|language|travel_advisory|_month|event_type|shopping|entertainment_option)/;

/** Shared traits from an analysis/compare response, strongest first. */
export function compareTraitsOf(response: unknown): string[] {
	const list = first(response, "results.tags", "results.entities", "results");
	if (!Array.isArray(list)) return [];
	const scored: { name: string; score: number }[] = [];
	for (const item of list) {
		const subtype = str(first(item, "subtype", "type")) ?? "";
		const tagId = str(get(item, "tag_id")) ?? "";
		const family = `${subtype} ${tagId}`;
		if (NOISE_SUBTYPES.test(family) || (subtype && !TRAIT_SUBTYPES.test(family))) continue;
		const name = str(get(item, "name")) ?? (tagId.startsWith("urn:") ? humanizeTag(tagId) : undefined);
		if (name) scored.push({ name, score: num(first(item, "query.score", "score")) ?? 0 });
	}
	return [...new Set(scored.sort((a, b) => b.score - a.score).map((t) => t.name))];
}

/** Signal IDs Qloo reported as unknown (for example search-only stub entities). */
export function invalidSignalsOf(response: unknown): string[] {
	const warnings = get(response, "warnings");
	if (!Array.isArray(warnings)) return [];
	return warnings.flatMap((warning) => {
		const ids = isObj(warning) && warning.type === "not_found" ? warning["signal.interests.entities"] : undefined;
		return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === "string") : [];
	});
}
