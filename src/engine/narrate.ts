/**
 * Template narration for the scripted planner. Every number comes from the
 * engine's results; nothing is generated.
 */
import { joinNames, km, monthName, pct, percentile } from "../shared/format.ts";
import { attentionExtremes } from "../shared/trend.ts";
import type { CityTwin, DupeScore, Hotspot, LocalPlan, ScoreKey, ZoomResult } from "../shared/types.ts";

function component(score: DupeScore, key: ScoreKey): number | undefined {
	return score.components.find((c) => c.key === key)?.value;
}

export function narrateHotspot(hotspot: Hotspot): string {
	const { locality, season } = hotspot;
	const month = monthName(season.month);
	const sentences: string[] = [];
	const when = month ? `${locality.name} in ${month}` : locality.name;
	if (season.isPeak) {
		sentences.push(`${when} is peak season: Qloo tags ${month} as a peak tourism month.`);
	} else if (season.isOffSeason) {
		sentences.push(`${when} is off-season, which already helps with crowds.`);
	} else {
		sentences.push(`Let's look at ${when}.`);
	}
	if (locality.popularity !== undefined) {
		sentences.push(`${locality.name} sits in the ${percentile(locality.popularity)} popularity percentile on Qloo.`);
	}
	const { busiest, quietest } = attentionExtremes(hotspot.trend);
	if (busiest && quietest) {
		sentences.push(
			`Over the past year, attention to ${locality.name} on Qloo peaked in ${monthName(busiest)} and dipped in ${monthName(quietest)}.`,
		);
	}
	if (season.events.length > 0) sentences.push(`This month brings ${joinNames(season.events.slice(0, 2))}.`);
	if (hotspot.crowdedSpots.length > 0) {
		sentences.push(
			`Your must-sees, ${joinNames(hotspot.crowdedSpots.map((s) => s.name))}, are among its most popular places.`,
		);
	}
	if (hotspot.tasteProfile.length > 0) {
		sentences.push(`I'll match alternatives to your taste for ${joinNames(hotspot.tasteProfile.map((t) => t.name))}.`);
	}
	if (hotspot.unresolved.length > 0) {
		sentences.push(`I couldn't match ${joinNames(hotspot.unresolved)} in Qloo, so I left ${hotspot.unresolved.length > 1 ? "them" : "it"} out.`);
	}
	return sentences.join(" ");
}

function cityLine(twin: CityTwin, home: string): string {
	const soul = pct(component(twin.score, "soul"));
	const traits = twin.sharedTraits.length > 0 ? `, sharing ${joinNames(twin.sharedTraits.slice(0, 2).map((t) => t.toLowerCase()))}` : "";
	const season = twin.season.isBestMonth
		? ` ${monthName(twin.season.month)} is one of its best months.`
		: twin.season.isPeak
			? ` Note that ${monthName(twin.season.month)} is busy there too.`
			: "";
	const gently = twin.smallCommunity ? " It's a small community, so visit gently." : "";
	return `${twin.city.name} (${km(twin.distanceKm)} away) has a ${soul} soul match with ${home}${traits}, at the ${percentile(twin.city.popularity)} popularity percentile.${season}${gently}`;
}

export function narrateZoom(result: ZoomResult, hotspot: Hotspot): string {
	const home = hotspot.locality.name;
	if (result.items.length === 0) return result.note ?? "";
	switch (result.level) {
		case "city": {
			const firsts = new Map<string, (typeof result.items)[number]>();
			for (const item of result.items) if (!firsts.has(item.original.id)) firsts.set(item.original.id, item);
			const lines = [...firsts.values()].map(
				(item) =>
					`Instead of ${item.original.name} (${percentile(item.original.popularity)} percentile), try ${item.twin.name}: ${pct(component(item.score, "soul"))} soul match, ${pct(component(item.score, "taste"))} taste fit, ${percentile(item.twin.popularity)} percentile, ${km(item.distanceKm)} away.`,
			);
			return `Same city. ${lines.join(" ")}`;
		}
		case "region": {
			const [first, ...rest] = result.items;
			if (!first) return "";
			const stops = joinNames(first.places.slice(0, 2).map((p) => p.name));
			const others = rest.length > 0 ? ` Also worth a look: ${joinNames(rest.slice(0, 2).map((t) => t.town.name))}.` : "";
			return `Day trip. ${first.town.name}, ${km(first.distanceKm)} from ${home}, scores ${pct(first.score.total)} overall: start with ${stops}.${others}`;
		}
		case "country":
		case "world": {
			const [first, ...rest] = result.items;
			if (!first) return "";
			const label = result.level === "country" ? "Same country." : "Beyond borders.";
			const others = rest.length > 0 ? ` Runners-up: ${joinNames(rest.map((c) => c.city.name))}.` : "";
			return `${label} ${cityLine(first, home)}${others}`;
		}
	}
}

export function narratePlan(plan: LocalPlan): string {
	const sentences: string[] = [];
	const days = plan.days.length === 1 ? "a day" : `${plan.days.length} days`;
	sentences.push(`Here's ${days} in ${plan.target.name}${plan.quieter ? ", tuned for quieter places" : ""}.`);
	if (plan.stayArea) {
		sentences.push(`Base yourself around ${plan.stayArea.label}: Qloo's heatmap shows your taste concentrating there.`);
	}
	const firstStops = plan.days[0]?.stops.slice(0, 3).map((s) => s.place.name) ?? [];
	if (firstStops.length > 0) sentences.push(`Day one opens with ${joinNames(firstStops)}.`);
	if (plan.customs.length > 0) {
		sentences.push(`Before you go, skim the local customs below, starting with ${plan.customs[0]?.topic.toLowerCase()}.`);
	}
	return sentences.join(" ");
}
