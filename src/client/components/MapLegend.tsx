import { HEAT_RAMP, usePrefersDark } from "../lib/theme.ts";

export function MapLegend({ heat, crowded, twin, home, stops }: { heat?: boolean; crowded?: string; twin?: string; home?: string; stops?: boolean }) {
	const ramp = usePrefersDark() ? HEAT_RAMP.dark : HEAT_RAMP.light;
	return (
		<ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-2">
			{heat ? (
				<li className="flex items-center gap-1.5">
					<span
						className="inline-block h-2.5 w-8 rounded-sm"
						style={{ background: `linear-gradient(90deg, ${ramp.steps.join(", ")})` }}
					/>
					Where your taste concentrates (Qloo heatmap)
				</li>
			) : null}
			{crowded ? (
				<li className="flex items-center gap-1.5">
					<span className="inline-block size-2.5 rounded-full bg-viz-muted ring-2 ring-card" /> {crowded}
				</li>
			) : null}
			{twin ? (
				<li className="flex items-center gap-1.5">
					<span className="inline-block size-2.5 rounded-full bg-viz-accent ring-2 ring-card" /> {twin}
				</li>
			) : null}
			{home ? (
				<li className="flex items-center gap-1.5">
					<span className="inline-block size-2.5 rounded-full bg-ink ring-2 ring-card" /> {home}
				</li>
			) : null}
			{stops ? (
				<li className="flex items-center gap-1.5">
					<span className="grid size-4 place-items-center rounded-full bg-ink text-[9px] font-semibold text-card">1</span>
					Plan stops, in order
				</li>
			) : null}
		</ul>
	);
}
