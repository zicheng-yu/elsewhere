import type { Evidence } from "../../shared/types.ts";
import { slimResponse } from "./slim.ts";

export const QLOO_HACKATHON_BASE_URL = "https://hackathon.api.qloo.com";

export type ParamValue = string | number | boolean | readonly string[] | undefined;
export type QlooParams = Record<string, ParamValue>;

export type QlooErrorKind =
	| "auth"
	| "forbidden"
	| "bad_request"
	| "not_found"
	| "rate_limited"
	| "server"
	| "timeout"
	| "network"
	| "budget";

export class QlooError extends Error {
	readonly kind: QlooErrorKind;
	readonly status: number;

	constructor(kind: QlooErrorKind, status: number, message: string) {
		super(message);
		this.name = "QlooError";
		this.kind = kind;
		this.status = status;
	}
}

/** Sends one GET request. Implemented by the live API and by the synthetic mock. */
export interface QlooTransport {
	readonly mode: "mock" | "live";
	get(path: string, params: URLSearchParams): Promise<unknown>;
}

export interface QlooCache {
	get(key: string): Promise<unknown | undefined>;
	put(key: string, value: unknown, ttlSeconds: number): Promise<void>;
}

/** Deterministic query string: sorted keys, arrays joined with commas, empty values dropped. */
export function toSearchParams(params: QlooParams): URLSearchParams {
	const search = new URLSearchParams();
	for (const key of Object.keys(params).sort()) {
		const value = params[key];
		if (value === undefined || value === "") continue;
		if (Array.isArray(value)) {
			if (value.length === 0) continue;
			search.set(key, value.join(","));
		} else {
			search.set(key, String(value));
		}
	}
	return search;
}

function kindFromStatus(status: number): QlooErrorKind {
	if (status === 401) return "auth";
	if (status === 403) return "forbidden";
	if (status === 404) return "not_found";
	if (status === 429) return "rate_limited";
	if (status >= 500) return "server";
	return "bad_request";
}

const HINTS: Partial<Record<QlooErrorKind, string>> = {
	auth: "Check the X-Api-Key header and that requests go to hackathon.api.qloo.com.",
	forbidden: "This entity type may not be available to hackathon keys.",
	not_found: "Check the endpoint path; insights requests must be GET with query parameters.",
	rate_limited: "Rate limit reached; slow down or ask for a quota increase in #api-help.",
};

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function backoffMs(attempt: number): number {
	return 400 * 2 ** attempt + Math.floor(Math.random() * 200);
}

export interface LiveTransportOptions {
	apiKey: string;
	baseUrl?: string;
	timeoutMs?: number;
	maxRetries?: number;
	/**
	 * Most fetch attempts (retries included) this transport may make. A Worker on
	 * the Free plan gets 50 external subrequests per invocation, shared with the
	 * LLM's calls; past this budget optional lookups fail and the journey degrades.
	 */
	maxFetches?: number;
}

/** Calls the real Qloo API. GET only, key in the X-Api-Key header. */
export class LiveTransport implements QlooTransport {
	readonly mode = "live" as const;
	#apiKey: string;
	#baseUrl: string;
	#timeoutMs: number;
	#maxRetries: number;
	#maxFetches: number;
	#fetches = 0;

	constructor(options: LiveTransportOptions) {
		this.#apiKey = options.apiKey;
		this.#baseUrl = (options.baseUrl ?? QLOO_HACKATHON_BASE_URL).replace(/\/$/, "");
		// One slow call should not stall a whole journey: fail fast, retry once.
		this.#timeoutMs = options.timeoutMs ?? 10_000;
		this.#maxRetries = options.maxRetries ?? 1;
		this.#maxFetches = options.maxFetches ?? Number.POSITIVE_INFINITY;
	}

