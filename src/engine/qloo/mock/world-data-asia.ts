/**
 * SYNTHETIC demo world: Asia (Japan, South Korea, Taiwan, Vietnam, Laos, Indonesia).
 *
 * Place names and approximate coordinates are public knowledge. Every
 * popularity, rating, price level and taste-vector value is invented for
 * development and keyless demos. Nothing in this file comes from Qloo.
 * Cafes, restaurants and bars have fictional names and do not refer to real
 * businesses.
 *
 * Design notes for the mock engine:
 * - Quiet twins share the dominant facets of the crowded sight they mirror
 *   (see the trailing "twin of" comments), with lower popularity and more "quiet".
 * - Uji, Nara, Otsu, Omihachiman, Miyama, Ine, Miyazu, Wazuka and Hikone are
 *   day trips from Kyoto; Tampaksiring and the other Bali towns are day trips
 *   from Ubud.
 * - radiusKm is the compact core. The mock transport counts a place as inside
 *   a locality when its key matches OR it lies within radiusKm (+20%, capped at
 *   2.4 km), so radii stay tight where towns touch (Otsu's Mii-dera is 8 km
 *   from central Kyoto). Outlying places (Ohara, Kuang Si) belong by key.
 * - Gyeongju, Busan, Taipei and Yogyakarta centres sit a few km toward their
 *   main sights so a 10 km city circle captures them.
 */
import { place, type WorldLocality, type WorldPlace } from "./world-schema.ts";

