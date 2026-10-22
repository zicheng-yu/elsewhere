import { bindings, defineConfig } from "cf/config";
import * as entrypoint from "./src/worker/index.ts" with { type: "cf-worker" };

export default defineConfig(({ mode }) => {
	// `cf dev --mode live` runs locally against the real Qloo API and the LLM agent, with keys from
	// the git-ignored .dev.vars.live. Every other mode (including a plain deploy) serves the
	// synthetic demo world with the scripted planner.
	const live = mode === "live";
	return {
		worker: {
			name: "elsewhere",
			compatibilityDate: "2026-10-06",
			compatibilityFlags: ["nodejs_compat"],
			entrypoint,
			assets: {
				notFoundHandling: "single-page-application",
				// /j/* goes through the Worker so share links get journey-specific social meta tags.
				runWorkerFirst: ["/api/*", "/j/*"],
			},
			domains: ["elsewhere.zichengyu.com"],
			observability: {
				enabled: true,
				logs: { enabled: true, headSamplingRate: 1 },
				traces: { enabled: true, headSamplingRate: 0.1 },
			},
			env: {
				// "mock" serves the synthetic demo world; "live" calls hackathon.api.qloo.com (needs QLOO_API_KEY).
				QLOO_MODE: bindings.text<"mock" | "live">(live ? "live" : "mock"),
				// "scripted" runs the deterministic planner; "llm" runs the agent loop over OpenRouter (needs OPENROUTER_API_KEY).
				AGENT_MODE: bindings.text<"scripted" | "llm">(live ? "llm" : "scripted"),
				// Secrets, never committed: .dev.vars.live locally, uploaded separately when the app goes live.
				...(live ? { QLOO_API_KEY: bindings.secret(), OPENROUTER_API_KEY: bindings.secret() } : {}),
				// OpenRouter model IDs: the agent's model and the fallbacks tried when its providers fail.
				LLM_MODEL: bindings.text("anthropic/claude-haiku-5.5"),
				LLM_FALLBACK_MODELS: bindings.text("openai/gpt-6-luna"),
				// Spending caps in US dollars, enforced before every model call (ledger in D1).
				LLM_DAILY_USD: bindings.text("0.50"),
				LLM_TOTAL_USD: bindings.text("5"),
				// Model calls per agent turn (each tool round trip is one call).
				LLM_MAX_CALLS: bindings.text("5"),
				// Journeys, share links, replays, the LLM spending ledger and the private Qloo response cache.
				DB: bindings.d1({ id: "ab568c3c-3932-4e2d-bfe8-27d736df35e4", name: "elsewhere-db" }),
				// The built SPA, so the Worker can rewrite index.html for share links.
				ASSETS: bindings.assets(),
				// Per-IP limit on agent runs.
				RATE_LIMITER: bindings.rateLimit({ namespace: "7301", simple: { limit: 8, period: 60 } }),
			},
		},
	};
});
