/**
 * Index over the SYNTHETIC demo world, plus serializers that render world
 * entities in the documented Qloo response shapes.
 */
import { MONTH_NAMES } from "../../../shared/types.ts";
import { geohashEncode } from "../../geo.ts";
import { normalizeName } from "../../text.ts";
import {
	FACETS,
	type Facet,
	type FacetVector,
	type PlaceCategory,
	type WorldLocality,
	type WorldPlace,
	type WorldTaste,
} from "./world-schema.ts";

export interface WorldData {
	localities: WorldLocality[];
	places: WorldPlace[];
	tastes: WorldTaste[];
}

export const FACET_LABELS: Record<Facet, string> = {
	spiritual: "Sacred sites",
	zen: "Zen",
	garden: "Gardens",
	tea: "Tea culture",
	craft: "Craftsmanship",
	history: "Heritage",
	architecture: "Architecture",
	art: "Art",
	design: "Design",
	nature: "Nature",
	mountains: "Mountains",
	water: "Waterside",
	coast: "Coast",
	food_street: "Street food",
	food_fine: "Fine dining",
	markets: "Markets",
	cafes: "Café culture",
	wine: "Wine",
	nightlife: "Nightlife",
	jazz: "Jazz",
	music: "Music",
	film: "Film",
	literature: "Literature",
	romance: "Romance",
	whimsy: "Whimsy",
	quiet: "Quiet",
	photogenic: "Photogenic",
	local_life: "Local life",
	shopping: "Shopping",
	outdoors: "Outdoors",
};

/** Words that the synthetic tag search maps to each facet. */
export const FACET_SYNONYMS: Record<Facet, string[]> = {
	spiritual: ["temple", "temples", "shrine", "shrines", "church", "sacred", "monastery", "pagoda", "spiritual"],
	zen: ["zen", "meditation", "mindful", "minimalist"],
	garden: ["garden", "gardens", "flowers", "cherry blossom", "sakura"],
	tea: ["tea", "matcha", "teahouse"],
	craft: ["craft", "crafts", "artisan", "handmade", "pottery", "ceramics", "tiles"],
	history: ["history", "historic", "heritage", "old town", "palace", "palaces", "castle", "ruins"],
	architecture: ["architecture", "buildings", "modernisme", "gaudi"],
	art: ["art", "museum", "museums", "gallery", "galleries", "street art"],
	design: ["design", "modern", "contemporary"],
	nature: ["nature", "forest", "green", "rice terraces", "wildlife"],
	mountains: ["mountain", "mountains", "alps", "alpine", "peaks"],
	water: ["lake", "lakes", "river", "canal", "canals", "waterfall", "waterfalls"],
	coast: ["beach", "beaches", "coast", "sea", "island", "islands", "seaside"],
	food_street: ["street food", "food", "snacks", "local food", "tapas", "seafood"],
	food_fine: ["fine dining", "michelin", "tasting menu", "gastronomy"],
	markets: ["market", "markets", "bazaar"],
	cafes: ["cafe", "cafes", "coffee", "bakery", "pastry"],
	wine: ["wine", "natural wine", "vineyard", "wine bar"],
	nightlife: ["nightlife", "bars", "night", "cocktails"],
	jazz: ["jazz", "live music"],
	music: ["music", "fado", "concerts", "flamenco"],
	film: ["film", "cinema", "movies"],
	literature: ["books", "bookshops", "literature", "poetry"],
	romance: ["romantic", "romance", "couples"],
	whimsy: ["whimsical", "quirky", "playful", "fairy tale"],
	quiet: ["quiet", "calm", "peaceful", "slow", "uncrowded", "serene"],
	photogenic: ["photography", "photogenic", "views", "viewpoints", "scenic"],
	local_life: ["local life", "neighborhood", "locals", "everyday"],
	shopping: ["shopping", "boutiques", "vintage"],
	outdoors: ["hiking", "outdoors", "cycling", "trekking", "adventure"],
};

const TAG = {
	attraction: "urn:tag:genre:place:tourist_attraction",
	landmark: "urn:tag:genre:place:historical_landmark",
	museum: "urn:tag:genre:place:museum",
	park: "urn:tag:genre:place:park",
	gallery: "urn:tag:genre:place:art_gallery",
	castle: "urn:tag:genre:place:castle",
	restaurant: "urn:tag:genre:place:restaurant",
	cafe: "urn:tag:genre:place:restaurant:cafe",
	bar: "urn:tag:genre:place:restaurant:bar",
	hotel: "urn:tag:genre:place:hotel",
} as const;

