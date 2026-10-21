/** A tiny synthetic world for deterministic engine tests (fictional places). */
import { QlooApi } from "../../src/engine/qloo/endpoints.ts";
import { QlooClient } from "../../src/engine/qloo/client.ts";
import { MockTransport } from "../../src/engine/qloo/mock/transport.ts";
import { place, type WorldLocality } from "../../src/engine/qloo/mock/world-schema.ts";
import { WorldIndex } from "../../src/engine/qloo/mock/world.ts";
import type { Evidence } from "../../src/shared/types.ts";

const locality = (overrides: Partial<WorldLocality> & Pick<WorldLocality, "key" | "name" | "lat" | "lon">): WorldLocality => ({
	region: "Test Region",
	country: "Testland",
	countryCode: "ZZ",
	population: 500_000,
	popularity: 0.8,
	radiusKm: 6,
	vector: { spiritual: 0.8, garden: 0.6, history: 0.7, tea: 0.5 },
	peakMonths: [],
	offSeasonMonths: [],
	bestMonths: [],
	traits: ["Temples", "Gardens"],
	...overrides,
});

export const TEST_WORLD = new WorldIndex({
	localities: [
		locality({
			key: "testa",
			name: "Testa",
			lat: 35.0,
			lon: 135.75,
			popularity: 0.995,
			radiusKm: 10,
			peakMonths: [4, 11],
			offSeasonMonths: [1],
			bestMonths: [5],
			events: [{ month: 4, name: "Blossom Festival" }],
			traits: ["Temples", "Gardens", "Tea houses"],
		}),
		locality({
			key: "quietton",
			name: "Quietton",
			lat: 36.56,
			lon: 136.65,
			popularity: 0.72,
			bestMonths: [4],
			traits: ["Temples", "Gardens", "Crafts"],
		}),
		locality({ key: "busyburg", name: "Busyburg", lat: 34.7, lon: 135.5, popularity: 0.97, vector: { nightlife: 0.9, food_street: 0.8, shopping: 0.7 }, traits: ["Nightlife"] }),
		locality({ key: "nearby-village", name: "Nearby Village", lat: 35.3, lon: 135.9, popularity: 0.5, population: 4000, radiusKm: 3 }),
		locality({
			key: "farland",
			name: "Farland",
			lat: 35.83,
			lon: 129.21,
			country: "Otherland",
			countryCode: "YY",
			popularity: 0.82,
			traits: ["Temples", "Royal tombs"],
		}),
	],
	places: [
		place("testa-crowded-shrine", "Crowded Shrine", "testa", 34.967, 135.773, "shrine", 0.998, { spiritual: 0.9, photogenic: 0.9, history: 0.6, nature: 0.4 }),
		place("testa-busy-temple", "Busy Temple", "testa", 34.995, 135.785, "temple", 0.997, { spiritual: 0.9, history: 0.8, architecture: 0.6, photogenic: 0.7 }),
		place("testa-quiet-shrine", "Quiet Shrine", "testa", 35.04, 135.78, "shrine", 0.62, { spiritual: 0.9, photogenic: 0.6, quiet: 0.8, nature: 0.5 }, { neighborhood: "North" }),
		place("testa-moss-garden", "Moss Garden", "testa", 35.02, 135.8, "garden", 0.7, { garden: 0.9, zen: 0.8, quiet: 0.8, spiritual: 0.4 }, { neighborhood: "East" }),
		place("testa-hill-temple", "Hill Temple", "testa", 35.06, 135.73, "temple", 0.68, { spiritual: 0.85, history: 0.7, quiet: 0.7, nature: 0.6 }, { neighborhood: "North" }),
		place("testa-big-market", "Big Market", "testa", 35.005, 135.765, "market", 0.99, { markets: 0.9, food_street: 0.8 }),
		place("testa-tea-cafe", "Leaf & Steam", "testa", 35.03, 135.79, "cafe", 0.55, { tea: 0.9, cafes: 0.8, quiet: 0.6 }, { neighborhood: "East", priceLevel: 2 }),
		place("testa-river-kitchen", "River Kitchen", "testa", 35.01, 135.77, "restaurant", 0.6, { food_fine: 0.6, local_life: 0.6, tea: 0.3 }, { neighborhood: "Center", priceLevel: 3 }),
		place("testa-noodle-bar", "Night Noodles", "testa", 35.0, 135.76, "restaurant", 0.58, { food_street: 0.8, nightlife: 0.4 }, { neighborhood: "Center", priceLevel: 1 }),
		place("testa-blue-note", "Blue Lantern Jazz", "testa", 35.005, 135.77, "bar", 0.5, { jazz: 0.9, nightlife: 0.8, music: 0.7 }, { neighborhood: "Center", priceLevel: 2 }),
		place("village-temple", "Village Temple", "nearby-village", 35.3, 135.9, "temple", 0.6, { spiritual: 0.85, quiet: 0.8, history: 0.6, nature: 0.6 }),
		place("village-teahouse", "Village Teahouse", "nearby-village", 35.302, 135.902, "teahouse", 0.45, { tea: 0.9, quiet: 0.8 }),
		place("quietton-temple", "Quietton Temple", "quietton", 36.56, 136.65, "temple", 0.75, { spiritual: 0.8, history: 0.7, garden: 0.5 }),
		place("quietton-garden", "Quietton Garden", "quietton", 36.562, 136.66, "garden", 0.8, { garden: 0.9, zen: 0.6, photogenic: 0.6 }),
		place("quietton-cafe", "Quietton Tea Room", "quietton", 36.565, 136.655, "cafe", 0.5, { tea: 0.8, cafes: 0.7 }, { priceLevel: 2 }),
		place("quietton-kitchen", "Quietton Kitchen", "quietton", 36.561, 136.652, "restaurant", 0.55, { food_fine: 0.5, local_life: 0.6 }, { priceLevel: 2 }),
		place("busyburg-castle", "Busyburg Castle", "busyburg", 34.687, 135.526, "castle", 0.98, { history: 0.8, architecture: 0.7 }),
		place("farland-pagoda", "Farland Pagoda", "farland", 35.79, 129.33, "temple", 0.8, { spiritual: 0.9, history: 0.8, quiet: 0.5 }),
		place("farland-tombs", "Royal Tombs Park", "farland", 35.835, 129.21, "park", 0.78, { history: 0.9, garden: 0.5 }),
	],
	tastes: [
		{ key: "calm-film", name: "Calm Film", kind: "movie", year: 2001, popularity: 0.9, vector: { quiet: 0.9, spiritual: 0.6, nature: 0.6, tea: 0.4 } },
		{ key: "loud-album", name: "Loud Album", kind: "artist", popularity: 0.9, vector: { nightlife: 0.9, jazz: 0.8, music: 0.9, food_street: 0.4 } },
	],
});

export function testApi(onEvidence?: (evidence: Evidence) => void): QlooApi {
	return new QlooApi(new QlooClient({ transport: new MockTransport(TEST_WORLD), onEvidence }));
}
