/** Journeys in D1: the snapshot behind share links, the agent conversation, and a replayable event log. */
import type { Budget, ChatMessage } from "../engine/agent/llm.ts";
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

async function ensureSchema(db: D1Database): Promise<void> {
	await db.prepare(SCHEMA).run();
}

export async function saveJourney(db: D1Database, journey: StoredJourney): Promise<void> {
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

export async function loadJourney(db: D1Database, id: string): Promise<StoredJourney | undefined> {
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

const SPEND_SCHEMA = `CREATE TABLE IF NOT EXISTS llm_spend (
	day TEXT PRIMARY KEY,
	cost_usd REAL NOT NULL DEFAULT 0,
	calls INTEGER NOT NULL DEFAULT 0,
	tokens INTEGER NOT NULL DEFAULT 0
)`;

export interface SpendLimits {
	/** Stop calling the model for the rest of the UTC day past this many US dollars. */
	dailyUsd: number;
	/** Stop calling the model for good past this many US dollars (until the cap is raised). */
	totalUsd: number;
}

/**
 * A spending ledger in D1: every model call records its cost, and no new call
 * starts once today's or the all-time spend reaches its cap. The OpenRouter
 * key's own credit limit remains the outer backstop.
 */
export function d1Budget(db: D1Database, limits: SpendLimits): Budget & { spent(): Promise<{ today: number; total: number }> } {
	const today = () => new Date().toISOString().slice(0, 10);
	const spent = async () => {
		const [, totals] = await db.batch<{ today: number | null; total: number | null }>([
			db.prepare(SPEND_SCHEMA),
			db.prepare("SELECT (SELECT cost_usd FROM llm_spend WHERE day = ?1) AS today, (SELECT SUM(cost_usd) FROM llm_spend) AS total").bind(today()),
		]);
		const row = totals?.results[0];
		return { today: row?.today ?? 0, total: row?.total ?? 0 };
	};
	return {
		spent,
		async allow() {
			const { today: day, total } = await spent();
			return day < limits.dailyUsd && total < limits.totalUsd;
		},
		async record({ costUsd, tokens }) {
			await db.batch([
				db.prepare(SPEND_SCHEMA),
				db
					.prepare(
						`INSERT INTO llm_spend (day, cost_usd, calls, tokens) VALUES (?1, ?2, 1, ?3)
						 ON CONFLICT(day) DO UPDATE SET cost_usd = cost_usd + ?2, calls = calls + 1, tokens = tokens + ?3`,
					)
					.bind(today(), costUsd, tokens),
			]);
		},
	};
}
