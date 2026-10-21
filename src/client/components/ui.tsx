import type { ReactNode } from "react";

type IconName = "check" | "x" | "spinner" | "alert" | "leaf" | "calendar" | "pin" | "arrow" | "sparkle" | "users" | "info" | "share";

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

export function SectionTitle({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
	return (
		<div className="mb-4 space-y-1">
			{eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
			<h2 className="font-serif text-2xl leading-tight sm:text-3xl">{title}</h2>
			{children ? <p className="text-sm text-ink-2">{children}</p> : null}
		</div>
	);
}
