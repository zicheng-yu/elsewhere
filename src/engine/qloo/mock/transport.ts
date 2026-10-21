/**
 * A synthetic stand-in for the Qloo API. It interprets the same query
 * parameters as the real endpoints and answers from the SYNTHETIC demo world,
 * in the documented response shapes, so the engine runs identically in mock
 * and live modes. Affinities are cosine similarities of invented facet
 * vectors; they say nothing about real Qloo data.
 */
import { centroid, geohashCenter, geohashEncode, geohashNeighbors, haversineKm, type LatLon } from "../../geo.ts";
import { matchNormalized, normalizeName } from "../../text.ts";
import { QlooError, type QlooTransport } from "../client.ts";
import { FACETS, type Facet, type MonthNumber } from "./world-schema.ts";
import {
	FACET_LABELS,
	FACET_SYNONYMS,
	facetTagId,
	hashUnit,
	regionalPrior,
	toUnit,
	type IndexedEntity,
	type WorldIndex,
} from "./world.ts";

const TASTE_TYPES: Record<string, string> = {
	"urn:entity:movie": "movie",
	"urn:entity:tv_show": "tv_show",
	"urn:entity:artist": "artist",
	"urn:entity:person": "person",
	"urn:entity:book": "book",
	"urn:entity:brand": "brand",
};

function badRequest(message: string): QlooError {
	return new QlooError("bad_request", 400, message);
}

function list(params: URLSearchParams, key: string): string[] {
	const value = params.get(key);
	return value ? value.split(",").map((item) => item.trim()).filter(Boolean) : [];
}

function numParam(params: URLSearchParams, key: string): number | undefined {
	const value = params.get(key);
	if (value === null || value === "") return undefined;
	const n = Number(value);
	return Number.isFinite(n) ? n : undefined;
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

function round3(value: number): number {
	return Math.round(value * 1000) / 1000;
}

function dot(a: Float64Array, b: Float64Array): number {
	let sum = 0;
	for (let i = 0; i < a.length; i++) sum += (a[i] ?? 0) * (b[i] ?? 0);
	return sum;
}

/** Synthetic affinity from unit vectors: similarity plus a small popularity prior and deterministic jitter. */
export function mockAffinity(signal: Float64Array, candidate: Float64Array, seed: string, popularity: number, prior = 0): number {
	const jitter = (hashUnit(seed) - 0.5) * 0.024;
	return round3(clamp(0.5 + 0.42 * dot(signal, candidate) + prior + 0.025 * popularity + jitter, 0.4, 0.995));
}

interface SignalInfo {
	/** Unit-length aggregate of the signal entities and tags. */
	unit: Float64Array;
	entities: IndexedEntity[];
	hasSignal: boolean;
}

interface Area {
	center: LatLon;
	radiusKm: number;
	contains(point: LatLon, localityKey?: string): boolean;
}

type Ring = [number, number][];

function parseRings(wkt: string): Ring[] {
	const rings: Ring[] = [];
	for (const match of wkt.matchAll(/\(([^()]+)\)/g)) {
		const ring = (match[1] ?? "")
			.split(",")
			.map((pair) => pair.trim().split(/\s+/).map(Number))
			.filter((pair): pair is [number, number] => pair.length >= 2 && pair.every(Number.isFinite))
			.map(([lon, lat]) => [lon, lat] as [number, number]);
		if (ring.length >= 3) rings.push(ring);
	}
	return rings;
}

function pointInRing(point: LatLon, ring: Ring): boolean {
	let inside = false;
	for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
		const [xi, yi] = ring[i] ?? [0, 0];
		const [xj, yj] = ring[j] ?? [0, 0];
		const intersects = yi > point.lat !== yj > point.lat && point.lon < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi;
		if (intersects) inside = !inside;
	}
	return inside;
}

function entityPopularity(entity: IndexedEntity): number {
	return entity.data.popularity;
}

function entityPoint(entity: IndexedEntity): LatLon | undefined {
	if (entity.kind === "taste") return undefined;
	return { lat: entity.data.lat, lon: entity.data.lon };
}