/** Genre tags per synthetic category, mirroring the documented place taxonomy. */
export const CATEGORY_TAGS: Record<PlaceCategory, string[]> = {
	shrine: [TAG.attraction],
	temple: [TAG.attraction],
	church: [TAG.attraction, TAG.landmark],
	garden: [TAG.park, TAG.attraction],
	park: [TAG.park],
	museum: [TAG.museum],
	gallery: [TAG.gallery, TAG.museum],
	landmark: [TAG.landmark, TAG.attraction],
	castle: [TAG.castle, TAG.landmark],
	palace: [TAG.landmark, TAG.attraction],
	bridge: [TAG.landmark, TAG.attraction],
	square: [TAG.landmark, TAG.attraction],
	street: [TAG.attraction],
	neighborhood: [TAG.attraction],
	market: [TAG.attraction],
	viewpoint: [TAG.attraction],
	village: [TAG.attraction],
	beach: [TAG.attraction],
	lake: [TAG.attraction],
	waterfall: [TAG.attraction],
	trail: [TAG.attraction],
	rice_terrace: [TAG.attraction],
	onsen: [TAG.attraction],
	teahouse: [TAG.restaurant, TAG.cafe],
	cafe: [TAG.restaurant, TAG.cafe],
	restaurant: [TAG.restaurant],
	bar: [TAG.restaurant, TAG.bar],
	hotel: [TAG.hotel],
};

export const CATEGORY_LABELS: Record<PlaceCategory, string> = {
	shrine: "Shrine",
	temple: "Temple",
	church: "Church",
	garden: "Garden",
	park: "Park",
	museum: "Museum",
	gallery: "Gallery",
	landmark: "Landmark",
	castle: "Castle",
	palace: "Palace",
	bridge: "Bridge",
	square: "Square",
	street: "Historic street",
	neighborhood: "Neighborhood",
	market: "Market",
	viewpoint: "Viewpoint",
	village: "Village",
	beach: "Beach",
	lake: "Lake",
	waterfall: "Waterfall",
	trail: "Trail",
	rice_terrace: "Rice terraces",
	onsen: "Hot spring",
	teahouse: "Teahouse",
	cafe: "Café",
	restaurant: "Restaurant",
	bar: "Bar",
	hotel: "Hotel",
};

const GENRE_LABELS: Record<string, string> = {
	[TAG.attraction]: "Tourist attraction",
	[TAG.landmark]: "Historical landmark",
	[TAG.museum]: "Museum",
	[TAG.park]: "Park",
	[TAG.gallery]: "Art gallery",
	[TAG.castle]: "Castle",
	[TAG.restaurant]: "Restaurant",
	[TAG.cafe]: "Café",
	[TAG.bar]: "Bar",
	[TAG.hotel]: "Hotel",
};

/** Cultural macro-regions. Real taste graphs cluster regionally; the synthetic locality affinity mirrors that. */
const MACRO_REGION: Record<string, string> = {
	JP: "east-asia",
	KR: "east-asia",
	TW: "east-asia",
	CN: "east-asia",
	HK: "east-asia",
	VN: "southeast-asia",
	LA: "southeast-asia",
	TH: "southeast-asia",
	KH: "southeast-asia",
	ID: "southeast-asia",
	MY: "southeast-asia",
	PT: "southern-europe",
	ES: "southern-europe",
	IT: "southern-europe",
	MT: "southern-europe",
	GR: "southern-europe",
	HR: "southern-europe",
	FR: "western-europe",
	CH: "western-europe",
	AT: "western-europe",
	DE: "western-europe",
	BE: "western-europe",
	NL: "western-europe",
	GB: "western-europe",
};

const CONTINENT: Record<string, string> = {
	"east-asia": "asia",
	"southeast-asia": "asia",
	"southern-europe": "europe",
	"western-europe": "europe",
};

/** 0.15 for the same macro-region, 0.06 for the same continent, else 0. */
export function regionalPrior(a: string, b: string): number {
	const ra = MACRO_REGION[a.toUpperCase()];
	const rb = MACRO_REGION[b.toUpperCase()];
	if (!ra || !rb) return 0;
	if (ra === rb) return 0.15;
	return CONTINENT[ra] === CONTINENT[rb] ? 0.06 : 0;
}

/** FNV-1a 32-bit hash. */
export function fnv1a(text: string, seed = 0x811c9dc5): number {
	let hash = seed >>> 0;
	for (let i = 0; i < text.length; i++) {
		hash ^= text.charCodeAt(i);
		hash = Math.imul(hash, 0x01000193) >>> 0;
	}
	return hash >>> 0;
}

/** Deterministic value in [0, 1) for a string. */
export function hashUnit(text: string): number {
	return fnv1a(text) / 0x100000000;
}

