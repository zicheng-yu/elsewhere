/**
 * Schema for the SYNTHETIC demo world used when QLOO_MODE=mock.
 *
 * Place names and approximate coordinates are public knowledge. Every ID,
 * popularity value, rating and taste vector is invented for development and
 * keyless demos. Nothing in the synthetic world comes from Qloo.
 */

/** Taste facets. Every vector value is in [0, 1]; omitted facets count as 0. */
export const FACETS = [
	"spiritual", // shrines, temples, churches, sacred sites
	"zen", // contemplative, minimalist, meditative
	"garden", // gardens, landscaped grounds
	"tea", // tea culture, teahouses, matcha
	"craft", // artisans, workshops, traditional crafts
	"history", // heritage, old towns, monuments
	"architecture", // notable buildings and design
	"art", // museums, galleries, street art
	"design", // contemporary design, modern aesthetics
	"nature", // greenery, forests, wildlife
	"mountains", // alpine scenery, hiking
	"water", // rivers, lakes, canals, waterfalls
	"coast", // seaside, beaches, islands
	"food_street", // street food, casual local eating
	"food_fine", // fine dining, tasting menus
	"markets", // food and flea markets
	"cafes", // coffee and café culture
	"wine", // wine bars, vineyards, natural wine
	"nightlife", // bars, late nights
	"jazz", // jazz bars, live small-venue music
	"music", // music culture broadly
	"film", // cinematic places, film culture
	"literature", // bookshops, literary history
	"romance", // romantic atmosphere
	"whimsy", // playful, fairy-tale, quirky
	"quiet", // calm, uncrowded atmosphere
	"photogenic", // visually striking, much photographed
	"local_life", // everyday neighborhood life
	"shopping", // boutiques, shopping streets
	"outdoors", // active outdoor pursuits
] as const;

export type Facet = (typeof FACETS)[number];
export type FacetVector = Partial<Record<Facet, number>>;

export const PLACE_CATEGORIES = [
	"shrine",
	"temple",
	"church",
	"garden",
	"park",
	"museum",
	"gallery",
	"landmark",
	"castle",
	"palace",
	"bridge",
	"square",
	"street",
	"neighborhood",
	"market",
	"viewpoint",
	"village",
	"beach",
	"lake",
	"waterfall",
	"trail",
	"rice_terrace",
	"onsen",
	"teahouse",
	"cafe",
	"restaurant",
	"bar",
	"hotel",
] as const;

export type PlaceCategory = (typeof PLACE_CATEGORIES)[number];

export type MonthNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface WorldLocality {
	/** Stable slug, unique across the whole world, e.g. "kyoto". */
	key: string;
	/** Display name, e.g. "Kyoto". */
	name: string;
	/** First-level region, e.g. "Kyoto Prefecture". */
	region: string;
	country: string;
	/** ISO 3166-1 alpha-2, e.g. "JP". */
	countryCode: string;
	lat: number;
	lon: number;
	population: number;
	/** Popularity percentile in [0, 1]. World-famous hotspots ≈ 0.99+. */
	popularity: number;
	/** Approximate radius of the urban area in kilometres (used for "within the city"). */
	radiusKm: number;
	vector: FacetVector;
	peakMonths: MonthNumber[];
	offSeasonMonths: MonthNumber[];
	bestMonths: MonthNumber[];
	events?: { month: MonthNumber; name: string }[];
	/** Short human-readable characteristics, e.g. "Zen temples", "Geisha district". */
	traits: string[];
}

export interface WorldPlace {
	/** Stable slug, unique across the whole world, e.g. "kyoto-fushimi-inari". */
	key: string;
	name: string;
	/** Key of the WorldLocality this place belongs to. */
	locality: string;
	lat: number;
	lon: number;
	category: PlaceCategory;
	/** Popularity percentile in [0, 1]. Famous crowded sights ≈ 0.98–0.999; quiet gems ≈ 0.4–0.85. */
	popularity: number;
	vector: FacetVector;
	neighborhood?: string;
	/** Business rating on a 1–5 scale. */
	rating?: number;
	/** 1–4, for food and drink places. */
	priceLevel?: 1 | 2 | 3 | 4;
}

export type WorldTasteKind = "movie" | "tv_show" | "artist" | "person" | "book" | "brand";

export interface WorldTaste {
	key: string;
	name: string;
	kind: WorldTasteKind;
	year?: number;
	popularity: number;
	vector: FacetVector;
}

type PlaceExtra = Pick<WorldPlace, "neighborhood" | "rating" | "priceLevel">;

/** Compact constructor for authoring places on a single line. */
export function place(
	key: string,
	name: string,
	locality: string,
	lat: number,
	lon: number,
	category: PlaceCategory,
	popularity: number,
	vector: FacetVector,
	extra: PlaceExtra = {},
): WorldPlace {
	return { key, name, locality, lat, lon, category, popularity, vector, ...extra };
}
