/** Lowercase, accent-free, punctuation-free form of a name, for matching. */
export function normalizeName(text: string): string {
	return text
		.replace(/œ/g, "oe")
		.replace(/Œ/g, "Oe")
		.replace(/æ/g, "ae")
		.replace(/ß/g, "ss")
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, " ")
		.trim();
}

const STOP_WORDS = new Set(["the", "of", "de", "la", "le", "del", "di", "a", "and", "st"]);

/** Fuzzy name match in [0, 1]. */
export function matchScore(query: string, name: string): number {
	return matchNormalized(normalizeName(query), normalizeName(name));
}

/** Fuzzy match of two strings already passed through normalizeName. */
export function matchNormalized(q: string, n: string): number {
	if (!q || !n) return 0;
	if (q === n) return 1;
	if (n.startsWith(q) || q.startsWith(n)) return 0.9;
	if (n.includes(q) || q.includes(n)) return 0.8;
	const nameTokens = new Set(n.split(" "));
	let total = 0;
	let common = 0;
	for (const token of q.split(" ")) {
		if (STOP_WORDS.has(token)) continue;
		total++;
		if (nameTokens.has(token)) common++;
	}
	return total === 0 ? 0 : (0.75 * common) / total;
}

export function slugify(text: string): string {
	return normalizeName(text).replace(/\s+/g, "-") || "item";
}