/** Deterministic, UUID-shaped synthetic ID (uppercase like Qloo IDs). */
export function syntheticId(key: string): string {
	const hex = [0x811c9dc5, 0x01000193, 0x9e3779b9, 0x85ebca6b]
		.map((salt) => fnv1a(key, salt).toString(16).padStart(8, "0"))
		.join("");
	return [
		hex.slice(0, 8),
		hex.slice(8, 12),
		`4${hex.slice(13, 16)}`,
		`8${hex.slice(17, 20)}`,
		hex.slice(20, 32),
	]
		.join("-")
		.toUpperCase();
}

export function toVector(vector: FacetVector): Float64Array {
	return Float64Array.from(FACETS, (facet) => vector[facet] ?? 0);
}

/** Unit-length copy, so cosine similarity is a plain dot product. */
export function toUnit(vector: Float64Array): Float64Array {
	let norm = 0;
	for (const x of vector) norm += x * x;
	norm = Math.sqrt(norm);
	return norm === 0 ? vector.slice() : vector.map((x) => x / norm);
}

export function facetTagId(facet: Facet): string {
	return `urn:tag:keyword:qloo:${facet}`;
}

const slug = (text: string) =>
	text
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "_")
		.replace(/^_|_$/g, "");

interface Indexed {
	id: string;
	/** Raw facet vector. */
	vector: Float64Array;
	/** Unit-length facet vector. */
	unit: Float64Array;
	/** Name normalized for fuzzy matching. */
	normName: string;
	tagIds: string[];
}

export type IndexedEntity =
	| (Indexed & { kind: "locality"; data: WorldLocality })
	| (Indexed & { kind: "place"; data: WorldPlace; locality: WorldLocality })
	| (Indexed & { kind: "taste"; data: WorldTaste });

export type LocalityEntity = Extract<IndexedEntity, { kind: "locality" }>;
export type PlaceEntity = Extract<IndexedEntity, { kind: "place" }>;
export type TasteEntityIndexed = Extract<IndexedEntity, { kind: "taste" }>;

interface RawTag {
	id: string;
	name: string;
	type: string;
}

function topFacets(vector: FacetVector, threshold: number): Facet[] {
	return FACETS.filter((facet) => (vector[facet] ?? 0) >= threshold);
}

function localityTags(locality: WorldLocality): RawTag[] {
	const tags: RawTag[] = [{ id: "urn:tag:genre:locality:city", name: "City", type: "urn:tag:genre:locality" }];
	const monthTag = (kind: string, month: number): RawTag => {
		const name = MONTH_NAMES[month - 1] ?? "";
		return { id: `urn:tag:${kind}:qloo:${name.toLowerCase()}`, name, type: `urn:tag:${kind}:qloo` };
	};
	for (const month of locality.peakMonths) tags.push(monthTag("peak_tourism_month", month));
	for (const month of locality.offSeasonMonths) tags.push(monthTag("off_season_month", month));
	for (const month of locality.bestMonths) tags.push(monthTag("best_month_for_travel", month));
	for (const event of locality.events ?? []) {
		const month = (MONTH_NAMES[event.month - 1] ?? "").toLowerCase();
		tags.push({ id: `urn:tag:${month}_event:qloo:${slug(event.name)}`, name: event.name, type: `urn:tag:${month}_event:qloo` });
	}
	for (const trait of locality.traits) {
		tags.push({ id: `urn:tag:culture:qloo:${slug(trait)}`, name: trait, type: "urn:tag:culture:qloo" });
	}
	for (const facet of topFacets(locality.vector, 0.6)) {
		tags.push({ id: facetTagId(facet), name: FACET_LABELS[facet], type: "urn:tag:keyword:qloo" });
	}
	return tags;
}

function placeTags(place: WorldPlace): RawTag[] {
	const tags: RawTag[] = CATEGORY_TAGS[place.category].map((id) => ({
		id,
		name: GENRE_LABELS[id] ?? CATEGORY_LABELS[place.category],
		type: "urn:tag:genre:place",
	}));
	tags.push({
		id: `urn:tag:category:place:${place.category}`,
		name: CATEGORY_LABELS[place.category],
		type: "urn:tag:category:place",
	});
	for (const facet of topFacets(place.vector, 0.5)) {
		tags.push({ id: facetTagId(facet), name: FACET_LABELS[facet], type: "urn:tag:keyword:qloo" });
	}
	return tags;
}

export class WorldIndex {
	readonly localities: LocalityEntity[];
	readonly places: PlaceEntity[];
	readonly tastes: TasteEntityIndexed[];
	readonly byId = new Map<string, IndexedEntity>();
	readonly localityByKey = new Map<string, WorldLocality>();
	readonly #localityTags = new Map<string, RawTag[]>();
	readonly #placeTags = new Map<string, RawTag[]>();

