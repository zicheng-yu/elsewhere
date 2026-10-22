// Secrets are uploaded separately (never committed) and may be absent; the app
// falls back to mock data and the scripted planner without them.
interface Env {
	QLOO_API_KEY?: string;
	OPENROUTER_API_KEY?: string;
	/** Model calls a visitor may make per UTC day (text binding, LLM_TURNS_PER_VISITOR). */
	LLM_TURNS_PER_VISITOR?: string;
}
