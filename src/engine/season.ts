import { MONTH_NAMES, type Locality, type SeasonInfo, type TagRef } from "../shared/types.ts";

const MONTHS_LOWER = MONTH_NAMES.map((name) => name.toLowerCase());

/** Month number (1–12) mentioned in a tag's name or ID suffix. */
function monthOf(tag: TagRef): number | undefined {
	for (const text of [tag.name, tag.id.split(":").at(-1) ?? ""]) {
		const index = MONTHS_LOWER.indexOf(text.toLowerCase().trim());
		if (index >= 0) return index + 1;
	}
	return undefined;
}

/** The tag family, e.g. "peak_tourism_month" for "urn:tag:peak_tourism_month:qloo". */
function familyOf(tag: TagRef): string {
	return tag.type.split(":")[2] ?? "";
}

function monthsTagged(tags: TagRef[], family: string): number[] {
	const months = tags.filter((tag) => familyOf(tag) === family).map(monthOf);
	return [...new Set(months.filter((m): m is number => m !== undefined))].sort((a, b) => a - b);
}

function namesIn(tags: TagRef[], family: string, limit: number): string[] {
	return [...new Set(tags.filter((tag) => familyOf(tag) === family).map((tag) => tag.name))].slice(0, limit);
}

/** Season context for a locality, from Qloo's month, event and travel-advisory tags. */
export function seasonInfo(locality: Locality | undefined, month: number | undefined): SeasonInfo {
	const tags = locality?.tags ?? [];
	const peakMonths = monthsTagged(tags, "peak_tourism_month");
	const offSeasonMonths = monthsTagged(tags, "off_season_month");
	const bestMonths = monthsTagged(tags, "best_month_for_travel");
	const worstMonths = monthsTagged(tags, "worst_month_for_travel");
	const calendar = MONTHS_LOWER.map((name) => ({
		events: namesIn(tags, `${name}_event`, 3),
		advisories: namesIn(tags, `${name}_travel_advisory`, 3),
	}));
	const current = month ? calendar[month - 1] : undefined;
	return {
		month,
		peakMonths,
		offSeasonMonths,
		bestMonths,
		worstMonths,
		isPeak: month !== undefined && peakMonths.includes(month),
		isOffSeason: month !== undefined && offSeasonMonths.includes(month),
		isBestMonth: month !== undefined && bestMonths.includes(month),
		isWorstMonth: month !== undefined && worstMonths.includes(month),
		events: current?.events ?? [],
		advisories: current?.advisories ?? [],
		calendar: calendar.some((m) => m.events.length + m.advisories.length > 0) ? calendar : undefined,
	};
}

/** Season fit in [0, 1], or undefined when there is no month or no month data. */
export function seasonScore(info: SeasonInfo): number | undefined {
	if (info.month === undefined) return undefined;
	if (info.peakMonths.length + info.offSeasonMonths.length + info.bestMonths.length + info.worstMonths.length === 0) return undefined;
	let score = 0.55;
	if (info.isBestMonth) score += 0.3;
	if (info.isOffSeason) score += 0.15;
	if (info.isPeak) score -= 0.35;
	if (info.isWorstMonth) score -= 0.2;
	if (info.events.length > 0) score += 0.05;
	return Math.min(1, Math.max(0, score));
}