export const ASIA_LOCALITIES: WorldLocality[] = [
	// Japan: Kyoto (hero base) and its day trips
	{
		key: "kyoto", name: "Kyoto", region: "Kyoto Prefecture", country: "Japan", countryCode: "JP",
		lat: 35.0253, lon: 135.7622, population: 1_440_000, popularity: 0.995, radiusKm: 6,
		vector: { spiritual: 1, history: 0.95, zen: 0.9, garden: 0.85, tea: 0.85, photogenic: 0.8, craft: 0.75, architecture: 0.7 },
		peakMonths: [3, 4, 10, 11], offSeasonMonths: [1, 2, 6], bestMonths: [5, 10],
		events: [
			{ month: 3, name: "Higashiyama Hanatoro lantern walk" },
			{ month: 5, name: "Aoi Matsuri" },
			{ month: 7, name: "Gion Matsuri" },
			{ month: 8, name: "Gozan no Okuribi bonfires" },
			{ month: 10, name: "Jidai Matsuri" },
		],
		traits: ["Zen temples", "Geisha district", "Matcha and tea ceremony", "Moss gardens", "Vermilion torii gates", "Machiya townhouses"],
	},
	{
		key: "uji", name: "Uji", region: "Kyoto Prefecture", country: "Japan", countryCode: "JP",
		lat: 34.8844, lon: 135.7998, population: 179_000, popularity: 0.9, radiusKm: 4,
		vector: { tea: 1, history: 0.85, spiritual: 0.8, water: 0.6, literature: 0.6, architecture: 0.6, garden: 0.55, photogenic: 0.55 },
		peakMonths: [4, 5, 11], offSeasonMonths: [1, 2], bestMonths: [5, 10],
		events: [
			{ month: 6, name: "Agata Matsuri" },
			{ month: 10, name: "Uji Tea Festival" },
		],
		traits: ["Matcha capital", "Tale of Genji country", "Phoenix Hall", "Riverside tea houses"],
	},
	{
		key: "nara", name: "Nara", region: "Nara Prefecture", country: "Japan", countryCode: "JP",
		lat: 34.685, lon: 135.8048, population: 350_000, popularity: 0.975, radiusKm: 6,
		vector: { history: 1, spiritual: 0.95, architecture: 0.75, nature: 0.7, photogenic: 0.7, whimsy: 0.6, garden: 0.45, craft: 0.4 },
		peakMonths: [3, 4, 10, 11], offSeasonMonths: [1, 2, 7], bestMonths: [5, 12],
		events: [
			{ month: 1, name: "Wakakusa Yamayaki" },
			{ month: 3, name: "Omizutori (Shuni-e)" },
			{ month: 8, name: "Nara Tokae lantern festival" },
		],
		traits: ["Bowing deer", "Great Buddha", "Ancient capital", "Merchant townhouses"],
	},
	{
		key: "otsu", name: "Otsu", region: "Shiga Prefecture", country: "Japan", countryCode: "JP",
		lat: 35.0105, lon: 135.8665, population: 345_000, popularity: 0.78, radiusKm: 3,
		vector: { water: 0.85, spiritual: 0.8, history: 0.75, nature: 0.6, photogenic: 0.5, outdoors: 0.45, quiet: 0.45, literature: 0.4 },
		peakMonths: [4, 8, 11], offSeasonMonths: [1, 2], bestMonths: [5, 10],
		events: [
			{ month: 8, name: "Biwako Fireworks Festival" },
			{ month: 10, name: "Otsu Matsuri" },
		],
		traits: ["Lake Biwa shore", "Temple-dotted hills", "Tale of Genji", "Stone-walled temple town"],
	},
	{
		key: "omihachiman", name: "Omihachiman", region: "Shiga Prefecture", country: "Japan", countryCode: "JP",
		lat: 35.1283, lon: 136.0981, population: 81_000, popularity: 0.62, radiusKm: 5,
		vector: { history: 0.85, water: 0.8, photogenic: 0.7, quiet: 0.65, architecture: 0.6, craft: 0.55, nature: 0.5, spiritual: 0.4 },
		peakMonths: [3, 4, 11], offSeasonMonths: [1, 2, 7], bestMonths: [5, 10],
		events: [
			{ month: 3, name: "Sagicho Fire Festival" },
			{ month: 4, name: "Hachiman Matsuri" },
		],
		traits: ["Merchant canal", "Omi merchant houses", "Reed-marsh boat rides", "Period-drama filming spot"],
	},
	{
		key: "miyama", name: "Miyama", region: "Kyoto Prefecture", country: "Japan", countryCode: "JP",
		lat: 35.3129, lon: 135.6221, population: 3_500, popularity: 0.58, radiusKm: 6,
		vector: { nature: 0.9, quiet: 0.85, history: 0.75, photogenic: 0.75, mountains: 0.6, craft: 0.55, local_life: 0.55, water: 0.4 },
		peakMonths: [8, 11], offSeasonMonths: [3, 6], bestMonths: [5, 10],
		events: [{ month: 1, name: "Miyama Snow Lantern Festival" }],
		traits: ["Thatched-roof farmhouses", "Mountain river valley", "Rural Kyoto", "Snow lanterns in winter"],
	},
	{
		key: "ine", name: "Ine", region: "Kyoto Prefecture", country: "Japan", countryCode: "JP",
		lat: 35.6752, lon: 135.2727, population: 1_900, popularity: 0.6, radiusKm: 3,
		vector: { coast: 0.95, water: 0.8, quiet: 0.8, photogenic: 0.8, local_life: 0.75, history: 0.55, food_street: 0.45, architecture: 0.45 },
		peakMonths: [8], offSeasonMonths: [1, 2], bestMonths: [5, 10, 11],
		events: [{ month: 7, name: "Ine Festival" }],
		traits: ["Funaya boathouses", "Fishing village", "Sea of Japan bay", "Fresh seafood"],
	},
	{
		key: "miyazu", name: "Miyazu", region: "Kyoto Prefecture", country: "Japan", countryCode: "JP",
		lat: 35.5356, lon: 135.1955, population: 16_000, popularity: 0.8, radiusKm: 7,
		vector: { coast: 0.9, photogenic: 0.85, nature: 0.8, spiritual: 0.6, water: 0.6, history: 0.55, outdoors: 0.5, quiet: 0.45 },
		peakMonths: [5, 8], offSeasonMonths: [1, 2], bestMonths: [10, 11],
		events: [{ month: 8, name: "Miyazu Toro Nagashi fireworks" }],
		traits: ["Pine-covered sandbar", "Bay views", "Ancient shrines", "Cycling across the bay"],
	},
	{
		key: "wazuka", name: "Wazuka", region: "Kyoto Prefecture", country: "Japan", countryCode: "JP",
		lat: 34.7956, lon: 135.9049, population: 3_600, popularity: 0.42, radiusKm: 5,
		vector: { tea: 1, quiet: 0.9, nature: 0.85, photogenic: 0.6, mountains: 0.55, local_life: 0.55, outdoors: 0.45, craft: 0.3 },
		peakMonths: [5], offSeasonMonths: [1, 2], bestMonths: [5, 10],
		traits: ["Terraced tea fields", "Uji tea country", "Hill farms", "Farm tea tastings"],
	},
	{
		key: "hikone", name: "Hikone", region: "Shiga Prefecture", country: "Japan", countryCode: "JP",
		lat: 35.2744, lon: 136.2597, population: 110_000, popularity: 0.76, radiusKm: 5,
		vector: { history: 0.95, architecture: 0.85, photogenic: 0.75, water: 0.6, garden: 0.5, whimsy: 0.45, local_life: 0.4, outdoors: 0.3 },
		peakMonths: [4, 11], offSeasonMonths: [1, 2], bestMonths: [5, 10],
		events: [{ month: 4, name: "Hikone Castle Cherry Blossom Festival" }],
		traits: ["Original castle keep", "Daimyo garden", "Lake Biwa views", "Beloved castle mascot"],
	},

	// Japan: twin cities for Kyoto (same country)
	{
		key: "kanazawa", name: "Kanazawa", region: "Ishikawa Prefecture", country: "Japan", countryCode: "JP",
		lat: 36.5611, lon: 136.6565, population: 460_000, popularity: 0.9, radiusKm: 7,
		vector: { garden: 0.95, craft: 0.95, history: 0.9, tea: 0.8, art: 0.7, photogenic: 0.7, spiritual: 0.55, zen: 0.5 },
		peakMonths: [5, 8, 11], offSeasonMonths: [1, 2], bestMonths: [4, 10],
		events: [
			{ month: 4, name: "Kenroku-en cherry blossom night opening" },
			{ month: 6, name: "Hyakumangoku Matsuri" },
		],
		traits: ["Samurai and geisha districts", "Gold-leaf crafts", "Landscape garden", "Seafood market", "Contemporary art"],
	},
	{
		key: "takayama", name: "Takayama", region: "Gifu Prefecture", country: "Japan", countryCode: "JP",
		lat: 36.146, lon: 137.2522, population: 83_000, popularity: 0.88, radiusKm: 5,
		vector: { history: 0.95, craft: 0.9, architecture: 0.75, photogenic: 0.75, mountains: 0.7, spiritual: 0.6, local_life: 0.6, markets: 0.55 },
		peakMonths: [4, 8, 10], offSeasonMonths: [3, 6], bestMonths: [5, 9, 11],
		events: [
			{ month: 4, name: "Spring Takayama Festival" },
			{ month: 10, name: "Autumn Takayama Festival" },
		],
		traits: ["Edo-era merchant streets", "Morning markets", "Sake breweries", "Alpine views", "Woodcraft"],
	},
	{
		key: "matsumoto", name: "Matsumoto", region: "Nagano Prefecture", country: "Japan", countryCode: "JP",
		lat: 36.238, lon: 137.972, population: 237_000, popularity: 0.86, radiusKm: 6,
		vector: { mountains: 0.85, history: 0.8, architecture: 0.8, craft: 0.75, photogenic: 0.7, art: 0.65, cafes: 0.5, music: 0.45 },
		peakMonths: [4, 8, 10], offSeasonMonths: [1, 2, 6], bestMonths: [5, 9, 11],
		events: [
			{ month: 4, name: "Matsumoto Castle Cherry Blossom Festival" },
			{ month: 5, name: "Crafts Fair Matsumoto" },
			{ month: 8, name: "Seiji Ozawa Matsumoto Festival" },
		],
		traits: ["Original black castle", "Northern Alps backdrop", "Craft culture", "Classical music festival", "Storehouse streets"],
	},
	{
		key: "kurashiki", name: "Kurashiki", region: "Okayama Prefecture", country: "Japan", countryCode: "JP",
		lat: 34.5851, lon: 133.7721, population: 474_000, popularity: 0.84, radiusKm: 6,
		vector: { history: 0.9, art: 0.8, photogenic: 0.8, water: 0.75, craft: 0.75, architecture: 0.75, romance: 0.5, cafes: 0.45 },
		peakMonths: [5, 8], offSeasonMonths: [1, 2], bestMonths: [4, 10, 11],
		events: [{ month: 3, name: "Kurashiki Haru Yoi Akari lantern festival" }],
		traits: ["Willow-lined canal", "White-walled storehouses", "Denim and folk crafts", "Western art museum", "Canal boat rides"],
	},
	{
		key: "hagi", name: "Hagi", region: "Yamaguchi Prefecture", country: "Japan", countryCode: "JP",
		lat: 34.4081, lon: 131.3992, population: 43_000, popularity: 0.76, radiusKm: 5,
		vector: { history: 0.95, craft: 0.85, quiet: 0.8, coast: 0.75, architecture: 0.55, tea: 0.5, literature: 0.5, spiritual: 0.45 },
		peakMonths: [5, 8], offSeasonMonths: [1, 2], bestMonths: [10, 11],
		events: [{ month: 5, name: "Hagi Pottery Festival" }],
		traits: ["Samurai castle town", "Hagi-yaki pottery", "Meiji Restoration history", "Sea of Japan coast", "White-walled lanes"],
	},

	// Cross-border twins for Kyoto
	{
		key: "gyeongju", name: "Gyeongju", region: "North Gyeongsang Province", country: "South Korea", countryCode: "KR",
		lat: 35.832, lon: 129.262, population: 245_000, popularity: 0.88, radiusKm: 12,
		vector: { history: 1, spiritual: 0.9, architecture: 0.75, photogenic: 0.75, garden: 0.6, nature: 0.6, zen: 0.55, tea: 0.5 },
		peakMonths: [5, 10], offSeasonMonths: [1, 2, 7], bestMonths: [4, 9, 11],
		events: [
			{ month: 4, name: "Gyeongju Cherry Blossom Marathon" },
			{ month: 10, name: "Silla Culture Festival" },
		],
		traits: ["Silla royal tombs", "Buddhist temples and grottoes", "Hanok villages", "Lotus ponds", "Cherry blossoms"],
	},
	{
		key: "hue", name: "Hue", region: "Hue City", country: "Vietnam", countryCode: "VN",
		lat: 16.4639, lon: 107.5867, population: 650_000, popularity: 0.86, radiusKm: 8,
		vector: { history: 0.95, architecture: 0.85, spiritual: 0.8, water: 0.7, photogenic: 0.7, garden: 0.6, food_street: 0.6, zen: 0.45 },
		peakMonths: [6, 7], offSeasonMonths: [10, 11], bestMonths: [2, 3, 4],
		events: [
			{ month: 2, name: "Tet Lunar New Year" },
			{ month: 9, name: "Mid-Autumn Lantern Festival" },
		],
		traits: ["Imperial citadel", "Royal tombs", "Perfume River", "Riverside pagodas", "Imperial cuisine"],
	},
	{
		key: "luang-prabang", name: "Luang Prabang", region: "Luang Prabang Province", country: "Laos", countryCode: "LA",
		lat: 19.89, lon: 102.1347, population: 56_000, popularity: 0.87, radiusKm: 13,
		vector: { spiritual: 0.95, history: 0.8, photogenic: 0.75, nature: 0.7, water: 0.65, quiet: 0.65, architecture: 0.65, zen: 0.55 },
		peakMonths: [12, 1], offSeasonMonths: [6, 7, 8], bestMonths: [11, 2],
		events: [
			{ month: 4, name: "Pi Mai Lao (Lao New Year)" },
			{ month: 10, name: "Boun Ok Phansa light-boat festival" },
		],
		traits: ["Gilded temples", "Morning alms procession", "Mekong sunsets", "Turquoise waterfalls", "French-colonial shophouses"],
	},

	// South Korea: Seoul (hotspot) and same-country twins
	{
		key: "seoul", name: "Seoul", region: "Seoul", country: "South Korea", countryCode: "KR",
		lat: 37.5663, lon: 126.9779, population: 9_400_000, popularity: 0.997, radiusKm: 15,
		vector: { food_street: 0.85, nightlife: 0.85, shopping: 0.85, cafes: 0.8, history: 0.7, design: 0.65, markets: 0.6, music: 0.6 },
		peakMonths: [4, 5, 10], offSeasonMonths: [1, 2, 7, 8], bestMonths: [6, 9],
		events: [
			{ month: 5, name: "Lotus Lantern Festival" },
			{ month: 10, name: "Seoul International Fireworks Festival" },
		],
		traits: ["Royal palaces", "Hanok alleys", "Street food and markets", "K-culture and nightlife", "Cafe culture", "Mountain trails in the city"],
	},
	{
		key: "busan", name: "Busan", region: "Busan", country: "South Korea", countryCode: "KR",
		lat: 35.1578, lon: 129.0597, population: 3_300_000, popularity: 0.95, radiusKm: 15,
		vector: { coast: 0.95, food_street: 0.85, markets: 0.75, photogenic: 0.7, nightlife: 0.65, cafes: 0.55, film: 0.5, spiritual: 0.45 },
		peakMonths: [7, 8, 10], offSeasonMonths: [1, 2], bestMonths: [5, 6, 9],
		events: [
			{ month: 8, name: "Busan Sea Festival" },
			{ month: 10, name: "Busan International Film Festival" },
			{ month: 11, name: "Busan Fireworks Festival" },
		],
		traits: ["City beaches", "Seaside temples", "Fish markets", "Hillside villages", "Film festival"],
	},
	{
		key: "jeonju", name: "Jeonju", region: "Jeonbuk State", country: "South Korea", countryCode: "KR",
		lat: 35.8239, lon: 127.1475, population: 640_000, popularity: 0.84, radiusKm: 6,
		vector: { history: 0.85, food_street: 0.85, craft: 0.8, architecture: 0.65, local_life: 0.65, markets: 0.6, photogenic: 0.6, tea: 0.45 },
		peakMonths: [5, 10], offSeasonMonths: [1, 2, 7], bestMonths: [4, 9],
		events: [
			{ month: 5, name: "Jeonju International Film Festival" },
			{ month: 10, name: "Jeonju Bibimbap Festival" },
		],
		traits: ["Hanok village", "Birthplace of bibimbap", "Hanji paper crafts", "Makgeolli alleys"],
	},

	// Taiwan: cross-border twin for Seoul
	{
		key: "taipei", name: "Taipei", region: "Taipei City", country: "Taiwan", countryCode: "TW",
		lat: 25.058, lon: 121.52, population: 2_500_000, popularity: 0.96, radiusKm: 12,
		vector: { food_street: 1, markets: 0.85, cafes: 0.8, local_life: 0.75, nightlife: 0.7, shopping: 0.55, history: 0.55, spiritual: 0.5 },
		peakMonths: [2, 12], offSeasonMonths: [7, 8], bestMonths: [3, 4, 10, 11],
		events: [
			{ month: 2, name: "Taipei Lantern Festival" },
			{ month: 6, name: "Dragon Boat Festival" },
			{ month: 12, name: "Taipei 101 New Year's Eve fireworks" },
		],
		traits: ["Night markets", "Temple culture", "Tea houses", "Hot springs", "Indie cafe scene"],
	},

	// Japan: Fukuoka, a second cross-border twin for Seoul
	{
		key: "fukuoka", name: "Fukuoka", region: "Fukuoka Prefecture", country: "Japan", countryCode: "JP",
		lat: 33.5901, lon: 130.4017, population: 1_640_000, popularity: 0.95, radiusKm: 8,
		vector: { food_street: 0.95, nightlife: 0.8, shopping: 0.75, local_life: 0.7, coast: 0.6, markets: 0.6, cafes: 0.6, history: 0.45 },
		peakMonths: [5, 7, 12], offSeasonMonths: [2, 6], bestMonths: [3, 4, 11],
		events: [
			{ month: 5, name: "Hakata Dontaku" },
			{ month: 7, name: "Hakata Gion Yamakasa" },
		],
		traits: ["Yatai street-food stalls", "Hakata ramen", "Shopping districts", "Seaside parks", "Festival floats"],
	},

	// Indonesia: Ubud (Bali hotspot) and its day trips
	{
		key: "ubud", name: "Ubud", region: "Bali", country: "Indonesia", countryCode: "ID",
		lat: -8.5068, lon: 115.2626, population: 75_000, popularity: 0.99, radiusKm: 6,
		vector: { spiritual: 0.9, nature: 0.9, craft: 0.85, art: 0.8, photogenic: 0.75, cafes: 0.55, zen: 0.5, outdoors: 0.5 },
		peakMonths: [7, 8, 12], offSeasonMonths: [1, 2, 11], bestMonths: [5, 6, 9],
		events: [
			{ month: 3, name: "Nyepi (Day of Silence)" },
			{ month: 10, name: "Ubud Writers & Readers Festival" },
		],
		traits: ["Rice terraces", "Hindu temples and offerings", "Yoga and wellness", "Craft villages", "Jungle ravines", "Balinese dance"],
	},
	{
		key: "tampaksiring", name: "Tampaksiring", region: "Bali", country: "Indonesia", countryCode: "ID",
		lat: -8.418, lon: 115.311, population: 50_000, popularity: 0.8, radiusKm: 3,
		vector: { spiritual: 0.95, water: 0.85, history: 0.7, nature: 0.6, photogenic: 0.6, architecture: 0.5, quiet: 0.4 },
		peakMonths: [7, 8], offSeasonMonths: [1, 2], bestMonths: [5, 6, 9],
		traits: ["Holy spring temples", "Rock-cut royal shrines", "River gorges"],
	},
	{
		key: "sidemen", name: "Sidemen", region: "Bali", country: "Indonesia", countryCode: "ID",
		lat: -8.4844, lon: 115.4387, population: 32_000, popularity: 0.55, radiusKm: 4,
		vector: { nature: 0.9, quiet: 0.85, photogenic: 0.75, local_life: 0.65, outdoors: 0.6, craft: 0.55, mountains: 0.55, spiritual: 0.45 },
		peakMonths: [7, 8], offSeasonMonths: [1, 2], bestMonths: [4, 5, 9],
		traits: ["Rice-terrace valley", "Mount Agung views", "Songket weaving", "Village life"],
	},
	{
		key: "munduk", name: "Munduk", region: "Bali", country: "Indonesia", countryCode: "ID",
		lat: -8.2684, lon: 115.0777, population: 6_000, popularity: 0.62, radiusKm: 5,
		vector: { nature: 0.95, water: 0.85, quiet: 0.8, outdoors: 0.8, mountains: 0.75, photogenic: 0.7, spiritual: 0.5, cafes: 0.45 },
		peakMonths: [7, 8], offSeasonMonths: [1, 2], bestMonths: [5, 6, 9],
		traits: ["Jungle waterfalls", "Coffee and clove hills", "Crater lakes", "Cool highland air"],
	},
	{
		key: "jatiluwih", name: "Jatiluwih", region: "Bali", country: "Indonesia", countryCode: "ID",
		lat: -8.3511, lon: 115.1164, population: 2_800, popularity: 0.72, radiusKm: 4,
		vector: { nature: 0.95, photogenic: 0.9, quiet: 0.7, outdoors: 0.7, mountains: 0.55, local_life: 0.5, history: 0.45, spiritual: 0.35 },
		peakMonths: [7, 8], offSeasonMonths: [1, 2], bestMonths: [4, 5, 9],
		traits: ["UNESCO subak rice terraces", "Highland villages", "Trekking trails", "Sacred mountain temple"],
	},
	{
		key: "amed", name: "Amed", region: "Bali", country: "Indonesia", countryCode: "ID",
		lat: -8.34, lon: 115.66, population: 8_000, popularity: 0.7, radiusKm: 5,
		vector: { coast: 0.95, outdoors: 0.8, water: 0.75, quiet: 0.75, nature: 0.6, photogenic: 0.6, local_life: 0.55, mountains: 0.35 },
		peakMonths: [7, 8], offSeasonMonths: [1, 2], bestMonths: [4, 5, 9, 10],
		traits: ["Black-sand coves", "Snorkeling and freediving", "Sea-salt farms", "Mount Agung views", "Jukung fishing boats"],
	},
	{
		key: "tirta-gangga", name: "Tirta Gangga", region: "Bali", country: "Indonesia", countryCode: "ID",
		lat: -8.4119, lon: 115.5869, population: 3_000, popularity: 0.74, radiusKm: 6,
		vector: { water: 0.85, photogenic: 0.8, garden: 0.75, spiritual: 0.7, nature: 0.65, history: 0.6, architecture: 0.55, mountains: 0.45 },
		peakMonths: [7, 8], offSeasonMonths: [1, 2], bestMonths: [4, 5, 9],
		traits: ["Royal water garden", "Gates of Heaven temple", "Terraced hills"],
	},
	{
		key: "pemuteran", name: "Pemuteran", region: "Bali", country: "Indonesia", countryCode: "ID",
		lat: -8.1453, lon: 114.6539, population: 9_000, popularity: 0.6, radiusKm: 4,
		vector: { coast: 0.95, quiet: 0.8, outdoors: 0.75, water: 0.75, nature: 0.65, local_life: 0.5, spiritual: 0.4 },
		peakMonths: [7, 8], offSeasonMonths: [1, 2], bestMonths: [4, 5, 9, 10],
		traits: ["Coral reef restoration", "Calm bay", "Monkey temple", "Gateway to Menjangan Island"],
	},
	{
		key: "bedugul", name: "Bedugul", region: "Bali", country: "Indonesia", countryCode: "ID",
		lat: -8.275, lon: 115.1643, population: 8_000, popularity: 0.82, radiusKm: 4,
		vector: { water: 0.85, photogenic: 0.85, spiritual: 0.8, nature: 0.8, mountains: 0.7, garden: 0.65, outdoors: 0.45, markets: 0.4 },
		peakMonths: [7, 8, 12], offSeasonMonths: [1, 2], bestMonths: [5, 6, 9],
		traits: ["Lake temple", "Cool highlands", "Botanic garden", "Strawberry farms"],
	},

	// Indonesia: same-country twin for Ubud (Borobudur kept separate: it lies ~28 km from Yogyakarta)
	{
		key: "yogyakarta", name: "Yogyakarta", region: "Special Region of Yogyakarta", country: "Indonesia", countryCode: "ID",
		lat: -7.7956, lon: 110.42, population: 375_000, popularity: 0.9, radiusKm: 10,
		vector: { craft: 0.9, art: 0.9, history: 0.85, spiritual: 0.75, food_street: 0.65, photogenic: 0.6, music: 0.55, nature: 0.4 },
		peakMonths: [6, 7, 12], offSeasonMonths: [1, 2], bestMonths: [5, 9],
		events: [
			{ month: 7, name: "ARTJOG contemporary art festival" },
			{ month: 11, name: "Ngayogjazz" },
		],
		traits: ["Sultan's palace", "Batik and silver crafts", "Ancient temples", "Student city", "Gamelan and shadow puppets"],
	},
	{
		key: "borobudur", name: "Borobudur", region: "Central Java", country: "Indonesia", countryCode: "ID",
		lat: -7.6079, lon: 110.2038, population: 60_000, popularity: 0.92, radiusKm: 4,
		vector: { spiritual: 0.95, history: 0.95, architecture: 0.9, photogenic: 0.85, mountains: 0.6, nature: 0.5, quiet: 0.4 },
		peakMonths: [6, 7, 12], offSeasonMonths: [1, 2], bestMonths: [5, 9],
		events: [{ month: 5, name: "Vesak at Borobudur" }],
		traits: ["Buddhist monument", "Sunrise over volcanoes", "Village cycling"],
	},
];

