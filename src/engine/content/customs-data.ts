/**
 * Curated etiquette and responsible-travel notes for the "Go like a local"
 * guide, also given to the agent as grounding.
 *
 * Editorial rules: English only; plain, warm and practical; stable customs
 * over changeable rules. Fees, access limits, visiting hours and fines change,
 * so they are described generally and travelers are pointed to current local
 * guidance. No prices, specific dates or fine amounts.
 *
 * Last reviewed: 2026-10-21.
 */

import { CUSTOMS_ASIA } from "./customs-asia.ts";
import { CUSTOMS_EUROPE } from "./customs-europe.ts";
import type { CustomsEntry } from "./customs-schema.ts";

/** Universal good-guest guidance, shown everywhere and used as the fallback. */
export const GENERIC_CUSTOMS: CustomsEntry = {
	countryCode: "*",
	notes: [
		{
			topic: "Greetings",
			text: "Learn to say hello, please and thank you in the local language. A greeting before a question, in shops or on the street, is welcome almost everywhere.",
		},
		{
			topic: "Places of worship",
			text: "Dress modestly, usually covering shoulders and knees, and follow posted rules on shoes and head coverings. Speak softly and avoid sightseeing during services unless you're joining in.",
		},
		{
			topic: "Photography",
			text: "Ask before photographing people, especially children and anyone at prayer. Respect no-photo signs, skip the flash indoors, and check local rules before flying a drone.",
		},
		{
			topic: "Neighborhoods",
			text: "Historic lanes are often people's homes. Keep voices low, don't block doorways or peer into windows, and never enter courtyards or gardens uninvited.",
		},
		{
			topic: "Public transport",
			text: "Let people off before boarding, keep bags off seats and offer priority seats to those who need them. Keep calls and music quiet.",
		},
		{
			topic: "Changing rules",
			text: "Fees, timed tickets, visitor limits and opening hours change often at busy places. Check current official guidance shortly before you go.",
		},
	],
	goodGuest: [
		"Visit famous sights early in the morning or late in the day, and give a quieter alternative nearby a try.",
		"Spread your spending: eat, shop and stay at small, locally owned businesses.",
		"Leave no trace: carry out your rubbish, stay on marked paths and don't feed wildlife.",
		"Travel outside peak season when you can, and stay longer in fewer places.",
	],
};

/**
 * Country entries (no `locality`) and locality entries (matched
 * case-insensitively by name), grouped by country.
 */
export const CUSTOMS: CustomsEntry[] = [...CUSTOMS_ASIA, ...CUSTOMS_EUROPE];
