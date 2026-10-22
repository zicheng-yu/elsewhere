import type { ReactNode } from "react";
import { monthName, percentile } from "../../shared/format.ts";
import type { Hotspot } from "../../shared/types.ts";
import { CrowdCalendar } from "./CrowdCalendar.tsx";
import { localitySubject, PlacePhoto, placeSubject } from "./PlacePhoto.tsx";
import { Icon } from "./ui.tsx";

/** A pill that sits on the photo: solid for the season, glass for facts. */
function HeroPill({ children, dot, title }: { children: ReactNode; dot?: string; title?: string }) {
	return dot ? (
		<span title={title} className="inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-[0.8125rem] font-medium text-[#18181b]">
			<span className={`size-2 rounded-full ${dot}`} />
			{children}
		</span>
	) : (
		<span title={title} className="inline-flex items-center gap-1.5 rounded-full border border-white/35 bg-white/15 px-3 py-1.5 text-[0.8125rem] text-white">
			{children}
		</span>
	);
}

export function HotspotHeader({ hotspot }: { hotspot: Hotspot }) {
	const { locality, season } = hotspot;
	const month = monthName(season.month);
	const peakNames = season.peakMonths.map(monthName).filter(Boolean);
	const bestNames = season.bestMonths.map(monthName).filter(Boolean);
	const hasTaste = hotspot.tasteProfile.length + hotspot.vibeTags.length > 0;

	return (
		<header className="space-y-4">
			<PlacePhoto
				subject={localitySubject(locality)}
				fallback={hotspot.crowdedSpots[0] ? placeSubject(hotspot.crowdedSpots[0]) : undefined}
				dark
				eager
				credit="top-right"
				className="h-[clamp(26rem,34vw,28.75rem)] rounded-[1.75rem]"
			>
				<div
					className="absolute inset-0"
					style={{ background: "linear-gradient(to top, rgb(14 11 9 / 0.8), rgb(14 11 9 / 0.45) 50%, rgb(14 11 9 / 0.12) 80%, transparent)" }}
				/>
				<div className="absolute inset-x-0 bottom-0 space-y-3 p-5 text-white sm:p-9">
					<p className="text-[0.8125rem] text-white/85">You planned</p>
					<h1 className="font-serif text-[3.25rem] leading-[0.92] tracking-[-0.01em] sm:text-7xl lg:text-[5.5rem]">
						{locality.name}
						{month ? <em> in {month}</em> : null}
					</h1>
					{locality.disambiguation || locality.country ? (
						<p className="text-[0.95rem] text-white/90">{locality.disambiguation ?? locality.country}</p>
					) : null}
					<div className="flex flex-wrap gap-2 pt-1">
						{season.isPeak ? (
							<HeroPill dot="bg-warning" title={`Qloo tags ${peakNames.join(", ")} as peak tourism months`}>
								Peak season
							</HeroPill>
						) : season.isOffSeason ? (
							<HeroPill dot="bg-good">Off-season</HeroPill>
						) : null}
						{locality.popularity !== undefined ? <HeroPill>{percentile(locality.popularity)} popularity percentile</HeroPill> : null}
						{bestNames.length > 0 && !season.isBestMonth ? <HeroPill>Best in {bestNames.join(" and ")}</HeroPill> : null}
						{season.events.slice(0, 2).map((event) => (
							<HeroPill key={event}>
								<Icon name="calendar" className="size-3.5" />
								{event}
							</HeroPill>
						))}
					</div>
				</div>
			</PlacePhoto>

			<div className={`grid gap-4 md:grid-cols-2 ${hasTaste ? "xl:grid-cols-3" : ""}`}>
				{season.peakMonths.length + season.bestMonths.length + season.worstMonths.length + season.offSeasonMonths.length > 0 ? (
					<section className="card space-y-4 p-5" aria-labelledby="crowd-title">
						<h2 id="crowd-title" className="text-[0.95rem] font-semibold">
							When it's busiest
						</h2>
						<CrowdCalendar season={season} place={locality.name} />
					</section>
				) : null}

				{hotspot.crowdedSpots.length > 0 ? (
					<section className="card space-y-2 p-5" aria-labelledby="crowded-title">
						<div className="flex items-baseline justify-between gap-3">
							<h2 id="crowded-title" className="text-[0.95rem] font-semibold">
								Crowded must-sees
							</h2>
							<span className="text-xs text-muted">Popularity</span>
						</div>
						<ul className="divide-y divide-line/70">
							{hotspot.crowdedSpots.map((spot) => (
								<li key={spot.id} className="flex items-center gap-3 py-2.5">
									<PlacePhoto subject={placeSubject(spot)} stamp="icon" credit={false} className="size-10 shrink-0 rounded-[0.625rem]" />
									<span className="min-w-0 flex-1 text-sm">{spot.name}</span>
									<span className="tabular text-[0.8125rem]">{percentile(spot.popularity)}</span>
								</li>
							))}
						</ul>
					</section>
				) : null}

				{hasTaste ? (
					<section className="card space-y-3 p-5" aria-labelledby="taste-title">
						<h2 id="taste-title" className="text-[0.95rem] font-semibold">
							Your taste
						</h2>
						<ul className="flex flex-wrap gap-1.5">
							{hotspot.tasteProfile.map((entity) => (
								<li key={entity.id} className="chip">
									{entity.name}
									<span className="text-muted">{entity.kind.replace("_", " ")}</span>
								</li>
							))}
							{hotspot.vibeTags.map((tag) => (
								<li key={tag.id} className="rounded-full border border-line px-3 py-1 text-[0.8125rem] text-ink-2">
									{tag.name}
								</li>
							))}
						</ul>
						<p className="text-[0.8125rem] leading-relaxed text-ink-2">
							Qloo maps these across film, music, books and places, then re-ranks every alternative by them.
						</p>
					</section>
				) : null}
			</div>
		</header>
	);
}
