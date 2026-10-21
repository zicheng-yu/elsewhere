import { QlooApi } from "../engine/qloo/endpoints.ts";
import { KvCache } from "../engine/qloo/cache.ts";
import { LiveTransport, QlooClient } from "../engine/qloo/client.ts";
import { demoWorld } from "../engine/qloo/mock/demo-world.ts";
import { MockTransport } from "../engine/qloo/mock/transport.ts";
import type { Evidence, RunModes } from "../shared/types.ts";

export interface ResolvedModes extends RunModes {
	qlooKey?: string;
	anthropicKey?: string;
}

/** Live data and the LLM agent switch on only when both the mode and the secret are present. */
export function resolveModes(env: Env): ResolvedModes {
	const qlooKey = env.QLOO_API_KEY?.trim() || undefined;
	const anthropicKey = env.ANTHROPIC_API_KEY?.trim() || undefined;
	return {
		qloo: env.QLOO_MODE === "live" && qlooKey ? "live" : "mock",
		agent: env.AGENT_MODE === "claude" && anthropicKey ? "claude" : "scripted",
		qlooKey,
		anthropicKey,
	};
}

export function createApi(env: Env, modes: ResolvedModes, onEvidence?: (evidence: Evidence) => void): QlooApi {
	if (modes.qloo === "live" && modes.qlooKey) {
		const client = new QlooClient({
			transport: new LiveTransport({ apiKey: modes.qlooKey }),
			cache: new KvCache(env.QLOO_CACHE),
			concurrency: 5,
			onEvidence,
		});
		return new QlooApi(client);
	}
	// Simulated latency keeps the streaming UI honest in mock mode.
	const client = new QlooClient({
		transport: new MockTransport(demoWorld(), { latencyMs: 90 }),
		concurrency: 5,
		onEvidence,
	});
	return new QlooApi(client);
}

export function clientIp(request: Request): string {
	return request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

export function log(level: "info" | "error", message: string, fields: Record<string, unknown> = {}): void {
	const line = JSON.stringify({ message, ...fields });
	if (level === "error") console.error(line);
	else console.log(line);
}
