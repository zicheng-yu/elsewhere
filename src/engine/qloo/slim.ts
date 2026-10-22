/**
 * Trims Qloo responses to the fields Elsewhere reads, before they are cached or
 * normalized. Qloo always returns full payloads (a city's boundary polygon alone
 * can run to hundreds of kilobytes) and asks clients to trim them; trimmed
 * payloads keep the KV cache small and cached reads cheap to parse.
 */

type Obj = Record<string, unknown>;

function isObj(value: unknown): value is Obj {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pick(source: unknown, keys: readonly string[]): Obj | undefined {
	if (!isObj(source)) return undefined;
	const out: Obj = {};
	for (const key of keys) {
		const value = source[key];
		if (value !== undefined && value !== null && value !== "") out[key] = value;
	}
	return Object.keys(out).length > 0 ? out : undefined;
}

function clip(value: unknown, max: number): string | undefined {
	if (typeof value !== "string") return undefined;
	const text = value.replace(/\s+/g, " ").trim();
	if (!text) return undefined;
	return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

/** Tag families the engine reads: place character, locality season and culture, destination genres. */
const USEFUL_TAG = new RegExp(
	[
		"category:place",
		"genre:(place|locality|destination)",
		"ambience",
		"setting",
		"interests",
		"neighborhood_characteristic",
		"decor",
		"view",
		"activity_type",
		"noise_level",
		"cuisine",
		"popular_food_item",
		"culture",
		"scenery",
		"characteristic",
		"photogenic_spot",
		"culinary_experience",
		"unusual_attraction",
		"(peak_tourism|off_season)_month",
		"(best|worst)_month_for_travel",
		"[a-z]+_event(_type)?",
		"[a-z]+_travel_advisory",
		"keyword:qloo",
	]
		.map((family) => `^urn:tag:${family}(:|$)`)
		.join("|"),
);

/** Category, genre and season tags are kept in full (the engine filters and dates on them). */
const ESSENTIAL_TAG = /^urn:tag:(category:place|genre:(place|locality|destination)|[a-z_]+_(month|event|event_type|travel_advisory)|(best|worst)_month_for_travel)(:|$)/;
/** A few character tags per entity are enough for "shared traits"; the most descriptive families first. */
const TRAIT_FAMILIES = ["ambience", "setting", "interests", "culture", "scenery", "characteristic", "decor", "view", "noise_level", "cuisine", "popular_food_item", "activity_type"];
const MAX_TRAIT_TAGS = 10;

function slimTags(raw: unknown): Obj[] | undefined {
	if (!Array.isArray(raw)) return undefined;
	const essential: Obj[] = [];
	const traits: { tag: Obj; rank: number }[] = [];
	for (const item of raw) {
		if (!isObj(item)) continue;
		const id = typeof item.tag_id === "string" && item.tag_id.startsWith("urn:") ? item.tag_id : (item.id ?? item.value);
		if (typeof id !== "string" || !USEFUL_TAG.test(id)) continue;
		// The type is the ID minus its last segment; normalizers derive it.
		const tag = { id, name: item.name };
		if (ESSENTIAL_TAG.test(id)) {
			essential.push(tag);
			continue;
		}
		const family = id.split(":")[2] ?? "";
		const rank = TRAIT_FAMILIES.indexOf(family);
		traits.push({ tag, rank: rank === -1 ? TRAIT_FAMILIES.length : rank });
	}
	traits.sort((a, b) => a.rank - b.rank);
	return [...essential, ...traits.slice(0, MAX_TRAIT_TAGS).map((t) => t.tag)];
}

const LATIN = /^[\p{Script=Latin}\p{N}\p{P}\p{Zs}]+$/u;

/** Keep English aliases plus one Latin-script alias, so localities named in local script still get a readable name. */
function slimAkas(raw: unknown): Obj[] | undefined {
	if (!Array.isArray(raw)) return undefined;
	const english = raw.filter((aka) => isObj(aka) && typeof aka.language === "string" && /^en(_|$)/.test(aka.language));
	const latin = raw.find((aka) => isObj(aka) && typeof aka.language === "string" && typeof aka.value === "string" && LATIN.test(aka.value));
	const kept = [...english.slice(0, 2), ...(latin ? [latin] : [])].map((aka) => pick(aka, ["language", "value"]));
	return kept.length > 0 ? (kept.filter(Boolean) as Obj[]) : undefined;
}

function slimProperties(raw: unknown): Obj | undefined {
	if (!isObj(raw)) return undefined;
	const out: Obj = {
		geocode: pick(raw.geocode, ["name", "city", "admin1_region", "country", "country_code", "metro"]),
		neighborhood: raw.neighborhood,
		primary_genre: pick(raw.primary_genre, ["id", "name"]),
		image: pick(raw.image, ["url"]),
		business_rating: raw.business_rating,
		price_level: raw.price_level,
		is_closed: raw.is_closed,
		description: clip(raw.description ?? raw.short_description, 280),
		// Localities and destinations
		place: raw.place,
		admin_level: raw.admin_level,
		country: raw.country,
		population: raw.population,
		ancestors: Array.isArray(raw.ancestors) ? raw.ancestors.map((a) => pick(a, ["entity_id", "name", "place", "admin_level"])) : undefined,
		akas: slimAkas(raw.akas),
		wikidata: isObj(raw.external) && isObj(raw.external.wikidata) ? raw.external.wikidata.id : undefined,
		// Media
		release_year: raw.release_year,
	};
	return pick(out, Object.keys(out));
}

function slimEntity(raw: Obj): Obj {
	const query = isObj(raw.query) ? pick(raw.query, ["affinity", "distance", "score", "popularity"]) : undefined;
	const out: Obj = {
		entity_id: raw.entity_id,
		name: raw.name,
		type: raw.type,
		subtype: raw.subtype,
		types: raw.types,
		tag_id: raw.tag_id,
		popularity: raw.popularity,
		location: pick(raw.location, ["lat", "lon", "latitude", "longitude", "geohash"]),
		query,
		disambiguation: clip(raw.disambiguation, 120),
		properties: slimProperties(raw.properties),
		tags: slimTags(raw.tags),
	};
	return pick(out, Object.keys(out)) ?? {};
}

function slimItem(item: unknown): unknown {
	if (!isObj(item)) return item;
	// Heatmap cells and tag results are already small.
	if (isObj(item.location) && "geohash" in item.location && !("entity_id" in item)) {
		return { location: item.location, query: pick(item.query, ["affinity", "popularity"]) };
	}
	if (!("entity_id" in item) && ("tag_id" in item || "id" in item)) {
		return pick(item, ["id", "tag_id", "name", "type", "subtype", "popularity", "query"]);
	}
	return slimEntity(item);
}

/** A trimmed copy of a Qloo response; shape-preserving, so normalizers read it like the original. */
export function slimResponse(data: unknown): unknown {
	if (!isObj(data)) return data;
	const results = data.results;
	let slimmed: unknown = results;
	if (Array.isArray(results)) {
		slimmed = results.map(slimItem);
	} else if (isObj(results)) {
		const out: Obj = {};
		for (const [key, value] of Object.entries(results)) out[key] = Array.isArray(value) ? value.map(slimItem) : value;
		slimmed = out;
	}
	return { results: slimmed, ...(data.warnings ? { warnings: data.warnings } : {}) };
}
