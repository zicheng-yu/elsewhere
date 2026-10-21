/**
 * Curated, human-reviewed etiquette and responsible-travel notes.
 *
 * Used directly by the scripted planner, and given to the LLM agent as
 * grounding. Notes are general guidance, not legal advice: local rules change,
 * so the UI always tells travelers to check current local guidance.
 */

export interface CustomsNote {
	/** Short topic label, e.g. "Shrines and temples". */
	topic: string;
	/** One or two sentences, at most ~35 words, in plain English. */
	text: string;
}

export interface CustomsEntry {
	/** ISO 3166-1 alpha-2 country code, e.g. "JP". */
	countryCode: string;
	/** Optional locality this entry is specific to, matched case-insensitively by name, e.g. "Kyoto". */
	locality?: string;
	/** Etiquette and customs. */
	notes: CustomsNote[];
	/** Responsible-travel ("be a good guest") notes. */
	goodGuest: string[];
}
