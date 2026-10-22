/** Journeys in D1 (the snapshot behind share links, the agent conversation, a replayable event log) and the LLM spending ledger. */
import type { ChatMessage, TurnBudget } from "../engine/agent/llm.ts";
import type { D1Like } from "../engine/qloo/cache.ts";
import type { AgentEvent } from "../shared/events.ts";
import type { JourneySnapshot } from "../shared/types.ts";

export interface RecordedEvent {
	/** Milliseconds since the run started. */
	t: number;
	e: AgentEvent;
}

export interface StoredJourney {
	snapshot: JourneySnapshot;
	conversation?: ChatMessage[];
	events: RecordedEvent[];
}

const SCHEMA = `CREATE TABLE IF NOT EXISTS journeys (
	id TEXT PRIMARY KEY,
	created_at INTEGER NOT NULL,
	updated_at INTEGER NOT NULL,
	snapshot TEXT NOT NULL,
	conversation TEXT,
	events TEXT
)`;

const SPEND_SCHEMA = `CREATE TABLE IF NOT EXISTS llm_spend (
	day TEXT PRIMARY KEY,
	cost_usd REAL NOT NULL DEFAULT 0,
	calls INTEGER NOT NULL DEFAULT 0,
	tokens INTEGER NOT NULL DEFAULT 0
)`;

/** Model calls per visitor per day: one visitor cannot spend the whole day's budget. */
const TURNS_SCHEMA = `CREATE TABLE IF NOT EXISTS llm_turns (
	day TEXT NOT NULL,
	visitor TEXT NOT NULL,
	turns INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY (day, visitor)
)`;

/** The slice of D1 the store uses; structural, so tests can run it over in-memory SQLite. */
export type StoreDb = D1Like & {
	batch<T = Record<string, unknown>>(statements: unknown[]): Promise<{ results: T[] }[]>;
};
export type LedgerDb = StoreDb;

/** Databases whose tables already exist in this isolate: D1 on the Free plan allows 50 queries per invocation. */
const ready = new WeakSet<object>();

async function ensureSchema(db: StoreDb): Promise<void> {
	if (ready.has(db)) return;
	await db.batch([db.prepare(SCHEMA), db.prepare(SPEND_SCHEMA), db.prepare(TURNS_SCHEMA)]);
	ready.add(db);
}

export async function saveJourney(db: StoreDb, journey: StoredJourney): Promise<void> {
	await ensureSchema(db);
	const now = Date.now();
	await db
		.prepare(
			`INSERT INTO journeys (id, created_at, updated_at, snapshot, conversation, events)
			 VALUES (?1, ?2, ?3, ?4, ?5, ?6)
			 ON CONFLICT(id) DO UPDATE SET
			   updated_at = excluded.updated_at,
			   snapshot = excluded.snapshot,
			   conversation = excluded.conversation,
			   events = excluded.events`,
		)
		.bind(
			journey.snapshot.id,
			journey.snapshot.createdAt,
			now,
			JSON.stringify(journey.snapshot),
			journey.conversation ? JSON.stringify(journey.conversation) : null,
			JSON.stringify(journey.events),
		)
		.run();
}

export async function loadJourney(db: StoreDb, id: string): Promise<StoredJourney | undefined> {
	await ensureSchema(db);
	const row = await db
		.prepare("SELECT snapshot, conversation, events FROM journeys WHERE id = ?1")
		.bind(id)
		.first<{ snapshot: string; conversation: string | null; events: string | null }>();
	if (!row) return undefined;
	return {
		snapshot: JSON.parse(row.snapshot) as JourneySnapshot,
		conversation: row.conversation ? (JSON.parse(row.conversation) as ChatMessage[]) : undefined,
		events: row.events ? (JSON.parse(row.events) as RecordedEvent[]) : [],
	};
}

export interface SpendLimits {
	/** Stop calling the model for the rest of the UTC day past this many US dollars. */
	dailyUsd: number;
	/** Stop calling the model for good past this many US dollars (until the cap is raised). */
	totalUsd: number;
	/** Stop calling the model for this visitor for the rest of the UTC day past this many turns. */
	turnsPerVisitor?: number;
}

/**
 * A spending ledger in D1: every model call records its cost, and no new turn
 * starts once today's or the all-time spend reaches its cap, or once the visitor
 * has used their turns for the day. The OpenRouter key's own credit limit
 * remains the outer backstop.
 */
export function d1Budget(db: LedgerDb, limits: SpendLimits): TurnBudget & { spent(): Promise<{ today: number; total: number }> } {
	const today = () => new Date().toISOString().slice(0, 10);
	const spent = async () => {
		await ensureSchema(db);
		const row = await db
			.prepare("SELECT (SELECT cost_usd FROM llm_spend WHERE day = ?1) AS today, (SELECT SUM(cost_usd) FROM llm_spend) AS total")
			.bind(today())
			.first<{ today: number | null; total: number | null }>();
		return { today: row?.today ?? 0, total: row?.total ?? 0 };
	};
	const record = async ({ costUsd, tokens }: { costUsd: number; tokens: number }) => {
		await ensureSchema(db);
		await db
			.prepare(
				`INSERT INTO llm_spend (day, cost_usd, calls, tokens) VALUES (?1, ?2, 1, ?3)
				 ON CONFLICT(day) DO UPDATE SET cost_usd = cost_usd + ?2, calls = calls + 1, tokens = tokens + ?3`,
			)
			.bind(today(), costUsd, tokens)
			.run();
	};
	return {
		spent,
		record,
		async allow() {
			const { today: day, total } = await spent();
			return day < limits.dailyUsd && total < limits.totalUsd;
		},
		async allowTurn(visitor: string) {
			const { today: day, total } = await spent();
			if (day >= limits.dailyUsd || total >= limits.totalUsd) return { ok: false, reason: "budget" };
			const limit = limits.turnsPerVisitor;
			if (limit === undefined || limit <= 0) return { ok: true };
			// One statement counts the turn and hands back the new count.
			const row = await db
				.prepare(
					`INSERT INTO llm_turns (day, visitor, turns) VALUES (?1, ?2, 1)
					 ON CONFLICT(day, visitor) DO UPDATE SET turns = turns + 1
					 RETURNING turns`,
				)
				.bind(today(), visitor)
				.first<{ turns: number }>();
			return (row?.turns ?? 1) <= limit ? { ok: true } : { ok: false, reason: "turns" };
		},
	};
}