function localityKeyOf(entity: IndexedEntity): string | undefined {
	if (entity.kind === "place") return entity.locality.key;
	if (entity.kind === "locality") return entity.data.key;
	return undefined;
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface MockTransportOptions {
	/** Simulated network latency per request, to make streaming UIs realistic. */
	latencyMs?: number;
}

export class MockTransport implements QlooTransport {
	readonly mode = "mock" as const;
	#world: WorldIndex;
	#latencyMs: number;

	constructor(world: WorldIndex, options: MockTransportOptions = {}) {
		this.#world = world;
		this.#latencyMs = options.latencyMs ?? 0;
	}

	async get(path: string, params: URLSearchParams): Promise<unknown> {
		if (this.#latencyMs > 0) await sleep(this.#latencyMs * (0.6 + 0.8 * Math.random()));
		switch (path) {
			case "/search":
				return this.#search(params);
			case "/entities":
				return this.#entities(params);
			case "/v2/insights":
				return this.#insights(params);
			case "/v2/tags":
				return this.#tags(params);
			case "/v2/analysis/compare":
				return this.#compare(params);
			case "/v2/trending":
				return this.#trending(params);
			default:
				throw new QlooError("not_found", 404, `No path matching request: ${path}`);
		}
	}

	#area(value: string | null, radiusM: number | undefined): Area | undefined {
		if (!value) return undefined;
		const trimmed = value.trim();
		const entity = this.#world.byId.get(trimmed);
		if (entity?.kind === "locality") {
			const { data } = entity;
			const pad = radiusM !== undefined ? radiusM / 1000 : Math.min(data.radiusKm * 0.2, 2.414);
			const radiusKm = data.radiusKm + pad;
			return {
				center: { lat: data.lat, lon: data.lon },
				radiusKm,
				contains: (point, localityKey) => localityKey === data.key || haversineKm(point, data) <= radiusKm,
			};
		}
		const point = /^POINT\s*\(\s*(-?[\d.]+)\s+(-?[\d.]+)\s*\)$/i.exec(trimmed);
		if (point) {
			const center = { lat: Number(point[2]), lon: Number(point[1]) };
			const radiusKm = (radiusM ?? 15_000) / 1000;
			return { center, radiusKm, contains: (p) => haversineKm(p, center) <= radiusKm };
		}
		if (/^(MULTI)?POLYGON/i.test(trimmed)) {
			const rings = parseRings(trimmed);
			if (rings.length === 0) throw badRequest(`Invalid WKT geometry: ${trimmed.slice(0, 60)}`);
			const points = rings.flat().map(([lon, lat]) => ({ lat, lon }));
			const center = centroid(points);
			const radiusKm = Math.max(...points.map((p) => haversineKm(p, center)));
			return { center, radiusKm, contains: (p) => rings.some((ring) => pointInRing(p, ring)) };
		}
		throw badRequest(`Unrecognized location: ${trimmed.slice(0, 60)}`);
	}

	#searchArea(params: URLSearchParams): Area | undefined {
		const value = params.get("filter.location");
		if (!value) return undefined;
		const radiusM = (numParam(params, "filter.radius") ?? 10) * 1609.34;
		const latLon = /^(-?[\d.]+)\s*,\s*(-?[\d.]+)$/.exec(value.trim());
		if (latLon) {
			const center = { lat: Number(latLon[1]), lon: Number(latLon[2]) };
			const radiusKm = radiusM / 1000;
			return { center, radiusKm, contains: (p) => haversineKm(p, center) <= radiusKm };
		}
		return this.#area(value, radiusM);
	}

	#signal(params: URLSearchParams): SignalInfo {
		const entities = list(params, "signal.interests.entities")
			.map((id) => this.#world.byId.get(id))
			.filter((entity): entity is IndexedEntity => entity !== undefined);
		const facets = list(params, "signal.interests.tags")
			.map((id) => id.split(":").at(-1) as Facet)
			.filter((facet) => FACETS.includes(facet));
		const vector = new Float64Array(FACETS.length);
		for (const entity of entities) {
			for (let i = 0; i < vector.length; i++) vector[i] = (vector[i] ?? 0) + (entity.unit[i] ?? 0);
		}
		for (const facet of facets) {
			const i = FACETS.indexOf(facet);
			vector[i] = (vector[i] ?? 0) + 0.8;
		}
		return { unit: toUnit(vector), entities, hasSignal: entities.length + facets.length > 0 };
	}

	#search(params: URLSearchParams): unknown {
		const queryNorm = normalizeName(params.get("query") ?? "");
		const types = list(params, "types");
		const area = this.#searchArea(params);
		const tags = list(params, "filter.tags");
		const intersection = params.get("operator.filter.tags") === "intersection";
		const popularityMin = numParam(params, "filter.popularity");
		const sortBy = params.get("sort_by") ?? "match";
		const take = clamp(Math.round(numParam(params, "take") ?? 10), 1, 199);

		const wanted = (entity: IndexedEntity): boolean => {
			if (types.length === 0) return true;
			if (entity.kind === "locality") return types.includes("urn:entity:locality");
			if (entity.kind === "place") return types.includes("urn:entity:place");
			return types.some((type) => TASTE_TYPES[type] === entity.data.kind);
		};

		const scored = [...this.#world.localities, ...this.#world.places, ...this.#world.tastes]
			.filter(wanted)
			.map((entity) => ({ entity, score: queryNorm ? matchNormalized(queryNorm, entity.normName) : 1 }))
			.filter(({ score }) => score >= 0.3)
			.filter(({ entity }) => {
				if (popularityMin !== undefined && entityPopularity(entity) < popularityMin) return false;
				if (area) {
					const point = entityPoint(entity);
					if (!point || !area.contains(point, localityKeyOf(entity))) return false;
				}
				if (tags.length > 0) {
					const has = (tag: string) => entity.tagIds.includes(tag);
					if (intersection ? !tags.every(has) : !tags.some(has)) return false;
				}
				return true;
			});

		scored.sort((a, b) => {
			if (sortBy === "popularity") return entityPopularity(b.entity) - entityPopularity(a.entity);
			if (sortBy === "distance" && area) {
				const da = haversineKm(entityPoint(a.entity) ?? area.center, area.center);
				const db = haversineKm(entityPoint(b.entity) ?? area.center, area.center);
				return da - db;
			}
			return b.score - a.score || entityPopularity(b.entity) - entityPopularity(a.entity);
		});

		return { success: true, results: scored.slice(0, take).map(({ entity }) => this.#world.raw(entity)) };
	}

	#entities(params: URLSearchParams): unknown {
		const ids = list(params, "entity_ids");
		if (ids.length === 0) throw badRequest("entity_ids must be specified.");
		const results = ids
			.map((id) => this.#world.byId.get(id))
			.filter((entity): entity is IndexedEntity => entity !== undefined)
			.map((entity) => this.#world.raw(entity));
		return { success: true, results };
	}

	#insights(params: URLSearchParams): unknown {
		const type = params.get("filter.type");
		if (!type) throw badRequest("filter.type is required");
		const signal = this.#signal(params);
		if (type === "urn:heatmap") return this.#heatmap(params, signal);

		let candidates: IndexedEntity[];
		if (type === "urn:entity:locality") {
			if (signal.entities.some((entity) => entity.kind !== "locality")) {
				throw badRequest("urn:entity:locality only supports signal.interests.entities that are localities");
			}
			const signalIds = new Set(signal.entities.map((entity) => entity.id));
			candidates = this.#world.localities.filter((entity) => !signalIds.has(entity.id));
		} else if (type === "urn:entity:place") {
			candidates = this.#world.places;
		} else if (TASTE_TYPES[type]) {
			candidates = this.#world.tastes.filter((entity) => entity.data.kind === TASTE_TYPES[type]);
		} else {
			throw new QlooError("forbidden", 403, `Entity type ${type} is not available`);
		}

		const area = this.#area(params.get("filter.location"), numParam(params, "filter.location.radius"));
		const excludeArea = this.#area(
			params.get("filter.exclude.location"),
			numParam(params, "filter.exclude.location.radius"),
		);
		const popularityMax = numParam(params, "filter.popularity.max");
		const popularityMin = numParam(params, "filter.popularity.min");
		const excludeIds = new Set(list(params, "filter.exclude.entities"));
		const tags = list(params, "filter.tags");
		const intersection = params.get("operator.filter.tags") === "intersection";
		const excludeTags = list(params, "filter.exclude.tags");
		const resultIds = list(params, "filter.results.entities");

		const hasFilter = Boolean(area || tags.length || resultIds.length);
		if (!signal.hasSignal && !hasFilter) throw badRequest("at least one valid signal or filter is required");

		const filtered = candidates.filter((entity) => {
			const popularity = entityPopularity(entity);
			if (popularityMax !== undefined && popularity > popularityMax) return false;
			if (popularityMin !== undefined && popularity < popularityMin) return false;
			if (excludeIds.has(entity.id)) return false;
			if (resultIds.length > 0 && !resultIds.includes(entity.id)) return false;
			const point = entityPoint(entity);
			if (area && (!point || !area.contains(point, localityKeyOf(entity)))) return false;
			if (excludeArea && point && excludeArea.contains(point, localityKeyOf(entity))) return false;
			if (tags.length > 0) {
				const has = (tag: string) => entity.tagIds.includes(tag);
				if (intersection ? !tags.every(has) : !tags.some(has)) return false;
			}
			if (excludeTags.some((tag) => entity.tagIds.includes(tag))) return false;
			return true;
		});

		const signalKey = list(params, "signal.interests.entities").join("|") + list(params, "signal.interests.tags").join("|");
		const signalCountries = signal.entities.flatMap((e) => (e.kind === "locality" ? [e.data.countryCode] : []));
		const prior = (entity: IndexedEntity) =>
			entity.kind === "locality" && signalCountries.length > 0
				? Math.max(...signalCountries.map((code) => regionalPrior(code, entity.data.countryCode)))
				: 0;
		let scored = filtered.map((entity) => ({
			entity,
			affinity: signal.hasSignal
				? mockAffinity(signal.unit, entity.unit, `${signalKey}|${entity.id}`, entityPopularity(entity), prior(entity))
				: round3(0.5 + 0.45 * entityPopularity(entity)),
		}));
		scored.sort((a, b) => b.affinity - a.affinity);

		// diversify.by caps results per city before paging (properties.geocode.city / .metro).
		const diversifyBy = params.get("diversify.by");
		if (diversifyBy === "properties.geocode.city" || diversifyBy === "properties.geocode.metro") {
			const cap = clamp(Math.round(numParam(params, "diversify.take") ?? 5), 1, 50);
			const counts = new Map<string, number>();
			scored = scored.filter(({ entity }) => {
				const key = localityKeyOf(entity) ?? entity.id;
				const n = counts.get(key) ?? 0;
				counts.set(key, n + 1);
				return n < cap;
			});
		}

		const take = clamp(Math.round(numParam(params, "take") ?? 20), 1, 50);
		const page = clamp(Math.round(numParam(params, "page") ?? 1), 1, 100);
		const offset = numParam(params, "offset") ?? (page - 1) * take;
		const explain = params.get("feature.explainability") === "true";

		const entities = scored.slice(offset, offset + take).map(({ entity, affinity }) => {
			const raw = this.#world.raw(entity, affinity);
			if (explain && signal.entities.length > 0) {
				const contributions = signal.entities.map((source) => ({
					entity_id: source.id,
					score: Math.max(0, dot(source.unit, entity.unit)),
				}));
				const total = contributions.reduce((sum, c) => sum + c.score, 0) || 1;
				const query = (raw.query ?? {}) as Record<string, unknown>;
				raw.query = {
					...query,
					explainability: {
						"signal.interests.entities": contributions.map((c) => ({ ...c, score: round3(c.score / total) })),
					},
				};
			}
			return raw;
		});

		return { success: true, results: { entities }, duration: 0.04 };
	}

	#heatmap(params: URLSearchParams, signal: SignalInfo): unknown {
		const area = this.#area(params.get("filter.location"), numParam(params, "filter.location.radius"));
		if (!area) throw badRequest("filter.location is required for urn:heatmap");
		if (!signal.hasSignal) throw badRequest("at least one valid signal or filter is required");
		const precision = area.radiusKm > 8 ? 5 : 6;
		const cells = new Map<string, { affinity: number; popularity: number }>();
		for (const place of this.#world.places) {
			if (!area.contains(place.data, place.locality.key)) continue;
			const hash = geohashEncode(place.data.lat, place.data.lon, precision);
			const affinity = mockAffinity(signal.unit, place.unit, `heat|${hash}|${place.id}`, place.data.popularity);
			const cell = cells.get(hash) ?? { affinity: 0, popularity: 0 };
			cells.set(hash, {
				affinity: Math.max(cell.affinity, affinity),
				popularity: Math.max(cell.popularity, place.data.popularity),
			});
		}
		for (const [hash, cell] of [...cells.entries()]) {
			for (const neighbor of geohashNeighbors(hash)) {
				const softened = { affinity: cell.affinity * 0.55, popularity: cell.popularity * 0.45 };
				const existing = cells.get(neighbor);
				if (!existing) cells.set(neighbor, softened);
			}
		}
		const take = clamp(Math.round(numParam(params, "take") ?? 120), 1, 500);
		const heatmap = [...cells.entries()]
			.sort((a, b) => b[1].affinity - a[1].affinity)
			.slice(0, take)
			.map(([geohash, cell]) => {
				const center = geohashCenter(geohash);
				return {
					location: { latitude: center.lat, longitude: center.lon, geohash },
					query: { affinity: round3(cell.affinity), popularity: round3(cell.popularity) },
				};
			});
		return { success: true, results: { heatmap }, duration: 0.05 };
	}

	#tags(params: URLSearchParams): unknown {
		const query = normalizeName(params.get("filter.query") ?? "");
		if (!query) throw badRequest("filter.query is required");
		const take = clamp(Math.round(numParam(params, "take") ?? 5), 1, 50);
		const scored = FACETS.map((facet) => {
			const label = normalizeName(FACET_LABELS[facet]);
			let score = label === query ? 1 : 0;
			for (const synonym of FACET_SYNONYMS[facet]) {
				const s = normalizeName(synonym);
				if (s === query) score = Math.max(score, 0.95);
				else if (query.includes(s) || s.includes(query)) score = Math.max(score, 0.7);
			}
			if (normalizeName(facet) === query) score = Math.max(score, 0.9);
			return { facet, score };
		})
			.filter(({ score }) => score > 0)
			.sort((a, b) => b.score - a.score)
			.slice(0, take);
		return {
			success: true,
			results: {
				tags: scored.map(({ facet }) => ({ id: facetTagId(facet), name: FACET_LABELS[facet], type: "urn:tag:keyword:qloo" })),
			},
		};
	}

	#compare(params: URLSearchParams): unknown {
		const side = (key: string) =>
			list(params, key)
				.map((id) => this.#world.byId.get(id))
				.filter((entity): entity is IndexedEntity => entity !== undefined);
		const a = side("a.signal.interests.entities");
		const b = side("b.signal.interests.entities");
		if (a.length === 0 || b.length === 0) throw badRequest("a.signal.interests.entities and b.signal.interests.entities are required");
		const sum = (entities: IndexedEntity[]) => {
			const vector = new Float64Array(FACETS.length);
			for (const entity of entities) entity.vector.forEach((x, i) => (vector[i] = (vector[i] ?? 0) + x));
			return toUnit(vector);
		};
		const va = sum(a);
		const vb = sum(b);
		const take = clamp(Math.round(numParam(params, "take") ?? 10), 1, 50);
		const tags = FACETS.map((facet, i) => ({ facet, score: Math.min(va[i] ?? 0, vb[i] ?? 0) }))
			.filter(({ score }) => score > 0.08)
			.sort((x, y) => y.score - x.score)
			.slice(0, take)
			.map(({ facet, score }) => ({
				tag_id: facetTagId(facet),
				name: FACET_LABELS[facet],
				type: "urn:tag:keyword:qloo",
				query: { score: round3(score) },
			}));
		return { success: true, results: { tags } };
	}

	#trending(params: URLSearchParams): unknown {
		const id = list(params, "signal.interests.entities")[0];
		const start = params.get("filter.start_date");
		const end = params.get("filter.end_date");
		if (!params.get("filter.type") || !id || !start || !end) {
			throw badRequest("filter.type, signal.interests.entities, filter.start_date and filter.end_date are required");
		}
		const entity = this.#world.byId.get(id);
		if (!entity) return { success: true, results: { trending: [] } };
		const locality =
			entity.kind === "locality" ? entity.data : entity.kind === "place" ? entity.locality : undefined;
		const base = entity.data.popularity * 100;
		const points: Record<string, unknown>[] = [];
		const endDate = new Date(`${end}T00:00:00Z`);
		for (let date = new Date(`${start}T00:00:00Z`); date <= endDate; date.setUTCDate(date.getUTCDate() + 7)) {
			const month = (date.getUTCMonth() + 1) as MonthNumber;
			const gap = 100 - base;
			const factor = locality?.peakMonths.includes(month)
				? 0.6
				: locality?.offSeasonMonths.includes(month)
					? 1.5
					: 1;
			const iso = date.toISOString().slice(0, 10);
			const percentile = clamp(100 - gap * factor * (0.95 + 0.1 * hashUnit(`${id}|${iso}`)), 0, 99.99);
			points.push({
				date: iso,
				population_percentile: Math.round(percentile * 100) / 100,
				population_rank: Math.max(1, Math.round((100 - percentile) * 40)),
				velocity_fold_change: round3(1 / factor),
			});
		}
		points.reverse();
		return { success: true, results: { trending: points } };
	}
}
