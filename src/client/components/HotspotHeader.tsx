import { monthName, percentile } from "../../shared/format.ts";
import type { Hotspot } from "../../shared/types.ts";
import { useWikiImage } from "../lib/wiki.ts";
import { CrowdCalendar } from "./CrowdCalendar.tsx";
import { Badge } from "./ui.tsx";

export function HotspotHeader({ hotspot }: { hotspot: Hotspot }) {
	const { locality, season } = hotspot;
	const image = useWikiImage(locality);
	const month = monthName(season.month);
	const peakNames = season.peakMonths.map(monthName).filter(Boolean);

	return (
		<header className="card overflow-hidden">
			<div className="grid md:grid-cols-[1fr_18rem]">
				<div className="space-y-4 p-6">
					<div className="space-y-1">
						<p className="eyebrow">You planned</p>
						<h1 className="font-serif text-4xl leading-tight sm:text-5xl">
							{locality.name}
							{month ? <span className="text-ink-2"> in {month}</span> : null}
						</h1>
						{locality.country ? <p className="text-sm text-ink-2">{locality.disambiguation ?? locality.country}</p> : null}
					</div>
					<div className="flex flex-wrap gap-2">
						{season.isPeak ? (
							<Badge tone="warning" title={`Qloo tags ${peakNames.join(", ")} as peak tourism months`}>
								Peak season
							</Badge>
						) : season.isOffSeason ? (
							<Badge tone="good">Off-season</Badge>
						) : null}
						{locality.popularity !== undefined ? <Badge>{percentile(locality.popularity)} popularity percentile</Badge> : null}
						{season.events.slice(0, 2).map((event) => (
							<Badge key={event} icon="calendar">
								{event}
							</Badge>
						))}
					</div>
					<CrowdCalendar season={season} trend={hotspot.trend} place={locality.name} />
					{hotspot.crowdedSpots.length > 0 ? (
						<div className="space-y-1.5">
							<p className="text-xs text-muted">Crowded must-sees</p>
							<ul className="flex flex-wrap gap-1.5">
								{hotspot.crowdedSpots.map((spot) => (
									<li key={spot.id} className="chip">
										<span className="inline-block size-2 rounded-full bg-viz-muted" />
										{spot.name}
										<span className="text-muted">{percentile(spot.popularity)}</span>
									</li>
								))}
							</ul>
						</div>
					) : null}
					{hotspot.tasteProfile.length + hotspot.vibeTags.length > 0 ? (
						<div className="space-y-1.5">
							<p className="text-xs text-muted">Your taste</p>
							<ul className="flex flex-wrap gap-1.5">
								{hotspot.tasteProfile.map((entity) => (
									<li key={entity.id} className="chip">
										{entity.name}
										<span className="text-muted">{entity.kind.replace("_", " ")}</span>
									</li>
								))}
								{hotspot.vibeTags.map((tag) => (
									<li key={tag.id} className="chip">
										{tag.name}
									</li>
								))}
							</ul>
						</div>
					) : null}
				</div>
				<div className="relative hidden min-h-56 bg-wash md:block">
					{image ? (
						<>
							<img src={image.url} alt="" className="absolute inset-0 size-full object-cover" />
							<a href={image.pageUrl} target="_blank" rel="noreferrer" className="absolute right-2 bottom-2 rounded bg-black/55 px-1.5 py-0.5 text-[10px] text-white">
								Wikipedia
							</a>
						</>
					) : null}
				</div>
			</div>
		</header>
	);
}
