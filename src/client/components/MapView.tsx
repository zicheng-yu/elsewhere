import { AttributionControl, LngLatBounds, Map as MapLibre, Marker, NavigationControl, setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import { geohashBounds, geohashRing } from "../../engine/geo.ts";
import type { HeatCell } from "../../shared/types.ts";
import { HEAT_RAMP, usePrefersDark } from "../lib/theme.ts";

setWorkerUrl(workerUrl);

export type MapPointKind = "crowded" | "twin" | "home" | "stop";

export interface MapPoint {
	id: string;
	lat: number;
	lon: number;
	label: string;
	kind: MapPointKind;
	order?: number;
}

export interface MapViewProps {
	heat?: HeatCell[];
	points: MapPoint[];
	/** Thin connectors, e.g. crowded spot → its quiet twin. */
	links?: { from: MapPoint; to: MapPoint }[];
	/** Ordered stops for a day route. */
	route?: MapPoint[];
	stayArea?: { geohash: string };
	height?: string;
	ariaLabel: string;
}

const STYLES = {
	light: "https://tiles.openfreemap.org/styles/positron",
	dark: "https://tiles.openfreemap.org/styles/dark",
};

// Stable defaults: a fresh [] on every render would rebuild the map each time.
const NO_HEAT: HeatCell[] = [];
const NO_LINKS: { from: MapPoint; to: MapPoint }[] = [];
const NO_ROUTE: MapPoint[] = [];

/** Meters per pixel at zoom 0 on the equator (512 px tiles). */
const METERS_PER_PX_Z0 = 78_271.517;
/** Above this the kernel gets expensive and adds nothing; detail shows through instead. */
const MAX_HEAT_RADIUS_PX = 260;

function markerElement(point: MapPoint): HTMLElement {
	const root = document.createElement("div");
	root.className = `map-marker ${point.kind}`;
	root.setAttribute("aria-hidden", "true");
	const dot = document.createElement("span");
	dot.className = "dot";
	if (point.kind === "stop") {
		dot.textContent = String(point.order ?? "");
	} else {
		dot.style.background =
			point.kind === "twin" ? "var(--color-viz-accent)" : point.kind === "home" ? "var(--color-ink)" : "var(--color-viz-muted)";
	}
	const label = document.createElement("span");
	label.className = "label";
	label.textContent = point.label;
	root.append(dot, label);
	return root;
}

const LABEL_PRIORITY: Record<MapPointKind, number> = { twin: 0, crowded: 1, home: 2, stop: 3 };

/**
 * Hide labels that would overlap one already placed (twins first, then crowded
 * spots, then home; stops in route order), cover another marker, or run off the
 * map. A hidden label returns on hover.
 */
function declutter(frame: HTMLElement, entries: { point: MapPoint; element: HTMLElement }[]): void {
	const hit = (a: DOMRect, b: DOMRect) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
	const bounds = frame.getBoundingClientRect();
	const clipped = (box: DOMRect) => box.left < bounds.left || box.right > bounds.right || box.top < bounds.top || box.bottom > bounds.bottom;
	// Every dot is an obstacle too: a label must not run under another marker.
	const dots = entries.map(({ element }) => element.querySelector(".dot")?.getBoundingClientRect());
	const placed: DOMRect[] = [];
	const ordered = entries
		.map((entry, index) => ({ ...entry, index }))
		.sort((a, b) => LABEL_PRIORITY[a.point.kind] - LABEL_PRIORITY[b.point.kind] || (a.point.order ?? 0) - (b.point.order ?? 0));
	for (const { element, index } of ordered) {
		const label = element.querySelector<HTMLElement>(".label");
		if (!label) continue;
		label.classList.remove("is-hidden");
		const box = label.getBoundingClientRect();
		const blocked =
			clipped(box) || placed.some((other) => hit(box, other)) || dots.some((dot, i) => i !== index && dot !== undefined && hit(box, dot));
		if (blocked) label.classList.add("is-hidden");
		else placed.push(box);
	}
}

/**
 * Heat cells as weighted points. Each point's kernel spans about one cell, so
 * neighboring cells blend into one surface whatever geohash precision Qloo returns.
 */
function heatSource(cells: HeatCell[]) {
	const max = Math.max(...cells.map((c) => c.affinity));
	const min = Math.min(...cells.map((c) => c.affinity));
	const span = Math.max(0.0001, max - min);
	let cellMeters = 0;
	let latSum = 0;
	const features = cells.map((cell) => {
		const b = geohashBounds(cell.geohash);
		const lat = (b.minLat + b.maxLat) / 2;
		const lon = (b.minLon + b.maxLon) / 2;
		const height = (b.maxLat - b.minLat) * 111_320;
		const width = (b.maxLon - b.minLon) * 111_320 * Math.cos((lat * Math.PI) / 180);
		cellMeters = Math.max(cellMeters, height, width);
		latSum += lat;
		return {
			type: "Feature" as const,
			// Squared so the strongest cells stand out from a faint background.
			properties: { w: ((cell.affinity - min) / span) ** 2 },
			geometry: { type: "Point" as const, coordinates: [lon, lat] },
		};
	});
	const lat = latSum / Math.max(1, cells.length);
	// Pixel radius that keeps the kernel about 1.1 cells wide at every zoom, capped.
	const radiusAtZ0 = (cellMeters * 1.1) / (METERS_PER_PX_Z0 * Math.cos((lat * Math.PI) / 180));
	const radiusStops: number[] = [];
	for (let zoom = 4; zoom <= 18; zoom += 2) {
		radiusStops.push(zoom, Math.max(2, Math.min(MAX_HEAT_RADIUS_PX, radiusAtZ0 * 2 ** zoom)));
	}
	return { data: { type: "FeatureCollection" as const, features }, radiusStops };
}

export default function MapView({
	heat = NO_HEAT,
	points,
	links = NO_LINKS,
	route = NO_ROUTE,
	stayArea,
	height = "22rem",
	ariaLabel,
}: MapViewProps) {
	const container = useRef<HTMLDivElement>(null);
	const dark = usePrefersDark();

	useEffect(() => {
		const element = container.current;
		if (!element) return;
		const map = new MapLibre({
			container: element,
			style: dark ? STYLES.dark : STYLES.light,
			center: points[0] ? [points[0].lon, points[0].lat] : [0, 20],
			zoom: 11,
			attributionControl: false,
			cooperativeGestures: true,
		});
		map.addControl(new NavigationControl({ showCompass: false }), "top-right");
		map.addControl(new AttributionControl(), "bottom-right");

		// The basemap style references a few sprites it doesn't ship; fill them with
		// a transparent pixel instead of logging a warning for each.
		map.setMissingStyleImageResolver((id) => {
			if (!map.hasImage(id)) map.addImage(id, { width: 1, height: 1, data: new Uint8Array(4) });
		});

		const entries = points.map((point) => ({ point, element: markerElement(point) }));
		const markers = entries.map(({ point, element: markerRoot }) =>
			new Marker({ element: markerRoot, anchor: "left", offset: [point.kind === "stop" ? -10 : -6, 0] })
				.setLngLat([point.lon, point.lat])
				.addTo(map),
		);
		const relabel = () => declutter(element, entries);
		map.on("moveend", relabel);

		map.on("load", () => {
			// On narrow maps the compact attribution starts expanded over the map; start it folded.
			if (element.clientWidth <= 640) {
				const attribution = element.querySelector(".maplibregl-ctrl-attrib");
				attribution?.classList.remove("maplibregl-compact-show");
				attribution?.removeAttribute("open");
			}

			relabel();
			if (heat.length > 0) {
				const ramp = dark ? HEAT_RAMP.dark : HEAT_RAMP.light;
				const { data, radiusStops } = heatSource(heat);
				map.addSource("heat", { type: "geojson", data });
				map.addLayer({
					id: "heat",
					type: "heatmap",
					source: "heat",
					paint: {
						"heatmap-weight": ["get", "w"],
						"heatmap-intensity": 1.8,
						"heatmap-radius": ["interpolate", ["exponential", 2], ["zoom"], ...radiusStops],
						"heatmap-color": [
							"interpolate",
							["linear"],
							["heatmap-density"],
							0,
							ramp.zero,
							0.12,
							ramp.steps[0],
							0.35,
							ramp.steps[1],
							0.6,
							ramp.steps[2],
							0.82,
							ramp.steps[3],
							1,
							ramp.steps[4],
						],
						"heatmap-opacity": dark ? 0.72 : 0.78,
					},
				});
			}
			if (stayArea) {
				map.addSource("stay", {
					type: "geojson",
					data: { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [geohashRing(stayArea.geohash)] } },
				});
				map.addLayer({
					id: "stay",
					type: "line",
					source: "stay",
					paint: { "line-color": dark ? "#cde2fb" : "#104281", "line-width": 2, "line-dasharray": [2, 1.5] },
				});
			}
			const lines = [
				...links.map((link) => [
					[link.from.lon, link.from.lat],
					[link.to.lon, link.to.lat],
				]),
				...(route.length > 1 ? [route.map((p) => [p.lon, p.lat])] : []),
			];
			if (lines.length > 0) {
				map.addSource("links", {
					type: "geojson",
					data: {
						type: "FeatureCollection",
						features: lines.map((coordinates) => ({
							type: "Feature",
							properties: {},
							geometry: { type: "LineString", coordinates },
						})),
					},
				});
				map.addLayer({
					id: "links",
					type: "line",
					source: "links",
					layout: { "line-join": "round", "line-cap": "round" },
					paint: { "line-color": dark ? "#8f877c" : "#8a8178", "line-width": 1.5, "line-opacity": 0.8 },
				});
			}
		});

		// Frame every point, leaving room on the right for labels (they hang right
		// of their dot). Refit when the container changes size, until the reader
		// pans or zooms themselves.
		const all = [...points, ...route];
		let userMoved = false;
		map.on("movestart", (event) => {
			if ((event as { originalEvent?: unknown }).originalEvent) userMoved = true;
		});
		const fit = () => {
			const { clientWidth: width, clientHeight: height } = element;
			if (all.length === 0 || width < 80 || height < 80) return;
			if (all.length === 1) {
				map.jumpTo({ center: [all[0].lon, all[0].lat], zoom: 12.5 });
				return;
			}
			const bounds = new LngLatBounds();
			for (const point of all) bounds.extend([point.lon, point.lat]);
			const labelRoom = Math.round(Math.min(150, Math.max(72, width * 0.3)));
			map.fitBounds(bounds, { padding: { top: 36, bottom: 40, left: 24, right: labelRoom }, maxZoom: 14, duration: 0 });
			relabel();
		};
		fit();
		const observer = new ResizeObserver(() => {
			map.resize();
			if (!userMoved) fit();
		});
		observer.observe(element);

		return () => {
			observer.disconnect();
			for (const marker of markers) marker.remove();
			map.remove();
		};
	}, [dark, heat, points, links, route, stayArea]);

	return (
		<div className="map-frame overflow-hidden rounded-[1.375rem] border border-line">
			<div ref={container} style={{ height }} role="img" aria-label={ariaLabel} />
		</div>
	);
}
