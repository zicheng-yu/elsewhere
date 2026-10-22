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

/** The subset of a D1 database the cache uses; structural, so engine code and tests need no Workers types. */
export interface D1Like {
	prepare(query: string): D1StatementLike;
}

export interface D1StatementLike {
	bind(...values: unknown[]): D1StatementLike;
	all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
	run(): Promise<unknown>;
}

export interface CacheStats {
	lookups: number;
	hits: number;
	writes: number;
	queries: number;
}

// The expiry column comes before the value so a cleanup scan never reads the large values.
const SCHEMA = `CREATE TABLE IF NOT EXISTS cache (
	key TEXT PRIMARY KEY,
	expires_at INTEGER NOT NULL,
	value TEXT NOT NULL
)`;
/** D1 allows 100 bound parameters per statement: lookups bind one per key plus the time. */
const KEYS_PER_SELECT = 99;
/** Writes bind three per row. */
const ROWS_PER_INSERT = 33;
/** Keeps each write statement's payload modest. */
const CHARS_PER_INSERT = 800_000;
/** D1 rejects rows over 2 MB; anything this long (in UTF-16 units) is not cached. */
const MAX_VALUE_CHARS = 500_000;
/** Statements kept back for the final flush. */
const FLUSH_RESERVE = 2;
/** Responses buffered before a write goes out with a lookup; fewer statements leave more of the budget for lookups. */
const WRITE_BATCH = 10;
/** Databases whose cache table already exists in this isolate. */
const ready = new WeakSet<object>();

interface Unwritten {
	expiresAt: number;
	text: string;
}

function chunks<T>(items: T[], size: number): T[][] {
	const out: T[][] = [];
	for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
	return out;
}

/**
 * Private server-side cache in D1, created per invocation. D1 on the Workers
 * Free plan allows 100,000 row writes a day (KV allows 1,000) but only 50
 * queries per invocation, so lookups made in the same turn of the event loop
 * share one query, writes wait until there are enough to go out with a lookup
 * (or the final flush), and the cache stops querying once its share of the
 * budget is spent.
 */
export class D1Cache implements QlooCache {
	readonly stats: CacheStats = { lookups: 0, hits: 0, writes: 0, queries: 0 };
	readonly #db: D1Like;
	readonly #maxQueries: number;
	#schema: Promise<boolean> | undefined;
	#scheduled = false;
	/** Values read or written during this invocation. */
	readonly #seen = new Map<string, unknown>();
	#waiting = new Map<string, ((value: unknown) => void)[]>();
	#unwritten = new Map<string, Unwritten>();

	/** `maxQueries` is this cache's share of the invocation's D1 queries; journeys and the spending ledger need the rest. */
	constructor(db: D1Like, options: { maxQueries?: number } = {}) {
		this.#db = db;
		this.#maxQueries = options.maxQueries ?? 24;
	}

	get(key: string): Promise<unknown | undefined> {
		if (this.#seen.has(key)) return Promise.resolve(this.#seen.get(key));
		return new Promise((resolve) => {
			const waiting = this.#waiting.get(key);
			if (waiting) waiting.push(resolve);
			else this.#waiting.set(key, [resolve]);
			if (!this.#scheduled) {
				this.#scheduled = true;
				setTimeout(() => void this.#lookup(), 0);
			}
		});
	}

	async put(key: string, value: unknown, ttlSeconds: number): Promise<void> {
		this.#seen.set(key, value);
		const text = JSON.stringify(value);
		if (text.length <= MAX_VALUE_CHARS) this.#unwritten.set(key, { expiresAt: Date.now() + ttlSeconds * 1000, text });
	}

	/** Writes whatever is still buffered. Call once the invocation's work is done, e.g. in waitUntil. */
	async flush(): Promise<CacheStats> {
		await this.#write(true);
		return this.stats;
	}

	async #lookup(): Promise<void> {
		this.#scheduled = false;
		const waiting = this.#waiting;
		this.#waiting = new Map();
		// Responses fetched since earlier lookups go out alongside this one once there are enough of them.
		const [found] = await Promise.all([this.#read([...waiting.keys()]), this.#unwritten.size >= WRITE_BATCH ? this.#write(false) : undefined]);
		for (const [key, resolvers] of waiting) {
			const value = found.get(key);
			if (value !== undefined) this.#seen.set(key, value);
			for (const resolve of resolvers) resolve(value);
		}
	}

	/** Reserves `statements` queries (plus the schema on first use); false when over budget. */
	async #begin(statements: number, final: boolean): Promise<boolean> {
		const schema = ready.has(this.#db) || this.#schema ? 0 : 1;
		const limit = final ? this.#maxQueries : this.#maxQueries - FLUSH_RESERVE;
		if (this.stats.queries + statements + schema > limit) return false;
		this.stats.queries += statements + schema;
		this.#schema ??= ready.has(this.#db)
			? Promise.resolve(true)
			: this.#db
					.prepare(SCHEMA)
					.run()
					.then(() => (ready.add(this.#db), true))
					.catch(() => false);
		return this.#schema;
	}

	async #read(keys: string[]): Promise<Map<string, unknown>> {
		const found = new Map<string, unknown>();
		if (keys.length === 0) return found;
		this.stats.lookups += keys.length;
		const parts = chunks(keys, KEYS_PER_SELECT);
		if (!(await this.#begin(parts.length, false))) return found;
		const now = Date.now();
		try {
			const results = await Promise.all(
				parts.map((part) =>
					this.#db
						.prepare(`SELECT key, value FROM cache WHERE key IN (${part.map(() => "?").join(", ")}) AND expires_at > ?`)
						.bind(...part, now)
						.all<{ key: string; value: string }>(),
				),
			);
			for (const { results: rows } of results) for (const row of rows) found.set(row.key, JSON.parse(row.value));
		} catch {
			// A failed lookup is a miss.
		}
		this.stats.hits += found.size;
		return found;
	}

	async #write(final: boolean): Promise<void> {
		if (this.#unwritten.size === 0) return;
		const entries = [...this.#unwritten];
		this.#unwritten = new Map();
		const statements: [string, Unwritten][][] = [];
		let current: [string, Unwritten][] = [];
		let chars = 0;
		for (const entry of entries) {
			if (current.length > 0 && (current.length >= ROWS_PER_INSERT || chars + entry[1].text.length > CHARS_PER_INSERT)) {
				statements.push(current);
				current = [];
				chars = 0;
			}
			current.push(entry);
			chars += entry[1].text.length;
		}
		statements.push(current);
		if (!(await this.#begin(statements.length, final))) {
			// Over budget: keep the entries for the final flush (which drops them if it cannot write either).
			if (!final) for (const [key, entry] of entries) this.#unwritten.set(key, entry);
			return;
		}
		await Promise.all(
			statements.map(async (rows) => {
				try {
					await this.#db
						.prepare(
							`INSERT INTO cache (key, expires_at, value) VALUES ${rows.map(() => "(?, ?, ?)").join(", ")}
							 ON CONFLICT(key) DO UPDATE SET expires_at = excluded.expires_at, value = excluded.value`,
						)
						.bind(...rows.flatMap(([key, entry]) => [key, entry.expiresAt, entry.text]))
						.run();
					this.stats.writes += rows.length;
				} catch {
					// Caching is best effort.
				}
			}),
		);
	}
}
