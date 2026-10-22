import { lazy, Suspense, useMemo, useState } from "react";
import { ZOOM_LEVELS, type Hotspot, type PlanTargetRef, type ZoomLevel, type ZoomResult } from "../../shared/types.ts";
import { CityCard, SpotTwinCard, TownCard } from "./Cards.tsx";
import { MapLegend } from "./MapLegend.tsx";
import type { MapPoint, MapViewProps } from "./MapView.tsx";
import { Icon } from "./ui.tsx";

const MapView = lazy(() => import("./MapView.tsx"));

function MapFallback() {
	return <div className="grid h-[22rem] place-items-center rounded-[1.375rem] border border-line bg-wash text-sm text-muted">Loading map…</div>;
}

function mapFor(result: ZoomResult, hotspot: Hotspot): Omit<MapViewProps, "ariaLabel"> & { legend: Parameters<typeof MapLegend>[0] } {
	const home: MapPoint = { id: "home", lat: hotspot.locality.lat, lon: hotspot.locality.lon, label: hotspot.locality.name, kind: "home" };
	switch (result.level) {
		case "city": {
			const crowded = new Map<string, MapPoint>();
			const twins: MapPoint[] = [];
			const links: { from: MapPoint; to: MapPoint }[] = [];
			for (const item of result.items) {
				const from =
					crowded.get(item.original.id) ??
					({ id: item.original.id, lat: item.original.lat, lon: item.original.lon, label: item.original.name, kind: "crowded" } satisfies MapPoint);
				crowded.set(item.original.id, from);
				const to: MapPoint = { id: item.twin.id, lat: item.twin.lat, lon: item.twin.lon, label: item.twin.name, kind: "twin" };
				twins.push(to);
				links.push({ from, to });
			}
			return {
				heat: result.heat ?? [],
				points: [...crowded.values(), ...twins],
				links,
				legend: { heat: (result.heat?.length ?? 0) > 0, crowded: "Crowded must-see", twin: "Quiet twin" },
			};
		}
		case "region": {
			const towns = result.items.map((item) => ({ id: item.id, lat: item.town.lat, lon: item.town.lon, label: item.town.name, kind: "twin" }) satisfies MapPoint);
			return { points: [home, ...towns], links: towns.map((to) => ({ from: home, to })), legend: { home: hotspot.locality.name, twin: "Day-trip twin" } };
		}
		case "country":
		case "world": {
			const cities = result.items.map((item) => ({ id: item.id, lat: item.city.lat, lon: item.city.lon, label: item.city.name, kind: "twin" }) satisfies MapPoint);
			return { points: [home, ...cities], links: cities.map((to) => ({ from: home, to })), legend: { home: hotspot.locality.name, twin: "Twin city" } };
		}
	}
}

export function ZoomSection({
	hotspot,
	zooms,
	running,
	planBusy,
	selected,
	onPlan,
}: {
	hotspot: Hotspot;
	zooms: Partial<Record<ZoomLevel, ZoomResult>>;
	running: boolean;
	planBusy: boolean;
	selected?: PlanTargetRef;
	onPlan: (target: PlanTargetRef) => void;
}) {
	const available = ZOOM_LEVELS.filter((level) => zooms[level.id]);
	const [active, setActive] = useState<ZoomLevel | undefined>();
	const current = active && zooms[active] ? active : available[0]?.id;
	const result = current ? zooms[current] : undefined;
	const map = useMemo(() => (result ? mapFor(result, hotspot) : undefined), [result, hotspot]);

	if (available.length === 0) {
		return running ? (
			<div className="card flex items-center gap-3 p-6 text-sm text-ink-2">
				<Icon name="spinner" /> Looking for the same soul with fewer crowds…
			</div>
		) : null;
	}

	const blurb = result ? [ZOOM_LEVELS.find((l) => l.id === result.level)?.blurb, result.note].filter(Boolean).join(" · ") : "";

	return (
		<section aria-labelledby="elsewheres" className="space-y-6">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div className="space-y-1.5">
					<h2 id="elsewheres" className="font-serif text-[2.5rem] leading-none sm:text-[2.75rem]">
						Your elsewheres
					</h2>
					{blurb ? <p className="text-sm text-ink-2">{blurb}</p> : null}
				</div>
				<div role="tablist" aria-label="How far will you go?" className="segmented">
					{ZOOM_LEVELS.map((level) => {
						const levelResult = zooms[level.id];
						return (
							<button
								key={level.id}
								type="button"
								role="tab"
								aria-selected={level.id === current}
								disabled={!levelResult}
								onClick={() => setActive(level.id)}
								className="segment"
							>
								{level.label}
								{levelResult ? <span className="text-xs font-normal text-muted">{levelResult.items.length}</span> : null}
							</button>
						);
					})}
				</div>
			</div>

			{result && map ? (
				<div className="space-y-8" role="tabpanel" aria-labelledby="elsewheres">
					<div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
						{result.level === "city"
							? result.items.map((item) => (
									<SpotTwinCard key={item.id} item={item} onPlan={onPlan} busy={planBusy} selected={selected?.itemId === item.id} />
								))
							: result.level === "region"
								? result.items.map((item) => (
										<TownCard key={item.id} item={item} home={hotspot.locality.name} onPlan={onPlan} busy={planBusy} selected={selected?.itemId === item.id} />
									))
								: result.items.map((item) => (
										<CityCard
											key={item.id}
											item={item}
											level={result.level}
											home={hotspot.locality.name}
											homePopularity={hotspot.locality.popularity}
											onPlan={onPlan}
											busy={planBusy}
											selected={selected?.itemId === item.id}
										/>
									))}
					</div>
					<div className="space-y-3">
						<h3 className="text-[0.95rem] font-semibold">On the map</h3>
						<Suspense fallback={<MapFallback />}>
							<MapView
								heat={map.heat}
								points={map.points}
								links={map.links}
								ariaLabel={`Map of ${ZOOM_LEVELS.find((l) => l.id === result.level)?.label.toLowerCase()} alternatives`}
							/>
						</Suspense>
						<MapLegend {...map.legend} />
					</div>
				</div>
			) : null}
		</section>
	);
}
