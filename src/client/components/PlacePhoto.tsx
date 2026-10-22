import { useState, type CSSProperties, type ReactNode } from "react";
import type { Locality, Place, TownTwin } from "../../shared/types.ts";
import { useWikiImage, type WikiSubject } from "../lib/wiki.ts";
import { Icon, type IconName } from "./ui.tsx";

export interface PhotoSubject extends WikiSubject {
	/** Image Qloo returned for the entity; tried before Wikipedia. */
	imageUrl?: string;
	/** Qloo categories and genre; they pick the stamp when there is no photo. */
	categories?: string[];
	/** Shown under the stamp's label, e.g. the neighborhood. */
	area?: string;
}

export function placeSubject(place: Place): PhotoSubject {
	return {
		kind: "place",
		name: place.name,
		lat: place.lat,
		lon: place.lon,
		city: place.city,
		region: place.region,
		country: place.country,
		imageUrl: place.imageUrl,
		categories: [...place.categories, place.genre ?? ""],
		area: place.neighborhood ?? place.city,
	};
}

export function localitySubject(locality: Locality): PhotoSubject {
	return {
		kind: "city",
		name: locality.name,
		lat: locality.lat,
		lon: locality.lon,
		disambiguation: locality.disambiguation,
		region: locality.region,
		country: locality.country,
		imageUrl: locality.imageUrl,
		area: locality.region ?? locality.country,
	};
}

export function townSubject(item: TownTwin): PhotoSubject {
	const region = item.places.find((place) => place.region)?.region;
	return { kind: "town", name: item.town.name, lat: item.town.lat, lon: item.town.lon, region, country: item.town.country, area: region ?? item.town.country };
}

interface StampLook {
	icon: IconName;
	hue: string;
	label: string;
}

const capitalize = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);

/** First match wins, so shrines are tested before temples and cafés before shops. */
const STAMPS: { test: RegExp; icon: IconName; hue: string; label: (match: string) => string }[] = [
	{ test: /\b(shrine|jinja|taisha)\b/, icon: "shrine", hue: "#c2410c", label: () => "Shrine" },
	{ test: /\b(temple|pagoda|monastery|stupa)\b|-(ji|dera|in)\b/, icon: "temple", hue: "#8b5e34", label: () => "Temple" },
	{ test: /\b(cathedral|basilica|church|chapel|abbey|mosque|synagogue)\b/, icon: "culture", hue: "#475569", label: capitalize },
	{ test: /\b(museum|gallery|theater|theatre|library|castle|palace|monument|fortress|citadel)\b/, icon: "culture", hue: "#475569", label: capitalize },
	{ test: /\b(garden|park|forest|grove|trail|mountain|waterfall|valley|botanical)\b/, icon: "garden", hue: "#4d7c0f", label: capitalize },
	{ test: /\b(beach|coast|lake|river|harbor|harbour|bay|island|canal|waterfront|pier|lagoon)\b/, icon: "water", hue: "#1d6fa3", label: capitalize },
	{
		test: /\b(café|cafe|coffee|kissa|kissaten|teahouse|tea room|tea house|bakery|patisserie)\b/,
		icon: "cafe",
		hue: "#7c5a3a",
		label: (match) => (match.startsWith("tea") ? "Tea room" : /bakery|patisserie/.test(match) ? "Bakery" : "Café"),
	},
	{
		test: /\b(market|bazaar|shotengai|arcade|shopping|shop|store|boutique|mall)\b/,
		icon: "market",
		hue: "#b45309",
		label: (match) => (/market|bazaar|shotengai|arcade/.test(match) ? "Market" : "Shop"),
	},
	{ test: /\b(restaurant|izakaya|kitchen|dining|bistro|trattoria|tavern|ramen|sushi|kaiseki|eatery|food)\b/, icon: "food", hue: "#a23a2a", label: () => "Restaurant" },
	{ test: /\b(bar|pub|club|jazz|cocktail|wine|vinyl)\b/, icon: "night", hue: "#4f46e5", label: () => "Bar" },
	{ test: /\b(neighborhood|neighbourhood|district|street|quarter|village)\b/, icon: "town", hue: "#57534e", label: capitalize },
];

