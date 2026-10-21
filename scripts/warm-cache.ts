/**
 * Run every featured scenario against a deployment to warm the Qloo cache and
 * record replayable journeys.
 *
 *   node scripts/warm-cache.ts [--base=https://elsewhere.zichengyu.com]
 */
import { SCENARIOS } from "../src/shared/scenarios.ts";
import type { AgentEvent } from "../src/shared/events.ts";

const base = process.argv.find((a) => a.startsWith("--base="))?.split("=")[1] ?? "https://elsewhere.zichengyu.com";

for (const scenario of SCENARIOS) {
	const started = Date.now();
	const response = await fetch(`${base}/api/journeys`, {
		method: "POST",
		headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
		body: JSON.stringify(scenario.request),
	});
	if (!response.ok || !response.body) {
		console.log(`✘ ${scenario.id}: HTTP ${response.status}`);
		continue;
	}
	let journeyId = "";
	let errors = 0;
	let buffer = "";
	const decoder = new TextDecoder();
	for await (const chunk of response.body) {
		buffer += decoder.decode(chunk, { stream: true });
		let boundary = buffer.indexOf("\n\n");
		while (boundary >= 0) {
			const frame = buffer.slice(0, boundary);
			buffer = buffer.slice(boundary + 2);
			boundary = buffer.indexOf("\n\n");
			const data = frame.split("\n").find((line) => line.startsWith("data:"))?.slice(5).trim();
			if (!data || data === "{}") continue;
			const event = JSON.parse(data) as AgentEvent;
			if (event.type === "run.start") journeyId = event.journeyId;
			if (event.type === "error") errors++;
		}
	}
	console.log(`${errors ? "⚠" : "✔"} ${scenario.id}: ${base}/j/${journeyId} (${((Date.now() - started) / 1000).toFixed(1)} s${errors ? `, ${errors} errors` : ""})`);
	// Stay under the per-IP rate limit.
	await new Promise((resolve) => setTimeout(resolve, 8000));
}
