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
	const tokens = total === 0 ? 0 : (0.75 * common) / total;
	return Math.max(tokens, typoScore(q, n));
}

/** Tolerates a slip or two in a short name ("Kyto" → "Kyoto", "Barcelonna" → "Barcelona"). */
function typoScore(q: string, n: string): number {
	const longest = Math.max(q.length, n.length);
	if (longest < 4 || longest > 24 || Math.abs(q.length - n.length) > 2) return 0;
	const similarity = 1 - editDistance(q, n) / longest;
	return similarity >= 0.8 ? 0.7 * similarity : 0;
}

function editDistance(a: string, b: string): number {
	let previous = Array.from({ length: b.length + 1 }, (_, j) => j);
	for (let i = 1; i <= a.length; i++) {
		const current = [i];
		for (let j = 1; j <= b.length; j++) {
			const substitution = (previous[j - 1] ?? 0) + (a[i - 1] === b[j - 1] ? 0 : 1);
			current.push(Math.min((previous[j] ?? 0) + 1, (current[j - 1] ?? 0) + 1, substitution));
		}
		previous = current;
	}
	return previous[b.length] ?? 0;
}

export function slugify(text: string): string {
	return normalizeName(text).replace(/\s+/g, "-") || "item";
}
