/** Domain types shared by the engine, the Worker API and the React client. */

export const MONTH_NAMES = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
] as const;

export type ZoomLevel = "city" | "region" | "country" | "world";

export const ZOOM_LEVELS: readonly { id: ZoomLevel; label: string; blurb: string }[] = [
	{ id: "city", label: "Same city", blurb: "Quieter twins of the spots you planned" },
	{ id: "region", label: "Day trip", blurb: "Nearby towns with the same feel" },
	{ id: "country", label: "Same country", blurb: "A twin city, off the beaten path" },
	{ id: "world", label: "Beyond borders", blurb: "The same soul, somewhere new" },
];

export type TasteKind =
	| "movie"
	| "tv_show"
	| "artist"
	| "person"
	| "book"
	| "brand"
	| "podcast"
	| "videogame"
	| "place";

export interface TagRef {
	id: string;
	name: string;
	type: string;
}

/** Something the traveler loves: a film, an artist, a restaurant at home... */
export interface TasteEntity {
	id: string;
	name: string;
	kind: TasteKind;
	subtitle?: string;
}

export interface Locality {
	id: string;
	/** Qloo's travel-destination entities carry English names; administrative localities often use the local script. */
	kind?: "locality" | "destination";
	name: string;
	lat: number;
	lon: number;
	country?: string;
	countryCode?: string;
	disambiguation?: string;
	/** First-level region, e.g. "Ishikawa". */
	region?: string;
	population?: number;
	/** Qloo popularity percentile in [0, 1]. */
	popularity?: number;
	/** Affinity to the query signals in [0, 1], when the locality came from an insights query. */
	affinity?: number;
	/** Administrative type, e.g. "city", "neighbourhood". */
	placeType?: string;
	tags: TagRef[];
	imageUrl?: string;
}

export interface Place {
	id: string;
	name: string;
	lat: number;
	lon: number;
	city?: string;
	neighborhood?: string;
	/** First-level region, e.g. "Kyoto Prefecture". */
	region?: string;
	country?: string;
	countryCode?: string;
	address?: string;
	popularity?: number;
	affinity?: number;
	rating?: number;
	priceLevel?: number;
	imageUrl?: string;
	description?: string;
	/** Qloo's primary genre, e.g. "Shinto shrine". */
	genre?: string;
	/** The name the traveler typed, when it resolved to a differently named Qloo entity. */
	requestedAs?: string;
	/** Human-readable categories, e.g. ["Shrine", "Tourist attraction"]. */
	categories: string[];
	tags: TagRef[];
}

export interface TripRequest {
	destination: string;
	/** Travel month, 1–12. */
	month?: number;
	/** Sights the traveler planned to visit. */
	mustSees: string[];
	/** Films, artists, books, places... the traveler loves. */
	favorites: string[];
	/** Free-form vibe words, e.g. "matcha", "quiet". */
	vibes: string[];
	flexibility: "booked" | "flexible";
	zooms?: ZoomLevel[];
	/** Free-text context for the LLM agent ("traveling with my parents", ...). */
	notes?: string;
	scenarioId?: string;
}

export type ScoreKey = "soul" | "character" | "taste" | "crowd" | "proximity" | "season";

export interface ScoreComponent {
	key: ScoreKey;
	label: string;
	/** Normalized value in [0, 1]. */
	value: number;
	/** Weight after renormalization over the available components. */
	weight: number;
	/** Where the number comes from, e.g. "Qloo place affinity to Fushimi Inari Taisha". */
	source: string;
}

export interface DupeScore {
	total: number;
	components: ScoreComponent[];
}

export interface SeasonInfo {
	month?: number;
	peakMonths: number[];
	offSeasonMonths: number[];
	bestMonths: number[];
	/** Months Qloo flags as the worst for travel (usually weather), not necessarily quiet ones. */
	worstMonths: number[];
	isPeak: boolean;
	isOffSeason: boolean;
	isBestMonth: boolean;
	isWorstMonth: boolean;
	/** Events in the travel month. */
	events: string[];
	/** Travel advisories in the travel month. */
	advisories: string[];
	/** Events and advisories for each month (index 0 is January), when Qloo has them. */
	calendar?: { events: string[]; advisories: string[] }[];
}

