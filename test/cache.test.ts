import { describe, expect, it } from "vitest";
import { D1Cache } from "../src/engine/qloo/cache.ts";
import { QlooClient, type QlooTransport } from "../src/engine/qloo/client.ts";
import { sqliteD1 } from "./fixtures/sqlite-d1.ts";

describe("D1 cache", () => {
	it("shares one query among lookups made together and batches writes", async () => {
		const db = sqliteD1();
		const first = new D1Cache(db);
		expect(await Promise.all([first.get("a"), first.get("b"), first.get("a")])).toEqual([undefined, undefined, undefined]);
		await first.put("a", { results: [1] }, 60);
		await first.put("b", "text", 60);
		// Values from this invocation come from memory.
		expect(await first.get("a")).toEqual({ results: [1] });
		expect(await first.get("c")).toBeUndefined();
		// Two responses are too few to write with that lookup; the flush writes them.
		expect(await first.flush()).toEqual({ lookups: 3, hits: 0, writes: 2, queries: 4 });
		expect(db.statements.map((s) => s.split(" ")[0])).toEqual(["CREATE", "SELECT", "SELECT", "INSERT"]);

		// A later invocation reads both back in one query; the table already exists.
		const second = new D1Cache(db);
		expect(await Promise.all([second.get("a"), second.get("b")])).toEqual([{ results: [1] }, "text"]);
		expect(second.stats).toEqual({ lookups: 2, hits: 2, writes: 0, queries: 1 });
	});

	it("stays within its query budget and keeps room for the final flush", async () => {
		const db = sqliteD1();
		const cache = new D1Cache(db, { maxQueries: 4 });
		await cache.get("a");
		await cache.put("a", 1, 60);
		// The table and one lookup use the two queries lookups may spend: the next lookup misses without a query.
		expect(await cache.get("b")).toBeUndefined();
		expect(cache.stats.queries).toBe(2);
		expect(await cache.flush()).toMatchObject({ writes: 1, queries: 3 });
		expect(await new D1Cache(db).get("a")).toBe(1);
	});

	it("ignores expired entries", async () => {
		const db = sqliteD1();
		const cache = new D1Cache(db);
		await cache.put("old", "stale", -60);
		await cache.flush();
		expect(await new D1Cache(db).get("old")).toBeUndefined();
	});

	it("writes along with a lookup once enough responses wait", async () => {
		const db = sqliteD1();
		const cache = new D1Cache(db);
		for (let i = 0; i < 10; i++) await cache.put(`k${i}`, i, 60);
		await cache.get("other");
		expect(cache.stats).toMatchObject({ writes: 10 });
		expect(db.statements.filter((s) => s.startsWith("INSERT"))).toHaveLength(1);
	});

	it("costs a Qloo run one query per wave of parallel requests", async () => {
		const db = sqliteD1();
		const transport: QlooTransport = { mode: "live", get: async (path, params) => ({ results: { entities: [{ name: `${path}?${params}` }] } }) };
		const run = async () => {
			const client = new QlooClient({ transport, cache: new D1Cache(db) });
			await Promise.all(["a", "b", "c"].map((query) => client.get("/search", { query })));
			await client.get("/search", { query: "d" });
			return client.flush();
		};
		expect(await run()).toMatchObject({ lookups: 4, hits: 0, writes: 4 });
		expect(await run()).toEqual({ lookups: 4, hits: 4, writes: 0, queries: 2 });
	});
});
