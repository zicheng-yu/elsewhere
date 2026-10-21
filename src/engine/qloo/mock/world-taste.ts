/**
 * SYNTHETIC taste entities for mock mode (films, artists, people, books, brands).
 * Names are public; every popularity and vector value is invented. Nothing here
 * comes from Qloo.
 */
import type { WorldTaste } from "./world-schema.ts";

export const TASTES: WorldTaste[] = [
	// Contemplative
	{ key: "spirited-away", name: "Spirited Away", kind: "movie", year: 2001, popularity: 0.99, vector: { whimsy: 0.9, spiritual: 0.7, nature: 0.6, craft: 0.4, history: 0.3, quiet: 0.4, film: 0.8, tea: 0.2 } },
	{ key: "my-neighbor-totoro", name: "My Neighbor Totoro", kind: "movie", year: 1988, popularity: 0.98, vector: { whimsy: 0.9, nature: 0.9, quiet: 0.7, local_life: 0.5, film: 0.7, spiritual: 0.3 } },
	{ key: "ryuichi-sakamoto", name: "Ryuichi Sakamoto", kind: "artist", popularity: 0.95, vector: { music: 0.9, quiet: 0.8, zen: 0.6, design: 0.6, art: 0.6, garden: 0.3, jazz: 0.2 } },
	{ key: "nils-frahm", name: "Nils Frahm", kind: "artist", popularity: 0.86, vector: { music: 0.9, quiet: 0.8, nature: 0.4, design: 0.4, zen: 0.4 } },
	{ key: "lost-in-translation", name: "Lost in Translation", kind: "movie", year: 2003, popularity: 0.95, vector: { film: 0.8, nightlife: 0.5, design: 0.5, quiet: 0.5, romance: 0.4, music: 0.4 } },
	{ key: "haruki-murakami", name: "Haruki Murakami", kind: "person", popularity: 0.96, vector: { literature: 0.9, jazz: 0.7, cafes: 0.5, quiet: 0.6, whimsy: 0.4, music: 0.5 } },
	// Night owl
	{ key: "in-the-mood-for-love", name: "In the Mood for Love", kind: "movie", year: 2000, popularity: 0.94, vector: { film: 0.9, romance: 0.9, nightlife: 0.6, food_street: 0.5, photogenic: 0.6, local_life: 0.5, music: 0.4 } },
	{ key: "chungking-express", name: "Chungking Express", kind: "movie", year: 1994, popularity: 0.9, vector: { film: 0.9, nightlife: 0.8, food_street: 0.6, romance: 0.6, local_life: 0.6, music: 0.5, whimsy: 0.3 } },
	{ key: "mariya-takeuchi", name: "Mariya Takeuchi", kind: "artist", popularity: 0.88, vector: { music: 0.9, nightlife: 0.7, jazz: 0.5, design: 0.4, romance: 0.4 } },
	{ key: "bill-evans", name: "Bill Evans", kind: "artist", popularity: 0.89, vector: { jazz: 0.95, music: 0.8, nightlife: 0.6, quiet: 0.4, romance: 0.4 } },
	{ key: "miles-davis", name: "Miles Davis", kind: "artist", popularity: 0.96, vector: { jazz: 0.95, music: 0.9, nightlife: 0.8, design: 0.3 } },
	// Food explorer
	{ key: "parts-unknown", name: "Parts Unknown", kind: "tv_show", year: 2013, popularity: 0.93, vector: { food_street: 0.95, markets: 0.8, local_life: 0.9, nightlife: 0.5, history: 0.3 } },
	{ key: "anthony-bourdain", name: "Anthony Bourdain", kind: "person", popularity: 0.95, vector: { food_street: 0.95, markets: 0.8, local_life: 0.9, nightlife: 0.6, literature: 0.3 } },
	{ key: "chefs-table", name: "Chef's Table", kind: "tv_show", year: 2015, popularity: 0.92, vector: { food_fine: 0.9, craft: 0.6, markets: 0.5, design: 0.4, wine: 0.4 } },
	// Paris
	{ key: "amelie", name: "Amélie", kind: "movie", year: 2001, popularity: 0.97, vector: { whimsy: 0.9, romance: 0.7, cafes: 0.7, local_life: 0.7, film: 0.8, photogenic: 0.5 } },
	{ key: "midnight-in-paris", name: "Midnight in Paris", kind: "movie", year: 2011, popularity: 0.94, vector: { literature: 0.8, art: 0.7, romance: 0.7, nightlife: 0.5, jazz: 0.5, history: 0.5, film: 0.7 } },
	{ key: "serge-gainsbourg", name: "Serge Gainsbourg", kind: "artist", popularity: 0.9, vector: { music: 0.9, nightlife: 0.7, romance: 0.6, art: 0.4, wine: 0.4 } },
	// Barcelona
	{ key: "vicky-cristina-barcelona", name: "Vicky Cristina Barcelona", kind: "movie", year: 2008, popularity: 0.9, vector: { romance: 0.8, art: 0.7, architecture: 0.6, wine: 0.5, film: 0.7, coast: 0.3 } },
	{ key: "rosalia", name: "Rosalía", kind: "artist", popularity: 0.96, vector: { music: 0.9, nightlife: 0.7, design: 0.5, art: 0.4, local_life: 0.3 } },
	// Alps
	{ key: "heidi", name: "Heidi", kind: "book", year: 1881, popularity: 0.9, vector: { mountains: 0.95, nature: 0.9, quiet: 0.8, local_life: 0.5, whimsy: 0.4, outdoors: 0.6 } },
	{ key: "grand-budapest-hotel", name: "The Grand Budapest Hotel", kind: "movie", year: 2014, popularity: 0.96, vector: { whimsy: 0.9, design: 0.8, photogenic: 0.8, mountains: 0.5, film: 0.8, history: 0.4 } },
	{ key: "wes-anderson", name: "Wes Anderson", kind: "person", popularity: 0.96, vector: { whimsy: 0.9, design: 0.9, photogenic: 0.9, film: 0.8, art: 0.5 } },
	// Bali
	{ key: "eat-pray-love", name: "Eat Pray Love", kind: "movie", year: 2010, popularity: 0.92, vector: { spiritual: 0.8, nature: 0.6, food_street: 0.5, romance: 0.6, quiet: 0.5, local_life: 0.4 } },
	// Venice
	{ key: "call-me-by-your-name", name: "Call Me by Your Name", kind: "movie", year: 2017, popularity: 0.94, vector: { romance: 0.9, history: 0.5, nature: 0.5, quiet: 0.6, literature: 0.5, film: 0.8, wine: 0.3 } },
	{ key: "antonio-vivaldi", name: "Antonio Vivaldi", kind: "artist", popularity: 0.95, vector: { music: 0.95, history: 0.8, spiritual: 0.4, romance: 0.4, architecture: 0.3 } },
	// Lisbon
	{ key: "amalia-rodrigues", name: "Amália Rodrigues", kind: "artist", popularity: 0.88, vector: { music: 0.9, nightlife: 0.6, romance: 0.7, history: 0.6, local_life: 0.6 } },
	{ key: "book-of-disquiet", name: "The Book of Disquiet", kind: "book", year: 1982, popularity: 0.86, vector: { literature: 0.95, quiet: 0.7, cafes: 0.6, history: 0.4, local_life: 0.5 } },
	// Seoul
	{ key: "parasite", name: "Parasite", kind: "movie", year: 2019, popularity: 0.98, vector: { film: 0.9, local_life: 0.7, design: 0.5, food_street: 0.4, nightlife: 0.3 } },
	{ key: "past-lives", name: "Past Lives", kind: "movie", year: 2023, popularity: 0.9, vector: { film: 0.9, romance: 0.8, quiet: 0.7, local_life: 0.5, literature: 0.4 } },
	// Brands
	{ key: "monocle", name: "Monocle", kind: "brand", popularity: 0.85, vector: { design: 0.9, cafes: 0.6, craft: 0.6, local_life: 0.5, architecture: 0.5 } },
	{ key: "kinfolk", name: "Kinfolk", kind: "brand", popularity: 0.8, vector: { design: 0.8, quiet: 0.8, cafes: 0.6, craft: 0.6, nature: 0.4 } },
];