export const ASIA_PLACES: WorldPlace[] = [
	// Kyoto
	place("kyoto-fushimi-inari", "Fushimi Inari Taisha", "kyoto", 34.9672, 135.7734, "shrine", 0.999, { spiritual: 1, photogenic: 0.95, history: 0.7, mountains: 0.6, nature: 0.55, outdoors: 0.5, whimsy: 0.3, food_street: 0.2 }, { neighborhood: "Fushimi", rating: 4.7 }),
	place("kyoto-kiyomizu-dera", "Kiyomizu-dera", "kyoto", 34.9948, 135.785, "temple", 0.998, { spiritual: 0.95, architecture: 0.95, photogenic: 0.95, history: 0.9, nature: 0.4, romance: 0.3, shopping: 0.3 }, { neighborhood: "Higashiyama", rating: 4.6 }),
	place("kyoto-kinkaku-ji", "Kinkaku-ji (Golden Pavilion)", "kyoto", 35.0394, 135.7294, "temple", 0.998, { photogenic: 1, architecture: 0.95, garden: 0.85, history: 0.85, spiritual: 0.75, zen: 0.7, water: 0.55 }, { neighborhood: "Kita", rating: 4.6 }),
	place("kyoto-arashiyama-bamboo-grove", "Arashiyama Bamboo Grove", "kyoto", 35.0167, 135.6712, "trail", 0.999, { photogenic: 1, nature: 0.95, zen: 0.55, whimsy: 0.35, outdoors: 0.35, spiritual: 0.3, film: 0.25 }, { neighborhood: "Arashiyama", rating: 4.4 }),
	place("kyoto-hanamikoji", "Hanamikoji Street", "kyoto", 35.0024, 135.7752, "street", 0.995, { history: 0.9, photogenic: 0.85, architecture: 0.7, romance: 0.6, food_fine: 0.55, tea: 0.45, nightlife: 0.4, local_life: 0.25 }, { neighborhood: "Gion", rating: 4.4 }),
	place("kyoto-nishiki-market", "Nishiki Market", "kyoto", 35.005, 135.7661, "market", 0.995, { markets: 1, food_street: 0.95, local_life: 0.55, shopping: 0.5, history: 0.35, craft: 0.25 }, { neighborhood: "Nakagyo", rating: 4.3 }),
	place("kyoto-ginkaku-ji", "Ginkaku-ji (Silver Pavilion)", "kyoto", 35.0269, 135.7983, "temple", 0.985, { zen: 0.95, garden: 0.95, history: 0.85, spiritual: 0.8, photogenic: 0.8, architecture: 0.75, tea: 0.4, nature: 0.35 }, { neighborhood: "Sakyo", rating: 4.5 }),
	place("kyoto-philosophers-path", "Philosopher's Path", "kyoto", 35.0251, 135.7962, "trail", 0.985, { photogenic: 0.85, water: 0.7, nature: 0.65, romance: 0.6, literature: 0.5, spiritual: 0.35, local_life: 0.3, cafes: 0.25 }, { neighborhood: "Sakyo", rating: 4.5 }),
	place("kyoto-sanjusangen-do", "Sanjusangen-do", "kyoto", 34.9879, 135.7717, "temple", 0.975, { spiritual: 0.95, art: 0.9, history: 0.9, architecture: 0.8, craft: 0.35 }, { neighborhood: "Higashiyama", rating: 4.7 }),
	place("kyoto-tenryu-ji", "Tenryu-ji", "kyoto", 35.016, 135.6738, "temple", 0.98, { zen: 0.95, garden: 0.95, spiritual: 0.85, history: 0.8, photogenic: 0.8, architecture: 0.6, nature: 0.55, water: 0.4 }, { neighborhood: "Arashiyama", rating: 4.5 }),
	place("kyoto-fushimi-kandakara", "Fushimi Kandakara Shrine", "kyoto", 34.9668, 135.777, "shrine", 0.6, { spiritual: 0.9, photogenic: 0.75, quiet: 0.75, nature: 0.65, mountains: 0.55, whimsy: 0.5, history: 0.45, outdoors: 0.4 }, { neighborhood: "Fushimi", rating: 4.6 }), // twin of Fushimi Inari
	place("kyoto-takenaka-inari", "Takenaka Inari Shrine", "kyoto", 35.0228, 135.7872, "shrine", 0.48, { spiritual: 0.9, quiet: 0.85, photogenic: 0.7, nature: 0.55, history: 0.45, local_life: 0.45, mountains: 0.35, outdoors: 0.3 }, { neighborhood: "Yoshida", rating: 4.5 }), // twin of Fushimi Inari
	place("kyoto-sekizan-zen-in", "Sekizan Zen-in", "kyoto", 35.0559, 135.8013, "temple", 0.56, { spiritual: 0.9, quiet: 0.75, photogenic: 0.7, nature: 0.6, history: 0.6, whimsy: 0.35, mountains: 0.35, garden: 0.3 }, { neighborhood: "Shugakuin", rating: 4.5 }), // twin of Fushimi Inari
	place("kyoto-kifune-shrine", "Kifune Shrine", "kyoto", 35.1217, 135.763, "shrine", 0.82, { spiritual: 0.9, nature: 0.85, photogenic: 0.8, water: 0.6, mountains: 0.55, romance: 0.55, quiet: 0.45, history: 0.45 }, { neighborhood: "Kibune", rating: 4.6 }), // twin of Fushimi Inari
	place("kyoto-kurama-dera", "Kurama-dera", "kyoto", 35.1181, 135.7707, "temple", 0.84, { spiritual: 0.95, mountains: 0.85, nature: 0.8, outdoors: 0.7, history: 0.55, photogenic: 0.55, quiet: 0.5, whimsy: 0.4 }, { neighborhood: "Kurama", rating: 4.6 }), // twin of Fushimi Inari
	place("kyoto-shoren-in", "Shoren-in", "kyoto", 35.0073, 135.7832, "temple", 0.64, { spiritual: 0.85, quiet: 0.8, garden: 0.75, history: 0.75, architecture: 0.6, photogenic: 0.55, zen: 0.5, nature: 0.4 }, { neighborhood: "Higashiyama", rating: 4.6 }), // twin of Ginkaku-ji, Tenryu-ji
	place("kyoto-shogunzuka-seiryuden", "Shogunzuka Seiryuden", "kyoto", 35.0021, 135.7869, "temple", 0.5, { architecture: 0.85, photogenic: 0.85, quiet: 0.85, spiritual: 0.8, history: 0.65, nature: 0.55, romance: 0.5 }, { neighborhood: "Higashiyama", rating: 4.6 }), // twin of Kiyomizu-dera (wooden stage, night views)
	place("kyoto-honen-in", "Honen-in", "kyoto", 35.024, 135.7974, "temple", 0.58, { zen: 0.9, garden: 0.9, spiritual: 0.85, quiet: 0.8, photogenic: 0.7, history: 0.65, architecture: 0.45, nature: 0.45 }, { neighborhood: "Sakyo", rating: 4.5 }), // twin of Ginkaku-ji
	place("kyoto-shisen-do", "Shisen-do", "kyoto", 35.0437, 135.7962, "temple", 0.56, { zen: 0.95, garden: 0.95, quiet: 0.9, history: 0.6, literature: 0.55, spiritual: 0.55, photogenic: 0.55, tea: 0.35 }, { neighborhood: "Ichijoji", rating: 4.6 }), // twin of Ginkaku-ji
	place("kyoto-manshu-in", "Manshu-in", "kyoto", 35.0488, 135.8031, "temple", 0.5, { garden: 0.9, zen: 0.85, quiet: 0.85, history: 0.75, spiritual: 0.75, architecture: 0.7, photogenic: 0.5 }, { neighborhood: "Shugakuin", rating: 4.5 }), // twin of Ginkaku-ji
	place("kyoto-enko-ji", "Enko-ji", "kyoto", 35.0451, 135.797, "temple", 0.66, { garden: 0.9, zen: 0.8, spiritual: 0.75, nature: 0.7, photogenic: 0.7, quiet: 0.7, history: 0.55 }, { neighborhood: "Ichijoji", rating: 4.6 }), // twin of Ginkaku-ji, Tenryu-ji
	place("kyoto-daitoku-ji", "Daitoku-ji", "kyoto", 35.0439, 135.7461, "temple", 0.8, { zen: 1, garden: 0.85, spiritual: 0.85, history: 0.85, tea: 0.75, quiet: 0.7, architecture: 0.6 }, { neighborhood: "Kita", rating: 4.5 }), // twin of Ginkaku-ji, Kinkaku-ji
	place("kyoto-tofuku-ji", "Tofuku-ji", "kyoto", 34.977, 135.7741, "temple", 0.88, { zen: 0.9, garden: 0.85, spiritual: 0.85, architecture: 0.75, photogenic: 0.75, history: 0.7, nature: 0.5, quiet: 0.4 }, { neighborhood: "Higashiyama", rating: 4.6 }), // twin of Tenryu-ji, Ginkaku-ji (busy only in autumn)
	place("kyoto-sanzen-in", "Sanzen-in", "kyoto", 35.1197, 135.8344, "temple", 0.85, { garden: 0.9, spiritual: 0.85, nature: 0.8, photogenic: 0.75, zen: 0.7, quiet: 0.6, mountains: 0.45, whimsy: 0.3 }, { neighborhood: "Ohara", rating: 4.6 }), // twin of Tenryu-ji
	place("kyoto-jakko-in", "Jakko-in", "kyoto", 35.1241, 135.821, "temple", 0.55, { spiritual: 0.85, quiet: 0.85, history: 0.75, nature: 0.7, literature: 0.6, garden: 0.6, zen: 0.55, mountains: 0.4 }, { neighborhood: "Ohara", rating: 4.4 }), // twin of Tenryu-ji, Ginkaku-ji
	place("kyoto-jingo-ji", "Jingo-ji", "kyoto", 35.055, 135.6709, "temple", 0.64, { spiritual: 0.9, nature: 0.8, history: 0.75, mountains: 0.7, photogenic: 0.7, quiet: 0.7, architecture: 0.55, outdoors: 0.5 }, { neighborhood: "Takao", rating: 4.6 }), // twin of Kiyomizu-dera, Fushimi Inari
	place("kyoto-daigo-ji", "Daigo-ji", "kyoto", 34.9515, 135.8218, "temple", 0.82, { spiritual: 0.9, history: 0.9, architecture: 0.85, photogenic: 0.75, garden: 0.6, nature: 0.5, quiet: 0.5 }, { neighborhood: "Daigo", rating: 4.6 }), // twin of Kiyomizu-dera
	place("kyoto-bishamon-do", "Bishamon-do", "kyoto", 35.0016, 135.8189, "temple", 0.5, { spiritual: 0.85, quiet: 0.8, nature: 0.75, photogenic: 0.75, history: 0.6, architecture: 0.5, garden: 0.5 }, { neighborhood: "Yamashina", rating: 4.5 }), // twin of Kiyomizu-dera (maple-carpeted approach)
	place("kyoto-adashino-nenbutsu-ji", "Adashino Nenbutsu-ji", "kyoto", 35.0268, 135.6645, "temple", 0.62, { nature: 0.8, photogenic: 0.8, quiet: 0.8, spiritual: 0.75, zen: 0.6, history: 0.5, whimsy: 0.25 }, { neighborhood: "Sagano", rating: 4.4 }), // twin of Arashiyama Bamboo Grove
	place("kyoto-otagi-nenbutsu-ji", "Otagi Nenbutsu-ji", "kyoto", 35.0314, 135.6611, "temple", 0.52, { nature: 0.85, photogenic: 0.85, whimsy: 0.8, quiet: 0.8, spiritual: 0.7, art: 0.55, history: 0.3 }, { neighborhood: "Sagano", rating: 4.6 }), // twin of Arashiyama Bamboo Grove (mossy forest, 1,200 playful statues)
	place("kyoto-gio-ji", "Gio-ji", "kyoto", 35.0234, 135.6668, "temple", 0.6, { nature: 0.85, photogenic: 0.8, quiet: 0.8, zen: 0.7, garden: 0.65, spiritual: 0.55, romance: 0.45, literature: 0.4 }, { neighborhood: "Sagano", rating: 4.5 }), // twin of Arashiyama Bamboo Grove (moss and bamboo)
	place("kyoto-daikaku-ji", "Daikaku-ji", "kyoto", 35.0282, 135.6777, "temple", 0.7, { history: 0.85, architecture: 0.8, garden: 0.8, spiritual: 0.8, photogenic: 0.75, water: 0.7, quiet: 0.65, zen: 0.5 }, { neighborhood: "Saga", rating: 4.5 }), // twin of Kinkaku-ji
	place("kyoto-to-ji", "To-ji", "kyoto", 34.9804, 135.7477, "temple", 0.9, { spiritual: 0.9, history: 0.9, architecture: 0.85, art: 0.7, photogenic: 0.65, markets: 0.4, quiet: 0.35 }, { neighborhood: "Minami", rating: 4.5 }), // twin of Sanjusangen-do
	place("kyoto-sennyu-ji", "Sennyu-ji", "kyoto", 34.9781, 135.7803, "temple", 0.5, { spiritual: 0.9, quiet: 0.85, history: 0.85, architecture: 0.65, art: 0.6, garden: 0.5 }, { neighborhood: "Higashiyama", rating: 4.4 }), // twin of Sanjusangen-do
	place("kyoto-kamishichiken", "Kamishichiken", "kyoto", 35.0298, 135.7367, "neighborhood", 0.62, { history: 0.9, photogenic: 0.7, architecture: 0.7, quiet: 0.7, romance: 0.55, tea: 0.45, local_life: 0.45, nightlife: 0.3 }, { neighborhood: "Kamigyo", rating: 4.4 }), // twin of Hanamikoji Street
	place("kyoto-fushimi-sake-district", "Fushimi Sake District", "kyoto", 34.9297, 135.7622, "neighborhood", 0.74, { history: 0.75, local_life: 0.65, water: 0.6, photogenic: 0.6, quiet: 0.55, food_street: 0.5, craft: 0.5, nightlife: 0.35 }, { neighborhood: "Fushimi", rating: 4.4 }), // twin of Hanamikoji Street, Nishiki Market
	place("kyoto-demachi-masugata", "Demachi Masugata Shotengai", "kyoto", 35.0303, 135.7696, "market", 0.5, { local_life: 0.9, markets: 0.85, food_street: 0.8, quiet: 0.45, shopping: 0.4, film: 0.3, whimsy: 0.25 }, { neighborhood: "Demachiyanagi", rating: 4.3 }), // twin of Nishiki Market
	place("kyoto-kamo-river-delta", "Kamo River Delta", "kyoto", 35.0299, 135.7717, "park", 0.6, { water: 0.85, local_life: 0.85, nature: 0.6, photogenic: 0.6, romance: 0.5, whimsy: 0.45, quiet: 0.45, literature: 0.35 }, { neighborhood: "Demachiyanagi", rating: 4.5 }), // twin of Philosopher's Path
	place("kyoto-yamashina-canal", "Yamashina Canal Path", "kyoto", 34.9985, 135.816, "trail", 0.45, { quiet: 0.85, water: 0.8, photogenic: 0.75, nature: 0.7, romance: 0.5, local_life: 0.45, outdoors: 0.3, spiritual: 0.25 }, { neighborhood: "Yamashina", rating: 4.5 }), // twin of Philosopher's Path
	place("kyoto-kamogawa-morning-kissa", "Kamogawa Morning Kissa", "kyoto", 35.0293, 135.7728, "cafe", 0.48, { cafes: 0.95, local_life: 0.7, quiet: 0.5, music: 0.35, literature: 0.3, whimsy: 0.25 }, { neighborhood: "Demachiyanagi", rating: 4.5, priceLevel: 1 }),
	place("kyoto-okazaki-matcha-atelier", "Okazaki Matcha Atelier", "kyoto", 35.0142, 135.7838, "cafe", 0.6, { tea: 1, cafes: 0.75, zen: 0.45, design: 0.45, quiet: 0.45, garden: 0.3 }, { neighborhood: "Okazaki", rating: 4.6, priceLevel: 2 }),
	place("kyoto-shugakuin-moss-tea-room", "Shugakuin Moss Tea Room", "kyoto", 35.0472, 135.7985, "teahouse", 0.42, { tea: 0.95, quiet: 0.8, garden: 0.65, zen: 0.6, cafes: 0.45, history: 0.3 }, { neighborhood: "Shugakuin", rating: 4.7, priceLevel: 2 }),
	place("kyoto-nishijin-tofu-kitchen", "Nishijin Tofu Kitchen", "kyoto", 35.03, 135.7468, "restaurant", 0.5, { local_life: 0.65, food_street: 0.55, food_fine: 0.45, quiet: 0.45, zen: 0.35, craft: 0.35 }, { neighborhood: "Nishijin", rating: 4.4, priceLevel: 2 }),
	place("kyoto-sagano-shojin-table", "Sagano Shojin Table", "kyoto", 35.0215, 135.6745, "restaurant", 0.55, { food_fine: 0.8, zen: 0.75, quiet: 0.6, garden: 0.45, spiritual: 0.4, nature: 0.3 }, { neighborhood: "Sagano", rating: 4.6, priceLevel: 3 }),
	place("kyoto-kiyamachi-lantern-izakaya", "Kiyamachi Lantern Izakaya", "kyoto", 35.0062, 135.7703, "restaurant", 0.62, { food_street: 0.85, nightlife: 0.75, local_life: 0.6, romance: 0.3, water: 0.2 }, { neighborhood: "Kiyamachi", rating: 4.3, priceLevel: 2 }),
	place("kyoto-kamigamo-seasonal-kaiseki", "Kamigamo Seasonal Kaiseki", "kyoto", 35.0565, 135.7545, "restaurant", 0.45, { food_fine: 1, quiet: 0.55, garden: 0.5, tea: 0.45, romance: 0.35, zen: 0.35 }, { neighborhood: "Kamigamo", rating: 4.8, priceLevel: 4 }),
	place("kyoto-sakyo-midnight-vinyl", "Sakyo Midnight Vinyl", "kyoto", 35.0278, 135.779, "bar", 0.45, { jazz: 1, music: 0.85, nightlife: 0.75, romance: 0.4, film: 0.3, quiet: 0.25 }, { neighborhood: "Sakyo", rating: 4.6, priceLevel: 2 }),
	place("kyoto-nijo-natural-wine-counter", "Nijo Natural Wine Counter", "kyoto", 35.0118, 135.7505, "bar", 0.5, { wine: 1, nightlife: 0.6, design: 0.45, local_life: 0.45, food_fine: 0.35 }, { neighborhood: "Nijo", rating: 4.5, priceLevel: 3 }),

	// Uji
	place("uji-byodo-in", "Byodo-in", "uji", 34.8894, 135.8078, "temple", 0.97, { architecture: 0.95, photogenic: 0.95, history: 0.9, garden: 0.8, spiritual: 0.8, water: 0.6, art: 0.55, zen: 0.4 }, { rating: 4.6 }),
	place("uji-ujigami-shrine", "Ujigami Shrine", "uji", 34.8921, 135.8115, "shrine", 0.66, { spiritual: 0.9, history: 0.9, quiet: 0.8, architecture: 0.7, nature: 0.5, zen: 0.35 }, { rating: 4.4 }),
	place("uji-kosho-ji", "Kosho-ji", "uji", 34.8901, 135.813, "temple", 0.55, { zen: 0.85, spiritual: 0.8, nature: 0.75, photogenic: 0.75, quiet: 0.75, garden: 0.55 }, { rating: 4.5 }),
	place("uji-tale-of-genji-museum", "The Tale of Genji Museum", "uji", 34.8938, 135.8106, "museum", 0.62, { literature: 0.95, history: 0.75, art: 0.55, quiet: 0.55, romance: 0.5, design: 0.35 }, { rating: 4.3 }),
	place("uji-kawagiri-tea-house", "Kawagiri Riverside Tea House", "uji", 34.8902, 135.8072, "teahouse", 0.52, { tea: 1, cafes: 0.55, water: 0.45, quiet: 0.45, history: 0.35, garden: 0.3 }, { rating: 4.5, priceLevel: 2 }),

	// Nara
	place("nara-todai-ji", "Todai-ji", "nara", 34.6892, 135.8397, "temple", 0.99, { spiritual: 1, history: 0.95, architecture: 0.95, photogenic: 0.8, art: 0.65, nature: 0.3 }, { rating: 4.7 }),
	place("nara-nara-park", "Nara Park", "nara", 34.6855, 135.8434, "park", 0.99, { whimsy: 0.85, photogenic: 0.85, nature: 0.8, history: 0.5, outdoors: 0.45, spiritual: 0.35 }, { rating: 4.6 }),
	place("nara-naramachi", "Naramachi", "nara", 34.6758, 135.83, "neighborhood", 0.74, { history: 0.8, local_life: 0.75, craft: 0.65, quiet: 0.65, architecture: 0.6, photogenic: 0.5, cafes: 0.45 }, { rating: 4.4 }),
	place("nara-shin-yakushi-ji", "Shin-Yakushi-ji", "nara", 34.6759, 135.8462, "temple", 0.56, { spiritual: 0.9, history: 0.9, quiet: 0.85, art: 0.8, architecture: 0.55 }, { rating: 4.5 }),
	place("nara-yoshikien", "Yoshikien Garden", "nara", 34.6852, 135.8373, "garden", 0.6, { garden: 0.95, quiet: 0.8, zen: 0.65, photogenic: 0.6, tea: 0.5, history: 0.5 }, { rating: 4.6 }),

	// Otsu
	place("otsu-mii-dera", "Mii-dera", "otsu", 35.0134, 135.8529, "temple", 0.76, { spiritual: 0.9, history: 0.85, architecture: 0.75, quiet: 0.6, photogenic: 0.6, nature: 0.55, water: 0.3 }, { rating: 4.5 }),
	place("otsu-ishiyama-dera", "Ishiyama-dera", "otsu", 34.9604, 135.9056, "temple", 0.78, { spiritual: 0.9, history: 0.85, literature: 0.6, nature: 0.6, photogenic: 0.6, quiet: 0.55, architecture: 0.55, garden: 0.5 }, { rating: 4.5 }),
	place("otsu-hiyoshi-taisha", "Hiyoshi Taisha", "otsu", 35.0734, 135.865, "shrine", 0.6, { spiritual: 0.9, nature: 0.75, history: 0.75, quiet: 0.75, photogenic: 0.6, mountains: 0.45, whimsy: 0.3 }, { neighborhood: "Sakamoto", rating: 4.5 }),
	place("otsu-lakeside-nagisa-park", "Otsu Lakeside Nagisa Park", "otsu", 35.0071, 135.8776, "park", 0.5, { water: 0.9, nature: 0.55, quiet: 0.55, photogenic: 0.55, local_life: 0.5, outdoors: 0.5, romance: 0.3 }, { rating: 4.2 }),

	// Omihachiman
	place("omihachiman-hachiman-bori", "Hachiman-bori Canal", "omihachiman", 35.1398, 136.09, "neighborhood", 0.8, { water: 0.85, history: 0.85, photogenic: 0.85, quiet: 0.55, architecture: 0.55, film: 0.45, romance: 0.4, nature: 0.35 }, { rating: 4.5 }),
	place("omihachiman-himure-hachimangu", "Himure Hachimangu", "omihachiman", 35.1408, 136.0895, "shrine", 0.58, { spiritual: 0.85, history: 0.75, quiet: 0.7, nature: 0.45, architecture: 0.45, photogenic: 0.45 }, { rating: 4.4 }),
	place("omihachiman-shinmachi-dori", "Shinmachi-dori Merchant Street", "omihachiman", 35.1375, 136.0898, "street", 0.52, { history: 0.85, quiet: 0.75, architecture: 0.7, photogenic: 0.55, craft: 0.5, local_life: 0.5 }, { rating: 4.3 }),
	place("omihachiman-nishinoko-reed-marshes", "Nishinoko Reed Marshes", "omihachiman", 35.1581, 136.1148, "lake", 0.5, { water: 0.9, nature: 0.85, quiet: 0.85, photogenic: 0.6, outdoors: 0.45, history: 0.35, romance: 0.3 }, { rating: 4.5 }),

	// Miyama
	place("miyama-kayabuki-no-sato", "Kayabuki no Sato (Thatched Village)", "miyama", 35.313, 135.6229, "village", 0.8, { photogenic: 0.9, history: 0.85, nature: 0.8, quiet: 0.7, craft: 0.6, mountains: 0.55, local_life: 0.45 }, { rating: 4.6 }),
	place("miyama-folk-museum", "Miyama Folk Museum", "miyama", 35.3138, 135.6231, "museum", 0.42, { history: 0.85, quiet: 0.85, craft: 0.75, local_life: 0.5, architecture: 0.45 }, { rating: 4.3 }),
	place("miyama-yura-river-valley", "Yura River Valley", "miyama", 35.3105, 135.6215, "viewpoint", 0.38, { nature: 0.9, quiet: 0.9, water: 0.8, mountains: 0.6, outdoors: 0.6, photogenic: 0.55 }, { rating: 4.5 }),

	// Ine
	place("ine-funaya-boathouses", "Ine Funaya Boathouses", "ine", 35.6752, 135.2867, "village", 0.82, { coast: 0.9, photogenic: 0.9, water: 0.8, quiet: 0.7, history: 0.65, local_life: 0.65, architecture: 0.5 }, { rating: 4.6 }),
	place("ine-funaya-no-sato-park", "Funaya no Sato Park", "ine", 35.6755, 135.2929, "viewpoint", 0.5, { photogenic: 0.85, coast: 0.8, quiet: 0.75, nature: 0.55, water: 0.5 }, { rating: 4.4 }),
	place("ine-bay-tide-kitchen", "Ine Bay Tide Kitchen", "ine", 35.6745, 135.2835, "restaurant", 0.45, { food_street: 0.65, coast: 0.65, local_life: 0.65, quiet: 0.55, food_fine: 0.4 }, { rating: 4.4, priceLevel: 2 }),

	// Miyazu
	place("miyazu-amanohashidate", "Amanohashidate", "miyazu", 35.5694, 135.1915, "landmark", 0.92, { coast: 0.95, photogenic: 0.95, nature: 0.8, water: 0.65, outdoors: 0.5, spiritual: 0.25 }, { rating: 4.5 }),
	place("miyazu-kasamatsu-park", "Kasamatsu Park", "miyazu", 35.5869, 135.1947, "viewpoint", 0.66, { photogenic: 0.85, coast: 0.75, nature: 0.6, quiet: 0.55, whimsy: 0.5, outdoors: 0.35 }, { rating: 4.4 }),
	place("miyazu-kono-shrine", "Kono Shrine", "miyazu", 35.5828, 135.1967, "shrine", 0.58, { spiritual: 0.95, history: 0.85, quiet: 0.75, nature: 0.5, architecture: 0.4 }, { rating: 4.5 }),
	place("miyazu-chion-ji", "Chion-ji", "miyazu", 35.5587, 135.1841, "temple", 0.64, { spiritual: 0.85, history: 0.7, quiet: 0.55, photogenic: 0.5, coast: 0.45 }, { rating: 4.3 }),

	// Wazuka
	place("wazuka-ishitera-tea-fields", "Ishitera Tea Fields", "wazuka", 34.7848, 135.882, "viewpoint", 0.58, { tea: 1, nature: 0.85, quiet: 0.85, photogenic: 0.8, history: 0.45, local_life: 0.45, outdoors: 0.45, mountains: 0.4 }, { rating: 4.6 }),
	place("wazuka-ridgeline-tea-tasting-room", "Ridgeline Tea Tasting Room", "wazuka", 34.7962, 135.9035, "teahouse", 0.4, { tea: 1, quiet: 0.8, local_life: 0.55, nature: 0.55, cafes: 0.45, craft: 0.35 }, { rating: 4.7, priceLevel: 2 }),

	// Hikone
	place("hikone-hikone-castle", "Hikone Castle", "hikone", 35.2764, 136.2519, "castle", 0.88, { history: 0.95, architecture: 0.9, photogenic: 0.8, nature: 0.45, whimsy: 0.4, water: 0.35 }, { rating: 4.5 }),
	place("hikone-genkyu-en", "Genkyu-en Garden", "hikone", 35.2786, 136.2533, "garden", 0.68, { garden: 0.95, photogenic: 0.75, history: 0.7, quiet: 0.65, water: 0.6, zen: 0.6, tea: 0.55 }, { rating: 4.5 }),
	place("hikone-ryotan-ji", "Ryotan-ji", "hikone", 35.2828, 136.2667, "temple", 0.46, { zen: 0.9, garden: 0.9, quiet: 0.85, spiritual: 0.8, history: 0.65 }, { rating: 4.4 }),
	place("hikone-yume-kyobashi", "Yume Kyobashi Castle Road", "hikone", 35.271, 136.2516, "street", 0.6, { history: 0.6, shopping: 0.6, food_street: 0.6, architecture: 0.55, local_life: 0.5 }, { rating: 4.2 }),

	// Kanazawa
	place("kanazawa-kenroku-en", "Kenroku-en", "kanazawa", 36.5619, 136.6625, "garden", 0.95, { garden: 1, photogenic: 0.9, history: 0.7, nature: 0.6, water: 0.5, zen: 0.5, tea: 0.35 }, { rating: 4.6 }),
	place("kanazawa-higashi-chaya", "Higashi Chaya District", "kanazawa", 36.5724, 136.6672, "neighborhood", 0.93, { history: 0.9, photogenic: 0.85, architecture: 0.75, craft: 0.65, tea: 0.6, romance: 0.45, shopping: 0.4 }, { neighborhood: "Higashiyama", rating: 4.5 }),
	place("kanazawa-21st-century-museum", "21st Century Museum of Contemporary Art", "kanazawa", 36.5608, 136.658, "museum", 0.92, { art: 1, design: 0.9, architecture: 0.75, photogenic: 0.7, whimsy: 0.5 }, { rating: 4.5 }),
	place("kanazawa-nagamachi", "Nagamachi Samurai District", "kanazawa", 36.564, 136.6499, "neighborhood", 0.85, { history: 0.95, architecture: 0.7, photogenic: 0.65, quiet: 0.6, garden: 0.55, water: 0.4 }, { neighborhood: "Nagamachi", rating: 4.4 }),
	place("kanazawa-myoryu-ji", "Myoryu-ji (Ninja Temple)", "kanazawa", 36.5554, 136.649, "temple", 0.82, { history: 0.85, whimsy: 0.75, spiritual: 0.7, architecture: 0.7 }, { neighborhood: "Teramachi", rating: 4.4 }),
	place("kanazawa-omicho-market", "Omicho Market", "kanazawa", 36.5719, 136.6558, "market", 0.9, { markets: 1, food_street: 0.95, local_life: 0.75, shopping: 0.4, coast: 0.35 }, { rating: 4.3 }),
	place("kanazawa-kazuemachi", "Kazuemachi Chaya District", "kanazawa", 36.5723, 136.6636, "neighborhood", 0.7, { history: 0.85, quiet: 0.75, photogenic: 0.7, architecture: 0.65, water: 0.55, romance: 0.55, tea: 0.4 }, { neighborhood: "Kazuemachi", rating: 4.5 }),
	place("kanazawa-asano-river-gold-leaf-tea-salon", "Asano River Gold Leaf Tea Salon", "kanazawa", 36.5718, 136.6648, "teahouse", 0.5, { tea: 0.9, cafes: 0.65, craft: 0.55, quiet: 0.55, history: 0.3 }, { rating: 4.5, priceLevel: 2 }),
	place("kanazawa-dt-suzuki-museum", "D. T. Suzuki Museum", "kanazawa", 36.5576, 136.661, "museum", 0.62, { zen: 1, quiet: 0.9, design: 0.85, architecture: 0.8, water: 0.6, spiritual: 0.45, literature: 0.4 }, { neighborhood: "Honda-machi", rating: 4.6 }),

	// Takayama
	place("takayama-sanmachi-suji", "Sanmachi Suji", "takayama", 36.1417, 137.2595, "street", 0.92, { history: 0.9, architecture: 0.8, photogenic: 0.8, craft: 0.6, food_street: 0.55, shopping: 0.5 }, { rating: 4.5 }),
	place("takayama-hida-folk-village", "Hida Folk Village", "takayama", 36.1323, 137.2344, "museum", 0.8, { history: 0.85, craft: 0.75, architecture: 0.7, quiet: 0.65, nature: 0.6, mountains: 0.4 }, { rating: 4.5 }),
	place("takayama-jinya", "Takayama Jinya", "takayama", 36.1397, 137.258, "landmark", 0.84, { history: 0.95, architecture: 0.75, quiet: 0.4 }, { rating: 4.3 }),
	place("takayama-miyagawa-morning-market", "Miyagawa Morning Market", "takayama", 36.1447, 137.2579, "market", 0.86, { markets: 0.95, local_life: 0.85, food_street: 0.75, craft: 0.45, water: 0.35 }, { rating: 4.3 }),
	place("takayama-higashiyama-walking-course", "Higashiyama Walking Course", "takayama", 36.1415, 137.2668, "trail", 0.52, { spiritual: 0.85, quiet: 0.85, history: 0.7, nature: 0.65, zen: 0.5, outdoors: 0.45 }, { rating: 4.5 }),
	place("takayama-hida-kokubun-ji", "Hida Kokubun-ji", "takayama", 36.1434, 137.2537, "temple", 0.6, { spiritual: 0.85, history: 0.85, architecture: 0.65, quiet: 0.6 }, { rating: 4.2 }),
	place("takayama-beam-and-bean-kissa", "Beam & Bean Kissa", "takayama", 36.1425, 137.2575, "cafe", 0.45, { cafes: 0.9, craft: 0.55, local_life: 0.5, quiet: 0.5, history: 0.3 }, { rating: 4.5, priceLevel: 1 }),
	place("takayama-old-hearth-hida-kitchen", "Old Hearth Hida Kitchen", "takayama", 36.1435, 137.2555, "restaurant", 0.5, { food_street: 0.6, food_fine: 0.55, local_life: 0.5, mountains: 0.3, history: 0.3 }, { rating: 4.5, priceLevel: 3 }),

	// Matsumoto
	place("matsumoto-castle", "Matsumoto Castle", "matsumoto", 36.2389, 137.9692, "castle", 0.95, { history: 0.95, architecture: 0.95, photogenic: 0.95, mountains: 0.45, water: 0.35 }, { rating: 4.7 }),
	place("matsumoto-nakamachi-street", "Nakamachi Street", "matsumoto", 36.2338, 137.9715, "street", 0.8, { craft: 0.8, history: 0.75, architecture: 0.65, local_life: 0.55, shopping: 0.55, quiet: 0.55, cafes: 0.5 }, { rating: 4.4 }),
	place("matsumoto-japan-ukiyo-e-museum", "Japan Ukiyo-e Museum", "matsumoto", 36.2303, 137.9351, "museum", 0.58, { art: 1, quiet: 0.85, history: 0.65, craft: 0.5 }, { rating: 4.4 }),
	place("matsumoto-nawate-street", "Nawate Street", "matsumoto", 36.2345, 137.9705, "street", 0.78, { whimsy: 0.85, local_life: 0.6, markets: 0.6, food_street: 0.5, shopping: 0.5, water: 0.4 }, { rating: 4.2 }),
	place("matsumoto-city-museum-of-art", "Matsumoto City Museum of Art", "matsumoto", 36.2316, 137.9765, "museum", 0.8, { art: 0.95, design: 0.7, photogenic: 0.65, whimsy: 0.6 }, { rating: 4.5 }),
	place("matsumoto-kaichi-school", "Former Kaichi School", "matsumoto", 36.2433, 137.9683, "landmark", 0.7, { history: 0.85, architecture: 0.85, quiet: 0.55, literature: 0.4 }, { rating: 4.4 }),
	place("matsumoto-kura-clay-and-coffee", "Kura Clay & Coffee", "matsumoto", 36.2335, 137.9722, "cafe", 0.48, { cafes: 0.95, craft: 0.6, local_life: 0.5, quiet: 0.5, design: 0.4 }, { rating: 4.6, priceLevel: 2 }),
	place("matsumoto-alps-night-jazz-room", "Alps Night Jazz Room", "matsumoto", 36.2328, 137.9688, "bar", 0.42, { jazz: 0.95, music: 0.85, nightlife: 0.7, quiet: 0.35, romance: 0.35 }, { rating: 4.6, priceLevel: 2 }),

	// Kurashiki
	place("kurashiki-bikan-quarter", "Bikan Historical Quarter", "kurashiki", 34.5964, 133.7709, "neighborhood", 0.93, { history: 0.9, photogenic: 0.9, water: 0.8, architecture: 0.75, romance: 0.6, craft: 0.4 }, { neighborhood: "Bikan", rating: 4.6 }),
	place("kurashiki-ohara-museum-of-art", "Ohara Museum of Art", "kurashiki", 34.5962, 133.7707, "museum", 0.88, { art: 1, history: 0.6, architecture: 0.6, quiet: 0.4 }, { neighborhood: "Bikan", rating: 4.5 }),
	place("kurashiki-ivy-square", "Kurashiki Ivy Square", "kurashiki", 34.5946, 133.7734, "landmark", 0.76, { architecture: 0.85, history: 0.75, photogenic: 0.75, design: 0.45, quiet: 0.4 }, { neighborhood: "Bikan", rating: 4.3 }),
	place("kurashiki-achi-shrine", "Achi Shrine", "kurashiki", 34.5975, 133.7734, "shrine", 0.56, { spiritual: 0.85, quiet: 0.75, nature: 0.6, history: 0.6, photogenic: 0.55 }, { neighborhood: "Tsurugatayama", rating: 4.4 }),
	place("kurashiki-museum-of-folkcraft", "Kurashiki Museum of Folkcraft", "kurashiki", 34.5955, 133.7716, "museum", 0.6, { craft: 1, history: 0.7, quiet: 0.7, art: 0.6 }, { neighborhood: "Bikan", rating: 4.4 }),
	place("kurashiki-honmachi-lanes", "Honmachi and Higashimachi Lanes", "kurashiki", 34.5973, 133.7728, "street", 0.52, { history: 0.8, quiet: 0.75, local_life: 0.6, architecture: 0.6, craft: 0.5, cafes: 0.35 }, { neighborhood: "Honmachi", rating: 4.4 }),
	place("kurashiki-willow-canal-kissa", "Willow Canal Kissa", "kurashiki", 34.5958, 133.7712, "cafe", 0.5, { cafes: 0.9, quiet: 0.5, water: 0.45, local_life: 0.45, history: 0.3 }, { neighborhood: "Bikan", rating: 4.5, priceLevel: 2 }),
	place("kurashiki-seto-tide-table", "Seto Tide Table", "kurashiki", 34.5948, 133.77, "restaurant", 0.45, { food_fine: 0.7, coast: 0.45, local_life: 0.45, quiet: 0.4 }, { neighborhood: "Bikan", rating: 4.5, priceLevel: 3 }),

	// Hagi
	place("hagi-castle-town", "Hagi Castle Town", "hagi", 34.4131, 131.3882, "neighborhood", 0.8, { history: 0.95, quiet: 0.7, architecture: 0.7, photogenic: 0.7, craft: 0.4 }, { neighborhood: "Horiuchi", rating: 4.5 }),
	place("hagi-castle-ruins", "Hagi Castle Ruins (Shizuki Park)", "hagi", 34.4176, 131.3825, "castle", 0.7, { history: 0.85, quiet: 0.65, nature: 0.6, coast: 0.6, photogenic: 0.6 }, { rating: 4.3 }),
	place("hagi-shoin-shrine", "Shoin Shrine", "hagi", 34.4127, 131.4157, "shrine", 0.74, { history: 0.95, spiritual: 0.75, literature: 0.65, quiet: 0.6 }, { neighborhood: "Chinto", rating: 4.4 }),
	place("hagi-toko-ji", "Toko-ji", "hagi", 34.4125, 131.4261, "temple", 0.55, { spiritual: 0.9, history: 0.85, quiet: 0.85, photogenic: 0.65, zen: 0.6, architecture: 0.55 }, { rating: 4.5 }),
	place("hagi-uragami-museum", "Hagi Uragami Museum", "hagi", 34.4094, 131.3944, "museum", 0.52, { art: 0.85, craft: 0.8, quiet: 0.75, history: 0.6 }, { rating: 4.4 }),
	place("hagi-kikugahama-beach", "Kikugahama Beach", "hagi", 34.4181, 131.3935, "beach", 0.45, { coast: 0.9, quiet: 0.8, nature: 0.6, photogenic: 0.6 }, { rating: 4.4 }),
	place("hagi-shizuki-hill-tea-room", "Shizuki Hill Tea Room", "hagi", 34.4138, 131.387, "teahouse", 0.42, { tea: 0.9, quiet: 0.8, craft: 0.6, garden: 0.45, history: 0.4 }, { rating: 4.6, priceLevel: 2 }),
	place("hagi-harbor-table", "Hagi Harbor Table", "hagi", 34.415, 131.401, "restaurant", 0.45, { food_street: 0.6, coast: 0.6, local_life: 0.5, food_fine: 0.4 }, { rating: 4.4, priceLevel: 2 }),

	// Gyeongju
	place("gyeongju-bulguksa", "Bulguksa Temple", "gyeongju", 35.79, 129.3322, "temple", 0.95, { spiritual: 0.95, history: 0.95, architecture: 0.9, photogenic: 0.8, nature: 0.5, garden: 0.4 }, { neighborhood: "Tohamsan", rating: 4.6 }),
	place("gyeongju-seokguram", "Seokguram Grotto", "gyeongju", 35.7948, 129.3492, "temple", 0.88, { spiritual: 1, history: 0.9, art: 0.8, mountains: 0.6, nature: 0.5, quiet: 0.45 }, { neighborhood: "Tohamsan", rating: 4.5 }),
	place("gyeongju-daereungwon", "Daereungwon Tomb Complex", "gyeongju", 35.8381, 129.2121, "park", 0.9, { history: 0.95, photogenic: 0.85, nature: 0.55, garden: 0.5, romance: 0.35, quiet: 0.35 }, { rating: 4.5 }),
	place("gyeongju-donggung-wolji", "Donggung Palace and Wolji Pond", "gyeongju", 35.8346, 129.2271, "palace", 0.92, { photogenic: 0.95, history: 0.9, water: 0.8, architecture: 0.75, garden: 0.7, romance: 0.6 }, { rating: 4.6 }),
	place("gyeongju-hwangnidan-gil", "Hwangnidan-gil", "gyeongju", 35.8375, 129.2097, "street", 0.88, { cafes: 0.85, photogenic: 0.7, shopping: 0.6, food_street: 0.6, local_life: 0.5, history: 0.5, design: 0.5 }, { rating: 4.3 }),
	place("gyeongju-yangdong-village", "Yangdong Folk Village", "gyeongju", 36.0011, 129.2533, "village", 0.62, { history: 0.95, quiet: 0.85, architecture: 0.75, nature: 0.6, photogenic: 0.6, local_life: 0.45, craft: 0.4 }, { rating: 4.5 }),
	place("gyeongju-silla-moon-hanok-teahouse", "Silla Moon Hanok Teahouse", "gyeongju", 35.8368, 129.2105, "teahouse", 0.5, { tea: 0.95, quiet: 0.6, cafes: 0.6, garden: 0.4, history: 0.4 }, { neighborhood: "Hwangnam-dong", rating: 4.6, priceLevel: 2 }),
	place("gyeongju-tumuli-lane-ssambap-house", "Tumuli Lane Ssambap House", "gyeongju", 35.8395, 129.2128, "restaurant", 0.5, { food_street: 0.8, local_life: 0.6, quiet: 0.3, history: 0.25 }, { neighborhood: "Hwangnam-dong", rating: 4.4, priceLevel: 2 }),

	// Hue
	place("hue-imperial-city", "Imperial City (Hue Citadel)", "hue", 16.4694, 107.5778, "palace", 0.95, { history: 1, architecture: 0.95, photogenic: 0.85, garden: 0.5, spiritual: 0.4 }, { neighborhood: "Citadel", rating: 4.5 }),
	place("hue-thien-mu-pagoda", "Thien Mu Pagoda", "hue", 16.4536, 107.5448, "temple", 0.9, { spiritual: 0.95, history: 0.8, photogenic: 0.8, architecture: 0.75, water: 0.65, zen: 0.6 }, { rating: 4.5 }),
	place("hue-tomb-of-tu-duc", "Tomb of Tu Duc", "hue", 16.4325, 107.566, "landmark", 0.85, { history: 0.9, garden: 0.85, architecture: 0.75, quiet: 0.65, water: 0.6, literature: 0.5, zen: 0.5, romance: 0.4 }, { rating: 4.5 }),
	place("hue-tomb-of-khai-dinh", "Tomb of Khai Dinh", "hue", 16.3986, 107.588, "landmark", 0.86, { architecture: 0.9, history: 0.85, photogenic: 0.85, art: 0.7, mountains: 0.4 }, { rating: 4.5 }),
	place("hue-dong-ba-market", "Dong Ba Market", "hue", 16.4725, 107.5886, "market", 0.8, { markets: 0.95, food_street: 0.9, local_life: 0.9, shopping: 0.5 }, { rating: 4 }),
	place("hue-tu-hieu-pagoda", "Tu Hieu Pagoda", "hue", 16.4386, 107.573, "temple", 0.6, { zen: 0.95, spiritual: 0.9, quiet: 0.85, nature: 0.7, garden: 0.55, water: 0.4 }, { rating: 4.7 }),
	place("hue-perfume-river-lotus-tea-house", "Perfume River Lotus Tea House", "hue", 16.4672, 107.5905, "teahouse", 0.45, { tea: 0.9, quiet: 0.6, cafes: 0.6, water: 0.45, garden: 0.4 }, { rating: 4.5, priceLevel: 1 }),
	place("hue-citadel-lane-bun-bo-kitchen", "Citadel Lane Bun Bo Kitchen", "hue", 16.4705, 107.582, "restaurant", 0.5, { food_street: 0.95, local_life: 0.75, history: 0.2 }, { neighborhood: "Citadel", rating: 4.5, priceLevel: 1 }),

	// Luang Prabang
	place("luang-prabang-wat-xieng-thong", "Wat Xieng Thong", "luang-prabang", 19.8975, 102.1431, "temple", 0.93, { spiritual: 0.95, architecture: 0.9, history: 0.9, photogenic: 0.85, art: 0.7 }, { neighborhood: "Old Town", rating: 4.6 }),
	place("luang-prabang-kuang-si-falls", "Kuang Si Falls", "luang-prabang", 19.7492, 101.9917, "waterfall", 0.94, { water: 1, nature: 0.95, photogenic: 0.95, outdoors: 0.7, whimsy: 0.3 }, { rating: 4.7 }),
	place("luang-prabang-mount-phousi", "Mount Phousi", "luang-prabang", 19.8904, 102.1369, "viewpoint", 0.9, { photogenic: 0.85, spiritual: 0.6, nature: 0.5, history: 0.5, romance: 0.45, outdoors: 0.4 }, { neighborhood: "Old Town", rating: 4.4 }),
	place("luang-prabang-sakkaline-road", "Sakkaline Road (Morning Alms Route)", "luang-prabang", 19.8948, 102.1393, "street", 0.88, { spiritual: 0.9, history: 0.7, local_life: 0.7, photogenic: 0.6, quiet: 0.5 }, { neighborhood: "Old Town", rating: 4.3 }),
	place("luang-prabang-morning-market", "Luang Prabang Morning Market", "luang-prabang", 19.8909, 102.1339, "market", 0.72, { local_life: 0.95, markets: 0.9, food_street: 0.85 }, { neighborhood: "Old Town", rating: 4.3 }),
	place("luang-prabang-wat-visoun", "Wat Visoun", "luang-prabang", 19.887, 102.1383, "temple", 0.58, { spiritual: 0.9, history: 0.85, quiet: 0.8, architecture: 0.65, whimsy: 0.35 }, { rating: 4.4 }),
	place("luang-prabang-nam-khan-teak-cafe", "Nam Khan Teak Cafe", "luang-prabang", 19.8935, 102.142, "cafe", 0.48, { cafes: 0.9, quiet: 0.6, water: 0.45, local_life: 0.45 }, { neighborhood: "Old Town", rating: 4.5, priceLevel: 1 }),
	place("luang-prabang-mekong-lantern-kitchen", "Mekong Lantern Lao Kitchen", "luang-prabang", 19.8955, 102.1378, "restaurant", 0.5, { food_street: 0.75, local_life: 0.55, food_fine: 0.45, water: 0.35, romance: 0.3 }, { neighborhood: "Old Town", rating: 4.5, priceLevel: 2 }),

	// Seoul
	place("seoul-gyeongbokgung", "Gyeongbokgung Palace", "seoul", 37.5799, 126.9768, "palace", 0.999, { history: 0.95, architecture: 0.95, photogenic: 0.95, garden: 0.45, film: 0.3 }, { neighborhood: "Jongno", rating: 4.6 }),
	place("seoul-bukchon-hanok-village", "Bukchon Hanok Village", "seoul", 37.5831, 126.9836, "neighborhood", 0.995, { photogenic: 0.9, architecture: 0.85, history: 0.8, local_life: 0.6, craft: 0.5, cafes: 0.45 }, { neighborhood: "Bukchon", rating: 4.3 }),
	place("seoul-myeongdong", "Myeongdong", "seoul", 37.5637, 126.984, "neighborhood", 0.995, { shopping: 1, food_street: 0.9, nightlife: 0.6, design: 0.3, local_life: 0.2 }, { neighborhood: "Jung", rating: 4.2 }),
	place("seoul-n-seoul-tower", "N Seoul Tower", "seoul", 37.5513, 126.9883, "landmark", 0.995, { photogenic: 0.95, romance: 0.85, nature: 0.45, film: 0.4, nightlife: 0.35, outdoors: 0.3 }, { neighborhood: "Namsan", rating: 4.5 }),
	place("seoul-insadong", "Insadong", "seoul", 37.573, 126.986, "street", 0.985, { craft: 0.85, shopping: 0.75, art: 0.65, tea: 0.6, history: 0.6, food_street: 0.45 }, { neighborhood: "Jongno", rating: 4.3 }),
	place("seoul-jogyesa", "Jogyesa Temple", "seoul", 37.574, 126.9819, "temple", 0.975, { spiritual: 0.95, photogenic: 0.8, architecture: 0.7, history: 0.7, art: 0.45, zen: 0.45, local_life: 0.4 }, { neighborhood: "Jongno", rating: 4.5 }),
	place("seoul-changgyeonggung", "Changgyeonggung Palace", "seoul", 37.5784, 126.996, "palace", 0.84, { history: 0.9, architecture: 0.85, photogenic: 0.8, garden: 0.75, quiet: 0.65, nature: 0.55, romance: 0.35 }, { neighborhood: "Jongno", rating: 4.5 }), // twin of Gyeongbokgung
	place("seoul-jongmyo", "Jongmyo Shrine", "seoul", 37.5747, 126.9936, "shrine", 0.82, { history: 0.95, architecture: 0.9, spiritual: 0.85, quiet: 0.8, photogenic: 0.6, zen: 0.5 }, { neighborhood: "Jongno", rating: 4.5 }), // twin of Gyeongbokgung
	place("seoul-bongeunsa", "Bongeunsa Temple", "seoul", 37.5157, 127.0573, "temple", 0.84, { spiritual: 0.9, history: 0.7, architecture: 0.7, zen: 0.65, photogenic: 0.6, quiet: 0.55, design: 0.3 }, { neighborhood: "Gangnam", rating: 4.5 }), // twin of Jogyesa, Gyeongbokgung
	place("seoul-seochon", "Seochon", "seoul", 37.5795, 126.9695, "neighborhood", 0.78, { local_life: 0.85, history: 0.75, architecture: 0.6, food_street: 0.6, photogenic: 0.55, markets: 0.55, quiet: 0.55, art: 0.5 }, { neighborhood: "Seochon", rating: 4.5 }), // twin of Bukchon Hanok Village
	place("seoul-ikseon-dong", "Ikseon-dong Hanok Alleys", "seoul", 37.5743, 126.9898, "neighborhood", 0.88, { cafes: 0.85, photogenic: 0.8, history: 0.6, architecture: 0.6, design: 0.6, food_street: 0.5, romance: 0.45, nightlife: 0.45 }, { neighborhood: "Jongno", rating: 4.4 }), // twin of Bukchon Hanok Village
	place("seoul-gilsangsa", "Gilsangsa Temple", "seoul", 37.5991, 126.9943, "temple", 0.6, { spiritual: 0.9, quiet: 0.85, zen: 0.8, nature: 0.65, photogenic: 0.55, history: 0.5, architecture: 0.5, garden: 0.4 }, { neighborhood: "Seongbuk", rating: 4.6 }), // twin of Jogyesa (hanok halls in a hillside forest)
	place("seoul-museum-of-craft-art", "Seoul Museum of Craft Art", "seoul", 37.5766, 126.9835, "museum", 0.6, { craft: 1, art: 0.8, quiet: 0.7, history: 0.6, design: 0.55 }, { neighborhood: "Anguk", rating: 4.6 }), // twin of Insadong
	place("seoul-yeonnam-dong", "Yeonnam-dong", "seoul", 37.5602, 126.9208, "neighborhood", 0.86, { cafes: 0.8, food_street: 0.75, local_life: 0.7, shopping: 0.65, design: 0.6, nightlife: 0.5 }, { neighborhood: "Mapo", rating: 4.4 }), // twin of Myeongdong
	place("seoul-mangwon-market", "Mangwon Market", "seoul", 37.5572, 126.9058, "market", 0.68, { local_life: 0.95, markets: 0.95, food_street: 0.9, quiet: 0.3 }, { neighborhood: "Mangwon", rating: 4.4 }), // twin of Myeongdong (street food)
	place("seoul-naksan-park", "Naksan Park", "seoul", 37.5805, 127.0076, "park", 0.7, { photogenic: 0.85, romance: 0.75, history: 0.6, quiet: 0.6, nature: 0.45, local_life: 0.35, nightlife: 0.3 }, { neighborhood: "Ihwa-dong", rating: 4.5 }), // twin of N Seoul Tower
	place("seoul-inwangsan", "Inwangsan", "seoul", 37.5847, 126.9586, "trail", 0.66, { mountains: 0.85, nature: 0.8, photogenic: 0.8, outdoors: 0.8, quiet: 0.65, spiritual: 0.45 }, { neighborhood: "Jongno", rating: 4.6 }), // twin of N Seoul Tower (city views)
	place("seoul-seoul-forest", "Seoul Forest", "seoul", 37.5446, 127.0398, "park", 0.78, { nature: 0.9, outdoors: 0.6, quiet: 0.6, photogenic: 0.55, local_life: 0.5, whimsy: 0.35, romance: 0.3 }, { neighborhood: "Seongsu", rating: 4.5 }),
	place("seoul-seochon-hanok-roastery", "Seochon Hanok Roastery", "seoul", 37.5788, 126.9705, "cafe", 0.55, { cafes: 0.95, local_life: 0.5, quiet: 0.5, design: 0.45, history: 0.35 }, { neighborhood: "Seochon", rating: 4.6, priceLevel: 2 }),
	place("seoul-seongbuk-pine-tea-room", "Seongbuk Pine Tea Room", "seoul", 37.5935, 126.993, "teahouse", 0.42, { tea: 0.95, quiet: 0.7, cafes: 0.55, garden: 0.4, craft: 0.35, history: 0.35 }, { neighborhood: "Seongbuk", rating: 4.7, priceLevel: 2 }),
	place("seoul-mangwon-alley-pojangmacha", "Mangwon Alley Pojangmacha", "seoul", 37.5565, 126.9045, "restaurant", 0.5, { food_street: 0.95, local_life: 0.85, nightlife: 0.7 }, { neighborhood: "Mangwon", rating: 4.4, priceLevel: 1 }),
	place("seoul-euljiro-neon-noodle-house", "Euljiro Neon Noodle House", "seoul", 37.566, 126.9915, "restaurant", 0.55, { food_street: 0.8, nightlife: 0.6, local_life: 0.6, film: 0.35, design: 0.3 }, { neighborhood: "Euljiro", rating: 4.4, priceLevel: 1 }),
	place("seoul-hannam-temple-food-table", "Hannam Temple-Food Table", "seoul", 37.5345, 127.001, "restaurant", 0.5, { food_fine: 0.95, zen: 0.55, quiet: 0.55, design: 0.4, spiritual: 0.35 }, { neighborhood: "Hannam", rating: 4.7, priceLevel: 4 }),
	place("seoul-euljiro-blue-hour-jazz", "Euljiro Blue Hour Jazz", "seoul", 37.5665, 126.9895, "bar", 0.48, { jazz: 0.95, music: 0.85, nightlife: 0.85, romance: 0.45, film: 0.3 }, { neighborhood: "Euljiro", rating: 4.6, priceLevel: 2 }),
	place("seoul-haebangchon-rooftop-wine-room", "Haebangchon Rooftop Wine Room", "seoul", 37.5435, 126.987, "bar", 0.5, { wine: 0.95, nightlife: 0.75, romance: 0.45, design: 0.4, local_life: 0.4 }, { neighborhood: "Haebangchon", rating: 4.5, priceLevel: 3 }),

	// Busan
	place("busan-gamcheon-culture-village", "Gamcheon Culture Village", "busan", 35.0975, 129.0092, "neighborhood", 0.97, { photogenic: 0.95, art: 0.85, whimsy: 0.7, local_life: 0.5, history: 0.4 }, { neighborhood: "Saha", rating: 4.4 }),
	place("busan-haedong-yonggungsa", "Haedong Yonggungsa", "busan", 35.1883, 129.2233, "temple", 0.97, { spiritual: 0.9, coast: 0.9, photogenic: 0.9, architecture: 0.6, history: 0.5 }, { neighborhood: "Gijang", rating: 4.5 }),
	place("busan-huinnyeoul-culture-village", "Huinnyeoul Culture Village", "busan", 35.0774, 129.0457, "neighborhood", 0.7, { coast: 0.9, photogenic: 0.8, local_life: 0.65, quiet: 0.65, art: 0.6, film: 0.45, whimsy: 0.4 }, { neighborhood: "Yeongdo", rating: 4.5 }),
	place("busan-jagalchi-market", "Jagalchi Market", "busan", 35.0967, 129.0297, "market", 0.88, { markets: 1, food_street: 0.9, local_life: 0.85, coast: 0.6 }, { neighborhood: "Nampo", rating: 4.3 }),
	place("busan-beomeosa", "Beomeosa Temple", "busan", 35.2839, 129.069, "temple", 0.72, { spiritual: 0.95, history: 0.8, nature: 0.7, quiet: 0.7, mountains: 0.65, zen: 0.6 }, { neighborhood: "Geumjeong", rating: 4.6 }),
	place("busan-yeongdo-tidewater-coffee", "Yeongdo Tidewater Coffee", "busan", 35.079, 129.048, "cafe", 0.5, { cafes: 0.9, coast: 0.6, design: 0.45, quiet: 0.45, local_life: 0.4 }, { neighborhood: "Yeongdo", rating: 4.5, priceLevel: 2 }),

	// Jeonju
	place("jeonju-hanok-village", "Jeonju Hanok Village", "jeonju", 35.8147, 127.1526, "neighborhood", 0.94, { history: 0.85, architecture: 0.85, photogenic: 0.85, food_street: 0.6, craft: 0.55, shopping: 0.45 }, { rating: 4.4 }),
	place("jeonju-gyeonggijeon", "Gyeonggijeon Shrine", "jeonju", 35.8157, 127.1498, "shrine", 0.82, { history: 0.95, architecture: 0.75, spiritual: 0.7, garden: 0.6, quiet: 0.55, nature: 0.45 }, { rating: 4.5 }),
	place("jeonju-jeondong-cathedral", "Jeondong Catholic Cathedral", "jeonju", 35.8135, 127.149, "church", 0.84, { architecture: 0.9, spiritual: 0.85, history: 0.8, photogenic: 0.8, romance: 0.4 }, { rating: 4.6 }),
	place("jeonju-nambu-market", "Nambu Market", "jeonju", 35.8122, 127.1475, "market", 0.74, { markets: 0.95, food_street: 0.95, local_life: 0.85, nightlife: 0.5 }, { rating: 4.3 }),
	place("jeonju-jaman-mural-village", "Jaman Mural Village", "jeonju", 35.8141, 127.1572, "neighborhood", 0.6, { art: 0.8, photogenic: 0.7, whimsy: 0.6, quiet: 0.55, local_life: 0.5 }, { rating: 4.2 }),
	place("jeonju-hanji-lantern-teahouse", "Hanji Lantern Teahouse", "jeonju", 35.8152, 127.1535, "teahouse", 0.45, { tea: 0.9, quiet: 0.6, craft: 0.55, history: 0.35 }, { rating: 4.5, priceLevel: 2 }),
	place("jeonju-courtyard-bibimbap-house", "Courtyard Bibimbap House", "jeonju", 35.816, 127.1515, "restaurant", 0.55, { food_street: 0.9, local_life: 0.6, history: 0.3 }, { rating: 4.4, priceLevel: 2 }),

	// Taipei
	place("taipei-longshan-temple", "Longshan Temple", "taipei", 25.0372, 121.4999, "temple", 0.95, { spiritual: 0.95, history: 0.8, architecture: 0.8, photogenic: 0.7, local_life: 0.6, art: 0.4 }, { neighborhood: "Wanhua", rating: 4.5 }),
	place("taipei-dihua-street", "Dihua Street", "taipei", 25.06, 121.51, "street", 0.84, { markets: 0.8, history: 0.75, local_life: 0.75, architecture: 0.6, tea: 0.55, craft: 0.5, shopping: 0.5, cafes: 0.45 }, { neighborhood: "Dadaocheng", rating: 4.4 }),
	place("taipei-beitou-hot-springs", "Beitou Hot Spring Valley", "taipei", 25.137, 121.509, "onsen", 0.86, { water: 0.75, nature: 0.7, quiet: 0.55, history: 0.5, architecture: 0.4, outdoors: 0.35 }, { neighborhood: "Beitou", rating: 4.4 }),
	place("taipei-treasure-hill", "Treasure Hill Artist Village", "taipei", 25.0105, 121.533, "village", 0.62, { art: 0.9, quiet: 0.65, photogenic: 0.6, whimsy: 0.55, local_life: 0.5, design: 0.5 }, { neighborhood: "Gongguan", rating: 4.3 }),
	place("taipei-ningxia-night-market", "Ningxia Night Market", "taipei", 25.0554, 121.5151, "market", 0.95, { food_street: 1, markets: 0.95, nightlife: 0.75, local_life: 0.65 }, { neighborhood: "Datong", rating: 4.4 }),
	place("taipei-dadaocheng-oolong-house", "Dadaocheng Oolong House", "taipei", 25.0575, 121.5112, "teahouse", 0.5, { tea: 1, quiet: 0.6, cafes: 0.5, history: 0.45, craft: 0.35 }, { neighborhood: "Dadaocheng", rating: 4.6, priceLevel: 2 }),
	place("taipei-zhongshan-lantern-jazz-bar", "Zhongshan Lantern Jazz Bar", "taipei", 25.0525, 121.5205, "bar", 0.48, { jazz: 0.9, nightlife: 0.85, music: 0.8, romance: 0.45, film: 0.4 }, { neighborhood: "Zhongshan", rating: 4.5, priceLevel: 2 }),

	// Fukuoka
	place("fukuoka-nakasu-yatai", "Nakasu Yatai Stalls", "fukuoka", 33.5915, 130.4055, "street", 0.93, { food_street: 1, nightlife: 0.85, local_life: 0.75, photogenic: 0.5, water: 0.45 }, { neighborhood: "Nakasu", rating: 4.3 }),
	place("fukuoka-ohori-park", "Ohori Park", "fukuoka", 33.5859, 130.3763, "park", 0.82, { water: 0.85, nature: 0.7, local_life: 0.65, quiet: 0.55, outdoors: 0.55, garden: 0.5 }, { neighborhood: "Chuo", rating: 4.6 }),
	place("fukuoka-kushida-shrine", "Kushida Shrine", "fukuoka", 33.5931, 130.4105, "shrine", 0.8, { spiritual: 0.85, history: 0.8, photogenic: 0.6, local_life: 0.5, craft: 0.4 }, { neighborhood: "Hakata", rating: 4.4 }),
	place("fukuoka-tochoji", "Tochoji Temple", "fukuoka", 33.5966, 130.4128, "temple", 0.66, { spiritual: 0.9, history: 0.75, architecture: 0.7, art: 0.55, quiet: 0.55 }, { neighborhood: "Hakata", rating: 4.4 }),
	place("fukuoka-yanagibashi-market", "Yanagibashi Rengo Market", "fukuoka", 33.5831, 130.4083, "market", 0.6, { markets: 0.95, local_life: 0.9, food_street: 0.85, coast: 0.4 }, { neighborhood: "Haruyoshi", rating: 4.3 }),
	place("fukuoka-daimyo", "Daimyo", "fukuoka", 33.5897, 130.3932, "neighborhood", 0.8, { shopping: 0.85, cafes: 0.8, design: 0.7, nightlife: 0.65, local_life: 0.5 }, { neighborhood: "Chuo", rating: 4.4 }),
	place("fukuoka-momochi-seaside-park", "Momochi Seaside Park", "fukuoka", 33.5935, 130.3515, "beach", 0.84, { coast: 0.9, photogenic: 0.75, romance: 0.55, design: 0.45, nightlife: 0.3 }, { neighborhood: "Sawara", rating: 4.4 }),
	place("fukuoka-haruyoshi-river-jazz-room", "Haruyoshi River Jazz Room", "fukuoka", 33.588, 130.4045, "bar", 0.45, { jazz: 0.95, nightlife: 0.85, music: 0.8, romance: 0.45, water: 0.3 }, { neighborhood: "Haruyoshi", rating: 4.5, priceLevel: 2 }),

	// Ubud
	place("ubud-tegallalang-rice-terraces", "Tegallalang Rice Terraces", "ubud", -8.4336, 115.2795, "rice_terrace", 0.99, { photogenic: 0.95, nature: 0.9, outdoors: 0.5, local_life: 0.35, history: 0.3, shopping: 0.25 }, { neighborhood: "Tegallalang", rating: 4.3 }),
	place("ubud-sacred-monkey-forest", "Sacred Monkey Forest Sanctuary", "ubud", -8.5188, 115.2584, "park", 0.995, { nature: 0.9, whimsy: 0.8, photogenic: 0.8, spiritual: 0.7, history: 0.35, outdoors: 0.3 }, { neighborhood: "Padangtegal", rating: 4.4 }),
	place("ubud-palace", "Ubud Palace", "ubud", -8.5068, 115.2626, "palace", 0.985, { history: 0.8, architecture: 0.8, art: 0.75, photogenic: 0.7, music: 0.55, spiritual: 0.55 }, { neighborhood: "Central Ubud", rating: 4.3 }),
	place("ubud-campuhan-ridge-walk", "Campuhan Ridge Walk", "ubud", -8.499, 115.2552, "trail", 0.975, { nature: 0.9, outdoors: 0.85, photogenic: 0.8, spiritual: 0.3 }, { neighborhood: "Campuhan", rating: 4.4 }),
	place("ubud-art-market", "Ubud Art Market", "ubud", -8.5065, 115.2617, "market", 0.975, { markets: 0.9, craft: 0.85, shopping: 0.8, local_life: 0.45, art: 0.4 }, { neighborhood: "Central Ubud", rating: 4.1 }),
	place("ubud-juwuk-manis-rice-walk", "Juwuk Manis Rice Field Walk", "ubud", -8.4948, 115.2617, "trail", 0.52, { nature: 0.9, quiet: 0.85, photogenic: 0.7, outdoors: 0.65, local_life: 0.55 }, { neighborhood: "North Ubud", rating: 4.6 }), // twin of Tegallalang, Campuhan Ridge
	place("ubud-pura-gunung-lebah", "Pura Gunung Lebah", "ubud", -8.5038, 115.2546, "temple", 0.6, { spiritual: 0.9, nature: 0.7, quiet: 0.7, history: 0.55, photogenic: 0.55, water: 0.5 }, { neighborhood: "Campuhan", rating: 4.4 }), // twin of Sacred Monkey Forest (temple in the gorge)
	place("ubud-penestanan-rice-terraces", "Penestanan Rice Terraces", "ubud", -8.504, 115.2465, "rice_terrace", 0.5, { nature: 0.85, photogenic: 0.8, quiet: 0.8, local_life: 0.55, outdoors: 0.55, art: 0.3 }, { neighborhood: "Penestanan", rating: 4.5 }), // twin of Tegallalang
	place("ubud-petulu-heron-village", "Petulu White Heron Village", "ubud", -8.4914, 115.2759, "village", 0.45, { nature: 0.85, quiet: 0.75, whimsy: 0.7, local_life: 0.6, photogenic: 0.6, spiritual: 0.35 }, { neighborhood: "Petulu", rating: 4.3 }), // twin of Sacred Monkey Forest (wildlife at dusk)
	place("ubud-botanic-garden", "Botanic Garden Ubud", "ubud", -8.489, 115.2707, "garden", 0.48, { nature: 0.9, garden: 0.85, quiet: 0.8, whimsy: 0.4, outdoors: 0.4, spiritual: 0.3 }, { neighborhood: "Kutuh", rating: 4.5 }), // twin of Sacred Monkey Forest (forest walk)
	place("ubud-neka-art-museum", "Neka Art Museum", "ubud", -8.489, 115.2536, "museum", 0.7, { art: 0.95, quiet: 0.7, craft: 0.6, history: 0.6 }, { neighborhood: "Sanggingan", rating: 4.5 }), // twin of Ubud Palace, Ubud Art Market
	place("ubud-sayan-ridge-coffee-garden", "Sayan Ridge Coffee Garden", "ubud", -8.5035, 115.2475, "cafe", 0.55, { cafes: 0.9, nature: 0.6, quiet: 0.55, garden: 0.4, design: 0.35 }, { neighborhood: "Sayan", rating: 4.5, priceLevel: 2 }),
	place("ubud-banyan-leaf-jamu-bar", "Banyan Leaf Jamu Bar", "ubud", -8.5105, 115.2615, "cafe", 0.5, { cafes: 0.75, tea: 0.6, zen: 0.45, quiet: 0.45, nature: 0.35 }, { neighborhood: "Central Ubud", rating: 4.5, priceLevel: 1 }),
	place("ubud-paddy-lantern-warung", "Paddy Lantern Warung", "ubud", -8.4985, 115.2635, "restaurant", 0.5, { food_street: 0.85, local_life: 0.65, nature: 0.45, quiet: 0.45 }, { neighborhood: "North Ubud", rating: 4.5, priceLevel: 1 }),
	place("ubud-fern-and-stone-plant-kitchen", "Fern & Stone Plant Kitchen", "ubud", -8.505, 115.251, "restaurant", 0.55, { food_fine: 0.8, nature: 0.45, design: 0.45, zen: 0.35 }, { neighborhood: "Penestanan", rating: 4.6, priceLevel: 3 }),

	// Tampaksiring
	place("tampaksiring-tirta-empul", "Tirta Empul", "tampaksiring", -8.4155, 115.315, "temple", 0.975, { spiritual: 1, water: 0.95, photogenic: 0.85, history: 0.75, architecture: 0.55 }, { rating: 4.5 }),
	place("tampaksiring-gunung-kawi", "Gunung Kawi", "tampaksiring", -8.4234, 115.3123, "temple", 0.85, { history: 0.9, spiritual: 0.85, nature: 0.75, photogenic: 0.75, water: 0.5, quiet: 0.5 }, { rating: 4.6 }),
	place("tampaksiring-pura-mengening", "Pura Mengening", "tampaksiring", -8.42, 115.3122, "temple", 0.48, { spiritual: 0.95, water: 0.9, quiet: 0.85, nature: 0.6, history: 0.55, photogenic: 0.5 }, { rating: 4.6 }),
	place("tampaksiring-gunung-kawi-sebatu", "Gunung Kawi Sebatu", "tampaksiring", -8.4053, 115.2936, "temple", 0.55, { spiritual: 0.9, water: 0.9, quiet: 0.8, photogenic: 0.7, garden: 0.65, nature: 0.55 }, { neighborhood: "Sebatu", rating: 4.6 }),

	// Sidemen
	place("sidemen-rice-terraces", "Sidemen Valley Rice Terraces", "sidemen", -8.4702, 115.4372, "rice_terrace", 0.62, { nature: 0.9, photogenic: 0.85, quiet: 0.8, local_life: 0.55, mountains: 0.5, outdoors: 0.5 }, { rating: 4.6 }),
	place("sidemen-valley-field-walk", "Sidemen Valley Field Walk", "sidemen", -8.478, 115.443, "trail", 0.45, { nature: 0.9, quiet: 0.9, outdoors: 0.8, photogenic: 0.6, local_life: 0.55, mountains: 0.5 }, { rating: 4.7 }),
	place("sidemen-songket-weaving-houses", "Sidemen Songket Weaving Houses", "sidemen", -8.4855, 115.4395, "village", 0.4, { craft: 0.95, local_life: 0.8, quiet: 0.7, art: 0.55, history: 0.45 }, { rating: 4.5 }),

	// Munduk
	place("munduk-waterfall", "Munduk Waterfall", "munduk", -8.2537, 115.0794, "waterfall", 0.66, { water: 0.95, nature: 0.95, photogenic: 0.8, outdoors: 0.7, quiet: 0.65 }, { rating: 4.5 }),
	place("munduk-melanting-waterfall", "Melanting Waterfall", "munduk", -8.2611, 115.0618, "waterfall", 0.5, { water: 0.95, nature: 0.95, quiet: 0.8, outdoors: 0.75, photogenic: 0.7 }, { rating: 4.5 }),
	place("munduk-pura-ulun-danu-tamblingan", "Pura Ulun Danu Tamblingan", "munduk", -8.2642, 115.0914, "temple", 0.55, { nature: 0.9, spiritual: 0.85, water: 0.85, quiet: 0.85, photogenic: 0.6, history: 0.5 }, { neighborhood: "Lake Tamblingan", rating: 4.6 }),
	place("munduk-clove-ridge-coffee-hut", "Clove Ridge Coffee Hut", "munduk", -8.2665, 115.0765, "cafe", 0.42, { cafes: 0.85, quiet: 0.7, nature: 0.6, mountains: 0.55, local_life: 0.45 }, { rating: 4.6, priceLevel: 1 }),

	// Jatiluwih
	place("jatiluwih-rice-terraces", "Jatiluwih Rice Terraces", "jatiluwih", -8.3702, 115.1312, "rice_terrace", 0.85, { nature: 0.95, photogenic: 0.9, quiet: 0.6, outdoors: 0.6, history: 0.5, local_life: 0.45, mountains: 0.45 }, { rating: 4.6 }),
	place("jatiluwih-trekking-trail", "Jatiluwih Trekking Trail", "jatiluwih", -8.3745, 115.134, "trail", 0.55, { nature: 0.9, quiet: 0.85, outdoors: 0.85, photogenic: 0.7, local_life: 0.5, history: 0.4 }, { rating: 4.7 }),
	place("jatiluwih-pura-luhur-batukaru", "Pura Luhur Batukaru", "jatiluwih", -8.3725, 115.1028, "temple", 0.6, { spiritual: 0.95, nature: 0.85, quiet: 0.85, history: 0.6, mountains: 0.6, photogenic: 0.5 }, { neighborhood: "Wongaya Gede", rating: 4.6 }),
	place("jatiluwih-terrace-edge-warung", "Terrace Edge Warung", "jatiluwih", -8.369, 115.129, "restaurant", 0.45, { food_street: 0.75, nature: 0.55, local_life: 0.55, quiet: 0.55 }, { rating: 4.4, priceLevel: 1 }),

	// Amed
	place("amed-jemeluk-bay", "Jemeluk Bay", "amed", -8.3381, 115.6609, "beach", 0.72, { coast: 0.95, water: 0.85, outdoors: 0.8, photogenic: 0.8, nature: 0.6, quiet: 0.5 }, { rating: 4.5 }),
	place("amed-japanese-shipwreck", "Japanese Shipwreck (Banyuning)", "amed", -8.3642, 115.7004, "beach", 0.55, { coast: 0.9, water: 0.85, outdoors: 0.85, quiet: 0.7, nature: 0.5, history: 0.35 }, { rating: 4.5 }),
	place("amed-sea-salt-farms", "Amed Sea-Salt Farms", "amed", -8.3352, 115.6395, "village", 0.4, { local_life: 0.85, coast: 0.8, quiet: 0.8, craft: 0.75, history: 0.4 }, { rating: 4.3 }),
	place("amed-jukung-sunrise-cafe", "Jukung Sunrise Cafe", "amed", -8.3395, 115.6575, "cafe", 0.45, { cafes: 0.8, coast: 0.7, quiet: 0.6, local_life: 0.45 }, { rating: 4.5, priceLevel: 1 }),

	// Tirta Gangga
	place("tirta-gangga-water-palace", "Tirta Gangga Water Palace", "tirta-gangga", -8.4119, 115.5869, "palace", 0.88, { water: 0.95, photogenic: 0.9, garden: 0.85, history: 0.65, architecture: 0.6, spiritual: 0.5 }, { rating: 4.5 }),
	place("tirta-gangga-pura-lempuyang", "Pura Lempuyang (Gates of Heaven)", "tirta-gangga", -8.3915, 115.6306, "temple", 0.97, { spiritual: 0.95, photogenic: 0.95, mountains: 0.75, history: 0.55, outdoors: 0.5 }, { rating: 4.3 }),
	place("tirta-gangga-ababi-rice-terraces", "Ababi Rice Terraces", "tirta-gangga", -8.4039, 115.5868, "rice_terrace", 0.45, { nature: 0.9, quiet: 0.85, photogenic: 0.75, outdoors: 0.6, local_life: 0.55, mountains: 0.45 }, { rating: 4.6 }),

	// Pemuteran
	place("pemuteran-biorock-reef", "Pemuteran Bay Biorock Reef", "pemuteran", -8.1425, 114.6549, "beach", 0.6, { coast: 0.95, water: 0.85, outdoors: 0.8, quiet: 0.7, nature: 0.65 }, { rating: 4.5 }),
	place("pemuteran-pura-pulaki", "Pura Pulaki", "pemuteran", -8.1457, 114.6805, "temple", 0.55, { spiritual: 0.85, whimsy: 0.6, nature: 0.6, coast: 0.6, photogenic: 0.6, quiet: 0.55, history: 0.5 }, { rating: 4.4 }),
	place("pemuteran-reef-garden-warung", "Reef Garden Warung", "pemuteran", -8.144, 114.656, "restaurant", 0.42, { food_street: 0.75, coast: 0.65, quiet: 0.6, local_life: 0.5 }, { rating: 4.5, priceLevel: 1 }),

	// Bedugul
	place("bedugul-ulun-danu-beratan", "Pura Ulun Danu Beratan", "bedugul", -8.2706, 115.1666, "temple", 0.97, { water: 0.95, photogenic: 0.95, spiritual: 0.9, mountains: 0.6, architecture: 0.6, history: 0.55 }, { rating: 4.5 }),
	place("bedugul-bali-botanic-garden", "Bali Botanic Garden", "bedugul", -8.2778, 115.1544, "garden", 0.7, { garden: 0.9, nature: 0.9, quiet: 0.7, outdoors: 0.5, mountains: 0.45 }, { rating: 4.5 }),
	place("bedugul-candikuning-market", "Candikuning Market", "bedugul", -8.2829, 115.1616, "market", 0.55, { markets: 0.85, local_life: 0.75, food_street: 0.6, garden: 0.3 }, { rating: 4 }),

	// Yogyakarta
	place("yogyakarta-prambanan", "Prambanan Temple", "yogyakarta", -7.752, 110.4912, "temple", 0.97, { spiritual: 0.95, history: 0.95, architecture: 0.95, photogenic: 0.9, art: 0.6 }, { neighborhood: "Prambanan", rating: 4.7 }),
	place("yogyakarta-kraton", "Kraton (Sultan's Palace)", "yogyakarta", -7.8058, 110.3641, "palace", 0.9, { history: 0.95, architecture: 0.8, music: 0.6, art: 0.6, craft: 0.5, spiritual: 0.45 }, { neighborhood: "Kraton", rating: 4.4 }),
	place("yogyakarta-taman-sari", "Taman Sari Water Castle", "yogyakarta", -7.8102, 110.359, "palace", 0.88, { history: 0.85, photogenic: 0.85, architecture: 0.8, water: 0.75, garden: 0.55, romance: 0.4 }, { neighborhood: "Kraton", rating: 4.4 }),
	place("yogyakarta-kotagede", "Kotagede Silver Quarter", "yogyakarta", -7.8179, 110.3954, "neighborhood", 0.68, { craft: 0.95, history: 0.85, local_life: 0.7, quiet: 0.6, architecture: 0.55, spiritual: 0.4 }, { neighborhood: "Kotagede", rating: 4.4 }),
	place("yogyakarta-malioboro", "Malioboro Street", "yogyakarta", -7.7928, 110.3657, "street", 0.96, { shopping: 0.85, food_street: 0.85, markets: 0.7, local_life: 0.6, nightlife: 0.45, craft: 0.45 }, { neighborhood: "Malioboro", rating: 4.3 }),
	place("yogyakarta-ratu-boko", "Ratu Boko", "yogyakarta", -7.77, 110.4889, "landmark", 0.72, { history: 0.9, photogenic: 0.8, spiritual: 0.6, quiet: 0.6, romance: 0.5, nature: 0.5 }, { neighborhood: "Prambanan", rating: 4.5 }),
	place("yogyakarta-silver-lane-kopi", "Silver Lane Kopi", "yogyakarta", -7.8195, 110.3965, "cafe", 0.45, { cafes: 0.9, local_life: 0.6, quiet: 0.5, craft: 0.45 }, { neighborhood: "Kotagede", rating: 4.5, priceLevel: 1 }),
	place("yogyakarta-gudeg-lantern-kitchen", "Gudeg Lantern Kitchen", "yogyakarta", -7.8032, 110.3672, "restaurant", 0.52, { food_street: 0.9, local_life: 0.7, history: 0.3, nightlife: 0.3 }, { neighborhood: "Wijilan", rating: 4.5, priceLevel: 1 }),

	// Borobudur
	place("borobudur-temple", "Borobudur Temple", "borobudur", -7.6079, 110.2038, "temple", 0.985, { spiritual: 1, history: 0.95, architecture: 0.95, photogenic: 0.9, art: 0.7 }, { rating: 4.7 }),
	place("borobudur-mendut-temple", "Mendut Temple", "borobudur", -7.6048, 110.2301, "temple", 0.6, { spiritual: 0.9, history: 0.85, quiet: 0.75, art: 0.7, architecture: 0.6 }, { rating: 4.4 }),
	place("borobudur-punthuk-setumbu", "Punthuk Setumbu", "borobudur", -7.6074, 110.1778, "viewpoint", 0.82, { photogenic: 0.95, nature: 0.75, mountains: 0.7, outdoors: 0.55, romance: 0.35 }, { rating: 4.4 }),
];