	constructor(data: WorldData) {
		for (const locality of data.localities) {
			if (this.localityByKey.has(locality.key)) throw new Error(`Duplicate locality key: ${locality.key}`);
			this.localityByKey.set(locality.key, locality);
		}
		const vectors = (facets: FacetVector) => {
			const vector = toVector(facets);
			return { vector, unit: toUnit(vector) };
		};
		this.localities = data.localities.map((data) => {
			const tags = localityTags(data);
			const id = syntheticId(`locality:${data.key}`);
			this.#localityTags.set(id, tags);
			return { kind: "locality", id, data, ...vectors(data.vector), normName: normalizeName(data.name), tagIds: tags.map((t) => t.id) };
		});
		this.places = data.places.flatMap((data) => {
			const locality = this.localityByKey.get(data.locality);
			if (!locality) return [];
			const tags = placeTags(data);
			const id = syntheticId(`place:${data.key}`);
			this.#placeTags.set(id, tags);
			return [
				{
					kind: "place" as const,
					id,
					data,
					locality,
					...vectors(data.vector),
					normName: normalizeName(data.name),
					tagIds: tags.map((t) => t.id),
				},
			];
		});
		this.tastes = data.tastes.map((data) => ({
			kind: "taste",
			id: syntheticId(`taste:${data.key}`),
			data,
			...vectors(data.vector),
			normName: normalizeName(data.name),
			tagIds: topFacets(data.vector, 0.5).map(facetTagId),
		}));
		for (const entity of [...this.localities, ...this.places, ...this.tastes]) {
			this.byId.set(entity.id, entity);
		}
	}

	localityEntity(key: string): LocalityEntity | undefined {
		return this.localities.find((entity) => entity.data.key === key);
	}

	rawLocality(entity: LocalityEntity, affinity?: number): Record<string, unknown> {
		const { data } = entity;
		return {
			entity_id: entity.id,
			name: data.name,
			type: "urn:entity",
			subtype: "urn:entity:locality",
			place: "city",
			admin_level: 5,
			population: data.population,
			lat: data.lat,
			lon: data.lon,
			geohash: geohashEncode(data.lat, data.lon, 12),
			popularity: data.popularity,
			...(affinity === undefined ? {} : { affinity, query: { affinity } }),
			disambiguation: `${data.name}, ${data.region}, ${data.country}`,
			country_code: data.countryCode,
			tags: this.#localityTags.get(entity.id) ?? [],
		};
	}

	rawPlace(entity: PlaceEntity, affinity?: number, extra: Record<string, unknown> = {}): Record<string, unknown> {
		const { data, locality } = entity;
		return {
			entity_id: entity.id,
			name: data.name,
			type: "urn:entity",
			subtype: "urn:entity:place",
			lat: data.lat,
			lon: data.lon,
			geohash: geohashEncode(data.lat, data.lon, 12),
			address: [data.neighborhood, locality.name].filter(Boolean).join(", "),
			city: locality.name,
			neighborhood: data.neighborhood,
			admin1_region: locality.region,
			country: locality.country,
			country_code: locality.countryCode,
			business_rating: data.rating,
			price_level: data.priceLevel,
			is_closed: false,
			popularity: data.popularity,
			...(affinity === undefined ? {} : { affinity, query: { affinity, ...extra } }),
			disambiguation: [data.neighborhood, locality.name, locality.country].filter(Boolean).join(", "),
			tags: this.#placeTags.get(entity.id) ?? [],
		};
	}

	rawTaste(entity: TasteEntityIndexed, affinity?: number): Record<string, unknown> {
		const { data } = entity;
		return {
			entity_id: entity.id,
			name: data.name,
			type: "urn:entity",
			subtype: `urn:entity:${data.kind}`,
			popularity: data.popularity,
			...(affinity === undefined ? {} : { query: { affinity } }),
			properties: data.year ? { release_year: data.year } : {},
			disambiguation: data.year ? String(data.year) : undefined,
			tags: entity.tagIds.map((id) => {
				const facet = id.split(":").at(-1) as Facet;
				return { id, name: FACET_LABELS[facet] ?? facet, type: "urn:tag:keyword:qloo" };
			}),
		};
	}

	raw(entity: IndexedEntity, affinity?: number): Record<string, unknown> {
		if (entity.kind === "locality") return this.rawLocality(entity, affinity);
		if (entity.kind === "place") return this.rawPlace(entity, affinity);
		return this.rawTaste(entity, affinity);
	}
}
