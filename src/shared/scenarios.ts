import type { TripRequest } from "./types.ts";

/** A taste profile used to show that different travelers get different twins. */
export interface Persona {
	id: string;
	label: string;
	favorites: string[];
	vibes: string[];
}

export const PERSONAS: Persona[] = [
	{
		id: "contemplative",
		label: "Contemplative",
		favorites: ["Spirited Away", "Ryuichi Sakamoto", "My Neighbor Totoro"],
		vibes: ["tea", "gardens", "quiet"],
	},
	{
		id: "night-owl",
		label: "Night owl",
		favorites: ["In the Mood for Love", "Mariya Takeuchi", "Chungking Express"],
		vibes: ["jazz", "nightlife", "street food"],
	},
	{
		id: "food-explorer",
		label: "Food explorer",
		favorites: ["Parts Unknown", "Chef's Table", "Anthony Bourdain"],
		vibes: ["markets", "street food", "local life"],
	},
];

/** A featured journey. The request is the input; every recommendation is computed. */
export interface Scenario {
	id: string;
	title: string;
	blurb: string;
	/** Why this hotspot is a good example, with a public source. */
	context: string;
	request: TripRequest;
}

export const SCENARIOS: Scenario[] = [
	{
		id: "kyoto-april",
		title: "Kyoto in April",
		blurb: "Cherry-blossom season at Kyoto's busiest shrines and temples.",
		context:
			"Japan's Tourism Agency describes overtourism as visitors bunching in specific places at specific times; Kyoto promotes decentralized tourism.",
		request: {
			destination: "Kyoto",
			month: 4,
			mustSees: ["Fushimi Inari Taisha", "Kiyomizu-dera", "Arashiyama Bamboo Grove"],
			favorites: ["Spirited Away", "Ryuichi Sakamoto"],
			vibes: ["matcha", "temples", "quiet"],
			flexibility: "booked",
			zooms: ["city", "region", "country", "world"],
			scenarioId: "kyoto-april",
		},
	},
	{
		id: "paris-june",
		title: "Montmartre in June",
		blurb: "Sacré-Cœur and the Eiffel Tower in early summer.",
		context: "Montmartre is on Fodor's No List 2026.",
		request: {
			destination: "Paris",
			month: 6,
			mustSees: ["Sacré-Cœur Basilica", "Eiffel Tower"],
			favorites: ["Amélie", "Serge Gainsbourg"],
			vibes: ["natural wine", "art", "quiet"],
			flexibility: "booked",
			zooms: ["city", "region"],
			scenarioId: "paris-june",
		},
	},
	{
		id: "barcelona-july",
		title: "Barcelona in July",
		blurb: "Gaudí's icons at the height of summer.",
		context: "Barcelona was on Fodor's No List 2025.",
		request: {
			destination: "Barcelona",
			month: 7,
			mustSees: ["Sagrada Família", "Park Güell"],
			favorites: ["Vicky Cristina Barcelona", "Rosalía"],
			vibes: ["architecture", "markets"],
			flexibility: "flexible",
			zooms: ["city", "country"],
			scenarioId: "barcelona-july",
		},
	},
	{
		id: "jungfrau-july",
		title: "The Jungfrau Region in July",
		blurb: "Lauterbrunnen's waterfalls and lakeside piers in peak hiking season.",
		context: "The Jungfrau Region is on Fodor's No List 2026.",
		request: {
			destination: "Interlaken",
			month: 7,
			mustSees: ["Staubbach Falls", "Harder Kulm"],
			favorites: ["Heidi", "The Grand Budapest Hotel"],
			vibes: ["hiking", "lakes", "quiet"],
			flexibility: "booked",
			zooms: ["region"],
			scenarioId: "jungfrau-july",
		},
	},
	{
		id: "bali-july",
		title: "Ubud in July",
		blurb: "Rice terraces and temples in Bali's busiest month.",
		context: "Bali was on Fodor's No List 2025.",
		request: {
			destination: "Ubud",
			month: 7,
			mustSees: ["Tegallalang Rice Terraces", "Sacred Monkey Forest Sanctuary"],
			favorites: ["Eat Pray Love", "Nils Frahm"],
			vibes: ["rice terraces", "nature", "quiet"],
			flexibility: "booked",
			zooms: ["region"],
			scenarioId: "bali-july",
		},
	},
	{
		id: "venice-august",
		title: "Venice in August",
		blurb: "St Mark's and the Rialto in the summer crush.",
		context: "Venice was on Fodor's No List 2025 and charges a day-tripper access fee on peak days.",
		request: {
			destination: "Venice",
			month: 8,
			mustSees: ["St Mark's Square", "Rialto Bridge"],
			favorites: ["Call Me by Your Name", "Antonio Vivaldi"],
			vibes: ["canals", "wine", "quiet"],
			flexibility: "flexible",
			zooms: ["country", "city"],
			scenarioId: "venice-august",
		},
	},
	{
		id: "lisbon-june",
		title: "Lisbon in June",
		blurb: "Belém and Tram 28 during the festival month.",
		context: "Lisbon was on Fodor's No List 2025; Expedia pairs Lisbon with Palermo as a dupe.",
		request: {
			destination: "Lisbon",
			month: 6,
			mustSees: ["Belém Tower", "Tram 28"],
			favorites: ["Amália Rodrigues", "The Book of Disquiet"],
			vibes: ["fado", "tiles", "seafood"],
			flexibility: "flexible",
			zooms: ["country", "world"],
			scenarioId: "lisbon-june",
		},
	},
	{
		id: "seoul-october",
		title: "Seoul in October",
		blurb: "Palaces and hanok alleys in autumn.",
		context: "Expedia pairs Seoul with Taipei as a destination dupe.",
		request: {
			destination: "Seoul",
			month: 10,
			mustSees: ["Gyeongbokgung Palace", "Bukchon Hanok Village"],
			favorites: ["Parasite", "Past Lives"],
			vibes: ["tea", "street food", "palaces"],
			flexibility: "flexible",
			zooms: ["city", "world"],
			scenarioId: "seoul-october",
		},
	},
];
