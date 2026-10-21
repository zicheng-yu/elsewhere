/**
 * SYNTHETIC demo world, Europe: Paris, Barcelona, the Jungfrau Region, Venice and
 * Lisbon, plus their day-trip towns and twin cities. Used when QLOO_MODE=mock.
 *
 * Place names and approximate coordinates are public knowledge. Every popularity,
 * rating, price level and taste-vector value is invented for development and
 * keyless demos. All café, restaurant and bar names are fictional. Nothing in this
 * file comes from Qloo.
 */

import { place, type WorldLocality, type WorldPlace } from "./world-schema.ts";

export const EUROPE_LOCALITIES: WorldLocality[] = [
	// A) Paris (same city) and its day-trip towns
	{
		key: "paris", name: "Paris", region: "Île-de-France", country: "France", countryCode: "FR",
		lat: 48.8566, lon: 2.3522, population: 2_100_000, popularity: 0.999, radiusKm: 10,
		vector: { art: 1, romance: 0.95, photogenic: 0.9, history: 0.9, architecture: 0.85, cafes: 0.85, food_fine: 0.75, literature: 0.6 },
		peakMonths: [6, 7, 8], offSeasonMonths: [1, 2, 11], bestMonths: [4, 5, 9, 10],
		events: [{ month: 6, name: "Fête de la Musique" }, { month: 6, name: "Nuit Blanche" }, { month: 9, name: "European Heritage Days" }],
		traits: ["Museum capital", "Café terraces", "Hilltop Montmartre", "Seine riverbanks", "Belle Époque boulevards"],
	},
	{
		key: "giverny", name: "Giverny", region: "Normandy", country: "France", countryCode: "FR",
		lat: 49.076, lon: 1.531, population: 500, popularity: 0.94, radiusKm: 2,
		vector: { art: 1, garden: 1, photogenic: 0.8, romance: 0.7, nature: 0.6, water: 0.5 },
		peakMonths: [5, 6, 7, 8], offSeasonMonths: [11, 12, 1, 2, 3], bestMonths: [4, 9, 10],
		traits: ["Monet's house and gardens", "Water-lily pond", "Impressionist painters' village", "Seine valley countryside"],
	},
	{
		key: "provins", name: "Provins", region: "Île-de-France", country: "France", countryCode: "FR",
		lat: 48.5604, lon: 3.299, population: 11_800, popularity: 0.74, radiusKm: 3,
		vector: { history: 1, architecture: 0.8, whimsy: 0.6, photogenic: 0.6, quiet: 0.6, garden: 0.4 },
		peakMonths: [6, 7, 8], offSeasonMonths: [1, 2, 11, 12], bestMonths: [4, 5, 9, 10],
		events: [{ month: 6, name: "Provins Medieval Festival" }],
		traits: ["UNESCO medieval fair town", "Ramparts and towers", "Underground passages", "Rose of Provins"],
	},
	{
		key: "auvers-sur-oise", name: "Auvers-sur-Oise", region: "Île-de-France", country: "France", countryCode: "FR",
		lat: 49.0725, lon: 2.175, population: 7_000, popularity: 0.72, radiusKm: 3,
		vector: { art: 1, quiet: 0.7, history: 0.6, nature: 0.6, romance: 0.4, local_life: 0.4 },
		peakMonths: [5, 6, 7, 8], offSeasonMonths: [11, 12, 1, 2], bestMonths: [4, 9, 10],
		events: [{ month: 6, name: "Festival d'Auvers-sur-Oise" }],
		traits: ["Van Gogh's last home", "Painters' village on the Oise", "The church and wheat fields he painted", "Daubigny's studio"],
	},
	{
		key: "chantilly", name: "Chantilly", region: "Hauts-de-France", country: "France", countryCode: "FR",
		lat: 49.1947, lon: 2.4711, population: 11_000, popularity: 0.78, radiusKm: 5,
		vector: { history: 0.9, architecture: 0.9, art: 0.8, garden: 0.8, nature: 0.6, romance: 0.5, outdoors: 0.3 },
		peakMonths: [5, 6, 7, 8], offSeasonMonths: [1, 2, 11], bestMonths: [4, 9, 10],
		events: [{ month: 6, name: "Prix de Diane" }],
		traits: ["Château and Musée Condé", "Great Stables", "Le Nôtre gardens", "Forest and racecourse", "Crème Chantilly"],
	},
	{
		key: "fontainebleau", name: "Fontainebleau", region: "Île-de-France", country: "France", countryCode: "FR",
		lat: 48.405, lon: 2.701, population: 15_000, popularity: 0.84, radiusKm: 6,
		vector: { history: 0.9, architecture: 0.9, nature: 0.8, outdoors: 0.8, art: 0.6, garden: 0.6, quiet: 0.4 },
		peakMonths: [5, 6, 7, 8], offSeasonMonths: [1, 2, 11], bestMonths: [4, 9, 10],
		events: [{ month: 6, name: "Art History Festival" }],
		traits: ["Royal château of eight centuries", "Forest bouldering", "Sandstone gorges", "Barbizon painters' landscapes"],
	},
	{
		key: "senlis", name: "Senlis", region: "Hauts-de-France", country: "France", countryCode: "FR",
		lat: 49.2075, lon: 2.587, population: 15_000, popularity: 0.6, radiusKm: 3,
		vector: { history: 1, architecture: 0.8, quiet: 0.8, spiritual: 0.6, local_life: 0.5, photogenic: 0.5, film: 0.3 },
		peakMonths: [6, 7, 8], offSeasonMonths: [1, 2, 11, 12], bestMonths: [4, 5, 9, 10],
		traits: ["Gothic cathedral", "Gallo-Roman walls", "Cobbled medieval lanes", "Period-film backdrop"],
	},
	{
		key: "rouen", name: "Rouen", region: "Normandy", country: "France", countryCode: "FR",
		lat: 49.442, lon: 1.094, population: 114_000, popularity: 0.87, radiusKm: 6,
		vector: { history: 1, architecture: 0.9, art: 0.8, spiritual: 0.6, local_life: 0.6, photogenic: 0.6, literature: 0.5, food_fine: 0.4 },
		peakMonths: [6, 7, 8], offSeasonMonths: [1, 2, 11], bestMonths: [4, 5, 9, 10],
		events: [{ month: 5, name: "Joan of Arc Festival" }],
		traits: ["Monet's cathedral", "Half-timbered old town", "Joan of Arc", "Impressionist collection", "Gros-Horloge"],
	},

	// B) Barcelona (same city) and its Spanish twin cities
	{
		key: "barcelona", name: "Barcelona", region: "Catalonia", country: "Spain", countryCode: "ES",
		lat: 41.3874, lon: 2.1686, population: 1_660_000, popularity: 0.998, radiusKm: 8,
		vector: { architecture: 1, art: 0.8, food_street: 0.8, photogenic: 0.8, nightlife: 0.75, design: 0.7, history: 0.7, coast: 0.6 },
		peakMonths: [6, 7, 8], offSeasonMonths: [1, 2], bestMonths: [5, 9, 10],
		events: [{ month: 6, name: "Sant Joan" }, { month: 9, name: "La Mercè" }],
		traits: ["Gaudí and Modernisme", "Gothic Quarter lanes", "Tapas and vermouth", "City beaches", "Late nights"],
	},
	{
		key: "girona", name: "Girona", region: "Catalonia", country: "Spain", countryCode: "ES",
		lat: 41.9844, lon: 2.823, population: 105_000, popularity: 0.87, radiusKm: 4,
		vector: { history: 1, architecture: 0.8, photogenic: 0.8, food_fine: 0.7, art: 0.5, water: 0.5, romance: 0.5, film: 0.5 },
		peakMonths: [5, 7, 8], offSeasonMonths: [1, 2, 11], bestMonths: [4, 6, 9, 10],
		events: [{ month: 5, name: "Temps de Flors" }],
		traits: ["Medieval Jewish Quarter", "Colourful houses on the Onyar", "City walls walk", "Game of Thrones locations", "Destination dining"],
	},
	{
		key: "tarragona", name: "Tarragona", region: "Catalonia", country: "Spain", countryCode: "ES",
		lat: 41.1175, lon: 1.2528, population: 138_000, popularity: 0.84, radiusKm: 5,
		vector: { history: 1, coast: 0.8, architecture: 0.6, quiet: 0.6, local_life: 0.5, food_street: 0.5, photogenic: 0.5, outdoors: 0.4 },
		peakMonths: [7, 8], offSeasonMonths: [1, 2, 11], bestMonths: [5, 6, 9, 10],
		events: [{ month: 9, name: "Santa Tecla Festival" }],
		traits: ["Roman Tarraco ruins", "Amphitheatre by the sea", "Human towers (castells)", "Fishermen's quarter El Serrallo"],
	},
	{
		key: "zaragoza", name: "Zaragoza", region: "Aragon", country: "Spain", countryCode: "ES",
		lat: 41.65, lon: -0.8833, population: 680_000, popularity: 0.85, radiusKm: 7,
		vector: { history: 0.9, architecture: 0.9, food_street: 0.8, local_life: 0.8, spiritual: 0.7, art: 0.6, nightlife: 0.5, quiet: 0.4 },
		peakMonths: [8, 10], offSeasonMonths: [1, 2], bestMonths: [4, 5, 6, 9],
		events: [{ month: 10, name: "Fiestas del Pilar" }],
		traits: ["Basilica of the Pillar", "Mudéjar towers", "Tapas in El Tubo", "Goya's homeland", "Ebro riverfront"],
	},
	{
		key: "cadiz", name: "Cádiz", region: "Andalusia", country: "Spain", countryCode: "ES",
		lat: 36.532, lon: -6.296, population: 111_000, popularity: 0.86, radiusKm: 4,
		vector: { coast: 1, local_life: 0.9, food_street: 0.8, history: 0.6, music: 0.6, photogenic: 0.6, nightlife: 0.5, quiet: 0.3 },
		peakMonths: [7, 8], offSeasonMonths: [1, 11, 12], bestMonths: [5, 6, 9, 10],
		events: [{ month: 2, name: "Carnival of Cádiz" }],
		traits: ["Ancient Atlantic port", "Old-town beaches", "Carnival songs (chirigotas)", "Fried-fish freidurías", "Watchtowers"],
	},
	{
		key: "valencia", name: "Valencia", region: "Valencian Community", country: "Spain", countryCode: "ES",
		lat: 39.47, lon: -0.3764, population: 807_000, popularity: 0.97, radiusKm: 7,
		vector: { food_street: 0.9, architecture: 0.8, design: 0.8, coast: 0.8, markets: 0.8, nightlife: 0.7, history: 0.6, outdoors: 0.4 },
		peakMonths: [3, 7, 8], offSeasonMonths: [1, 11], bestMonths: [4, 5, 10],
		events: [{ month: 3, name: "Las Fallas" }],
		traits: ["City of Arts and Sciences", "Paella's homeland", "Turia riverbed park", "Central Market", "Urban beaches"],
	},

	// C) Jungfrau Region (day trip): crowded valley towns and quieter alpine alternatives
	{
		key: "interlaken", name: "Interlaken", region: "Bern", country: "Switzerland", countryCode: "CH",
		lat: 46.6863, lon: 7.8632, population: 5_800, popularity: 0.99, radiusKm: 3,
		vector: { mountains: 1, outdoors: 0.9, water: 0.8, nature: 0.8, photogenic: 0.8, romance: 0.3 },
		peakMonths: [7, 8], offSeasonMonths: [4, 11], bestMonths: [6, 9],
		events: [{ month: 9, name: "Jungfrau Marathon" }],
		traits: ["Between two lakes", "Gateway to the Jungfrau", "Paragliders over the Höhematte", "Alpine rail hub"],
	},
	{
		key: "lauterbrunnen", name: "Lauterbrunnen", region: "Bern", country: "Switzerland", countryCode: "CH",
		lat: 46.5935, lon: 7.9085, population: 2_300, popularity: 0.97, radiusKm: 3,
		vector: { photogenic: 1, mountains: 1, water: 0.9, nature: 0.9, outdoors: 0.8, romance: 0.3 },
		peakMonths: [7, 8], offSeasonMonths: [4, 11], bestMonths: [6, 9],
		traits: ["Valley of 72 waterfalls", "Sheer limestone cliffs", "Car-free Wengen above", "Gateway to Mürren"],
	},
	{
		key: "grindelwald", name: "Grindelwald", region: "Bern", country: "Switzerland", countryCode: "CH",
		lat: 46.624, lon: 8.036, population: 3_800, popularity: 0.97, radiusKm: 5,
		vector: { mountains: 1, outdoors: 0.9, photogenic: 0.9, nature: 0.8, water: 0.3 },
		peakMonths: [7, 8], offSeasonMonths: [4, 11], bestMonths: [6, 9],
		traits: ["Eiger North Face", "Gondolas to First", "Eiger Express to the Jungfraujoch", "Alpine meadows and glaciers"],
	},
	{
		key: "iseltwald", name: "Iseltwald", region: "Bern", country: "Switzerland", countryCode: "CH",
		lat: 46.709, lon: 7.964, population: 400, popularity: 0.93, radiusKm: 2,
		vector: { water: 1, photogenic: 0.9, romance: 0.8, film: 0.7, mountains: 0.6, quiet: 0.3 },
		peakMonths: [7, 8], offSeasonMonths: [11, 1, 2], bestMonths: [6, 9],
		traits: ["Lake Brienz peninsula", "K-drama pier", "Turquoise water", "Tiny lakeside village"],
	},
	{
		key: "kandersteg", name: "Kandersteg", region: "Bern", country: "Switzerland", countryCode: "CH",
		lat: 46.4967, lon: 7.6747, population: 1_300, popularity: 0.8, radiusKm: 4,
		vector: { mountains: 1, nature: 0.9, outdoors: 0.9, water: 0.8, photogenic: 0.8, quiet: 0.6 },
		peakMonths: [7, 8], offSeasonMonths: [4, 11], bestMonths: [6, 9],
		traits: ["Oeschinensee", "Alpine hiking hub", "Wild Gastern valley", "Lötschberg car train"],
	},
	{
		key: "lotschental", name: "Lötschental", region: "Valais", country: "Switzerland", countryCode: "CH",
		lat: 46.4042, lon: 7.7839, population: 1_200, popularity: 0.55, radiusKm: 7,
		vector: { mountains: 1, nature: 1, quiet: 0.9, outdoors: 0.8, craft: 0.5, history: 0.5, water: 0.4 },
		peakMonths: [7, 8], offSeasonMonths: [4, 5, 11], bestMonths: [6, 9],
		events: [{ month: 2, name: "Tschäggättä masked carnival" }],
		traits: ["Remote Valais valley", "Tschäggättä carnival masks", "Lötschentaler Höhenweg trail", "Larch-wood villages"],
	},
	{
		key: "engelberg", name: "Engelberg", region: "Obwalden", country: "Switzerland", countryCode: "CH",
		lat: 46.821, lon: 8.409, population: 4_300, popularity: 0.86, radiusKm: 5,
		vector: { mountains: 1, outdoors: 0.9, nature: 0.8, photogenic: 0.8, spiritual: 0.5, water: 0.5, quiet: 0.4 },
		peakMonths: [7, 8], offSeasonMonths: [4, 11], bestMonths: [6, 9],
		traits: ["Titlis glacier and Rotair", "Benedictine abbey", "Trübsee alpine lake", "Year-round mountain resort"],
	},
	{
		key: "adelboden", name: "Adelboden", region: "Bern", country: "Switzerland", countryCode: "CH",
		lat: 46.4933, lon: 7.5598, population: 3_300, popularity: 0.72, radiusKm: 4,
		vector: { mountains: 1, nature: 0.9, outdoors: 0.9, quiet: 0.7, photogenic: 0.7, water: 0.6 },
		peakMonths: [1, 7, 8], offSeasonMonths: [4, 5, 11], bestMonths: [6, 9],
		events: [{ month: 1, name: "Adelboden Ski World Cup" }],
		traits: ["Engstligen Falls", "Engstligenalp high plateau", "Chalet village", "World Cup slalom slope"],
	},
	{
		key: "murren", name: "Mürren", region: "Bern", country: "Switzerland", countryCode: "CH",
		lat: 46.5594, lon: 7.8922, population: 450, popularity: 0.86, radiusKm: 3,
		vector: { mountains: 1, photogenic: 0.9, outdoors: 0.8, nature: 0.8, quiet: 0.6, film: 0.4 },
		peakMonths: [7, 8], offSeasonMonths: [4, 5, 11], bestMonths: [6, 9],
		events: [{ month: 1, name: "Inferno ski race" }],
		traits: ["Car-free cliff-edge village", "Schilthorn summit (Bond film location)", "Allmendhubel flower trail", "Eiger–Mönch–Jungfrau panorama"],
	},
	{
		key: "gimmelwald", name: "Gimmelwald", region: "Bern", country: "Switzerland", countryCode: "CH",
		lat: 46.5467, lon: 7.8925, population: 130, popularity: 0.6, radiusKm: 2,
		vector: { quiet: 1, mountains: 1, nature: 0.9, outdoors: 0.7, photogenic: 0.7, local_life: 0.5 },
		peakMonths: [7, 8], offSeasonMonths: [4, 5, 11], bestMonths: [6, 9],
		traits: ["Tiny farming hamlet", "Honesty-box farm shops", "Via ferrata to Mürren", "Cliff-top views of the Lauterbrunnen valley"],
	},
	{
		key: "thun", name: "Thun", region: "Bern", country: "Switzerland", countryCode: "CH",
		lat: 46.758, lon: 7.628, population: 44_000, popularity: 0.78, radiusKm: 4,
		vector: { water: 0.8, history: 0.8, photogenic: 0.7, mountains: 0.6, architecture: 0.6, local_life: 0.6, quiet: 0.5, outdoors: 0.4 },
		peakMonths: [7, 8], offSeasonMonths: [1, 2, 11], bestMonths: [5, 6, 9],
		events: [{ month: 7, name: "Thunerseespiele lakeside musical" }],
		traits: ["Turreted castle", "Aare river surfing", "Two-level old-town lanes", "Lake Thun steamers"],
	},
	{
		key: "brienz", name: "Brienz", region: "Bern", country: "Switzerland", countryCode: "CH",
		lat: 46.7546, lon: 8.038, population: 3_000, popularity: 0.76, radiusKm: 4,
		vector: { water: 0.9, craft: 0.9, mountains: 0.8, nature: 0.7, photogenic: 0.7, quiet: 0.6, history: 0.4 },
		peakMonths: [7, 8], offSeasonMonths: [4, 11], bestMonths: [6, 9],
		traits: ["Woodcarving village", "Turquoise Lake Brienz", "Steam cog railway", "Giessbach Falls"],
	},

	// D) Venice (same city) and its Italian twin cities
	{
		key: "venice", name: "Venice", region: "Veneto", country: "Italy", countryCode: "IT",
		lat: 45.4375, lon: 12.3358, population: 250_000, popularity: 0.999, radiusKm: 10,
		vector: { water: 1, photogenic: 1, romance: 0.9, history: 0.9, architecture: 0.9, art: 0.8, film: 0.5, craft: 0.5 },
		peakMonths: [5, 6, 7, 8, 9], offSeasonMonths: [1, 11], bestMonths: [4, 10],
		events: [{ month: 2, name: "Carnival of Venice" }, { month: 5, name: "Venice Biennale opening" }, { month: 7, name: "Festa del Redentore" }],
		traits: ["Canals instead of streets", "Byzantine–Gothic palaces", "Lagoon islands", "Cicchetti in bacari", "Day-tripper access fee"],
	},
	{
		key: "chioggia", name: "Chioggia", region: "Veneto", country: "Italy", countryCode: "IT",
		lat: 45.2196, lon: 12.2789, population: 48_000, popularity: 0.68, radiusKm: 4,
		vector: { water: 1, local_life: 0.8, markets: 0.7, coast: 0.7, food_street: 0.6, photogenic: 0.6, history: 0.5, quiet: 0.5 },
		peakMonths: [7, 8], offSeasonMonths: [1, 2, 11], bestMonths: [5, 6, 9],
		events: [{ month: 7, name: "Sagra del Pesce" }],
		traits: ["Fishing-town 'little Venice'", "Canal Vena", "Daily fish market", "Sottomarina beach"],
	},
	{
		key: "comacchio", name: "Comacchio", region: "Emilia-Romagna", country: "Italy", countryCode: "IT",
		lat: 44.6943, lon: 12.183, population: 21_000, popularity: 0.62, radiusKm: 4,
		vector: { water: 1, photogenic: 0.8, quiet: 0.8, history: 0.6, architecture: 0.6, local_life: 0.6, romance: 0.5, nature: 0.5 },
		peakMonths: [7, 8], offSeasonMonths: [1, 2, 11], bestMonths: [4, 5, 9, 10],
		events: [{ month: 10, name: "Sagra dell'Anguilla" }],
		traits: ["Canal town of the Po Delta", "Trepponti bridge", "Eel-fishing lagoons", "Flamingos in the wetlands"],
	},
	{
		key: "treviso", name: "Treviso", region: "Veneto", country: "Italy", countryCode: "IT",
		lat: 45.6658, lon: 12.2456, population: 85_000, popularity: 0.78, radiusKm: 4,
		vector: { water: 0.9, history: 0.8, local_life: 0.8, architecture: 0.7, photogenic: 0.7, wine: 0.6, quiet: 0.6, romance: 0.5 },
		peakMonths: [6, 7, 8], offSeasonMonths: [1, 2, 11], bestMonths: [4, 5, 9, 10],
		traits: ["Canals and water mills", "Tiramisù's hometown", "Prosecco hills nearby", "Frescoed façades"],
	},
	{
		key: "trieste", name: "Trieste", region: "Friuli-Venezia Giulia", country: "Italy", countryCode: "IT",
		lat: 45.6503, lon: 13.7703, population: 200_000, popularity: 0.86, radiusKm: 8,
		vector: { cafes: 1, literature: 0.9, coast: 0.8, history: 0.8, architecture: 0.8, photogenic: 0.6, quiet: 0.5, romance: 0.4 },
		peakMonths: [7, 8], offSeasonMonths: [1, 2, 11], bestMonths: [5, 6, 9, 10],
		events: [{ month: 10, name: "Barcolana regatta" }],
		traits: ["Habsburg coffee houses", "Joyce and Svevo", "Sea-facing grand square", "Bora wind", "Karst plateau"],
	},
	{
		key: "bologna", name: "Bologna", region: "Emilia-Romagna", country: "Italy", countryCode: "IT",
		lat: 44.4939, lon: 11.3428, population: 390_000, popularity: 0.92, radiusKm: 6,
		vector: { food_street: 1, local_life: 0.9, history: 0.8, architecture: 0.8, markets: 0.6, nightlife: 0.6, music: 0.5, literature: 0.5 },
		peakMonths: [5, 6, 9], offSeasonMonths: [1, 2, 8], bestMonths: [4, 10],
		traits: ["UNESCO porticoes", "Tagliatelle al ragù", "Oldest university in the West", "Two Towers", "Quadrilatero market lanes"],
	},
	{
		key: "mantua", name: "Mantua", region: "Lombardy", country: "Italy", countryCode: "IT",
		lat: 45.1564, lon: 10.7917, population: 49_000, popularity: 0.78, radiusKm: 4,
		vector: { art: 0.9, history: 0.9, architecture: 0.9, quiet: 0.7, water: 0.7, romance: 0.5, food_street: 0.5, literature: 0.4 },
		peakMonths: [5, 9], offSeasonMonths: [1, 2, 11], bestMonths: [4, 6, 10],
		events: [{ month: 9, name: "Festivaletteratura" }],
		traits: ["Renaissance Gonzaga court", "City ringed by lakes", "Mantegna's Bridal Chamber", "Pumpkin tortelli"],
	},
	{
		key: "ferrara", name: "Ferrara", region: "Emilia-Romagna", country: "Italy", countryCode: "IT",
		lat: 44.8381, lon: 11.6198, population: 130_000, popularity: 0.78, radiusKm: 4,
		vector: { history: 0.9, quiet: 0.8, architecture: 0.8, outdoors: 0.7, local_life: 0.7, art: 0.5, literature: 0.4, food_street: 0.4 },
		peakMonths: [5, 6, 9], offSeasonMonths: [1, 2, 11], bestMonths: [4, 10],
		events: [{ month: 8, name: "Ferrara Buskers Festival" }],
		traits: ["City of bicycles", "Moated Este castle", "Renaissance street grid", "Walls you can cycle"],
	},

	// E) Lisbon (same country and anywhere), Sintra, Portuguese twins and cross-border twins
	{
		key: "lisbon", name: "Lisbon", region: "Lisbon District", country: "Portugal", countryCode: "PT",
		lat: 38.7223, lon: -9.1393, population: 545_000, popularity: 0.998, radiusKm: 8,
		vector: { photogenic: 0.9, music: 0.8, local_life: 0.75, romance: 0.7, history: 0.7, food_street: 0.7, architecture: 0.6, coast: 0.5 },
		peakMonths: [6, 7, 8], offSeasonMonths: [1, 2, 11], bestMonths: [4, 5, 10],
		events: [{ month: 6, name: "Santo António festival" }],
		traits: ["Seven hills and miradouros", "Fado", "Azulejo tiles", "Yellow trams", "Pastéis de nata"],
	},
	{
		key: "sintra", name: "Sintra", region: "Lisbon District", country: "Portugal", countryCode: "PT",
		lat: 38.7976, lon: -9.388, population: 30_000, popularity: 0.98, radiusKm: 5,
		vector: { whimsy: 1, romance: 0.9, history: 0.9, architecture: 0.9, photogenic: 0.9, garden: 0.8, nature: 0.8, mountains: 0.4 },
		peakMonths: [6, 7, 8], offSeasonMonths: [1, 2, 11], bestMonths: [4, 5, 10],
		traits: ["Romantic palaces", "Misty forested hills", "Moorish castle walls", "UNESCO cultural landscape"],
	},
	{
		key: "coimbra", name: "Coimbra", region: "Coimbra District", country: "Portugal", countryCode: "PT",
		lat: 40.2085, lon: -8.4265, population: 140_000, popularity: 0.85, radiusKm: 4,
		vector: { history: 1, literature: 0.9, architecture: 0.8, music: 0.8, local_life: 0.6, photogenic: 0.6, romance: 0.5, nightlife: 0.5 },
		peakMonths: [5, 7, 8], offSeasonMonths: [1, 2, 12], bestMonths: [4, 6, 9, 10],
		events: [{ month: 5, name: "Queima das Fitas" }],
		traits: ["Hilltop university (UNESCO)", "Baroque Joanina Library", "Coimbra fado serenades", "Student traditions", "Mondego riverside"],
	},
	{
		key: "evora", name: "Évora", region: "Alentejo", country: "Portugal", countryCode: "PT",
		lat: 38.5714, lon: -7.9094, population: 57_000, popularity: 0.8, radiusKm: 4,
		vector: { history: 1, architecture: 0.8, quiet: 0.8, wine: 0.8, local_life: 0.6, photogenic: 0.6, food_street: 0.5, music: 0.4 },
		peakMonths: [7, 8], offSeasonMonths: [1, 2, 12], bestMonths: [4, 5, 10],
		events: [{ month: 6, name: "Feira de São João" }],
		traits: ["Walled UNESCO town", "Roman temple", "Chapel of Bones", "Alentejo wine", "Cante alentejano singing", "Megaliths nearby"],
	},
	{
		key: "aveiro", name: "Aveiro", region: "Aveiro District", country: "Portugal", countryCode: "PT",
		lat: 40.6405, lon: -8.6538, population: 80_000, popularity: 0.83, radiusKm: 4,
		vector: { water: 1, photogenic: 0.9, architecture: 0.7, romance: 0.6, coast: 0.6, history: 0.5, whimsy: 0.5, local_life: 0.5 },
		peakMonths: [7, 8], offSeasonMonths: [1, 2, 11], bestMonths: [5, 6, 9, 10],
		traits: ["Canals and moliceiro boats", "Art Nouveau façades", "Ovos moles sweets", "Striped houses of Costa Nova", "Salt pans"],
	},
	{
		key: "braga", name: "Braga", region: "Braga District", country: "Portugal", countryCode: "PT",
		lat: 41.5503, lon: -8.427, population: 193_000, popularity: 0.82, radiusKm: 5,
		vector: { spiritual: 1, history: 0.9, architecture: 0.8, local_life: 0.6, photogenic: 0.6, garden: 0.5, food_street: 0.5, nightlife: 0.4 },
		peakMonths: [4, 7, 8], offSeasonMonths: [1, 2, 11], bestMonths: [5, 6, 9, 10],
		events: [{ month: 4, name: "Holy Week processions" }, { month: 6, name: "São João festival" }],
		traits: ["Portugal's religious capital", "Baroque stairway of Bom Jesus", "Oldest cathedral in Portugal", "Young university city"],
	},
	{
		key: "tomar", name: "Tomar", region: "Santarém District", country: "Portugal", countryCode: "PT",
		lat: 39.6033, lon: -8.412, population: 36_000, popularity: 0.66, radiusKm: 3,
		vector: { history: 1, architecture: 0.9, spiritual: 0.8, quiet: 0.8, water: 0.5, local_life: 0.5, garden: 0.4, whimsy: 0.4 },
		peakMonths: [7, 8], offSeasonMonths: [1, 2, 11, 12], bestMonths: [4, 5, 9, 10],
		events: [{ month: 7, name: "Festa dos Tabuleiros (every four years)" }],
		traits: ["Knights Templar stronghold", "Convent of Christ (UNESCO)", "Nabão riverside", "Festa dos Tabuleiros"],
	},
	{
		key: "guimaraes", name: "Guimarães", region: "Braga District", country: "Portugal", countryCode: "PT",
		lat: 41.444, lon: -8.2925, population: 156_000, popularity: 0.78, radiusKm: 4,
		vector: { history: 1, architecture: 0.8, local_life: 0.7, photogenic: 0.7, quiet: 0.6, food_street: 0.5, spiritual: 0.4, nightlife: 0.4 },
		peakMonths: [7, 8], offSeasonMonths: [1, 2, 11], bestMonths: [4, 5, 9, 10],
		events: [{ month: 8, name: "Festas Gualterianas" }],
		traits: ["Birthplace of Portugal", "Hilltop medieval castle", "Granite old town (UNESCO)", "Penha cable car"],
	},
	{
		key: "palermo", name: "Palermo", region: "Sicily", country: "Italy", countryCode: "IT",
		lat: 38.1157, lon: 13.3615, population: 630_000, popularity: 0.91, radiusKm: 10,
		vector: { food_street: 1, history: 0.9, local_life: 0.9, markets: 0.8, architecture: 0.8, coast: 0.6, photogenic: 0.6, music: 0.4 },
		peakMonths: [7, 8], offSeasonMonths: [1, 2], bestMonths: [4, 5, 6, 10],
		events: [{ month: 7, name: "Festino di Santa Rosalia" }],
		traits: ["Arab-Norman monuments", "Street-food capital", "Open-air markets", "Baroque churches", "Mondello beach"],
	},
	{
		key: "valletta", name: "Valletta", region: "South Eastern Region", country: "Malta", countryCode: "MT",
		lat: 35.8983, lon: 14.5125, population: 5_800, popularity: 0.88, radiusKm: 2,
		vector: { history: 1, architecture: 0.9, coast: 0.9, photogenic: 0.8, romance: 0.6, art: 0.6, spiritual: 0.5, local_life: 0.4 },
		peakMonths: [7, 8], offSeasonMonths: [1, 2], bestMonths: [4, 5, 6, 10, 11],
		events: [{ month: 2, name: "Malta Carnival" }, { month: 7, name: "Malta Jazz Festival" }],
		traits: ["Fortified Baroque capital", "Grand Harbour views", "Caravaggio in the co-cathedral", "Enclosed wooden balconies"],
	},
	{
		key: "naples", name: "Naples", region: "Campania", country: "Italy", countryCode: "IT",
		lat: 40.8518, lon: 14.2681, population: 910_000, popularity: 0.97, radiusKm: 7,
		vector: { food_street: 1, local_life: 1, history: 0.9, art: 0.6, spiritual: 0.6, coast: 0.6, photogenic: 0.6, music: 0.5 },
		peakMonths: [6, 7, 8], offSeasonMonths: [1, 2, 11], bestMonths: [4, 5, 10],
		events: [{ month: 9, name: "Feast of San Gennaro" }],
		traits: ["Pizza's birthplace", "Baroque churches and catacombs", "Spaccanapoli street life", "Bay and Vesuvius views", "Nativity-craft street"],
	},
];

