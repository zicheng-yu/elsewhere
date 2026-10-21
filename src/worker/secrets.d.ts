// Secrets are uploaded separately (never committed) and may be absent; the app
// falls back to mock data and the scripted planner without them.
interface Env {
	QLOO_API_KEY?: string;
	ANTHROPIC_API_KEY?: string;
}
