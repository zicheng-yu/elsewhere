import { bindings, defineConfig } from "cf/config";
import * as entrypoint from "./src/worker/index.ts" with { type: "cf-worker" };

export default defineConfig({
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
			QLOO_MODE: bindings.text<"mock" | "live">("mock"),
			// "scripted" runs the deterministic planner; "claude" runs the LLM agent loop (needs ANTHROPIC_API_KEY).
			AGENT_MODE: bindings.text<"scripted" | "claude">("scripted"),
			// Private server-side cache of Qloo responses (never committed to the repo).
			QLOO_CACHE: bindings.kv({ id: "872bf0866cd64231bf24d2a40e96c1d5" }),
			// Journeys, share links and replays.
			DB: bindings.d1({ id: "ab568c3c-3932-4e2d-bfe8-27d736df35e4", name: "elsewhere-db" }),
			// The built SPA, so the Worker can rewrite index.html for share links.
			ASSETS: bindings.assets(),
			// Per-IP limit on agent runs.
			RATE_LIMITER: bindings.rateLimit({ namespace: "7301", simple: { limit: 8, period: 60 } }),
		},
	},
});
