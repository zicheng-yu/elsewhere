/** Journeys in D1: the snapshot behind share links, the agent conversation, and a replayable event log. */
import type { ConversationMessage } from "../engine/agent/claude.ts";
import type { AgentEvent } from "../shared/events.ts";
import type { JourneySnapshot } from "../shared/types.ts";

export interface RecordedEvent {
	/** Milliseconds since the run started. */
	t: number;
	e: AgentEvent;
}

export interface StoredJourney {
	snapshot: JourneySnapshot;
	conversation?: ConversationMessage[];
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
		conversation: row.conversation ? (JSON.parse(row.conversation) as ConversationMessage[]) : undefined,
		events: row.events ? (JSON.parse(row.events) as RecordedEvent[]) : [],
	};
}
