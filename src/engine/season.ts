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

function monthsTagged(tags: TagRef[], kind: string): number[] {
	const months = tags.filter((tag) => tag.type.includes(kind)).map(monthOf);
	return [...new Set(months.filter((m): m is number => m !== undefined))].sort((a, b) => a - b);
}

/** Season context for a locality, from Qloo's month tags. */
export function seasonInfo(locality: Locality, month: number | undefined): SeasonInfo {
	const peakMonths = monthsTagged(locality.tags, "peak_tourism_month");
	const offSeasonMonths = monthsTagged(locality.tags, "off_season_month");
	const bestMonths = monthsTagged(locality.tags, "best_month_for_travel");
	const monthKey = month ? MONTHS_LOWER[month - 1] : undefined;
	const inMonth = (kind: string) =>
		monthKey ? locality.tags.filter((tag) => tag.type.includes(`${monthKey}_${kind}`)).map((tag) => tag.name) : [];
	return {
		month,
		peakMonths,
		offSeasonMonths,
		bestMonths,
		isPeak: month !== undefined && peakMonths.includes(month),
		isOffSeason: month !== undefined && offSeasonMonths.includes(month),
		isBestMonth: month !== undefined && bestMonths.includes(month),
		events: inMonth("event"),
		advisories: inMonth("travel_advisory"),
	};
}

/** Season fit in [0, 1], or undefined when there is no month or no month data. */
export function seasonScore(info: SeasonInfo): number | undefined {
	if (info.month === undefined) return undefined;
	if (info.peakMonths.length + info.offSeasonMonths.length + info.bestMonths.length === 0) return undefined;
	let score = 0.55;
	if (info.isBestMonth) score += 0.3;
	if (info.isOffSeason) score += 0.15;
	if (info.isPeak) score -= 0.35;
	if (info.events.length > 0) score += 0.05;
	return Math.min(1, Math.max(0, score));
}
