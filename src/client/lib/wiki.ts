import { useEffect, useState } from "react";

export interface WikiImage {
	url: string;
	pageUrl: string;
}

export interface WikiSubject {
	name: string;
	/** Qloo's "City, Region, Country" disambiguation string. */
	disambiguation?: string;
	country?: string;
}

interface WikiPage {
	title: string;
	missing?: boolean;
	fullurl?: string;
	thumbnail?: { source?: string };
	pageprops?: { disambiguation?: string };
}

interface WikiQuery {
	query?: {
		pages?: WikiPage[];
		normalized?: { from: string; to: string }[];
		redirects?: { from: string; to: string }[];
	};
}

const cache = new Map<string, Promise<WikiImage | undefined>>();

/** Most specific first: "Hagi, Yamaguchi" beats the disambiguation page "Hagi". */
function candidateTitles({ name, disambiguation, country }: WikiSubject): string[] {
	const parts = (disambiguation ?? "").split(",").map((part) => part.trim());
	const region = parts.slice(1, -1).join(", ");
	const shortRegion = region.replace(/\s+(Prefecture|Province|Region|County|Governorate|Oblast|Canton)$/i, "");
	const nation = country ?? parts.at(-1);
	const titles = [
		shortRegion && `${name}, ${shortRegion}`,
		region && `${name}, ${region}`,
		nation && nation !== name && `${name}, ${nation}`,
		name,
	];
	return [...new Set(titles.filter((t): t is string => Boolean(t)))];
}

/**
 * One MediaWiki query for all candidate titles. Unlike the REST summary
 * endpoint it answers 200 for missing pages, so lookups stay out of the console.
 */
async function lookup(titles: string[]): Promise<WikiImage | undefined> {
	const params = new URLSearchParams({
		action: "query",
		format: "json",
		formatversion: "2",
		origin: "*",
		redirects: "1",
		prop: "pageimages|pageprops|info",
		piprop: "thumbnail",
		pithumbsize: "800",
		ppprop: "disambiguation",
		inprop: "url",
		titles: titles.join("|"),
	});
	const response = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
	if (!response.ok) return undefined;
	const { query } = (await response.json()) as WikiQuery;
	const resolve = (title: string) => {
		let resolved = title;
		for (const step of [...(query?.normalized ?? []), ...(query?.redirects ?? [])]) {
			if (step.from === resolved) resolved = step.to;
		}
		return resolved;
	};
	for (const title of titles) {
		const page = query?.pages?.find((p) => p.title === resolve(title));
		if (!page || page.missing || page.pageprops?.disambiguation !== undefined || !page.thumbnail?.source) continue;
		return { url: page.thumbnail.source, pageUrl: page.fullurl ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}` };
	}
	return undefined;
}

/** Lead image for a city from Wikipedia (CC BY-SA). */
export function useWikiImage(subject: WikiSubject | undefined): WikiImage | undefined {
	const [image, setImage] = useState<WikiImage | undefined>();
	const titles = subject ? candidateTitles(subject) : [];
	const key = titles.join("|");
	useEffect(() => {
		if (!key) return;
		let active = true;
		if (!cache.has(key)) cache.set(key, lookup(key.split("|")).catch(() => undefined));
		cache.get(key)?.then((found) => {
			if (active) setImage(found);
		});
		return () => {
			active = false;
		};
	}, [key]);
	return image;
}
