import { useEffect, useState } from "react";

const DARK_QUERY = "(prefers-color-scheme: dark)";

export function usePrefersDark(): boolean {
	const [dark, setDark] = useState(() => window.matchMedia(DARK_QUERY).matches);
	useEffect(() => {
		const media = window.matchMedia(DARK_QUERY);
		const onChange = () => setDark(media.matches);
		media.addEventListener("change", onChange);
		return () => media.removeEventListener("change", onChange);
	}, []);
	return dark;
}

/**
 * Blue sequential ramp for the taste heat (reference steps 100 → 650). Near zero
 * recedes into the surface, so the anchor flips in dark mode: light steps on a
 * light map, dark steps on a dark one, and the strongest cells always stand out.
 */
export const HEAT_RAMP = {
	light: { zero: "rgba(205, 226, 251, 0)", steps: ["#cde2fb", "#86b6ef", "#3987e5", "#1c5cab", "#104281"] },
	dark: { zero: "rgba(13, 54, 107, 0)", steps: ["#0d366b", "#1c5cab", "#3987e5", "#86b6ef", "#cde2fb"] },
} as const;
