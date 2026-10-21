import type { TagRef } from "../shared/types.ts";

/** Tag types that describe character rather than administrative facts. */
const TRAIT_TYPE_PATTERNS = [
	/keyword/,
	/characteristic/,
	/culture/,
	/category:place/,
	/scenery/,
	/culinary/,
	/activity/,
	/ambience/,
	/popular_food/,
	/ideal_traveler/,
	/photogenic/,
];

const GENERIC_NAMES = new Set(["tourist attraction", "historical landmark", "city", "restaurant"]);

export function traitNames(tags: TagRef[]): string[] {
	return tags
		.filter((tag) => TRAIT_TYPE_PATTERNS.some((pattern) => pattern.test(tag.type)))
		.map((tag) => tag.name)
		.filter((name) => !GENERIC_NAMES.has(name.toLowerCase()));
}

/** Character traits two entities share, most specific first. */
export function sharedTraits(a: TagRef[], b: TagRef[], limit = 4): string[] {
	const bNames = new Set(traitNames(b).map((name) => name.toLowerCase()));
	const shared = traitNames(a).filter((name) => bNames.has(name.toLowerCase()));
	return [...new Set(shared)].slice(0, limit);
}
