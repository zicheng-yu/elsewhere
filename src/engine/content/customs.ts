import type { CustomsNote } from "../../shared/types.ts";
import { normalizeName } from "../text.ts";
import { CUSTOMS, GENERIC_CUSTOMS } from "./customs-data.ts";

const MAX_NOTES = 7;
const MAX_GOOD_GUEST = 4;

/** Places that share another entry's customs, e.g. Bali towns use the Ubud (Balinese Hindu) notes. */
const LOCALITY_ALIASES: Record<string, string> = {
	sidemen: "Ubud",
	munduk: "Ubud",
	amed: "Ubud",
	jatiluwih: "Ubud",
	"tirta gangga": "Ubud",
	pemuteran: "Ubud",
	bedugul: "Ubud",
	canggu: "Ubud",
	"tampaksiring": "Ubud",
};

/** Etiquette and good-guest notes for a place: locality-specific first, then country, then universal. */
export function customsFor(
	countryCode: string | undefined,
	localityName: string | undefined,
): { notes: CustomsNote[]; goodGuest: string[] } {
	const code = countryCode?.toUpperCase();
	const wanted = localityName ? normalizeName(LOCALITY_ALIASES[normalizeName(localityName)] ?? localityName) : undefined;
	const local = wanted ? CUSTOMS.find((entry) => entry.locality && normalizeName(entry.locality) === wanted) : undefined;
	const country = CUSTOMS.find((entry) => !entry.locality && entry.countryCode === (local?.countryCode ?? code));

	const notes: CustomsNote[] = [];
	const topics = new Set<string>();
	for (const note of [...(local?.notes ?? []), ...(country?.notes ?? []), ...GENERIC_CUSTOMS.notes]) {
		const key = note.topic.toLowerCase();
		if (topics.has(key)) continue;
		topics.add(key);
		notes.push(note);
		if (notes.length >= MAX_NOTES) break;
	}
	const goodGuest = [
		...new Set([...(local?.goodGuest ?? []), ...(country?.goodGuest ?? []), ...GENERIC_CUSTOMS.goodGuest]),
	].slice(0, MAX_GOOD_GUEST);
	return { notes, goodGuest };
}
