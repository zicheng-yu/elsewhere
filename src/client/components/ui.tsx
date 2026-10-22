import type { ReactNode } from "react";

export type IconName =
	| "check"
	| "x"
	| "spinner"
	| "alert"
	| "leaf"
	| "calendar"
	| "pin"
	| "arrow"
	| "back"
	| "search"
	| "plus"
	| "sparkle"
	| "users"
	| "info"
	| "share"
	// Category stamps for places without a photo
	| "temple"
	| "shrine"
	| "garden"
	| "water"
	| "market"
	| "cafe"
	| "food"
	| "night"
	| "culture"
	| "town";

const PATHS: Record<Exclude<IconName, "spinner">, string> = {
	check: "M5 12.5l4.5 4.5L19 7.5",
	x: "M6 6l12 12M18 6L6 18",
	alert: "M12 4l9 16H3L12 4zm0 6v4m0 3v.5",
	leaf: "M5 19c0-8 6-14 14-14 0 8-6 14-14 14zm0 0l7-7",
	calendar: "M5 7h14v12H5zM5 11h14M9 4v4m6-4v4",
	pin: "M12 21s-6-5.5-6-10a6 6 0 1112 0c0 4.5-6 10-6 10zm0-8a2 2 0 100-4 2 2 0 000 4z",
	arrow: "M5 12h14m-5-5l5 5-5 5",
	sparkle: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z",
	users: "M9 11a3 3 0 100-6 3 3 0 000 6zm6 1a2.5 2.5 0 100-5M3 19c0-3 2.7-5 6-5s6 2 6 5m2-4c2 .3 4 1.8 4 4",
	info: "M12 8v.5M12 11v5M12 21a9 9 0 110-18 9 9 0 010 18z",
	share: "M7 12v6h10v-6M12 4v11m-4-7l4-4 4 4",
	back: "M19 12H5m6-6l-6 6 6 6",
	search: "M11 18a7 7 0 100-14 7 7 0 000 14zm9 2l-4-4",
	plus: "M12 5v14M5 12h14",
	temple: "M3 9c3-1 6-3 9-6 3 3 6 5 9 6M5 9v11M19 9v11M9 20v-6h6v6M3 20h18",
	shrine: "M3 5c6 1.3 12 1.3 18 0M5 9h14M7 6v15M17 6v15",
	garden: "M12 21v-7m0 0c-4 0-7-2.5-7-6 0-2.5 2-4 4-4 1 0 2 .5 3 1.5C13 4.5 14 4 15 4c2 0 4 1.5 4 4 0 3.5-3 6-7 6z",
	water: "M2 15c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M2 19c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M8 11a4 4 0 018 0",
	market: "M4 9l1.5-5h13L20 9M4 9h16M4 9a2.7 2.7 0 005.3 0 2.7 2.7 0 005.4 0 2.7 2.7 0 005.3 0M5 9v11h14V9M10 20v-5h4v5",
	cafe: "M5 8h12v6a5 5 0 01-5 5h-2a5 5 0 01-5-5V8zm12 1h1.5a2.5 2.5 0 010 5H17M4 21h15",
	food: "M7 3v8M5 3v5a2 2 0 004 0V3M7 11v10M17 3c-2 1-3 3.5-3 7h3v11",
	night: "M5 4h14l-7 8-7-8zm7 8v8m-4 0h8",
	culture: "M3 9l9-5 9 5M5 9v9M9.5 9v9M14.5 9v9M19 9v9M3 20h18",
	town: "M3 20v-9l5-4 5 4v9m0 0v-6l4-3 4 3v6M3 20h18M7 20v-4h2v4",
};

export function Icon({ name, className = "size-4" }: { name: IconName; className?: string }) {
	if (name === "spinner") {
		return (
			<svg viewBox="0 0 24 24" className={`${className} animate-spin`} aria-hidden="true">
				<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.5" />
				<path d="M21 12a9 9 0 00-9-9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
			</svg>
		);
	}
	return (
		<svg
			viewBox="0 0 24 24"
			className={className}
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d={PATHS[name]} />
		</svg>
	);
}

export function Badge({
	children,
	tone = "neutral",
	icon,
	title,
}: {
	children: ReactNode;
	tone?: "neutral" | "good" | "warning" | "serious" | "accent";
	icon?: IconName;
	title?: string;
}) {
	const dot: Record<string, string> = {
		neutral: "bg-muted",
		good: "bg-good",
		warning: "bg-warning",
		serious: "bg-serious",
		accent: "bg-viz-accent",
	};
	return (
		<span className="chip text-ink-2" title={title}>
			{icon ? <Icon name={icon} className="size-3.5" /> : <span className={`inline-block size-2 rounded-full ${dot[tone]}`} />}
			{children}
		</span>
	);
}