/** Where to look for places in a destination: a Qloo locality when one matched, else a circle. */
export interface SearchArea {
	localityId?: string;
	lat: number;
	lon: number;
	radiusKm: number;
}

export interface Hotspot {
	/** The destination as the traveler knows it (English name, country, popularity). */
	locality: Locality;
	/** Qloo destination entity used to find twin cities. */
	destinationId?: string;
	area: SearchArea;
	season: SeasonInfo;
	crowdedSpots: Place[];
	tasteProfile: TasteEntity[];
	vibeTags: TagRef[];
	/** Names from the request that could not be matched. */
	unresolved: string[];
}

export interface SpotTwin {
	id: string;
	original: Place;
	twin: Place;
	score: DupeScore;
	distanceKm: number;
	sharedTraits: string[];
}

export interface TownTwin {
	id: string;
	town: { name: string; lat: number; lon: number; country?: string };
	places: Place[];
	score: DupeScore;
	distanceKm: number;
	sharedTraits: string[];
}

export interface CityTwin {
	id: string;
	city: Locality;
	score: DupeScore;
	distanceKm: number;
	sharedTraits: string[];
	/** Qloo month tags for the twin, when it has them (destinations carry none). */
	season?: SeasonInfo;
	highlights: Place[];
	/** Small community: suggest visiting gently. */
	smallCommunity: boolean;
	/** Whether the candidate came from Qloo's destination similarity or was proposed by the agent. */
	origin: "qloo" | "agent";
}

export type ZoomResult =
	| { level: "city"; items: SpotTwin[]; note?: string; heat?: HeatCell[] }
	| { level: "region"; items: TownTwin[]; note?: string }
	| { level: "country"; items: CityTwin[]; note?: string }
	| { level: "world"; items: CityTwin[]; note?: string };

export interface HeatCell {
	geohash: string;
	lat: number;
	lon: number;
	affinity: number;
	popularity: number;
}

export type PlanSlot = "morning" | "lunch" | "afternoon" | "coffee" | "dinner" | "evening";

export interface PlanStop {
	slot: PlanSlot;
	place: Place;
	note: string;
}

export interface PlanDay {
	title: string;
	stops: PlanStop[];
}

export interface CustomsNote {
	topic: string;
	text: string;
}

/** What to plan: the hotspot city itself, or one item from a zoom result. */
export interface PlanTargetRef {
	level: ZoomLevel | "hotspot";
	/** Item id from the zoom result; omitted for "hotspot". */
	itemId?: string;
}

export interface PlanPrefs {
	/** Prefer less popular places. */
	quieter?: boolean;
	extraVibes?: string[];
	days?: number;
}

export interface LocalPlan {
	target: { name: string; lat: number; lon: number; kind: "city" | "town"; ref: PlanTargetRef };
	stayArea?: { label: string; lat: number; lon: number; geohash: string; affinity: number };
	heat: HeatCell[];
	days: PlanDay[];
	customs: CustomsNote[];
	goodGuest: string[];
	quieter: boolean;
}

/** A redacted record of one Qloo request, shown in the evidence drawer. */
export interface Evidence {
	id: string;
	endpoint: string;
	params: Record<string, string>;
	resultCount: number;
	cached: boolean;
	ms: number;
	ok: boolean;
	note?: string;
}

export interface RunModes {
	qloo: "mock" | "live";
	agent: "scripted" | "llm";
	/** The LLM behind the agent (OpenRouter model ID), when it is on. */
	model?: string;
}

export interface JourneySnapshot {
	id: string;
	createdAt: number;
	modes: RunModes;
	request: TripRequest;
	hotspot?: Hotspot;
	zooms: ZoomResult[];
	plan?: LocalPlan;
	narrative: string;
}