export const EUROPE_PLACES: WorldPlace[] = [
	// Paris: crowded icons, quieter twins, food and drink
	place("paris-eiffel-tower", "Eiffel Tower", "paris", 48.8582, 2.2945, "landmark", 0.999, { photogenic: 1, romance: 0.9, architecture: 0.5, design: 0.4, film: 0.4, history: 0.2 }, { neighborhood: "7th arrondissement", rating: 4.7 }),
	place("paris-louvre", "Louvre Museum", "paris", 48.8611, 2.3358, "museum", 0.998, { art: 1, history: 0.9, architecture: 0.8, photogenic: 0.5, design: 0.3 }, { neighborhood: "1st arrondissement", rating: 4.7 }),
	place("paris-sacre-coeur", "Sacré-Cœur Basilica", "paris", 48.8867, 2.3431, "church", 0.993, { photogenic: 0.9, spiritual: 0.8, romance: 0.7, architecture: 0.5, history: 0.4, art: 0.3, whimsy: 0.3 }, { neighborhood: "Montmartre", rating: 4.7 }),
	place("paris-place-du-tertre", "Place du Tertre", "paris", 48.8867, 2.3408, "square", 0.985, { art: 0.9, photogenic: 0.7, whimsy: 0.6, history: 0.5, cafes: 0.5, romance: 0.5, film: 0.3 }, { neighborhood: "Montmartre", rating: 4.3 }),
	place("paris-notre-dame", "Notre-Dame de Paris", "paris", 48.8531, 2.35, "church", 0.997, { architecture: 1, history: 1, spiritual: 0.9, photogenic: 0.7, literature: 0.5, art: 0.4 }, { neighborhood: "Île de la Cité", rating: 4.7 }),
	place("paris-champs-elysees", "Champs-Élysées", "paris", 48.8697, 2.3075, "street", 0.996, { shopping: 1, photogenic: 0.7, architecture: 0.6, history: 0.5, design: 0.4, nightlife: 0.4 }, { neighborhood: "8th arrondissement", rating: 4.5 }),
	place("paris-rue-cremieux", "Rue Crémieux", "paris", 48.8469, 2.3711, "street", 0.975, { photogenic: 1, whimsy: 0.8, architecture: 0.4, local_life: 0.4, design: 0.3 }, { neighborhood: "12th arrondissement", rating: 4.4 }),
	place("paris-place-des-vosges", "Le Marais (Place des Vosges)", "paris", 48.8556, 2.3656, "square", 0.985, { history: 0.9, architecture: 0.9, photogenic: 0.7, romance: 0.6, shopping: 0.6, art: 0.4, literature: 0.3 }, { neighborhood: "Le Marais", rating: 4.7 }),
	place("paris-musee-dorsay", "Musée d'Orsay", "paris", 48.86, 2.3265, "museum", 0.988, { art: 1, architecture: 0.7, history: 0.6, design: 0.4, photogenic: 0.4 }, { neighborhood: "7th arrondissement", rating: 4.8 }),
	place("paris-butte-aux-cailles", "Butte-aux-Cailles", "paris", 48.8281, 2.3525, "neighborhood", 0.72, { local_life: 0.8, art: 0.7, photogenic: 0.7, whimsy: 0.6, history: 0.5, quiet: 0.5, romance: 0.4, nightlife: 0.4 }, { neighborhood: "13th arrondissement", rating: 4.6 }),
	place("paris-parc-de-belleville", "Parc de Belleville", "paris", 48.8708, 2.3847, "viewpoint", 0.7, { photogenic: 1, romance: 0.8, local_life: 0.6, art: 0.5, quiet: 0.5, garden: 0.4, whimsy: 0.3 }, { neighborhood: "Belleville (20th)", rating: 4.5 }),
	place("paris-buttes-chaumont", "Parc des Buttes-Chaumont", "paris", 48.8803, 2.3828, "garden", 0.86, { garden: 0.8, nature: 0.7, photogenic: 0.7, romance: 0.6, local_life: 0.6, whimsy: 0.5, quiet: 0.4 }, { neighborhood: "19th arrondissement", rating: 4.7 }),
	place("paris-musee-vie-romantique", "Musée de la Vie Romantique", "paris", 48.8809, 2.3334, "museum", 0.68, { romance: 0.9, art: 0.8, literature: 0.7, quiet: 0.7, garden: 0.5, history: 0.5, tea: 0.4 }, { neighborhood: "Nouvelle Athènes (9th)", rating: 4.5 }),
	place("paris-musee-jacquemart-andre", "Musée Jacquemart-André", "paris", 48.8754, 2.3105, "museum", 0.8, { art: 1, history: 0.8, architecture: 0.7, quiet: 0.5, romance: 0.3, tea: 0.3 }, { neighborhood: "8th arrondissement", rating: 4.6 }),
	place("paris-musee-nissim-de-camondo", "Musée Nissim de Camondo", "paris", 48.8789, 2.3128, "museum", 0.62, { history: 0.9, art: 0.8, quiet: 0.8, architecture: 0.7, design: 0.5 }, { neighborhood: "Parc Monceau (8th)", rating: 4.7 }),
	place("paris-promenade-plantee", "Promenade Plantée (Coulée Verte René-Dumont)", "paris", 48.8494, 2.3716, "garden", 0.66, { garden: 0.9, quiet: 0.8, nature: 0.6, outdoors: 0.5, photogenic: 0.5, local_life: 0.5, architecture: 0.4 }, { neighborhood: "12th arrondissement", rating: 4.6 }),
	place("paris-canal-saint-martin", "Canal Saint-Martin", "paris", 48.8712, 2.3654, "neighborhood", 0.85, { water: 0.8, local_life: 0.8, romance: 0.6, film: 0.6, photogenic: 0.6, cafes: 0.5, nightlife: 0.4, quiet: 0.3 }, { neighborhood: "10th arrondissement", rating: 4.5 }),
	place("paris-square-du-vert-galant", "Square du Vert-Galant", "paris", 48.8572, 2.34, "garden", 0.74, { romance: 0.9, photogenic: 0.8, water: 0.8, quiet: 0.6, history: 0.4, garden: 0.4 }, { neighborhood: "Île de la Cité", rating: 4.6 }),
	place("paris-pont-de-bir-hakeim", "Pont de Bir-Hakeim", "paris", 48.8556, 2.2876, "bridge", 0.8, { photogenic: 0.9, film: 0.8, romance: 0.7, architecture: 0.7, water: 0.7, history: 0.3, quiet: 0.3 }, { neighborhood: "Passy–Grenelle", rating: 4.7 }),
	place("paris-musee-rodin", "Musée Rodin", "paris", 48.8553, 2.3158, "museum", 0.88, { art: 1, garden: 0.8, romance: 0.5, history: 0.5, architecture: 0.5, quiet: 0.5 }, { neighborhood: "7th arrondissement", rating: 4.7 }),
	place("paris-parc-montsouris", "Parc Montsouris", "paris", 48.8222, 2.3383, "park", 0.62, { garden: 0.9, nature: 0.8, quiet: 0.8, local_life: 0.6, outdoors: 0.4, romance: 0.4 }, { neighborhood: "14th arrondissement", rating: 4.6 }),
	place("paris-villa-leandre", "Villa Léandre", "paris", 48.8884, 2.335, "street", 0.55, { photogenic: 0.8, quiet: 0.8, whimsy: 0.7, architecture: 0.6, history: 0.4, local_life: 0.4 }, { neighborhood: "Montmartre", rating: 4.6 }),
	place("paris-rue-des-thermopyles", "Rue des Thermopyles", "paris", 48.8328, 2.3186, "street", 0.48, { quiet: 0.9, photogenic: 0.8, local_life: 0.6, whimsy: 0.5, garden: 0.5, history: 0.3 }, { neighborhood: "Plaisance (14th)", rating: 4.5 }),
	place("paris-musee-bourdelle", "Musée Bourdelle", "paris", 48.8431, 2.3183, "museum", 0.55, { art: 1, quiet: 0.8, garden: 0.5, history: 0.5, craft: 0.4, architecture: 0.4 }, { neighborhood: "Montparnasse (15th)", rating: 4.6 }),
	place("paris-saint-etienne-du-mont", "Saint-Étienne-du-Mont", "paris", 48.8465, 2.348, "church", 0.72, { architecture: 0.9, spiritual: 0.8, history: 0.8, photogenic: 0.5, quiet: 0.5, film: 0.4, literature: 0.4 }, { neighborhood: "Latin Quarter (5th)", rating: 4.7 }),
	place("paris-place-dauphine", "Place Dauphine", "paris", 48.8564, 2.3422, "square", 0.66, { history: 0.8, architecture: 0.7, quiet: 0.7, local_life: 0.6, romance: 0.6, photogenic: 0.4, cafes: 0.4 }, { neighborhood: "Île de la Cité", rating: 4.6 }),
	place("paris-galerie-vivienne", "Galerie Vivienne", "paris", 48.8667, 2.3397, "street", 0.78, { shopping: 0.9, architecture: 0.7, photogenic: 0.7, history: 0.6, design: 0.5, quiet: 0.4, romance: 0.3 }, { neighborhood: "2nd arrondissement", rating: 4.6 }),
	place("paris-musee-marmottan-monet", "Musée Marmottan Monet", "paris", 48.8592, 2.2675, "museum", 0.78, { art: 1, history: 0.6, architecture: 0.6, quiet: 0.6, garden: 0.3, romance: 0.3 }, { neighborhood: "Passy (16th)", rating: 4.7 }),
	place("paris-marche-daligre", "Marché d'Aligre", "paris", 48.849, 2.3784, "market", 0.7, { markets: 1, local_life: 0.9, food_street: 0.7, shopping: 0.4, wine: 0.3, cafes: 0.3 }, { neighborhood: "12th arrondissement", rating: 4.5 }),
	place("paris-cafe-de-la-butte-douce", "Café de la Butte Douce", "paris", 48.8276, 2.3518, "cafe", 0.55, { cafes: 0.9, local_life: 0.8, quiet: 0.5, art: 0.3, whimsy: 0.3 }, { neighborhood: "Butte-aux-Cailles", rating: 4.5, priceLevel: 2 }),
	place("paris-comptoir-des-ecluses", "Le Comptoir des Écluses", "paris", 48.8716, 2.366, "cafe", 0.6, { cafes: 0.9, local_life: 0.7, water: 0.4, film: 0.3, romance: 0.3 }, { neighborhood: "Canal Saint-Martin", rating: 4.4, priceLevel: 2 }),
	place("paris-salon-de-the-pivoine", "Salon de Thé Pivoine", "paris", 48.8805, 2.3345, "cafe", 0.5, { tea: 0.9, cafes: 0.7, romance: 0.6, quiet: 0.6, garden: 0.4, literature: 0.3 }, { neighborhood: "Nouvelle Athènes (9th)", rating: 4.6, priceLevel: 2 }),
	place("paris-bistrot-des-glycines", "Bistrot des Glycines", "paris", 48.8331, 2.3195, "restaurant", 0.55, { local_life: 0.8, food_street: 0.6, wine: 0.6, romance: 0.4, quiet: 0.4, food_fine: 0.3 }, { neighborhood: "Plaisance (14th)", rating: 4.5, priceLevel: 2 }),
	place("paris-la-cave-aux-merles", "La Cave aux Merles", "paris", 48.8718, 2.3792, "restaurant", 0.6, { wine: 1, local_life: 0.7, food_street: 0.6, nightlife: 0.5, design: 0.2 }, { neighborhood: "Belleville", rating: 4.6, priceLevel: 3 }),
	place("paris-maison-vermeil", "Maison Vermeil", "paris", 48.8628, 2.3612, "restaurant", 0.62, { food_fine: 1, wine: 0.7, design: 0.5, romance: 0.5 }, { neighborhood: "Haut-Marais (3rd)", rating: 4.7, priceLevel: 4 }),
	place("paris-creperie-du-phare-gris", "Crêperie du Phare Gris", "paris", 48.8418, 2.3238, "restaurant", 0.5, { food_street: 0.9, local_life: 0.7, cafes: 0.3, whimsy: 0.3, coast: 0.2 }, { neighborhood: "Montparnasse", rating: 4.4, priceLevel: 1 }),
	place("paris-caveau-des-sept-marches", "Le Caveau des Sept Marches", "paris", 48.8522, 2.3455, "bar", 0.6, { jazz: 1, music: 0.9, nightlife: 0.8, history: 0.4, romance: 0.4 }, { neighborhood: "Latin Quarter (5th)", rating: 4.6, priceLevel: 2 }),
	place("paris-le-zinc-perche", "Le Zinc Perché", "paris", 48.8279, 2.3512, "bar", 0.5, { nightlife: 0.8, local_life: 0.8, wine: 0.5, music: 0.3, whimsy: 0.3 }, { neighborhood: "Butte-aux-Cailles", rating: 4.4, priceLevel: 2 }),

	// Giverny (day trip from Paris, ~65 km): Monet's crowded gardens and quieter corners
	place("giverny-monet-house-and-gardens", "Monet's House and Gardens", "giverny", 49.0752, 1.534, "garden", 0.98, { garden: 1, art: 0.9, photogenic: 0.9, romance: 0.7, water: 0.6, nature: 0.5 }, { rating: 4.6 }),
	place("giverny-musee-des-impressionnismes", "Musée des Impressionnismes Giverny", "giverny", 49.0763, 1.5313, "museum", 0.72, { art: 1, garden: 0.6, quiet: 0.5, history: 0.4, nature: 0.3 }, { rating: 4.4 }),
	place("giverny-sainte-radegonde", "Église Sainte-Radegonde (Monet's grave)", "giverny", 49.0775, 1.5236, "church", 0.55, { quiet: 0.8, history: 0.6, art: 0.5, spiritual: 0.5, garden: 0.3 }, { rating: 4.4 }),

	// Provins (day trip from Paris, ~77 km): medieval fair town
	place("provins-tour-cesar", "Tour César", "provins", 48.5603, 3.29, "castle", 0.8, { history: 1, architecture: 0.8, photogenic: 0.6, whimsy: 0.4 }, { neighborhood: "Ville Haute", rating: 4.5 }),
	place("provins-ramparts", "Ramparts and Porte Saint-Jean", "provins", 48.563, 3.2815, "landmark", 0.72, { history: 0.9, architecture: 0.7, photogenic: 0.6, quiet: 0.5, outdoors: 0.3 }, { neighborhood: "Ville Haute", rating: 4.6 }),
	place("provins-saint-quiriace", "Collégiale Saint-Quiriace", "provins", 48.5608, 3.2917, "church", 0.55, { history: 0.8, architecture: 0.8, spiritual: 0.7, quiet: 0.7 }, { neighborhood: "Ville Haute", rating: 4.5 }),
	place("provins-underground-passages", "Provins Underground Passages", "provins", 48.5594, 3.2965, "landmark", 0.6, { history: 0.8, whimsy: 0.6, quiet: 0.5, architecture: 0.3 }, { neighborhood: "Ville Basse", rating: 4.3 }),

	// Auvers-sur-Oise (day trip from Paris, ~27 km): Van Gogh's last village
	place("auvers-sur-oise-notre-dame", "Church of Notre-Dame d'Auvers", "auvers-sur-oise", 49.072, 2.1762, "church", 0.72, { art: 0.9, photogenic: 0.7, history: 0.6, quiet: 0.6, spiritual: 0.5, romance: 0.3 }, { rating: 4.5 }),
	place("auvers-sur-oise-maison-de-van-gogh", "Maison de Van Gogh", "auvers-sur-oise", 49.0707, 2.1715, "museum", 0.75, { art: 1, history: 0.8, quiet: 0.4, literature: 0.3 }, { rating: 4.5 }),
	place("auvers-sur-oise-wheat-fields", "Wheat fields and Van Gogh's grave", "auvers-sur-oise", 49.0748, 2.179, "trail", 0.6, { art: 0.8, nature: 0.8, quiet: 0.8, history: 0.5, outdoors: 0.4 }, { rating: 4.5 }),
	place("auvers-sur-oise-maison-atelier-daubigny", "Maison-Atelier de Daubigny", "auvers-sur-oise", 49.0705, 2.1635, "museum", 0.45, { art: 0.9, quiet: 0.9, history: 0.6, craft: 0.3 }, { rating: 4.6 }),
	place("auvers-sur-oise-chateau", "Château d'Auvers", "auvers-sur-oise", 49.0695, 2.1668, "castle", 0.55, { history: 0.7, garden: 0.6, art: 0.6, quiet: 0.6, architecture: 0.5 }, { rating: 4.1 }),

	// Chantilly (day trip from Paris, ~39 km): château, stables and forest
	place("chantilly-chateau-musee-conde", "Château de Chantilly (Musée Condé)", "chantilly", 49.1939, 2.4858, "palace", 0.88, { art: 0.9, history: 0.9, architecture: 0.9, garden: 0.6, photogenic: 0.6, romance: 0.5 }, { rating: 4.7 }),
	place("chantilly-great-stables", "Great Stables (Musée du Cheval)", "chantilly", 49.1937, 2.48, "museum", 0.72, { architecture: 0.8, history: 0.8, art: 0.4, whimsy: 0.3, quiet: 0.3 }, { rating: 4.6 }),
	place("chantilly-hameau", "Le Hameau and Anglo-Chinese Garden", "chantilly", 49.1965, 2.4925, "garden", 0.58, { garden: 0.9, romance: 0.7, quiet: 0.7, nature: 0.6, whimsy: 0.5 }, { rating: 4.6 }),
	place("chantilly-etangs-de-commelles", "Étangs de Commelles", "chantilly", 49.1573, 2.4947, "lake", 0.45, { nature: 0.9, quiet: 0.9, water: 0.8, outdoors: 0.6, romance: 0.4, whimsy: 0.3 }, { neighborhood: "Forest of Chantilly", rating: 4.6 }),

	// Fontainebleau (day trip from Paris, ~56 km): royal château and forest
	place("fontainebleau-chateau", "Château de Fontainebleau", "fontainebleau", 48.4022, 2.7006, "palace", 0.92, { history: 1, architecture: 1, art: 0.8, photogenic: 0.7, garden: 0.5 }, { rating: 4.7 }),
	place("fontainebleau-grand-parterre", "Grand Parterre and Jardin Anglais", "fontainebleau", 48.4015, 2.7045, "garden", 0.7, { garden: 1, quiet: 0.6, history: 0.5, romance: 0.5, water: 0.4, nature: 0.4 }, { rating: 4.6 }),
	place("fontainebleau-gorges-de-franchard", "Gorges de Franchard", "fontainebleau", 48.4105, 2.633, "trail", 0.55, { nature: 1, outdoors: 0.9, quiet: 0.8, photogenic: 0.5, mountains: 0.3 }, { neighborhood: "Forest of Fontainebleau", rating: 4.7 }),

	// Senlis (day trip from Paris, ~43 km): quiet Gothic town
	place("senlis-cathedral", "Senlis Cathedral", "senlis", 49.2068, 2.586, "church", 0.68, { spiritual: 0.9, architecture: 0.9, history: 0.9, quiet: 0.6, photogenic: 0.5 }, { rating: 4.6 }),
	place("senlis-old-town", "Senlis medieval old town", "senlis", 49.206, 2.588, "neighborhood", 0.6, { history: 0.9, quiet: 0.8, architecture: 0.6, photogenic: 0.6, local_life: 0.6, film: 0.4 }, { rating: 4.6 }),
	place("senlis-chateau-royal", "Château Royal de Senlis", "senlis", 49.2074, 2.5842, "castle", 0.48, { history: 0.9, quiet: 0.8, architecture: 0.5, garden: 0.5 }, { rating: 4.3 }),

	// Rouen (day trip from Paris, ~112 km): Monet's cathedral and half-timbered lanes
	place("rouen-cathedral", "Rouen Cathedral", "rouen", 49.4402, 1.095, "church", 0.88, { architecture: 1, history: 0.9, spiritual: 0.8, photogenic: 0.7, art: 0.6 }, { rating: 4.7 }),
	place("rouen-gros-horloge", "Gros-Horloge", "rouen", 49.4416, 1.0912, "landmark", 0.82, { history: 0.9, photogenic: 0.8, architecture: 0.8, whimsy: 0.4, local_life: 0.4 }, { rating: 4.6 }),
	place("rouen-aitre-saint-maclou", "Aître Saint-Maclou", "rouen", 49.4403, 1.0999, "landmark", 0.62, { history: 0.9, architecture: 0.7, quiet: 0.7, art: 0.4, spiritual: 0.4 }, { rating: 4.5 }),
	place("rouen-musee-des-beaux-arts", "Musée des Beaux-Arts de Rouen", "rouen", 49.4447, 1.0947, "museum", 0.7, { art: 1, history: 0.6, quiet: 0.6, architecture: 0.4 }, { rating: 4.6 }),
	place("rouen-place-du-vieux-marche", "Place du Vieux-Marché", "rouen", 49.4428, 1.088, "square", 0.75, { history: 0.8, local_life: 0.6, architecture: 0.6, markets: 0.6, food_street: 0.4, spiritual: 0.4 }, { rating: 4.4 }),

	// Barcelona: crowded icons, quieter twins, food and drink
	place("barcelona-sagrada-familia", "Sagrada Família", "barcelona", 41.4037, 2.1743, "church", 0.999, { architecture: 1, photogenic: 0.9, spiritual: 0.8, art: 0.7, design: 0.6, whimsy: 0.4 }, { neighborhood: "Eixample", rating: 4.8 }),
	place("barcelona-park-guell", "Park Güell", "barcelona", 41.4136, 2.1528, "garden", 0.995, { whimsy: 1, photogenic: 0.9, architecture: 0.8, garden: 0.7, art: 0.6, nature: 0.3 }, { neighborhood: "La Salut (Gràcia)", rating: 4.5 }),
	place("barcelona-casa-batllo", "Casa Batlló", "barcelona", 41.3916, 2.1649, "landmark", 0.992, { architecture: 1, whimsy: 0.8, design: 0.8, photogenic: 0.8, art: 0.7 }, { neighborhood: "Passeig de Gràcia", rating: 4.7 }),
	place("barcelona-la-rambla", "La Rambla", "barcelona", 41.381, 2.1734, "street", 0.995, { shopping: 0.6, photogenic: 0.6, history: 0.5, local_life: 0.5, nightlife: 0.5, markets: 0.4, food_street: 0.4, music: 0.3 }, { neighborhood: "Ciutat Vella", rating: 4.1 }),
	place("barcelona-barri-gotic", "Gothic Quarter (Barri Gòtic)", "barcelona", 41.3828, 2.1769, "neighborhood", 0.993, { history: 1, architecture: 0.8, photogenic: 0.7, romance: 0.5, spiritual: 0.4, nightlife: 0.4, shopping: 0.3 }, { neighborhood: "Ciutat Vella", rating: 4.7 }),
	place("barcelona-la-boqueria", "La Boqueria", "barcelona", 41.3819, 2.1719, "market", 0.99, { markets: 1, food_street: 0.9, photogenic: 0.6, local_life: 0.3 }, { neighborhood: "El Raval", rating: 4.4 }),
	place("barcelona-casa-mila", "Casa Milà (La Pedrera)", "barcelona", 41.3953, 2.1617, "landmark", 0.985, { architecture: 1, design: 0.8, photogenic: 0.7, art: 0.6, whimsy: 0.6 }, { neighborhood: "Passeig de Gràcia", rating: 4.6 }),
	place("barcelona-sant-pau", "Recinte Modernista de Sant Pau", "barcelona", 41.4116, 2.1744, "landmark", 0.8, { architecture: 1, art: 0.7, photogenic: 0.7, design: 0.6, quiet: 0.6, garden: 0.5, history: 0.5 }, { neighborhood: "El Guinardó", rating: 4.7 }),
	place("barcelona-laberint-dhorta", "Parc del Laberint d'Horta", "barcelona", 41.4403, 2.1456, "garden", 0.66, { garden: 1, whimsy: 0.8, quiet: 0.7, romance: 0.6, nature: 0.6, photogenic: 0.6, history: 0.5 }, { neighborhood: "Horta", rating: 4.6 }),
	place("barcelona-bunkers-del-carmel", "Bunkers del Carmel", "barcelona", 41.4193, 2.1617, "viewpoint", 0.93, { photogenic: 1, romance: 0.6, history: 0.5, outdoors: 0.4, nature: 0.3, local_life: 0.3 }, { neighborhood: "El Carmel", rating: 4.7 }),
	place("barcelona-placa-del-sol", "Plaça del Sol", "barcelona", 41.4008, 2.1567, "square", 0.75, { local_life: 0.9, nightlife: 0.8, cafes: 0.5, food_street: 0.4, music: 0.3 }, { neighborhood: "Gràcia", rating: 4.4 }),
	place("barcelona-rambla-del-poblenou", "Rambla del Poblenou", "barcelona", 41.4005, 2.2005, "street", 0.62, { local_life: 0.9, cafes: 0.6, shopping: 0.5, quiet: 0.5, history: 0.4, food_street: 0.4, photogenic: 0.4, nightlife: 0.3 }, { neighborhood: "Poblenou", rating: 4.5 }),
	place("barcelona-santa-maria-del-mar", "Santa Maria del Mar", "barcelona", 41.3836, 2.1819, "church", 0.86, { spiritual: 0.9, architecture: 0.9, history: 0.9, photogenic: 0.6, quiet: 0.5, music: 0.3 }, { neighborhood: "El Born", rating: 4.8 }),
	place("barcelona-el-born", "El Born", "barcelona", 41.385, 2.183, "neighborhood", 0.88, { history: 0.8, nightlife: 0.7, architecture: 0.6, local_life: 0.6, shopping: 0.6, food_street: 0.5, photogenic: 0.5 }, { neighborhood: "La Ribera", rating: 4.6 }),
	place("barcelona-mercat-de-sant-antoni", "Mercat de Sant Antoni", "barcelona", 41.3786, 2.1621, "market", 0.7, { markets: 1, food_street: 0.8, local_life: 0.8, architecture: 0.4, literature: 0.3 }, { neighborhood: "Sant Antoni", rating: 4.5 }),
	place("barcelona-montjuic-castle", "Montjuïc Castle", "barcelona", 41.3633, 2.1661, "castle", 0.82, { history: 0.9, photogenic: 0.8, outdoors: 0.5, quiet: 0.5, nature: 0.4, coast: 0.4 }, { neighborhood: "Montjuïc", rating: 4.4 }),
	place("barcelona-palau-de-la-musica", "Palau de la Música Catalana", "barcelona", 41.3875, 2.1756, "landmark", 0.9, { architecture: 1, music: 0.9, art: 0.7, photogenic: 0.7, design: 0.6, history: 0.5 }, { neighborhood: "Sant Pere", rating: 4.8 }),
	place("barcelona-casa-vicens", "Casa Vicens", "barcelona", 41.4036, 2.1508, "landmark", 0.78, { architecture: 1, whimsy: 0.8, design: 0.7, photogenic: 0.7, art: 0.6, quiet: 0.5, garden: 0.4 }, { neighborhood: "Gràcia", rating: 4.6 }),
	place("barcelona-sant-andreu", "Sant Andreu old town", "barcelona", 41.4355, 2.1902, "neighborhood", 0.45, { local_life: 0.9, history: 0.8, quiet: 0.7, architecture: 0.6, photogenic: 0.4, spiritual: 0.3, markets: 0.3 }, { neighborhood: "Sant Andreu de Palomar", rating: 4.4 }),
	place("barcelona-mercat-de-la-llibertat", "Mercat de la Llibertat", "barcelona", 41.3997, 2.1536, "market", 0.55, { markets: 1, local_life: 0.9, food_street: 0.8, architecture: 0.5, quiet: 0.4 }, { neighborhood: "Gràcia", rating: 4.5 }),
	place("barcelona-cafe-llimona-i-mel", "Cafè Llimona i Mel", "barcelona", 41.4015, 2.158, "cafe", 0.55, { cafes: 0.9, local_life: 0.7, quiet: 0.5, design: 0.3 }, { neighborhood: "Gràcia", rating: 4.6, priceLevel: 2 }),
	place("barcelona-forn-de-les-rajoles", "Forn de les Rajoles", "barcelona", 41.3792, 2.1612, "cafe", 0.5, { cafes: 0.8, local_life: 0.8, food_street: 0.5 }, { neighborhood: "Sant Antoni", rating: 4.5, priceLevel: 1 }),
	place("barcelona-cafe-ones-lentes", "Cafè Ones Lentes", "barcelona", 41.399, 2.203, "cafe", 0.45, { cafes: 0.8, quiet: 0.6, local_life: 0.5, coast: 0.4, design: 0.4 }, { neighborhood: "Poblenou", rating: 4.5, priceLevel: 2 }),
	place("barcelona-bodega-els-tres-bocois", "Bodega Els Tres Bocois", "barcelona", 41.3795, 2.164, "restaurant", 0.6, { food_street: 0.9, local_life: 0.8, wine: 0.6, nightlife: 0.4, markets: 0.3 }, { neighborhood: "Sant Antoni", rating: 4.5, priceLevel: 2 }),
	place("barcelona-arrossos-de-la-vela-rosa", "Arrossos de la Vela Rosa", "barcelona", 41.3965, 2.2045, "restaurant", 0.58, { food_street: 0.7, coast: 0.6, local_life: 0.6, food_fine: 0.4, wine: 0.4 }, { neighborhood: "Poblenou", rating: 4.5, priceLevel: 3 }),
	place("barcelona-taula-de-fil", "Taula de Fil", "barcelona", 41.393, 2.1595, "restaurant", 0.62, { food_fine: 1, wine: 0.7, design: 0.6, art: 0.3 }, { neighborhood: "Eixample", rating: 4.7, priceLevel: 4 }),
	place("barcelona-menjador-del-pati", "Menjador del Pati", "barcelona", 41.4025, 2.1595, "restaurant", 0.5, { local_life: 0.9, food_street: 0.8, quiet: 0.4, wine: 0.3 }, { neighborhood: "Gràcia", rating: 4.4, priceLevel: 1 }),
	place("barcelona-sota-volta-jazz", "Sota Volta Jazz", "barcelona", 41.3845, 2.1812, "bar", 0.58, { jazz: 1, music: 0.9, nightlife: 0.8, history: 0.4, romance: 0.3 }, { neighborhood: "El Born", rating: 4.6, priceLevel: 2 }),
	place("barcelona-el-terrat-industrial", "El Terrat Industrial", "barcelona", 41.403, 2.1985, "bar", 0.5, { nightlife: 0.8, design: 0.6, local_life: 0.6, music: 0.3, wine: 0.3 }, { neighborhood: "Poblenou", rating: 4.4, priceLevel: 2 }),

	// Girona (Spanish twin of Barcelona): medieval river city
	place("girona-cathedral", "Girona Cathedral", "girona", 41.9875, 2.8264, "church", 0.86, { architecture: 0.9, history: 0.9, spiritual: 0.8, photogenic: 0.7, film: 0.6 }, { neighborhood: "Barri Vell", rating: 4.7 }),
	place("girona-cases-de-lonyar", "Cases de l'Onyar", "girona", 41.984, 2.824, "viewpoint", 0.84, { photogenic: 1, water: 0.8, architecture: 0.6, romance: 0.6, history: 0.4 }, { neighborhood: "Barri Vell", rating: 4.7 }),
	place("girona-el-call", "El Call (Jewish Quarter)", "girona", 41.9862, 2.8254, "neighborhood", 0.78, { history: 1, photogenic: 0.6, quiet: 0.6, architecture: 0.6, romance: 0.4, spiritual: 0.4 }, { neighborhood: "Barri Vell", rating: 4.7 }),
	place("girona-passeig-de-la-muralla", "Passeig de la Muralla", "girona", 41.9845, 2.8285, "trail", 0.72, { history: 0.8, photogenic: 0.7, quiet: 0.6, architecture: 0.5, outdoors: 0.5 }, { neighborhood: "Barri Vell", rating: 4.6 }),
	place("girona-banys-arabs", "Banys Àrabs", "girona", 41.9882, 2.8257, "landmark", 0.7, { history: 0.9, architecture: 0.8, quiet: 0.5 }, { neighborhood: "Barri Vell", rating: 4.3 }),
	place("girona-sant-feliu", "Basilica of Sant Feliu", "girona", 41.988, 2.8245, "church", 0.6, { spiritual: 0.8, history: 0.8, architecture: 0.7, quiet: 0.7 }, { neighborhood: "Barri Vell", rating: 4.6 }),
	place("girona-cafe-del-pont-vermell", "Cafè del Pont Vermell", "girona", 41.9835, 2.8235, "cafe", 0.5, { cafes: 0.9, local_life: 0.6, quiet: 0.5, water: 0.4 }, { neighborhood: "Mercadal", rating: 4.5, priceLevel: 2 }),
	place("girona-fogons-del-galligants", "Fogons del Galligants", "girona", 41.989, 2.827, "restaurant", 0.58, { food_fine: 0.8, wine: 0.7, local_life: 0.4, history: 0.3 }, { neighborhood: "Sant Pere de Galligants", rating: 4.6, priceLevel: 3 }),

	// Tarragona (Spanish twin of Barcelona): Roman city on the sea
	place("tarragona-amphitheatre", "Tarragona Amphitheatre", "tarragona", 41.1147, 1.2593, "landmark", 0.86, { history: 1, photogenic: 0.8, coast: 0.7, architecture: 0.6 }, { rating: 4.6 }),
	place("tarragona-cathedral", "Tarragona Cathedral", "tarragona", 41.1192, 1.2581, "church", 0.75, { architecture: 0.9, history: 0.9, spiritual: 0.8, quiet: 0.5, garden: 0.3 }, { neighborhood: "Part Alta", rating: 4.6 }),
	place("tarragona-roman-circus", "Roman Circus and Praetorium", "tarragona", 41.117, 1.2575, "landmark", 0.7, { history: 1, architecture: 0.6, photogenic: 0.5, quiet: 0.5 }, { neighborhood: "Part Alta", rating: 4.5 }),
	place("tarragona-balco-del-mediterrani", "Balcó del Mediterrani", "tarragona", 41.1137, 1.2566, "viewpoint", 0.72, { coast: 0.9, photogenic: 0.8, romance: 0.6, local_life: 0.4, quiet: 0.4 }, { rating: 4.6 }),
	place("tarragona-part-alta", "Part Alta (old town)", "tarragona", 41.118, 1.256, "neighborhood", 0.7, { history: 0.9, local_life: 0.7, architecture: 0.6, quiet: 0.6, nightlife: 0.3 }, { neighborhood: "Part Alta", rating: 4.6 }),
	place("tarragona-pont-del-diable", "Pont del Diable (Les Ferreres Aqueduct)", "tarragona", 41.1467, 1.2436, "landmark", 0.68, { history: 1, quiet: 0.8, architecture: 0.8, nature: 0.6, photogenic: 0.6 }, { rating: 4.5 }),
	place("tarragona-taverna-xarxa-blava", "Taverna Xarxa Blava", "tarragona", 41.1095, 1.24, "restaurant", 0.55, { food_street: 0.8, coast: 0.7, local_life: 0.7, wine: 0.3 }, { neighborhood: "El Serrallo", rating: 4.5, priceLevel: 2 }),

	// Zaragoza (Spanish twin of Barcelona): basilicas, Mudéjar palace and tapas lanes
	place("zaragoza-basilica-del-pilar", "Basilica of Our Lady of the Pillar", "zaragoza", 41.6569, -0.8783, "church", 0.9, { spiritual: 1, architecture: 0.9, history: 0.8, photogenic: 0.8, art: 0.6 }, { neighborhood: "Casco Histórico", rating: 4.8 }),
	place("zaragoza-aljaferia", "Aljafería Palace", "zaragoza", 41.6565, -0.8968, "palace", 0.82, { history: 1, architecture: 1, art: 0.6, quiet: 0.4, garden: 0.3 }, { rating: 4.6 }),
	place("zaragoza-la-seo", "La Seo Cathedral", "zaragoza", 41.6546, -0.8759, "church", 0.72, { architecture: 0.9, history: 0.9, spiritual: 0.8, art: 0.5, quiet: 0.5 }, { neighborhood: "Casco Histórico", rating: 4.7 }),
	place("zaragoza-el-tubo", "El Tubo tapas lanes", "zaragoza", 41.6525, -0.879, "street", 0.78, { food_street: 1, local_life: 0.8, nightlife: 0.7, wine: 0.5 }, { neighborhood: "Casco Histórico", rating: 4.5 }),
	place("zaragoza-puente-de-piedra", "Puente de Piedra", "zaragoza", 41.6572, -0.8753, "bridge", 0.68, { photogenic: 0.8, water: 0.7, history: 0.7, architecture: 0.5, romance: 0.4 }, { rating: 4.6 }),
	place("zaragoza-mercado-central", "Mercado Central de Zaragoza", "zaragoza", 41.6561, -0.8829, "market", 0.65, { markets: 1, food_street: 0.8, local_life: 0.8, architecture: 0.5 }, { neighborhood: "Casco Histórico", rating: 4.4 }),
	place("zaragoza-bodeguilla-del-cierzo", "Bodeguilla del Cierzo", "zaragoza", 41.6528, -0.8795, "bar", 0.5, { wine: 0.8, local_life: 0.7, food_street: 0.6, nightlife: 0.6 }, { neighborhood: "El Tubo", rating: 4.5, priceLevel: 2 }),

	// Cádiz (Spanish twin of Barcelona): Atlantic port city
	place("cadiz-cathedral", "Cádiz Cathedral", "cadiz", 36.5291, -6.2953, "church", 0.85, { architecture: 0.9, spiritual: 0.8, history: 0.8, photogenic: 0.8, coast: 0.5 }, { rating: 4.6 }),
	place("cadiz-la-caleta", "Playa de la Caleta", "cadiz", 36.5318, -6.306, "beach", 0.8, { coast: 1, photogenic: 0.8, local_life: 0.7, romance: 0.6, history: 0.4, film: 0.3 }, { neighborhood: "La Viña", rating: 4.6 }),
	place("cadiz-barrio-de-la-vina", "Barrio de la Viña", "cadiz", 36.5308, -6.3025, "neighborhood", 0.65, { local_life: 1, food_street: 0.8, music: 0.6, nightlife: 0.5, coast: 0.4 }, { neighborhood: "La Viña", rating: 4.6 }),
	place("cadiz-mercado-central", "Mercado Central de Abastos", "cadiz", 36.5335, -6.2975, "market", 0.72, { markets: 1, food_street: 0.9, local_life: 0.8, coast: 0.3 }, { rating: 4.6 }),
	place("cadiz-torre-tavira", "Torre Tavira", "cadiz", 36.532, -6.2984, "viewpoint", 0.66, { photogenic: 0.8, history: 0.7, coast: 0.5, whimsy: 0.4 }, { rating: 4.5 }),
	place("cadiz-castillo-de-san-sebastian", "Castillo de San Sebastián", "cadiz", 36.5281, -6.3156, "castle", 0.55, { coast: 0.9, history: 0.8, photogenic: 0.7, quiet: 0.6, romance: 0.4 }, { rating: 4.5 }),
	place("cadiz-freiduria-la-ola-chica", "Freiduría La Ola Chica", "cadiz", 36.5302, -6.2995, "restaurant", 0.55, { food_street: 1, local_life: 0.8, coast: 0.5 }, { rating: 4.5, priceLevel: 1 }),
	place("cadiz-bar-compas-de-la-vina", "Bar Compás de la Viña", "cadiz", 36.5305, -6.3015, "bar", 0.48, { music: 0.8, local_life: 0.7, nightlife: 0.7, wine: 0.4 }, { neighborhood: "La Viña", rating: 4.5, priceLevel: 1 }),

	// Valencia (busy Spanish twin of Barcelona): futurist architecture, rice and markets
	place("valencia-city-of-arts-and-sciences", "City of Arts and Sciences", "valencia", 39.4542, -0.35, "landmark", 0.97, { architecture: 1, design: 1, photogenic: 0.9, water: 0.5, art: 0.3 }, { neighborhood: "Quatre Carreres", rating: 4.7 }),
	place("valencia-mercado-central", "Mercado Central", "valencia", 39.4735, -0.3789, "market", 0.94, { markets: 1, food_street: 0.9, architecture: 0.6, local_life: 0.6, photogenic: 0.5 }, { neighborhood: "Ciutat Vella", rating: 4.7 }),
	place("valencia-lonja-de-la-seda", "La Lonja de la Seda", "valencia", 39.4744, -0.3784, "landmark", 0.84, { history: 1, architecture: 1, photogenic: 0.6, quiet: 0.3 }, { neighborhood: "Ciutat Vella", rating: 4.7 }),
	place("valencia-jardi-del-turia", "Jardí del Túria", "valencia", 39.4801, -0.3861, "park", 0.82, { outdoors: 0.8, garden: 0.8, local_life: 0.7, nature: 0.6, quiet: 0.4 }, { rating: 4.8 }),
	place("valencia-el-cabanyal", "El Cabanyal", "valencia", 39.4689, -0.3328, "neighborhood", 0.62, { local_life: 0.9, coast: 0.8, architecture: 0.6, food_street: 0.6, photogenic: 0.5, quiet: 0.5 }, { neighborhood: "Poblats Marítims", rating: 4.5 }),
	place("valencia-russafa", "Russafa", "valencia", 39.4625, -0.3719, "neighborhood", 0.72, { nightlife: 0.8, local_life: 0.8, cafes: 0.7, design: 0.5, art: 0.4, markets: 0.4 }, { neighborhood: "L'Eixample", rating: 4.6 }),
	place("valencia-orxateria-la-xufa-daurada", "Orxateria la Xufa Daurada", "valencia", 39.474, -0.377, "cafe", 0.5, { cafes: 0.8, local_life: 0.7, food_street: 0.5, history: 0.2 }, { neighborhood: "Ciutat Vella", rating: 4.5, priceLevel: 1 }),
	place("valencia-arrossos-del-cabanyal-vell", "Arrossos del Cabanyal Vell", "valencia", 39.4675, -0.329, "restaurant", 0.55, { food_street: 0.8, coast: 0.7, local_life: 0.6, food_fine: 0.3 }, { neighborhood: "El Cabanyal", rating: 4.6, priceLevel: 2 }),

	// Interlaken: base town between the lakes
	place("interlaken-harder-kulm", "Harder Kulm", "interlaken", 46.6973, 7.8517, "viewpoint", 0.97, { photogenic: 1, mountains: 0.9, water: 0.6, nature: 0.5, romance: 0.4 }, { rating: 4.7 }),
	place("interlaken-hohematte", "Höhematte", "interlaken", 46.6865, 7.858, "park", 0.86, { mountains: 0.7, outdoors: 0.7, photogenic: 0.7, nature: 0.5, local_life: 0.3 }, { neighborhood: "Höheweg", rating: 4.6 }),
	place("interlaken-unspunnen-castle", "Unspunnen Castle ruins", "interlaken", 46.6686, 7.8573, "castle", 0.45, { quiet: 0.9, history: 0.8, nature: 0.6, mountains: 0.4, whimsy: 0.3 }, { neighborhood: "Wilderswil", rating: 4.4 }),
	place("interlaken-cafe-zwischensee", "Café Zwischensee", "interlaken", 46.6855, 7.86, "cafe", 0.55, { cafes: 0.9, local_life: 0.5, quiet: 0.4, mountains: 0.3 }, { neighborhood: "Höheweg", rating: 4.4, priceLevel: 2 }),
	place("interlaken-stubli-zum-bodeli", "Stübli zum Bödeli", "interlaken", 46.688, 7.856, "restaurant", 0.58, { food_street: 0.6, local_life: 0.6, mountains: 0.4, wine: 0.3, craft: 0.2 }, { neighborhood: "Unterseen", rating: 4.5, priceLevel: 3 }),
	place("interlaken-aarequai-fischkuche", "Aarequai Fischküche", "interlaken", 46.6875, 7.85, "restaurant", 0.5, { food_fine: 0.5, wine: 0.5, water: 0.5, local_life: 0.4 }, { neighborhood: "Unterseen", rating: 4.4, priceLevel: 3 }),

	// Lauterbrunnen: crowded waterfall valley
	place("lauterbrunnen-staubbach-falls", "Staubbach Falls", "lauterbrunnen", 46.5896, 7.9055, "waterfall", 0.99, { water: 1, photogenic: 1, mountains: 0.8, nature: 0.8, romance: 0.4, literature: 0.3 }, { rating: 4.7 }),
	place("lauterbrunnen-trummelbach-falls", "Trümmelbach Falls", "lauterbrunnen", 46.5696, 7.9139, "waterfall", 0.95, { water: 1, nature: 0.9, mountains: 0.8, photogenic: 0.6, outdoors: 0.4 }, { rating: 4.6 }),
	place("lauterbrunnen-wengen", "Wengen", "lauterbrunnen", 46.6056, 7.9214, "village", 0.92, { mountains: 0.9, photogenic: 0.8, nature: 0.7, outdoors: 0.7, quiet: 0.4, romance: 0.3 }, { neighborhood: "Wengen", rating: 4.8 }),
	place("lauterbrunnen-stechelberg", "Stechelberg", "lauterbrunnen", 46.545, 7.903, "village", 0.65, { quiet: 0.9, mountains: 0.9, nature: 0.9, water: 0.7, outdoors: 0.6 }, { neighborhood: "Stechelberg", rating: 4.7 }),

	// Grindelwald: crowded gondolas and the Jungfraujoch (reached via the Eiger Express)
	place("grindelwald-first", "Grindelwald First (Cliff Walk)", "grindelwald", 46.6608, 8.0547, "viewpoint", 0.99, { mountains: 1, photogenic: 0.9, outdoors: 0.8, nature: 0.6, whimsy: 0.3 }, { neighborhood: "First", rating: 4.7 }),
	place("grindelwald-bachalpsee", "Bachalpsee", "grindelwald", 46.6694, 8.0225, "lake", 0.97, { mountains: 1, photogenic: 1, water: 0.9, nature: 0.8, outdoors: 0.6, romance: 0.3 }, { neighborhood: "First", rating: 4.9 }),
	place("grindelwald-jungfraujoch", "Jungfraujoch", "grindelwald", 46.5475, 7.985, "viewpoint", 0.995, { mountains: 1, photogenic: 0.9, nature: 0.7, outdoors: 0.4, history: 0.3 }, { neighborhood: "Jungfraujoch (via the Eiger Express)", rating: 4.6 }),
	place("grindelwald-glacier-canyon", "Glacier Canyon (Gletscherschlucht)", "grindelwald", 46.61, 8.0515, "trail", 0.8, { water: 0.9, nature: 0.9, mountains: 0.7, outdoors: 0.5, whimsy: 0.3 }, { neighborhood: "Grund", rating: 4.5 }),

	// Iseltwald: tiny lakeside village whose K-drama pier is overcrowded (quiet lakeside trail listed under Brienz)
	place("iseltwald-lakeside-pier", "Iseltwald lakeside pier", "iseltwald", 46.7105, 7.9635, "landmark", 0.97, { water: 1, photogenic: 1, film: 0.9, romance: 0.8, mountains: 0.5 }, { rating: 4.4 }),

	// Kandersteg (day trip from Interlaken, ~26 km): alpine lakes
	place("kandersteg-oeschinensee", "Oeschinensee", "kandersteg", 46.4983, 7.7269, "lake", 0.95, { water: 1, mountains: 1, photogenic: 1, nature: 0.9, outdoors: 0.7, romance: 0.3 }, { rating: 4.9 }),
	place("kandersteg-blausee", "Blausee", "kandersteg", 46.5325, 7.6647, "lake", 0.8, { water: 1, nature: 0.9, photogenic: 0.9, romance: 0.5, whimsy: 0.4, quiet: 0.4 }, { neighborhood: "Kandergrund", rating: 4.5 }),
	place("kandersteg-gasterntal", "Gasterntal", "kandersteg", 46.46, 7.71, "trail", 0.5, { quiet: 1, nature: 1, mountains: 0.9, outdoors: 0.8, water: 0.6 }, { neighborhood: "Gastern valley", rating: 4.8 }),

	// Lötschental (day trip from Interlaken, ~32 km): remote Valais valley (Wiler, Kippel, Fafleralp)
	place("lotschental-wiler", "Wiler", "lotschental", 46.4042, 7.7839, "village", 0.5, { quiet: 0.9, mountains: 0.8, nature: 0.7, local_life: 0.6, history: 0.5 }, { neighborhood: "Wiler", rating: 4.6 }),
	place("lotschental-lauchernalp", "Lauchernalp", "lotschental", 46.411, 7.7742, "viewpoint", 0.55, { mountains: 1, outdoors: 0.9, nature: 0.8, photogenic: 0.8, quiet: 0.7 }, { neighborhood: "Wiler", rating: 4.8 }),
	place("lotschental-fafleralp", "Fafleralp and Grundsee", "lotschental", 46.4351, 7.8548, "lake", 0.48, { mountains: 1, nature: 1, quiet: 0.9, water: 0.8, photogenic: 0.7, outdoors: 0.7 }, { neighborhood: "Fafleralp", rating: 4.8 }),
	place("lotschental-museum", "Lötschentaler Museum", "lotschental", 46.4003, 7.7719, "museum", 0.4, { craft: 0.9, history: 0.9, quiet: 0.8, whimsy: 0.6, art: 0.4 }, { neighborhood: "Kippel", rating: 4.5 }),

	// Engelberg (day trip from Interlaken, ~44 km): crowded Titlis, quieter lakes and abbey
	place("engelberg-titlis", "Titlis (Rotair and Cliff Walk)", "engelberg", 46.7735, 8.428, "viewpoint", 0.96, { mountains: 1, photogenic: 0.9, outdoors: 0.6, nature: 0.6, whimsy: 0.3 }, { rating: 4.6 }),
	place("engelberg-trubsee", "Trübsee", "engelberg", 46.7939, 8.3908, "lake", 0.68, { mountains: 1, water: 0.8, nature: 0.8, outdoors: 0.7, photogenic: 0.7, quiet: 0.6 }, { rating: 4.7 }),
	place("engelberg-abbey", "Engelberg Abbey", "engelberg", 46.8206, 8.4097, "church", 0.62, { spiritual: 0.9, history: 0.8, quiet: 0.7, architecture: 0.6, craft: 0.4, music: 0.3 }, { rating: 4.6 }),
	place("engelberg-brunni-harzlisee", "Brunni and Härzlisee", "engelberg", 46.8412, 8.411, "lake", 0.55, { mountains: 0.9, nature: 0.8, quiet: 0.7, outdoors: 0.7, water: 0.5, whimsy: 0.4 }, { neighborhood: "Brunni", rating: 4.7 }),

	// Adelboden (day trip from Interlaken, ~32 km): waterfalls and a high plateau
	place("adelboden-engstligen-falls", "Engstligen Falls", "adelboden", 46.45, 7.5605, "waterfall", 0.66, { water: 1, nature: 0.9, mountains: 0.8, photogenic: 0.8, quiet: 0.6, outdoors: 0.5 }, { neighborhood: "Unter dem Birg", rating: 4.8 }),
	place("adelboden-engstligenalp", "Engstligenalp", "adelboden", 46.4445, 7.566, "viewpoint", 0.6, { mountains: 1, nature: 0.9, outdoors: 0.8, quiet: 0.8, photogenic: 0.7 }, { rating: 4.8 }),
	place("adelboden-village", "Adelboden village", "adelboden", 46.4933, 7.5598, "village", 0.6, { mountains: 0.8, quiet: 0.6, local_life: 0.6, photogenic: 0.6, craft: 0.3 }, { rating: 4.6 }),

	// Mürren (day trip from Interlaken, ~14 km): car-free cliff village and the Schilthorn
	place("murren-village", "Mürren car-free village", "murren", 46.5594, 7.8922, "village", 0.82, { mountains: 1, photogenic: 0.9, nature: 0.7, quiet: 0.6, romance: 0.4 }, { rating: 4.8 }),
	place("murren-schilthorn", "Schilthorn summit", "murren", 46.5572, 7.8353, "viewpoint", 0.94, { mountains: 1, photogenic: 0.9, film: 0.8, outdoors: 0.5, whimsy: 0.3 }, { rating: 4.7 }),
	place("murren-allmendhubel", "Allmendhubel Flower Trail", "murren", 46.5642, 7.8878, "trail", 0.6, { mountains: 0.9, nature: 0.9, quiet: 0.7, outdoors: 0.7, garden: 0.5, whimsy: 0.3 }, { rating: 4.7 }),

	// Gimmelwald (day trip from Interlaken, ~16 km): tiny farming hamlet
	place("gimmelwald-hamlet", "Gimmelwald hamlet", "gimmelwald", 46.5467, 7.8925, "village", 0.58, { mountains: 1, quiet: 0.9, nature: 0.8, photogenic: 0.7, local_life: 0.6, craft: 0.3 }, { rating: 4.8 }),
	place("gimmelwald-sprutz-waterfall", "Sprutz Waterfall", "gimmelwald", 46.5505, 7.8795, "waterfall", 0.45, { water: 0.9, nature: 0.9, quiet: 0.9, mountains: 0.7, photogenic: 0.6, outdoors: 0.6 }, { rating: 4.7 }),
	place("gimmelwald-via-ferrata", "Via Ferrata Mürren–Gimmelwald", "gimmelwald", 46.5525, 7.8955, "trail", 0.5, { outdoors: 1, mountains: 0.9, photogenic: 0.7, nature: 0.6, quiet: 0.5 }, { rating: 4.8 }),

	// Thun (day trip from Interlaken, ~20 km): castle town on the Aare
	place("thun-castle", "Thun Castle", "thun", 46.76, 7.63, "castle", 0.8, { history: 1, architecture: 0.8, photogenic: 0.8, whimsy: 0.5, mountains: 0.4 }, { neighborhood: "Schlossberg", rating: 4.6 }),
	place("thun-obere-hauptgasse", "Obere Hauptgasse", "thun", 46.7592, 7.629, "street", 0.62, { local_life: 0.8, history: 0.7, architecture: 0.6, shopping: 0.6, cafes: 0.4 }, { neighborhood: "Altstadt", rating: 4.6 }),
	place("thun-schadau-park", "Schadau Castle and Park", "thun", 46.7461, 7.6372, "garden", 0.65, { garden: 0.8, water: 0.8, romance: 0.6, mountains: 0.6, quiet: 0.6, history: 0.5 }, { neighborhood: "Schadau", rating: 4.7 }),
	place("thun-obere-schleuse", "Obere Schleuse", "thun", 46.7577, 7.6303, "bridge", 0.55, { water: 0.9, history: 0.6, photogenic: 0.6, local_life: 0.5, outdoors: 0.5 }, { neighborhood: "Altstadt", rating: 4.6 }),

	// Brienz (day trip from Interlaken, ~15 km): woodcarving village on Lake Brienz
	place("brienz-brunngasse", "Brunngasse", "brienz", 46.7553, 8.0353, "street", 0.62, { photogenic: 0.8, quiet: 0.7, craft: 0.6, history: 0.6, garden: 0.4 }, { rating: 4.7 }),
	place("brienz-woodcarving-museum", "Swiss Woodcarving Museum", "brienz", 46.7565, 8.033, "museum", 0.5, { craft: 1, art: 0.6, quiet: 0.6, history: 0.5 }, { rating: 4.6 }),
	place("brienz-giessbach-falls", "Giessbach Falls", "brienz", 46.7353, 8.0205, "waterfall", 0.78, { water: 1, nature: 0.9, photogenic: 0.8, romance: 0.4, history: 0.4 }, { neighborhood: "Giessbach", rating: 4.7 }),
	place("brienz-rothorn", "Brienz Rothorn steam railway", "brienz", 46.7869, 8.0469, "viewpoint", 0.74, { mountains: 1, photogenic: 0.8, history: 0.5, outdoors: 0.5, whimsy: 0.4, water: 0.4 }, { rating: 4.7 }),
	place("brienz-lakeside-promenade", "Brienz lakeside promenade", "brienz", 46.754, 8.039, "park", 0.55, { water: 1, photogenic: 0.8, quiet: 0.7, romance: 0.6, mountains: 0.6 }, { rating: 4.6 }),
	place("brienz-giessbach-iseltwald-trail", "Giessbach–Iseltwald lakeside trail", "brienz", 46.7245, 7.9925, "trail", 0.55, { nature: 0.9, water: 0.8, quiet: 0.8, outdoors: 0.7, mountains: 0.5, photogenic: 0.5 }, { neighborhood: "South shore of Lake Brienz", rating: 4.7 }),

	// Venice: crowded icons, quieter twins (incl. lagoon islands), food and drink
	place("venice-st-marks-square", "St Mark's Square", "venice", 45.434, 12.3381, "square", 0.999, { history: 1, architecture: 1, photogenic: 1, romance: 0.7, spiritual: 0.6, art: 0.5 }, { neighborhood: "San Marco", rating: 4.7 }),
	place("venice-rialto-bridge", "Rialto Bridge", "venice", 45.438, 12.336, "bridge", 0.997, { water: 1, photogenic: 1, history: 0.7, architecture: 0.7, romance: 0.7, markets: 0.3 }, { neighborhood: "San Polo", rating: 4.6 }),
	place("venice-doges-palace", "Doge's Palace", "venice", 45.4337, 12.3405, "palace", 0.995, { history: 1, architecture: 1, art: 0.9, photogenic: 0.6 }, { neighborhood: "San Marco", rating: 4.7 }),
	place("venice-bridge-of-sighs", "Bridge of Sighs", "venice", 45.434, 12.3409, "bridge", 0.99, { romance: 1, photogenic: 1, water: 0.8, history: 0.7, architecture: 0.6, literature: 0.3 }, { neighborhood: "San Marco", rating: 4.5 }),
	place("venice-burano", "Burano", "venice", 45.486, 12.417, "village", 0.975, { photogenic: 1, whimsy: 0.8, craft: 0.7, water: 0.7, local_life: 0.4, coast: 0.4 }, { neighborhood: "Burano", rating: 4.7 }),
	place("venice-libreria-acqua-alta", "Libreria Acqua Alta", "venice", 45.438, 12.3423, "landmark", 0.975, { literature: 1, whimsy: 0.9, photogenic: 0.8, water: 0.5 }, { neighborhood: "Castello", rating: 4.4 }),
	place("venice-fondamenta-della-misericordia", "Fondamenta della Misericordia", "venice", 45.4446, 12.3322, "street", 0.72, { water: 0.9, local_life: 0.9, nightlife: 0.6, food_street: 0.6, photogenic: 0.6, romance: 0.5, quiet: 0.4 }, { neighborhood: "Cannaregio", rating: 4.6 }),
	place("venice-via-garibaldi", "Via Garibaldi", "venice", 45.4323, 12.3531, "street", 0.58, { local_life: 1, quiet: 0.6, markets: 0.5, food_street: 0.5, history: 0.4, water: 0.4 }, { neighborhood: "Castello", rating: 4.5 }),
	place("venice-san-pietro-di-castello", "San Pietro di Castello", "venice", 45.4346, 12.3596, "church", 0.5, { quiet: 0.9, history: 0.9, spiritual: 0.8, architecture: 0.7, photogenic: 0.5, water: 0.4 }, { neighborhood: "Castello", rating: 4.5 }),
	place("venice-torcello", "Torcello", "venice", 45.4966, 12.4173, "village", 0.62, { history: 1, quiet: 0.9, spiritual: 0.8, art: 0.7, nature: 0.6, architecture: 0.6, literature: 0.3 }, { neighborhood: "Torcello", rating: 4.6 }),
	place("venice-sant-erasmo", "Sant'Erasmo", "venice", 45.4575, 12.4126, "village", 0.45, { quiet: 1, nature: 0.8, garden: 0.7, local_life: 0.6, water: 0.6, outdoors: 0.5, food_street: 0.3 }, { neighborhood: "Sant'Erasmo", rating: 4.5 }),
	place("venice-pellestrina", "Pellestrina", "venice", 45.3178, 12.3158, "village", 0.5, { quiet: 0.9, coast: 0.8, photogenic: 0.8, local_life: 0.8, water: 0.7, craft: 0.4, whimsy: 0.4, food_street: 0.3 }, { neighborhood: "Pellestrina (San Pietro in Volta)", rating: 4.6 }),
	place("venice-san-giorgio-maggiore", "San Giorgio Maggiore", "venice", 45.4293, 12.3431, "church", 0.8, { architecture: 1, photogenic: 0.9, spiritual: 0.8, history: 0.7, quiet: 0.6, art: 0.5, water: 0.5 }, { neighborhood: "Isola di San Giorgio", rating: 4.8 }),
	place("venice-scuola-grande-di-san-rocco", "Scuola Grande di San Rocco", "venice", 45.4366, 12.325, "museum", 0.7, { art: 1, history: 0.9, architecture: 0.7, quiet: 0.7, spiritual: 0.6 }, { neighborhood: "San Polo", rating: 4.8 }),
	place("venice-ponte-chiodo", "Ponte Chiodo", "venice", 45.4428, 12.3347, "bridge", 0.5, { water: 0.9, photogenic: 0.8, quiet: 0.8, history: 0.6, romance: 0.6, architecture: 0.4 }, { neighborhood: "Cannaregio", rating: 4.5 }),
	place("venice-querini-stampalia", "Fondazione Querini Stampalia", "venice", 45.4363, 12.3411, "museum", 0.55, { literature: 1, quiet: 0.8, design: 0.7, water: 0.6, art: 0.6, garden: 0.5, photogenic: 0.5, whimsy: 0.3 }, { neighborhood: "Castello", rating: 4.5 }),
	place("venice-caffe-remo-lento", "Caffè Remo Lento", "venice", 45.445, 12.33, "cafe", 0.5, { cafes: 0.9, quiet: 0.6, local_life: 0.6, water: 0.4 }, { neighborhood: "Cannaregio", rating: 4.5, priceLevel: 2 }),
	place("venice-pasticceria-ala-di-gabbiano", "Pasticceria Ala di Gabbiano", "venice", 45.4328, 12.3505, "cafe", 0.45, { cafes: 0.8, local_life: 0.8, quiet: 0.5, food_street: 0.4 }, { neighborhood: "Castello", rating: 4.6, priceLevel: 1 }),
	place("venice-bacaro-dei-remeri", "Bacaro dei Remèri", "venice", 45.4443, 12.3315, "restaurant", 0.6, { food_street: 1, wine: 0.8, local_life: 0.8, nightlife: 0.5, water: 0.3 }, { neighborhood: "Cannaregio", rating: 4.6, priceLevel: 2 }),
	place("venice-bacaro-ombra-lunga", "Bacaro Ombra Lunga", "venice", 45.432, 12.3525, "restaurant", 0.52, { food_street: 0.9, local_life: 0.9, wine: 0.8, quiet: 0.4 }, { neighborhood: "Castello", rating: 4.5, priceLevel: 1 }),
	place("venice-bacaro-del-sotoportego-scuro", "Bacaro del Sotoportego Scuro", "venice", 45.4305, 12.3255, "restaurant", 0.55, { food_street: 0.9, wine: 0.8, local_life: 0.7, nightlife: 0.4, history: 0.3 }, { neighborhood: "Dorsoduro", rating: 4.6, priceLevel: 2 }),
	place("venice-bar-fanal-de-nebbia", "Bar Fanal de Nebbia", "venice", 45.4448, 12.3305, "bar", 0.5, { nightlife: 0.8, wine: 0.6, local_life: 0.6, water: 0.5, music: 0.4, jazz: 0.4 }, { neighborhood: "Cannaregio", rating: 4.4, priceLevel: 2 }),

	// Chioggia (Italian twin of Venice): the fishermen's "little Venice"
	place("chioggia-canal-vena", "Canal Vena", "chioggia", 45.22, 12.2795, "street", 0.66, { water: 1, local_life: 0.9, photogenic: 0.8, romance: 0.5, history: 0.5, quiet: 0.5 }, { neighborhood: "Centro storico", rating: 4.6 }),
	place("chioggia-fish-market", "Chioggia fish market", "chioggia", 45.2207, 12.2785, "market", 0.62, { markets: 1, local_life: 0.9, food_street: 0.8, coast: 0.5, water: 0.4 }, { neighborhood: "Centro storico", rating: 4.5 }),
	place("chioggia-corso-del-popolo", "Corso del Popolo", "chioggia", 45.219, 12.2785, "street", 0.6, { local_life: 0.9, history: 0.6, cafes: 0.5, architecture: 0.4, shopping: 0.4 }, { neighborhood: "Centro storico", rating: 4.5 }),
	place("chioggia-ponte-di-vigo", "Ponte di Vigo", "chioggia", 45.2232, 12.28, "bridge", 0.64, { water: 0.9, photogenic: 0.9, history: 0.6, romance: 0.5, architecture: 0.5 }, { neighborhood: "Vigo", rating: 4.6 }),
	place("chioggia-sottomarina-beach", "Sottomarina beach", "chioggia", 45.2147, 12.301, "beach", 0.6, { coast: 1, local_life: 0.6, outdoors: 0.5, nature: 0.3 }, { neighborhood: "Sottomarina", rating: 4.3 }),
	place("chioggia-osteria-vela-al-terzo", "Osteria Vela al Terzo", "chioggia", 45.2203, 12.2797, "restaurant", 0.52, { food_street: 0.9, local_life: 0.8, coast: 0.6, wine: 0.4 }, { neighborhood: "Centro storico", rating: 4.5, priceLevel: 2 }),

	// Comacchio (Italian twin of Venice): canal town of the Po Delta
	place("comacchio-trepponti", "Trepponti", "comacchio", 44.693, 12.1833, "bridge", 0.7, { water: 0.9, photogenic: 0.9, architecture: 0.8, history: 0.7, romance: 0.4 }, { rating: 4.6 }),
	place("comacchio-canals", "Comacchio canals", "comacchio", 44.695, 12.182, "neighborhood", 0.6, { water: 1, quiet: 0.8, photogenic: 0.8, local_life: 0.7, romance: 0.5, history: 0.5 }, { rating: 4.6 }),
	place("comacchio-manifattura-dei-marinati", "Manifattura dei Marinati", "comacchio", 44.6925, 12.1795, "museum", 0.48, { food_street: 0.7, craft: 0.7, history: 0.7, quiet: 0.6, water: 0.5 }, { rating: 4.5 }),
	place("comacchio-museo-delta-antico", "Museo Delta Antico", "comacchio", 44.6934, 12.1817, "museum", 0.42, { history: 0.9, quiet: 0.8, art: 0.4, water: 0.4, coast: 0.3 }, { rating: 4.6 }),
	place("comacchio-valli-di-comacchio", "Valli di Comacchio lagoon", "comacchio", 44.665, 12.175, "lake", 0.55, { nature: 1, water: 0.9, quiet: 0.9, outdoors: 0.7, photogenic: 0.7 }, { neighborhood: "Po Delta Park", rating: 4.7 }),
	place("comacchio-trattoria-barchino-rosso", "Trattoria Barchino Rosso", "comacchio", 44.6945, 12.184, "restaurant", 0.45, { food_street: 0.9, local_life: 0.8, quiet: 0.4, water: 0.4 }, { rating: 4.5, priceLevel: 2 }),

	// Treviso (Italian twin of Venice): canals and water mills
	place("treviso-canale-dei-buranelli", "Canale dei Buranelli", "treviso", 45.6655, 12.2445, "street", 0.68, { water: 1, photogenic: 0.9, romance: 0.6, local_life: 0.6, history: 0.5, quiet: 0.5 }, { neighborhood: "Centro storico", rating: 4.6 }),
	place("treviso-isola-della-pescheria", "Isola della Pescheria", "treviso", 45.6668, 12.2483, "market", 0.6, { markets: 0.9, local_life: 0.9, water: 0.8, food_street: 0.6, photogenic: 0.5 }, { neighborhood: "Centro storico", rating: 4.5 }),
	place("treviso-piazza-dei-signori", "Piazza dei Signori", "treviso", 45.6659, 12.2455, "square", 0.66, { history: 0.8, architecture: 0.8, local_life: 0.8, cafes: 0.6, photogenic: 0.5 }, { neighborhood: "Centro storico", rating: 4.6 }),
	place("treviso-san-nicolo", "Church of San Nicolò", "treviso", 45.6632, 12.2396, "church", 0.45, { quiet: 0.9, spiritual: 0.8, art: 0.8, history: 0.8, architecture: 0.7 }, { rating: 4.6 }),
	place("treviso-porta-san-tomaso", "Porta San Tomaso and city walls", "treviso", 45.6696, 12.2507, "landmark", 0.5, { history: 0.8, quiet: 0.7, architecture: 0.6, water: 0.5, outdoors: 0.5 }, { rating: 4.5 }),
	place("treviso-osteria-del-sile-lento", "Osteria del Sile Lento", "treviso", 45.6662, 12.247, "restaurant", 0.55, { wine: 0.9, food_street: 0.8, local_life: 0.8 }, { neighborhood: "Centro storico", rating: 4.6, priceLevel: 2 }),
	place("treviso-caffe-delle-acque-chete", "Caffè delle Acque Chete", "treviso", 45.665, 12.244, "cafe", 0.48, { cafes: 0.9, local_life: 0.7, quiet: 0.6, water: 0.3 }, { neighborhood: "Centro storico", rating: 4.5, priceLevel: 1 }),

	// Trieste (Italian twin of Venice): Habsburg seaport of cafés and books
	place("trieste-piazza-unita", "Piazza Unità d'Italia", "trieste", 45.65, 13.7678, "square", 0.85, { architecture: 0.9, photogenic: 0.9, coast: 0.8, history: 0.8, romance: 0.5 }, { neighborhood: "Waterfront", rating: 4.8 }),
	place("trieste-miramare-castle", "Miramare Castle", "trieste", 45.7025, 13.7122, "castle", 0.86, { coast: 0.9, history: 0.9, photogenic: 0.9, romance: 0.8, garden: 0.8, architecture: 0.7 }, { neighborhood: "Grignano", rating: 4.7 }),
	place("trieste-canal-grande", "Canal Grande di Trieste", "trieste", 45.6525, 13.7714, "street", 0.72, { water: 0.8, photogenic: 0.7, history: 0.6, local_life: 0.5, cafes: 0.5, literature: 0.4 }, { neighborhood: "Borgo Teresiano", rating: 4.6 }),
	place("trieste-roman-theatre", "Roman Theatre of Trieste", "trieste", 45.6492, 13.7717, "landmark", 0.55, { history: 0.9, quiet: 0.6, architecture: 0.5 }, { neighborhood: "Città Vecchia", rating: 4.4 }),
	place("trieste-san-giusto", "San Giusto Cathedral and Castle", "trieste", 45.647, 13.772, "church", 0.62, { history: 0.9, spiritual: 0.7, architecture: 0.7, photogenic: 0.6, quiet: 0.6 }, { neighborhood: "San Giusto", rating: 4.6 }),
	place("trieste-molo-audace", "Molo Audace", "trieste", 45.6521, 13.7664, "landmark", 0.7, { coast: 1, photogenic: 0.8, romance: 0.7, quiet: 0.5, local_life: 0.4 }, { neighborhood: "Waterfront", rating: 4.7 }),
	place("trieste-caffe-della-bora-gentile", "Caffè della Bora Gentile", "trieste", 45.6515, 13.7735, "cafe", 0.55, { cafes: 1, literature: 0.7, history: 0.5, quiet: 0.5 }, { neighborhood: "Borgo Teresiano", rating: 4.6, priceLevel: 2 }),

	// Bologna (Italian twin of Venice): porticoes, towers and food-market lanes
	place("bologna-two-towers", "Two Towers (Asinelli and Garisenda)", "bologna", 44.4943, 11.3468, "landmark", 0.88, { history: 0.9, architecture: 0.9, photogenic: 0.8 }, { neighborhood: "Centro storico", rating: 4.6 }),
	place("bologna-piazza-maggiore", "Piazza Maggiore", "bologna", 44.4938, 11.3427, "square", 0.9, { history: 0.9, architecture: 0.9, local_life: 0.8, photogenic: 0.7, film: 0.4 }, { neighborhood: "Centro storico", rating: 4.7 }),
	place("bologna-quadrilatero", "Quadrilatero market lanes", "bologna", 44.4935, 11.345, "market", 0.82, { markets: 1, food_street: 1, local_life: 0.8, history: 0.5 }, { neighborhood: "Centro storico", rating: 4.6 }),
	place("bologna-portico-di-san-luca", "Portico di San Luca", "bologna", 44.48, 11.298, "trail", 0.7, { architecture: 0.8, outdoors: 0.7, history: 0.7, spiritual: 0.6, quiet: 0.6, photogenic: 0.6 }, { neighborhood: "Colle della Guardia", rating: 4.8 }),
	place("bologna-santo-stefano", "Santo Stefano (Seven Churches)", "bologna", 44.4922, 11.3488, "church", 0.72, { history: 1, spiritual: 0.9, architecture: 0.8, quiet: 0.7 }, { neighborhood: "Centro storico", rating: 4.8 }),
	place("bologna-archiginnasio", "Archiginnasio and Anatomical Theatre", "bologna", 44.4922, 11.3436, "landmark", 0.72, { history: 0.9, literature: 0.8, architecture: 0.8, quiet: 0.5, art: 0.4 }, { neighborhood: "Centro storico", rating: 4.6 }),
	place("bologna-finestrella-di-via-piella", "Finestrella di Via Piella", "bologna", 44.4985, 11.3445, "viewpoint", 0.7, { photogenic: 0.9, water: 0.8, whimsy: 0.6, romance: 0.5 }, { neighborhood: "Centro storico", rating: 4.2 }),
	place("bologna-osteria-sette-portici", "Osteria Sette Portici", "bologna", 44.496, 11.348, "restaurant", 0.6, { food_street: 1, local_life: 0.8, wine: 0.7, nightlife: 0.3 }, { neighborhood: "Università", rating: 4.6, priceLevel: 2 }),

	// Mantua (Italian twin of Venice): Renaissance court on three lakes
	place("mantua-palazzo-ducale", "Palazzo Ducale (Camera degli Sposi)", "mantua", 45.1603, 10.7989, "palace", 0.82, { art: 1, history: 1, architecture: 0.9, photogenic: 0.5 }, { rating: 4.7 }),
	place("mantua-palazzo-te", "Palazzo Te", "mantua", 45.1474, 10.7873, "palace", 0.74, { art: 1, architecture: 0.9, history: 0.8, whimsy: 0.5, quiet: 0.5, garden: 0.4 }, { rating: 4.7 }),
	place("mantua-piazza-delle-erbe", "Piazza delle Erbe", "mantua", 45.1585, 10.7944, "square", 0.7, { history: 0.8, architecture: 0.8, local_life: 0.7, markets: 0.5, cafes: 0.5 }, { rating: 4.7 }),
	place("mantua-basilica-di-sant-andrea", "Basilica of Sant'Andrea", "mantua", 45.159, 10.7945, "church", 0.62, { architecture: 1, spiritual: 0.8, history: 0.8, art: 0.7, quiet: 0.6 }, { rating: 4.7 }),
	place("mantua-lakeshore", "Mantua lakeshore (Lago di Mezzo)", "mantua", 45.164, 10.796, "lake", 0.55, { water: 0.9, quiet: 0.8, nature: 0.7, photogenic: 0.7, romance: 0.5, outdoors: 0.5 }, { rating: 4.6 }),
	place("mantua-trattoria-zucca-e-lago", "Trattoria Zucca e Lago", "mantua", 45.1575, 10.7925, "restaurant", 0.52, { food_street: 0.8, local_life: 0.7, wine: 0.6, quiet: 0.4 }, { rating: 4.6, priceLevel: 2 }),

	// Ferrara (Italian twin of Venice): quiet Renaissance city of bicycles
	place("ferrara-castello-estense", "Castello Estense", "ferrara", 44.8375, 11.6194, "castle", 0.8, { history: 1, architecture: 0.9, photogenic: 0.8, water: 0.5 }, { rating: 4.6 }),
	place("ferrara-city-walls", "Ferrara city walls (Porta degli Angeli)", "ferrara", 44.8493, 11.6245, "trail", 0.58, { outdoors: 0.9, quiet: 0.8, history: 0.8, nature: 0.6, local_life: 0.5 }, { rating: 4.8 }),
	place("ferrara-cathedral", "Ferrara Cathedral", "ferrara", 44.8355, 11.6201, "church", 0.66, { architecture: 0.9, history: 0.9, spiritual: 0.8, art: 0.5 }, { rating: 4.5 }),
	place("ferrara-palazzo-dei-diamanti", "Palazzo dei Diamanti", "ferrara", 44.8421, 11.6211, "museum", 0.62, { art: 0.9, architecture: 0.9, history: 0.7, quiet: 0.5 }, { rating: 4.6 }),
	place("ferrara-via-delle-volte", "Via delle Volte", "ferrara", 44.8334, 11.618, "street", 0.55, { history: 0.9, quiet: 0.8, photogenic: 0.8, whimsy: 0.4, romance: 0.4 }, { rating: 4.6 }),
	place("ferrara-osteria-bicicletta-blu", "Osteria Bicicletta Blu", "ferrara", 44.8365, 11.618, "restaurant", 0.5, { food_street: 0.8, local_life: 0.8, wine: 0.6, quiet: 0.4 }, { rating: 4.5, priceLevel: 2 }),

	// Lisbon: crowded icons, quieter twins, food and drink
	place("lisbon-belem-tower", "Belém Tower", "lisbon", 38.6916, -9.216, "landmark", 0.995, { history: 1, architecture: 0.9, photogenic: 0.9, water: 0.7, coast: 0.4 }, { neighborhood: "Belém", rating: 4.6 }),
	place("lisbon-jeronimos-monastery", "Jerónimos Monastery", "lisbon", 38.6978, -9.2061, "church", 0.996, { architecture: 1, history: 1, spiritual: 0.8, photogenic: 0.8, art: 0.4 }, { neighborhood: "Belém", rating: 4.7 }),
	place("lisbon-miradouro-de-santa-luzia", "Alfama (Miradouro de Santa Luzia)", "lisbon", 38.7118, -9.1305, "viewpoint", 0.99, { photogenic: 1, romance: 0.8, history: 0.7, local_life: 0.5, music: 0.4, craft: 0.3 }, { neighborhood: "Alfama", rating: 4.7 }),
	place("lisbon-tram-28", "Tram 28 (Graça stop)", "lisbon", 38.7163, -9.131, "landmark", 0.985, { photogenic: 0.9, whimsy: 0.7, history: 0.6, local_life: 0.5, romance: 0.4 }, { neighborhood: "Graça", rating: 4.3 }),
	place("lisbon-lx-factory", "LX Factory", "lisbon", 38.7036, -9.1786, "neighborhood", 0.975, { design: 1, art: 0.7, shopping: 0.7, food_street: 0.6, nightlife: 0.5, literature: 0.4 }, { neighborhood: "Alcântara", rating: 4.5 }),
	place("lisbon-time-out-market", "Time Out Market (Mercado da Ribeira)", "lisbon", 38.707, -9.1458, "market", 0.98, { food_street: 1, markets: 0.8, nightlife: 0.4, design: 0.3, local_life: 0.3 }, { neighborhood: "Cais do Sodré", rating: 4.5 }),
	place("lisbon-miradouro-da-senhora-do-monte", "Miradouro da Senhora do Monte", "lisbon", 38.7189, -9.1328, "viewpoint", 0.82, { photogenic: 1, romance: 0.8, quiet: 0.5, history: 0.4, local_life: 0.4 }, { neighborhood: "Graça", rating: 4.8 }),
	place("lisbon-national-tile-museum", "National Tile Museum", "lisbon", 38.7244, -9.1139, "museum", 0.78, { craft: 1, art: 0.9, history: 0.8, quiet: 0.6, spiritual: 0.5, architecture: 0.5 }, { neighborhood: "Xabregas", rating: 4.7 }),
	place("lisbon-gulbenkian", "Calouste Gulbenkian Museum and Garden", "lisbon", 38.7367, -9.1542, "museum", 0.8, { art: 1, garden: 0.8, quiet: 0.7, design: 0.6, nature: 0.5, architecture: 0.5 }, { neighborhood: "Avenidas Novas", rating: 4.8 }),
	place("lisbon-estrela", "Estrela Garden and Basilica", "lisbon", 38.7135, -9.16, "church", 0.7, { architecture: 0.8, spiritual: 0.7, garden: 0.7, history: 0.6, quiet: 0.6, photogenic: 0.6, local_life: 0.5 }, { neighborhood: "Estrela", rating: 4.7 }),
	place("lisbon-campo-de-ourique", "Campo de Ourique", "lisbon", 38.715, -9.167, "neighborhood", 0.62, { local_life: 1, cafes: 0.6, food_street: 0.6, quiet: 0.6, markets: 0.5, photogenic: 0.3 }, { neighborhood: "Campo de Ourique", rating: 4.6 }),
	place("lisbon-marvila", "Marvila", "lisbon", 38.7453, -9.1042, "neighborhood", 0.55, { design: 0.8, art: 0.8, local_life: 0.6, nightlife: 0.5, quiet: 0.5, food_street: 0.4, craft: 0.4 }, { neighborhood: "Marvila", rating: 4.4 }),
	place("lisbon-jardim-do-torel", "Jardim do Torel", "lisbon", 38.7188, -9.1424, "garden", 0.55, { photogenic: 0.8, quiet: 0.8, garden: 0.7, romance: 0.6, local_life: 0.5 }, { neighborhood: "Santana", rating: 4.6 }),
	place("lisbon-mercado-de-campo-de-ourique", "Mercado de Campo de Ourique", "lisbon", 38.7168, -9.1667, "market", 0.6, { food_street: 0.9, markets: 0.9, local_life: 0.9, wine: 0.4, quiet: 0.3 }, { neighborhood: "Campo de Ourique", rating: 4.5 }),
	place("lisbon-aguas-livres-aqueduct", "Águas Livres Aqueduct", "lisbon", 38.7289, -9.1692, "landmark", 0.6, { history: 0.9, architecture: 0.9, photogenic: 0.7, quiet: 0.7, outdoors: 0.3, water: 0.3 }, { neighborhood: "Campolide", rating: 4.6 }),
	place("lisbon-tram-24", "Tram 24 (Príncipe Real–Campolide)", "lisbon", 38.72, -9.153, "landmark", 0.55, { photogenic: 0.8, local_life: 0.7, whimsy: 0.7, history: 0.6, quiet: 0.5, romance: 0.3 }, { neighborhood: "Rato", rating: 4.5 }),
	place("lisbon-pastelaria-nata-da-graca", "Pastelaria Nata da Graça", "lisbon", 38.7168, -9.1318, "cafe", 0.55, { cafes: 0.9, local_life: 0.8, food_street: 0.6 }, { neighborhood: "Graça", rating: 4.6, priceLevel: 1 }),
	place("lisbon-pastelaria-bica-e-canela", "Pastelaria Bica e Canela", "lisbon", 38.7158, -9.166, "cafe", 0.5, { cafes: 0.9, local_life: 0.8, quiet: 0.5, food_street: 0.4 }, { neighborhood: "Campo de Ourique", rating: 4.5, priceLevel: 1 }),
	place("lisbon-tasca-da-vizinha-rosa", "Tasca da Vizinha Rosa", "lisbon", 38.715, -9.135, "restaurant", 0.58, { food_street: 0.9, local_life: 0.9, wine: 0.5, music: 0.3 }, { neighborhood: "Mouraria", rating: 4.6, priceLevel: 1 }),
	place("lisbon-marisqueira-rede-dourada", "Marisqueira Rede Dourada", "lisbon", 38.7395, -9.1025, "restaurant", 0.55, { food_street: 0.7, coast: 0.7, local_life: 0.6, wine: 0.5, food_fine: 0.4 }, { neighborhood: "Poço do Bispo (Marvila)", rating: 4.6, priceLevel: 3 }),
	place("lisbon-mesa-do-miradouro", "Mesa do Miradouro", "lisbon", 38.7165, -9.149, "restaurant", 0.6, { food_fine: 1, wine: 0.7, romance: 0.5, design: 0.5 }, { neighborhood: "Príncipe Real", rating: 4.7, priceLevel: 4 }),
	place("lisbon-casa-de-fado-xaile-negro", "Casa de Fado Xaile Negro", "lisbon", 38.7112, -9.129, "bar", 0.62, { music: 1, romance: 0.7, nightlife: 0.7, history: 0.5, local_life: 0.4 }, { neighborhood: "Alfama", rating: 4.6, priceLevel: 3 }),
	place("lisbon-bar-vinil-do-cais", "Bar Vinil do Cais", "lisbon", 38.7072, -9.144, "bar", 0.55, { nightlife: 0.9, jazz: 0.8, music: 0.8, local_life: 0.4 }, { neighborhood: "Cais do Sodré", rating: 4.5, priceLevel: 2 }),

	// Sintra (day trip from Lisbon, ~23 km): crowded fairy-tale palaces and quieter retreats
	place("sintra-pena-palace", "Pena Palace", "sintra", 38.7878, -9.3906, "palace", 0.99, { whimsy: 1, photogenic: 1, architecture: 0.9, romance: 0.8, history: 0.7, garden: 0.4 }, { rating: 4.6 }),
	place("sintra-quinta-da-regaleira", "Quinta da Regaleira", "sintra", 38.7963, -9.396, "garden", 0.98, { whimsy: 1, photogenic: 0.9, garden: 0.8, romance: 0.6, history: 0.6, architecture: 0.6, spiritual: 0.4 }, { rating: 4.7 }),
	place("sintra-moorish-castle", "Moorish Castle", "sintra", 38.7925, -9.3894, "castle", 0.93, { history: 0.9, photogenic: 0.8, nature: 0.6, outdoors: 0.5, mountains: 0.4 }, { rating: 4.6 }),
	place("sintra-monserrate-palace", "Monserrate Palace", "sintra", 38.7942, -9.4206, "palace", 0.8, { garden: 1, whimsy: 0.8, romance: 0.8, architecture: 0.8, photogenic: 0.7, nature: 0.6, quiet: 0.6 }, { rating: 4.7 }),
	place("sintra-convent-of-the-capuchos", "Convent of the Capuchos", "sintra", 38.7844, -9.4383, "church", 0.6, { quiet: 1, nature: 0.9, spiritual: 0.8, zen: 0.7, history: 0.6, whimsy: 0.4 }, { rating: 4.6 }),

	// Coimbra (Portuguese twin of Lisbon): university hill and Coimbra fado
	place("coimbra-university", "University of Coimbra (Joanina Library)", "coimbra", 40.2074, -8.4265, "landmark", 0.9, { literature: 1, history: 1, architecture: 0.9, art: 0.6, photogenic: 0.6 }, { neighborhood: "Alta", rating: 4.7 }),
	place("coimbra-se-velha", "Sé Velha (Old Cathedral)", "coimbra", 40.2088, -8.4271, "church", 0.75, { history: 0.9, spiritual: 0.8, architecture: 0.8, quiet: 0.5, music: 0.3 }, { neighborhood: "Alta", rating: 4.6 }),
	place("coimbra-santa-cruz", "Monastery of Santa Cruz", "coimbra", 40.2109, -8.4289, "church", 0.7, { history: 0.9, spiritual: 0.8, architecture: 0.8, art: 0.5, quiet: 0.5 }, { neighborhood: "Baixa", rating: 4.6 }),
	place("coimbra-botanical-garden", "Botanical Garden of the University of Coimbra", "coimbra", 40.2058, -8.4214, "garden", 0.62, { garden: 1, nature: 0.8, quiet: 0.8, history: 0.5, literature: 0.3 }, { neighborhood: "Alta", rating: 4.6 }),
	place("coimbra-portugal-dos-pequenitos", "Portugal dos Pequenitos", "coimbra", 40.2031, -8.4342, "park", 0.72, { whimsy: 1, architecture: 0.6, photogenic: 0.6, history: 0.4 }, { neighborhood: "Santa Clara", rating: 4.4 }),
	place("coimbra-adega-da-serenata", "Adega da Serenata", "coimbra", 40.2083, -8.428, "bar", 0.55, { music: 1, nightlife: 0.6, romance: 0.6, history: 0.5, literature: 0.3 }, { neighborhood: "Alta", rating: 4.6, priceLevel: 2 }),
	place("coimbra-tasca-do-penedo-alto", "Tasca do Penedo Alto", "coimbra", 40.2095, -8.4275, "restaurant", 0.5, { food_street: 0.9, local_life: 0.9, wine: 0.5 }, { neighborhood: "Alta", rating: 4.5, priceLevel: 1 }),

	// Évora (Portuguese twin of Lisbon): walled Alentejo town
	place("evora-roman-temple", "Roman Temple of Évora", "evora", 38.5731, -7.9078, "landmark", 0.86, { history: 1, architecture: 0.8, photogenic: 0.8, romance: 0.4 }, { neighborhood: "Centro histórico", rating: 4.6 }),
	place("evora-chapel-of-bones", "Chapel of Bones (Capela dos Ossos)", "evora", 38.5689, -7.9089, "church", 0.84, { history: 0.9, spiritual: 0.8, architecture: 0.5, art: 0.4 }, { neighborhood: "Centro histórico", rating: 4.4 }),
	place("evora-cathedral", "Évora Cathedral", "evora", 38.5718, -7.9066, "church", 0.72, { architecture: 0.9, history: 0.9, spiritual: 0.8, photogenic: 0.6, quiet: 0.5 }, { neighborhood: "Centro histórico", rating: 4.7 }),
	place("evora-praca-do-giraldo", "Praça do Giraldo", "evora", 38.5713, -7.9095, "square", 0.7, { local_life: 0.8, history: 0.7, cafes: 0.6, architecture: 0.5 }, { neighborhood: "Centro histórico", rating: 4.6 }),
	place("evora-almendres-cromlech", "Almendres Cromlech", "evora", 38.5575, -8.0612, "landmark", 0.55, { history: 1, quiet: 0.9, nature: 0.7, spiritual: 0.6, outdoors: 0.4, whimsy: 0.3 }, { neighborhood: "Guadalupe", rating: 4.5 }),
	place("evora-taberna-talha-e-cortica", "Taberna Talha e Cortiça", "evora", 38.572, -7.91, "bar", 0.5, { wine: 1, local_life: 0.7, food_street: 0.6, quiet: 0.4 }, { neighborhood: "Centro histórico", rating: 4.6, priceLevel: 2 }),

	// Aveiro (Portuguese twin of Lisbon and of Venice): canals and striped beach houses
	place("aveiro-central-canal", "Ria de Aveiro central canal", "aveiro", 40.6413, -8.6533, "landmark", 0.88, { water: 1, photogenic: 0.9, romance: 0.6, whimsy: 0.5, local_life: 0.4 }, { neighborhood: "Centro", rating: 4.5 }),
	place("aveiro-art-nouveau-museum", "Aveiro Art Nouveau Museum", "aveiro", 40.6418, -8.6557, "museum", 0.6, { architecture: 0.9, art: 0.7, design: 0.6, history: 0.6, quiet: 0.5 }, { neighborhood: "Centro", rating: 4.4 }),
	place("aveiro-museum", "Aveiro Museum (Monastery of Jesus)", "aveiro", 40.6394, -8.6512, "museum", 0.55, { history: 0.9, art: 0.8, quiet: 0.7, spiritual: 0.6, architecture: 0.6 }, { neighborhood: "Centro", rating: 4.6 }),
	place("aveiro-mercado-do-peixe", "Mercado do Peixe", "aveiro", 40.6427, -8.6541, "market", 0.6, { markets: 0.9, food_street: 0.8, local_life: 0.8, water: 0.5, nightlife: 0.4 }, { neighborhood: "Beira Mar", rating: 4.4 }),
	place("aveiro-costa-nova", "Costa Nova striped houses", "aveiro", 40.617, -8.75, "beach", 0.8, { coast: 1, photogenic: 1, whimsy: 0.7, architecture: 0.4, quiet: 0.4 }, { neighborhood: "Costa Nova (Ílhavo)", rating: 4.6 }),
	place("aveiro-salt-pans", "Aveiro salt pans", "aveiro", 40.6455, -8.6615, "trail", 0.45, { nature: 0.8, water: 0.8, quiet: 0.8, photogenic: 0.6, craft: 0.5 }, { neighborhood: "Salinas", rating: 4.4 }),
	place("aveiro-docaria-ria-serena", "Doçaria Ria Serena", "aveiro", 40.6408, -8.6528, "cafe", 0.5, { cafes: 0.8, food_street: 0.6, local_life: 0.6, craft: 0.3 }, { neighborhood: "Centro", rating: 4.5, priceLevel: 1 }),

	// Braga (Portuguese twin of Lisbon): sanctuaries and baroque stairways
	place("braga-bom-jesus-do-monte", "Bom Jesus do Monte", "braga", 41.5549, -8.377, "church", 0.88, { spiritual: 1, architecture: 0.9, photogenic: 0.9, history: 0.7, garden: 0.6, nature: 0.4 }, { neighborhood: "Tenões", rating: 4.8 }),
	place("braga-cathedral", "Sé de Braga", "braga", 41.5499, -8.4274, "church", 0.74, { history: 1, spiritual: 0.9, architecture: 0.8, art: 0.5 }, { neighborhood: "Centro histórico", rating: 4.6 }),
	place("braga-jardim-de-santa-barbara", "Jardim de Santa Bárbara", "braga", 41.5514, -8.4259, "garden", 0.7, { garden: 1, photogenic: 0.8, history: 0.6, romance: 0.5, quiet: 0.4 }, { neighborhood: "Centro histórico", rating: 4.7 }),
	place("braga-sameiro-sanctuary", "Sanctuary of Sameiro", "braga", 41.5418, -8.3698, "church", 0.6, { spiritual: 0.9, photogenic: 0.7, quiet: 0.7, architecture: 0.6, nature: 0.4 }, { neighborhood: "Espinho", rating: 4.7 }),
	place("braga-arco-da-porta-nova", "Arco da Porta Nova", "braga", 41.5503, -8.4293, "landmark", 0.62, { history: 0.8, architecture: 0.7, local_life: 0.6, photogenic: 0.6 }, { neighborhood: "Centro histórico", rating: 4.5 }),
	place("braga-cafe-sino-pequeno", "Café Sino Pequeno", "braga", 41.5508, -8.428, "cafe", 0.48, { cafes: 0.9, local_life: 0.8, quiet: 0.4, history: 0.3 }, { neighborhood: "Centro histórico", rating: 4.5, priceLevel: 1 }),

	// Tomar (Portuguese twin of Lisbon): Templar town on the Nabão
	place("tomar-convent-of-christ", "Convent of Christ", "tomar", 39.6047, -8.4175, "church", 0.8, { history: 1, architecture: 1, spiritual: 0.8, photogenic: 0.8, whimsy: 0.4 }, { rating: 4.8 }),
	place("tomar-synagogue", "Synagogue of Tomar", "tomar", 39.6032, -8.4139, "landmark", 0.45, { history: 0.9, quiet: 0.9, spiritual: 0.7, architecture: 0.5 }, { neighborhood: "Centro histórico", rating: 4.5 }),
	place("tomar-sete-montes", "Mata Nacional dos Sete Montes", "tomar", 39.6045, -8.415, "park", 0.45, { nature: 0.9, quiet: 0.9, garden: 0.6, outdoors: 0.5, history: 0.4 }, { rating: 4.6 }),
	place("tomar-mouchao-park", "Mouchão Park and Nabão waterwheel", "tomar", 39.6035, -8.4085, "park", 0.5, { water: 0.9, quiet: 0.8, garden: 0.6, local_life: 0.6, photogenic: 0.6 }, { rating: 4.6 }),
	place("tomar-praca-da-republica", "Praça da República and São João Baptista", "tomar", 39.6031, -8.4117, "square", 0.55, { history: 0.8, architecture: 0.7, local_life: 0.7, spiritual: 0.5, photogenic: 0.5 }, { neighborhood: "Centro histórico", rating: 4.6 }),
	place("tomar-tasca-da-roda-dagua", "Tasca da Roda d'Água", "tomar", 39.604, -8.411, "restaurant", 0.42, { food_street: 0.9, local_life: 0.9, quiet: 0.5, wine: 0.4 }, { neighborhood: "Centro histórico", rating: 4.5, priceLevel: 1 }),

	// Guimarães (Portuguese twin of Lisbon): the cradle of Portugal
	place("guimaraes-castle", "Guimarães Castle", "guimaraes", 41.4479, -8.2904, "castle", 0.8, { history: 1, architecture: 0.7, photogenic: 0.7, outdoors: 0.2 }, { neighborhood: "Centro histórico", rating: 4.6 }),
	place("guimaraes-palace-of-the-dukes", "Palace of the Dukes of Braganza", "guimaraes", 41.4465, -8.291, "palace", 0.75, { history: 0.9, architecture: 0.9, photogenic: 0.6, art: 0.5 }, { neighborhood: "Centro histórico", rating: 4.5 }),
	place("guimaraes-largo-da-oliveira", "Largo da Oliveira", "guimaraes", 41.4425, -8.2945, "square", 0.7, { history: 0.9, local_life: 0.8, architecture: 0.7, photogenic: 0.7, cafes: 0.5 }, { neighborhood: "Centro histórico", rating: 4.8 }),
	place("guimaraes-rua-de-santa-maria", "Rua de Santa Maria", "guimaraes", 41.444, -8.2935, "street", 0.58, { history: 0.9, quiet: 0.7, photogenic: 0.7, architecture: 0.6, romance: 0.4 }, { neighborhood: "Centro histórico", rating: 4.7 }),
	place("guimaraes-monte-da-penha", "Monte da Penha", "guimaraes", 41.4318, -8.2698, "viewpoint", 0.55, { nature: 0.8, photogenic: 0.7, quiet: 0.7, spiritual: 0.6, outdoors: 0.6 }, { neighborhood: "Penha", rating: 4.7 }),
	place("guimaraes-tasca-pedra-de-granito", "Tasca Pedra de Granito", "guimaraes", 41.443, -8.2935, "restaurant", 0.48, { food_street: 0.9, local_life: 0.9, wine: 0.5 }, { neighborhood: "Centro histórico", rating: 4.5, priceLevel: 1 }),

	// Palermo (cross-border twin of Lisbon): Arab-Norman city of markets and street food
	place("palermo-cathedral", "Palermo Cathedral", "palermo", 38.1144, 13.3561, "church", 0.9, { architecture: 1, history: 0.9, spiritual: 0.8, photogenic: 0.8 }, { neighborhood: "Centro storico", rating: 4.7 }),
	place("palermo-cappella-palatina", "Palazzo dei Normanni and Cappella Palatina", "palermo", 38.1108, 13.3534, "palace", 0.86, { history: 1, art: 0.9, architecture: 0.9, spiritual: 0.7 }, { neighborhood: "Albergheria", rating: 4.7 }),
	place("palermo-ballaro", "Ballarò market", "palermo", 38.1115, 13.361, "market", 0.8, { markets: 1, food_street: 1, local_life: 0.9, photogenic: 0.5 }, { neighborhood: "Albergheria", rating: 4.4 }),
	place("palermo-quattro-canti", "Quattro Canti", "palermo", 38.1158, 13.3614, "square", 0.85, { architecture: 0.9, history: 0.8, photogenic: 0.8, local_life: 0.5 }, { neighborhood: "Centro storico", rating: 4.6 }),
	place("palermo-teatro-massimo", "Teatro Massimo", "palermo", 38.1203, 13.3572, "landmark", 0.82, { architecture: 0.9, music: 0.9, history: 0.6, art: 0.5, film: 0.5 }, { neighborhood: "Centro storico", rating: 4.7 }),
	place("palermo-mondello", "Mondello beach", "palermo", 38.2008, 13.3231, "beach", 0.84, { coast: 1, photogenic: 0.7, local_life: 0.6, outdoors: 0.5, architecture: 0.3 }, { neighborhood: "Mondello", rating: 4.5 }),
	place("palermo-la-kalsa", "La Kalsa", "palermo", 38.1161, 13.3689, "neighborhood", 0.6, { history: 0.9, local_life: 0.8, architecture: 0.6, art: 0.5, quiet: 0.5, nightlife: 0.4, literature: 0.4 }, { neighborhood: "Kalsa", rating: 4.5 }),
	place("palermo-friggitoria-scirocco-lento", "Friggitoria Scirocco Lento", "palermo", 38.1125, 13.3605, "restaurant", 0.52, { food_street: 1, local_life: 0.8, markets: 0.5 }, { neighborhood: "Albergheria", rating: 4.6, priceLevel: 1 }),

	// Valletta (cross-border twin of Lisbon): fortified Baroque capital on the harbour
	place("valletta-st-johns-co-cathedral", "St John's Co-Cathedral", "valletta", 35.8978, 14.5128, "church", 0.9, { art: 1, architecture: 0.9, history: 0.9, spiritual: 0.8, photogenic: 0.6 }, { rating: 4.8 }),
	place("valletta-upper-barrakka-gardens", "Upper Barrakka Gardens", "valletta", 35.8947, 14.5122, "garden", 0.88, { photogenic: 1, coast: 0.8, history: 0.7, garden: 0.6, romance: 0.6 }, { rating: 4.7 }),
	place("valletta-lower-barrakka-gardens", "Lower Barrakka Gardens", "valletta", 35.8975, 14.5178, "garden", 0.65, { coast: 0.8, photogenic: 0.8, quiet: 0.8, garden: 0.7, history: 0.6, romance: 0.5 }, { rating: 4.7 }),
	place("valletta-strait-street", "Strait Street", "valletta", 35.8985, 14.5134, "street", 0.66, { nightlife: 0.8, history: 0.7, music: 0.6, jazz: 0.5, local_life: 0.5 }, { rating: 4.5 }),
	place("valletta-fort-st-elmo", "Fort St Elmo", "valletta", 35.902, 14.5188, "castle", 0.62, { history: 1, coast: 0.8, quiet: 0.6, architecture: 0.6, film: 0.3 }, { rating: 4.5 }),
	place("valletta-grandmasters-palace", "Grandmaster's Palace", "valletta", 35.8989, 14.5138, "palace", 0.72, { history: 0.9, architecture: 0.8, art: 0.6 }, { rating: 4.5 }),
	place("valletta-kafe-gallarija", "Kafè Gallarija", "valletta", 35.898, 14.514, "cafe", 0.5, { cafes: 0.8, local_life: 0.8, food_street: 0.7 }, { rating: 4.5, priceLevel: 1 }),
	place("valletta-kantina-tal-bahar", "Kantina tal-Baħar", "valletta", 35.8992, 14.5118, "bar", 0.52, { wine: 0.9, nightlife: 0.6, romance: 0.5, jazz: 0.4, history: 0.4 }, { rating: 4.6, priceLevel: 2 }),

	// Naples (busy cross-border twin of Lisbon): street life, Baroque churches and the bay
	place("naples-spaccanapoli", "Spaccanapoli", "naples", 40.8485, 14.2555, "street", 0.95, { local_life: 1, food_street: 0.8, history: 0.8, photogenic: 0.6, spiritual: 0.4 }, { neighborhood: "Centro storico", rating: 4.6 }),
	place("naples-cappella-sansevero", "Cappella Sansevero (Veiled Christ)", "naples", 40.8492, 14.2549, "museum", 0.94, { art: 1, history: 0.8, spiritual: 0.6, whimsy: 0.3 }, { neighborhood: "Centro storico", rating: 4.8 }),
	place("naples-archaeological-museum", "National Archaeological Museum of Naples", "naples", 40.8536, 14.2506, "museum", 0.88, { history: 1, art: 0.9, architecture: 0.4 }, { rating: 4.7 }),
	place("naples-san-gregorio-armeno", "Via San Gregorio Armeno", "naples", 40.8505, 14.2577, "street", 0.9, { craft: 1, whimsy: 0.7, local_life: 0.6, shopping: 0.6, photogenic: 0.6 }, { neighborhood: "Centro storico", rating: 4.5 }),
	place("naples-castel-dellovo", "Castel dell'Ovo", "naples", 40.8278, 14.2481, "castle", 0.86, { coast: 0.9, photogenic: 0.9, history: 0.8, romance: 0.6 }, { neighborhood: "Santa Lucia", rating: 4.5 }),
	place("naples-quartieri-spagnoli", "Quartieri Spagnoli", "naples", 40.8408, 14.2464, "neighborhood", 0.86, { local_life: 1, food_street: 0.7, art: 0.6, photogenic: 0.6, nightlife: 0.5 }, { neighborhood: "Quartieri Spagnoli", rating: 4.5 }),
	place("naples-certosa-di-san-martino", "Certosa di San Martino", "naples", 40.8431, 14.2411, "museum", 0.7, { photogenic: 0.9, art: 0.8, history: 0.8, quiet: 0.6, spiritual: 0.6, coast: 0.4 }, { neighborhood: "Vomero", rating: 4.7 }),
	place("naples-pizzeria-vico-del-fumo", "Pizzeria Vico del Fumo", "naples", 40.849, 14.2565, "restaurant", 0.6, { food_street: 1, local_life: 0.8, history: 0.3 }, { neighborhood: "Centro storico", rating: 4.7, priceLevel: 1 }),
];
