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
			runWorkerFirst: ["/api/*"],
		},
		domains: ["elsewhere.zichengyu.com"],
		observability: {
			enabled: true,
			logs: { enabled: true, headSamplingRate: 1 },
			traces: { enabled: true, headSamplingRate: 0.1 },
		},
		env: {
			// "mock" serves synthetic fixtures; "live" calls hackathon.api.qloo.com.
			QLOO_MODE: bindings.text<"mock" | "live">("mock"),
			// "scripted" runs the deterministic planner; "claude" runs the LLM agent loop.
			AGENT_MODE: bindings.text<"scripted" | "claude">("scripted"),
		},
	},
});
