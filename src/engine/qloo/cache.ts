import type { QlooCache } from "./client.ts";

/** In-memory LRU cache for local runs, scripts and tests. */
export class MemoryCache implements QlooCache {
	#entries = new Map<string, { value: unknown; expires: number }>();
	#maxEntries: number;

	constructor(maxEntries = 500) {
		this.#maxEntries = maxEntries;
	}

	async get(key: string): Promise<unknown | undefined> {
		const entry = this.#entries.get(key);
		if (!entry) return undefined;
		if (entry.expires < Date.now()) {
			this.#entries.delete(key);
			return undefined;
		}
		// Refresh recency.
		this.#entries.delete(key);
		this.#entries.set(key, entry);
		return entry.value;
	}

	async put(key: string, value: unknown, ttlSeconds: number): Promise<void> {
		this.#entries.delete(key);
		this.#entries.set(key, { value, expires: Date.now() + ttlSeconds * 1000 });
		while (this.#entries.size > this.#maxEntries) {
			const oldest = this.#entries.keys().next().value;
			if (oldest === undefined) break;
			this.#entries.delete(oldest);
		}
	}
}

/** The subset of a Workers KV namespace used by the cache. */
export interface KvLike {
	get(key: string, type: "json"): Promise<unknown>;
	put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

/** Private server-side cache backed by Workers KV. Keys are hashed to stay under KV's key-size limit. */
export class KvCache implements QlooCache {
	#kv: KvLike;
	#prefix: string;

	constructor(kv: KvLike, prefix = "qloo:v1:") {
		this.#kv = kv;
		this.#prefix = prefix;
	}

	async get(key: string): Promise<unknown | undefined> {
		const value = await this.#kv.get(await this.#hash(key), "json");
		return value ?? undefined;
	}

	async put(key: string, value: unknown, ttlSeconds: number): Promise<void> {
		await this.#kv.put(await this.#hash(key), JSON.stringify(value), {
			expirationTtl: Math.max(60, Math.round(ttlSeconds)),
		});
	}

	async #hash(key: string): Promise<string> {
		const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key));
		const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
		return `${this.#prefix}${hex}`;
	}
}
