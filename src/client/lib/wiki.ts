import { useEffect, useState } from "react";

export interface WikiImage {
	url: string;
	pageUrl: string;
}

export interface WikiSubject {
	name: string;
	/** "city" for destinations, "town" for day-trip towns, "place" for a single sight, café or shop. */
	kind: "city" | "town" | "place";
	lat?: number;
	lon?: number;
	/** Qloo's "City, Region, Country" disambiguation string. */
	disambiguation?: string;
	/** First-level region, e.g. "Kyoto Prefecture". */
	region?: string;
	/** City a place belongs to. */
	city?: string;
	country?: string;
}

interface WikiPage {
	title: string;
	missing?: boolean;
	fullurl?: string;
	thumbnail?: { source?: string };
	/** File name of the lead image. */
	pageimage?: string;
	pageprops?: { disambiguation?: string };
	coordinates?: { lat: number; lon: number }[];
}

interface WikiQuery {
	query?: {
		pages?: WikiPage[];
		normalized?: { from: string; to: string }[];
		redirects?: { from: string; to: string }[];
	};
}

/** How far an article's coordinates may sit from the subject before it counts as a different place. */
const MAX_KM = { city: 60, town: 25, place: 6 } as const;
/** Radius of the nearby-articles fallback, in meters (the API caps it at 10 km). */
const NEARBY_M = { city: 10_000, town: 10_000, place: 1_500 } as const;
const THUMB_PX = { city: 1600, town: 960, place: 960 } as const;
/** Lead images that are collages, maps, crests or diagrams rather than a photo of the place. */
const NOT_A_PHOTO = /montage|collage|composite|mosaic|\.(png|svg|gif)$/i;

const cache = new Map<string, Promise<WikiImage | undefined>>();

function shortRegion(region: string): string {
	return region.replace(/\s+(Prefecture|Province|Region|County|Governorate|Oblast|Canton|Regency)$/i, "");
}

/** Most specific first: "Hagi, Yamaguchi" beats the disambiguation page "Hagi". */
function candidateTitles({ name, kind, disambiguation, region, city, country }: WikiSubject): string[] {
	const parts = (disambiguation ?? "").split(",").map((part) => part.trim());
	const area = region ?? parts.slice(1, -1).join(", ");
	const nation = country ?? parts.at(-1);
	const titles =
		kind === "place"
			? [name, city && city !== name && `${name} (${city})`, city && city !== name && `${name}, ${city}`]
			: [
					area && `${name}, ${shortRegion(area)}`,
					area && `${name}, ${area}`,
					nation && nation !== name && `${name}, ${nation}`,
					name,
				];
	return [...new Set(titles.filter((t): t is string => Boolean(t)))];
}

function km(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
	const rad = Math.PI / 180;
	const dLat = (b.lat - a.lat) * rad;
	const dLon = (b.lon - a.lon) * rad;
	const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
	return 12_742 * Math.asin(Math.sqrt(h));
}

/** Folds case, diacritics and punctuation: "Shisen-dō" and "Shisen-do" compare equal. */
function fold(text: string): string {
	return text
		.normalize("NFD")
		.replace(/\p{M}/gu, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "");
}

/** "Uji, Kyoto" names "Uji"; "Kamo River" may stand for "Kamo River Delta", never the reverse. */
function namesSubject(title: string, name: string): boolean {
	const base = fold(title.split(/ \(|, /)[0] ?? title);
	const wanted = fold(name);
	return base === wanted || (base.length >= 6 && wanted.startsWith(base));
}

/** A usable lead image, on an article that sits where the subject is. */
function accept(page: WikiPage | undefined, subject: WikiSubject): page is WikiPage & { thumbnail: { source: string } } {
	if (!page || page.missing || page.pageprops?.disambiguation !== undefined || !page.thumbnail?.source) return false;
	if (NOT_A_PHOTO.test(page.pageimage ?? "")) return false;
	const at = page.coordinates?.[0];
	if (subject.lat === undefined || subject.lon === undefined) return true;
	// Without coordinates only a city title is specific enough to trust.
	if (!at) return subject.kind === "city";
	return km(at, { lat: subject.lat, lon: subject.lon }) <= MAX_KM[subject.kind];
}

function toImage(page: WikiPage & { thumbnail: { source: string } }): WikiImage {
	return { url: page.thumbnail.source, pageUrl: page.fullurl ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}` };
}

async function query(params: Record<string, string>): Promise<WikiQuery["query"]> {
	const search = new URLSearchParams({
		action: "query",
		format: "json",
		formatversion: "2",
		origin: "*",
		prop: "pageimages|pageprops|info|coordinates",
		piprop: "thumbnail|name",
		ppprop: "disambiguation",
		inprop: "url",
		...params,
	});
	const response = await fetch(`https://en.wikipedia.org/w/api.php?${search}`);
	if (!response.ok) return undefined;
	return ((await response.json()) as WikiQuery).query;
}

/**
 * One MediaWiki query for all candidate titles (it answers 200 for missing pages,
 * so lookups stay out of the console), then the articles around the subject's
 * coordinates when no title fits: that is how "Uji" finds "Uji, Kyoto".
 */
async function lookup(subject: WikiSubject): Promise<WikiImage | undefined> {
	const titles = candidateTitles(subject);
	const thumb = String(THUMB_PX[subject.kind]);
	const byTitle = await query({ titles: titles.join("|"), redirects: "1", pithumbsize: thumb });
	const resolve = (title: string) => {
		let resolved = title;
		for (const step of [...(byTitle?.normalized ?? []), ...(byTitle?.redirects ?? [])]) {
			if (step.from === resolved) resolved = step.to;
		}
		return resolved;
	};
	for (const title of titles) {
		const page = byTitle?.pages?.find((p) => p.title === resolve(title));
		if (accept(page, subject)) return toImage(page);
	}

	if (subject.lat === undefined || subject.lon === undefined) return undefined;
	const nearby = await query({
		generator: "geosearch",
		ggscoord: `${subject.lat}|${subject.lon}`,
		ggsradius: String(NEARBY_M[subject.kind]),
		ggslimit: "50",
		pithumbsize: thumb,
	});
	const here = { lat: subject.lat, lon: subject.lon };
	const distance = (page: WikiPage) => (page.coordinates?.[0] ? km(page.coordinates[0], here) : Number.POSITIVE_INFINITY);
	const pages = [...(nearby?.pages ?? [])].sort((a, b) => distance(a) - distance(b));
	for (const page of pages) {
		if (namesSubject(page.title, subject.name) && accept(page, subject)) return toImage(page);
	}
	return undefined;
}

export interface WikiLookup {
	image?: WikiImage;
	/** False while the lookup is in flight; true once it answered, found or not. */
	settled: boolean;
}

/** Lead image for a city, town or place from Wikipedia (CC BY-SA). */
export function useWikiImage(subject: WikiSubject | undefined): WikiLookup {
	const key = subject ? JSON.stringify([subject.kind, subject.name, subject.disambiguation, subject.region, subject.city, subject.country, subject.lat, subject.lon]) : "";
	const [state, setState] = useState<{ key: string; image?: WikiImage }>();
	useEffect(() => {
		if (!key || !subject) return;
		let active = true;
		if (!cache.has(key)) cache.set(key, lookup(subject).catch(() => undefined));
		cache.get(key)?.then((image) => {
			if (active) setState({ key, image });
		});
		return () => {
			active = false;
		};
		// The key captures every field the lookup reads.
	}, [key]);
	const current = state?.key === key ? state : undefined;
	return { image: current?.image, settled: Boolean(current) };
}
