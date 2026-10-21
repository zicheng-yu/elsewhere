import type { AgentEvent } from "../../shared/events.ts";
import type { Persona, Scenario } from "../../shared/scenarios.ts";
import type { JourneySnapshot, PlanPrefs, PlanTargetRef, RunModes, TripRequest } from "../../shared/types.ts";

export class ApiError extends Error {
	readonly status: number;

	constructor(status: number, message: string) {
		super(message);
		this.name = "ApiError";
		this.status = status;
	}
}

async function json<T>(response: Response): Promise<T> {
	if (!response.ok) {
		const body = (await response.json().catch(() => ({}))) as { message?: string; error?: string };
		throw new ApiError(response.status, body.message ?? body.error ?? `Request failed (${response.status})`);
	}
	return (await response.json()) as T;
}

/** POST a JSON body and read the server-sent event stream it returns. */
async function postEvents(
	url: string,
	body: unknown,
	onEvent: (event: AgentEvent) => void,
	signal?: AbortSignal,
): Promise<void> {
	const response = await fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
		body: JSON.stringify(body),
		signal,
	});
	if (!response.ok || !response.body) {
		const payload = (await response.json().catch(() => ({}))) as { message?: string; error?: string };
		throw new ApiError(response.status, payload.message ?? payload.error ?? `Request failed (${response.status})`);
	}
	const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
	let buffer = "";
	for (;;) {
		const { value, done } = await reader.read();
		if (done) break;
		buffer += value.replace(/\r\n/g, "\n");
		let boundary = buffer.indexOf("\n\n");
		while (boundary >= 0) {
			const frame = buffer.slice(0, boundary);
			buffer = buffer.slice(boundary + 2);
			boundary = buffer.indexOf("\n\n");
			const lines = frame.split("\n");
			const name = lines.find((line) => line.startsWith("event:"))?.slice(6).trim();
			const data = lines
				.filter((line) => line.startsWith("data:"))
				.map((line) => line.slice(5).trimStart())
				.join("\n");
			if (!data || name === "ping") continue;
			try {
				onEvent(JSON.parse(data) as AgentEvent);
			} catch {
				// Ignore malformed frames.
			}
		}
	}
}

export interface Suggestion {
	id: string;
	name: string;
	subtitle?: string;
	lat?: number;
	lon?: number;
}

export type SuggestionKind = "destination" | "place" | "taste" | "vibe";

export const api = {
	async health(): Promise<{ modes: RunModes }> {
		return json(await fetch("/api/health"));
	},

	async scenarios(): Promise<{ scenarios: Scenario[]; personas: Persona[] }> {
		return json(await fetch("/api/scenarios"));
	},

	async search(kind: SuggestionKind, q: string, near?: { lat: number; lon: number }, signal?: AbortSignal): Promise<Suggestion[]> {
		const params = new URLSearchParams({ kind, q });
		if (near) {
			params.set("lat", String(near.lat));
			params.set("lon", String(near.lon));
		}
		const { results } = await json<{ results: Suggestion[] }>(await fetch(`/api/search?${params}`, { signal }));
		return results;
	},

	startJourney(request: TripRequest, onEvent: (event: AgentEvent) => void, signal?: AbortSignal): Promise<void> {
		return postEvents("/api/journeys", request, onEvent, signal);
	},

	plan(
		journeyId: string,
		target: PlanTargetRef,
		prefs: PlanPrefs,
		onEvent: (event: AgentEvent) => void,
		signal?: AbortSignal,
	): Promise<void> {
		return postEvents(`/api/journeys/${journeyId}/plan`, { target, prefs }, onEvent, signal);
	},

	message(journeyId: string, message: string, onEvent: (event: AgentEvent) => void, signal?: AbortSignal): Promise<void> {
		return postEvents(`/api/journeys/${journeyId}/messages`, { message }, onEvent, signal);
	},

	async journey(id: string): Promise<JourneySnapshot> {
		const { snapshot } = await json<{ snapshot: JourneySnapshot }>(await fetch(`/api/journeys/${id}`));
		return snapshot;
	},

	async events(id: string): Promise<{ t: number; e: AgentEvent }[]> {
		const { events } = await json<{ events: { t: number; e: AgentEvent }[] }>(await fetch(`/api/journeys/${id}/events`));
		return events;
	},

	async baseline(request: TripRequest): Promise<{ available: boolean; text?: string; reason?: string }> {
		return json(
			await fetch("/api/baseline", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(request),
			}),
		);
	},
};
