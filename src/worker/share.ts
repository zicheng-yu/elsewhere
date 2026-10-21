/** Journey-specific <title> and social meta tags for share links (/j/:id). */
import { monthName } from "../shared/format.ts";
import type { JourneySnapshot } from "../shared/types.ts";
import { log } from "./runtime.ts";
import { loadJourney } from "./store.ts";

function describe(snapshot: JourneySnapshot): { title: string; description: string } {
	const city = snapshot.hotspot?.locality.name ?? snapshot.request.destination;
	const month = monthName(snapshot.request.month);
	const where = month ? `${city} in ${month}` : city;
	const firstTwin = snapshot.zooms.find((z) => z.level === "city");
	const twin = firstTwin?.level === "city" ? firstTwin.items[0] : undefined;
	const title = twin ? `${twin.original.name} → ${twin.twin.name} · Elsewhere` : `${where}, without the crowds · Elsewhere`;
	const levels = snapshot.zooms.map((z) => z.items.length).reduce((a, b) => a + b, 0);
	const description = `Same soul, fewer crowds: ${levels} taste-matched alternatives to ${where}, from quieter twins to day trips and twin cities, picked with Qloo's taste graph.`;
	return { title, description };
}

class SetContent {
	#text: string;
	constructor(text: string) {
		this.#text = text;
	}
	element(element: Element): void {
		element.setInnerContent(this.#text);
	}
}

class AppendMeta {
	#tags: [string, string, string][];
	constructor(tags: [string, string, string][]) {
		this.#tags = tags;
	}
	element(element: Element): void {
		const escape = (value: string) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
		const html = this.#tags.map(([attr, key, value]) => `<meta ${attr}="${key}" content="${escape(value)}" />`).join("");
		element.append(html, { html: true });
	}
}

export async function sharePage(request: Request, env: Env, id: string): Promise<Response> {
	const shell = await env.ASSETS.fetch(new Request(new URL("/", request.url), request));
	const journey = await loadJourney(env.DB, id).catch((error) => {
		log("error", "share lookup failed", { id, error: String(error) });
		return undefined;
	});
	if (!journey) return shell;
	const { title, description } = describe(journey.snapshot);
	return new HTMLRewriter()
		.on("title", new SetContent(title))
		.on(
			"head",
			new AppendMeta([
				["name", "description", description],
				["property", "og:title", title],
				["property", "og:description", description],
				["property", "og:type", "website"],
				["property", "og:url", request.url],
				["name", "twitter:card", "summary"],
			]),
		)
		.transform(shell);
}