	async get(path: string, params: URLSearchParams): Promise<unknown> {
		const query = params.toString();
		const url = `${this.#baseUrl}${path}${query ? `?${query}` : ""}`;
		for (let attempt = 0; ; attempt++) {
			if (this.#fetches >= this.#maxFetches) throw new QlooError("budget", 0, `Qloo request budget for this run is spent: ${path}`);
			this.#fetches++;
			let response: Response;
			try {
				response = await fetch(url, {
					headers: { "X-Api-Key": this.#apiKey, Accept: "application/json" },
					signal: AbortSignal.timeout(this.#timeoutMs),
				});
			} catch (error) {
				const timedOut = error instanceof Error && error.name === "TimeoutError";
				if (attempt < this.#maxRetries) {
					await sleep(backoffMs(attempt));
					continue;
				}
				throw new QlooError(
					timedOut ? "timeout" : "network",
					0,
					timedOut ? `Qloo request timed out: ${path}` : `Qloo request failed: ${path}`,
				);
			}
			if (response.ok) return await response.json();

			const kind = kindFromStatus(response.status);
			const retryable = kind === "rate_limited" || kind === "server";
			if (retryable && attempt < this.#maxRetries) {
				const retryAfter = Number(response.headers.get("retry-after"));
				await sleep(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : backoffMs(attempt));
				continue;
			}
			const body = (await response.text().catch(() => "")).slice(0, 300);
			const hint = HINTS[kind] ? ` ${HINTS[kind]}` : "";
			throw new QlooError(kind, response.status, `Qloo ${response.status} on ${path}: ${body}${hint}`);
		}
	}
}

/** Runs at most `limit` async tasks at once. */
export function createLimiter(limit: number): <T>(task: () => Promise<T>) => Promise<T> {
	let active = 0;
	const queue: (() => void)[] = [];
	const release = () => {
		active--;
		queue.shift()?.();
	};
	return async <T>(task: () => Promise<T>): Promise<T> => {
		if (active >= limit) await new Promise<void>((resolve) => queue.push(resolve));
		active++;
		try {
			return await task();
		} finally {
			release();
		}
	};
}

export interface QlooClientOptions {
	transport: QlooTransport;
	cache?: QlooCache;
	cacheTtlSeconds?: number;
	concurrency?: number;
	onEvidence?: (evidence: Evidence) => void;
	/** Trim responses to the fields Elsewhere reads (default). Exploration scripts can turn it off. */
	trim?: boolean;
}

/** Bump when the cached response shape changes. */
const CACHE_VERSION = "v3";

/**
 * Adds trimming, caching, request coalescing, concurrency limits and an
 * evidence trail on top of a transport.
 */
export class QlooClient {
	readonly mode: "mock" | "live";
	#transport: QlooTransport;
	#cache: QlooCache | undefined;
	#ttl: number;
	#limit: <T>(task: () => Promise<T>) => Promise<T>;
	#onEvidence: ((evidence: Evidence) => void) | undefined;
	#trim: boolean;
	#counter = 0;
	/** Identical requests in flight at the same time share one call. */
	readonly #inflight = new Map<string, Promise<unknown>>();
	/** Keeps evidence IDs unique across the runs (journey, plans) that share one timeline. */
	readonly #runTag = crypto.randomUUID().slice(0, 6);

	constructor(options: QlooClientOptions) {
		this.mode = options.transport.mode;
		this.#transport = options.transport;
		this.#cache = options.cache;
		this.#ttl = options.cacheTtlSeconds ?? 7 * 24 * 3600;
		this.#limit = createLimiter(options.concurrency ?? 5);
		this.#onEvidence = options.onEvidence;
		this.#trim = options.trim ?? true;
	}

	async get(path: string, params: QlooParams, note?: string): Promise<unknown> {
		const search = toSearchParams(params);
		const cacheKey = `${CACHE_VERSION}:${this.mode}:${this.#trim ? "" : "raw:"}${path}?${search.toString()}`;
		const pending = this.#inflight.get(cacheKey);
		if (pending) return pending;
		const task = this.#fetch(path, search, cacheKey, note);
		this.#inflight.set(cacheKey, task);
		try {
			return await task;
		} finally {
			this.#inflight.delete(cacheKey);
		}
	}

	async #fetch(path: string, search: URLSearchParams, cacheKey: string, note?: string): Promise<unknown> {
		const started = Date.now();

		const cached = await this.#cache?.get(cacheKey).catch(() => undefined);
		if (cached !== undefined) {
			this.#record(path, search, cached, { cached: true, ok: true, started, note });
			return cached;
		}

		try {
			const response = await this.#limit(() => this.#transport.get(path, search));
			const data = this.#trim ? slimResponse(response) : response;
			await this.#cache?.put(cacheKey, data, this.#ttl).catch(() => undefined);
			this.#record(path, search, data, { cached: false, ok: true, started, note });
			return data;
		} catch (error) {
			this.#record(path, search, undefined, {
				cached: false,
				ok: false,
				started,
				note: error instanceof Error ? error.message : String(error),
			});
			throw error;
		}
	}

	#record(
		path: string,
		search: URLSearchParams,
		data: unknown,
		meta: { cached: boolean; ok: boolean; started: number; note?: string },
	): void {
		if (!this.#onEvidence) return;
		this.#counter++;
		this.#onEvidence({
			id: `${this.#runTag}-q${this.#counter}`,
			endpoint: path,
			params: Object.fromEntries(search.entries()),
			resultCount: countResults(data),
			cached: meta.cached,
			ms: Date.now() - meta.started,
			ok: meta.ok,
			note: meta.note,
		});
	}
}

function countResults(data: unknown): number {
	if (!data || typeof data !== "object") return 0;
	const results = (data as { results?: unknown }).results;
	if (Array.isArray(results)) return results.length;
	if (results && typeof results === "object") {
		for (const key of ["entities", "heatmap", "tags", "trending"]) {
			const list = (results as Record<string, unknown>)[key];
			if (Array.isArray(list)) return list.length;
		}
	}
	return 0;
}
