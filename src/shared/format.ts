import { MONTH_NAMES } from "./types.ts";

/** 0.995 → "99.5th"; 0.62 → "62nd". */
export function percentile(p: number | undefined): string {
	if (p === undefined || Number.isNaN(p)) return "unknown";
	const value = p * 100;
	const rounded = value >= 99 ? Math.round(value * 10) / 10 : Math.round(value);
	return `${rounded}${ordinalSuffix(rounded)}`;
}

function ordinalSuffix(n: number): string {
	if (!Number.isInteger(n)) return "th";
	const mod100 = n % 100;
	if (mod100 >= 11 && mod100 <= 13) return "th";
	switch (n % 10) {
		case 1:
			return "st";
		case 2:
			return "nd";
		case 3:
			return "rd";
		default:
			return "th";
	}
}

/** 0.873 → "87%". */
export function pct(value: number | undefined): string {
	if (value === undefined || Number.isNaN(value)) return "–";
	return `${Math.round(value * 100)}%`;
}

export function monthName(month: number | undefined): string {
	if (!month || month < 1 || month > 12) return "";
	return MONTH_NAMES[month - 1] ?? "";
}

export function km(distance: number): string {
	if (distance < 1) return `${Math.round(distance * 1000)} m`;
	if (distance < 10) return `${distance.toFixed(1)} km`;
	return `${Math.round(distance)} km`;
}

export function joinNames(names: string[]): string {
	if (names.length <= 1) return names.join("");
	return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}
