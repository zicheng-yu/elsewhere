import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import type { D1Like, D1StatementLike } from "../../src/engine/qloo/cache.ts";

/** A D1 stand-in over an in-memory SQLite database that records every statement it runs. */
export function sqliteD1(): D1Like & { statements: string[] } {
	const db = new DatabaseSync(":memory:");
	const statements: string[] = [];
	const statement = (sql: string, params: unknown[] = []): D1StatementLike => ({
		bind: (...values) => statement(sql, values),
		all: async <T>() => {
			statements.push(sql);
			return { results: db.prepare(sql).all(...(params as SQLInputValue[])) as T[] };
		},
		run: async () => {
			statements.push(sql);
			return db.prepare(sql).run(...(params as SQLInputValue[]));
		},
	});
	return { prepare: (sql) => statement(sql), statements };
}