function stampFor(subject: PhotoSubject): StampLook {
	if (subject.kind === "place") {
		const text = [...(subject.categories ?? []), subject.name].join(" ").toLowerCase();
		for (const rule of STAMPS) {
			const match = text.match(rule.test);
			if (match) return { icon: rule.icon, hue: rule.hue, label: rule.label(match[1] ?? match[0]) };
		}
		return { icon: "pin", hue: "#57534e", label: "Place" };
	}
	return { icon: "town", hue: "#57534e", label: subject.kind === "city" ? "City" : "Town" };
}

/** Stands in for a missing photo: the place's category as a tinted icon. */
export function Stamp({ subject, size = "full" }: { subject: PhotoSubject; size?: "full" | "icon" }) {
	const look = stampFor(subject);
	return (
		<div
			className="stamp absolute inset-0 flex flex-col items-center justify-center gap-2 p-3 text-center"
			style={{ "--stamp": look.hue } as CSSProperties}
			aria-hidden="true"
		>
			<Icon name={look.icon} className={size === "full" ? "size-10 [stroke-width:1.2]" : "size-6 [stroke-width:1.5]"} />
			{size === "full" ? (
				<>
					<span className="font-serif text-xl leading-tight italic">{look.label}</span>
					{subject.area ? <span className="text-xs">{subject.area}</span> : null}
				</>
			) : null}
		</div>
	);
}

/**
 * A place's photo: Qloo's image, else the Wikipedia lead image, else the photo of
 * `fallback` (a city's best-known place), else a category stamp. The frame (size,
 * radius) comes from `className`; overlays go in `children`.
 * A `dark` frame keeps white overlay text legible, so it shows no stamp; with
 * `stamp="none"` a place without a photo renders nothing once the lookup settles.
 */
export function PlacePhoto({
	subject,
	fallback,
	className = "",
	stamp = "full",
	credit = "bottom-right",
	eager = false,
	dark = false,
	children,
}: {
	subject: PhotoSubject;
	fallback?: PhotoSubject;
	className?: string;
	stamp?: "full" | "icon" | "none";
	credit?: "bottom-right" | "top-right" | false;
	eager?: boolean;
	dark?: boolean;
	children?: ReactNode;
}) {
	const [failed, setFailed] = useState<string[]>([]);
	const [loaded, setLoaded] = useState<string | undefined>();
	const qloo = subject.imageUrl && !failed.includes(subject.imageUrl) ? subject.imageUrl : undefined;
	const wiki = useWikiImage(qloo ? undefined : subject);
	const wikiUrl = wiki.image && !failed.includes(wiki.image.url) ? wiki.image.url : undefined;
	const useFallback = !qloo && !wikiUrl && wiki.settled && fallback !== undefined;
	const backup = useWikiImage(useFallback ? fallback : undefined);
	const backupUrl = backup.image && !failed.includes(backup.image.url) ? backup.image.url : undefined;
	const src = qloo ?? wikiUrl ?? backupUrl;
	const credited = src === wikiUrl ? wiki.image : src === backupUrl ? backup.image : undefined;
	const settled = wiki.settled && (!useFallback || backup.settled);
	if (!src && settled && stamp === "none") return null;

	return (
		<div className={`relative overflow-hidden ${dark ? "bg-[#2b2622]" : "bg-frame"} ${className}`}>
			{src ? (
				<img
					key={src}
					src={src}
					alt=""
					loading={eager ? "eager" : "lazy"}
					decoding="async"
					onLoad={() => setLoaded(src)}
					onError={() => setFailed((list) => [...list, src])}
					className={`absolute inset-0 size-full object-cover transition-opacity duration-500 ${loaded === src ? "opacity-100" : "opacity-0"}`}
				/>
			) : settled && !dark && stamp !== "none" ? (
				<Stamp subject={subject} size={stamp} />
			) : null}
			{children}
			{credit && credited ? (
				<a
					href={credited.pageUrl}
					target="_blank"
					rel="noreferrer"
					className={`photo-credit ${credit === "top-right" ? "top-2.5 right-2.5" : "right-2.5 bottom-2.5"}`}
				>
					Wikipedia
				</a>
			) : null}
		</div>
	);
}
