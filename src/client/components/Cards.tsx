import type { ReactNode } from "react";
import { km, monthName, percentile } from "../../shared/format.ts";
import type { CityTwin, DupeScore, PlanTargetRef, SpotTwin, TownTwin } from "../../shared/types.ts";
import { localitySubject, PlacePhoto, placeSubject, townSubject, type PhotoSubject } from "./PlacePhoto.tsx";
import { PopularityShift, ScoreMeters, ScorePill } from "./ScoreMeters.tsx";
import { Badge, Icon } from "./ui.tsx";

interface CardActions {
	onPlan: (target: PlanTargetRef) => void;
	busy: boolean;
	selected: boolean;
}

function Traits({ traits }: { traits: string[] }) {
	if (traits.length === 0) return null;
	return (
		<div className="flex flex-wrap gap-1.5">
			{traits.map((trait) => (
				<span key={trait} className="chip text-xs text-ink-2">
					{trait}
				</span>
			))}
		</div>
	);
}

function PlanButton({ onClick, busy, selected, label = "Go like a local" }: { onClick: () => void; busy: boolean; selected: boolean; label?: string }) {
	return (
		<button type="button" className={`btn ${selected ? "btn-quiet" : "btn-outline"} min-h-11 w-full`} onClick={onClick} disabled={busy}>
			{selected ? <Icon name="check" /> : null}
			{selected ? "Planned below" : label}
			{selected ? null : <Icon name="arrow" />}
		</button>
	);
}

/** Photo first, then who it replaces, what it is, and why it scored. */
function TwinCard({
	photo,
	fallback,
	score,
	eyebrow,
	title,
	meta,
	children,
	action,
}: {
	photo: PhotoSubject;
	fallback?: PhotoSubject;
	score: DupeScore;
	eyebrow: string;
	title: string;
	meta: string;
	children: ReactNode;
	action: ReactNode;
}) {
	return (
		<article className="card flex min-w-0 flex-col overflow-hidden">
			<PlacePhoto subject={photo} fallback={fallback} className="aspect-[3/2]">
				<ScorePill score={score} />
			</PlacePhoto>
			<div className="flex flex-1 flex-col gap-4 p-5">
				<header className="space-y-1">
					<p className="text-xs text-muted">{eyebrow}</p>
					<h3 className="font-serif text-[1.75rem] leading-[1.05]">{title}</h3>
					<p className="text-[0.8125rem] text-ink-2">{meta}</p>
				</header>
				{children}
				<div className="mt-auto pt-1">{action}</div>
			</div>
		</article>
	);
}

export function SpotTwinCard({ item, onPlan, busy, selected }: { item: SpotTwin } & CardActions) {
	return (
		<TwinCard
			photo={placeSubject(item.twin)}
			score={item.score}
			eyebrow={`Instead of ${item.original.name}`}
			title={item.twin.name}
			meta={[item.twin.categories[0], item.twin.neighborhood, `${km(item.distanceKm)} away`].filter(Boolean).join(" · ")}
			action={<PlanButton onClick={() => onPlan({ level: "city", itemId: item.id })} busy={busy} selected={selected} />}
		>
			<PopularityShift from={item.original.popularity} to={item.twin.popularity} fromLabel={item.original.name} toLabel={item.twin.name} />
			<ScoreMeters score={item.score} showTotal={false} />
			<Traits traits={item.sharedTraits} />
		</TwinCard>
	);
}

export function TownCard({ item, home, onPlan, busy, selected }: { item: TownTwin; home: string } & CardActions) {
	const region = item.places.find((place) => place.region)?.region;
	return (
		<TwinCard
			photo={townSubject(item)}
			fallback={item.places[0] ? placeSubject(item.places[0]) : undefined}
			score={item.score}
			eyebrow={`Day trip from ${home}`}
			title={item.town.name}
			meta={[region, `${km(item.distanceKm)} away`].filter(Boolean).join(" · ")}
			action={<PlanButton onClick={() => onPlan({ level: "region", itemId: item.id })} busy={busy} selected={selected} label="Plan the day" />}
		>
			<ul className="divide-y divide-line/70 text-sm">
				{item.places.slice(0, 3).map((place) => (
					<li key={place.id} className="flex items-baseline justify-between gap-3 py-1.5">
						<span>{place.name}</span>
						<span className="tabular shrink-0 text-xs text-muted">{percentile(place.popularity)}</span>
					</li>
				))}
			</ul>
			<ScoreMeters score={item.score} showTotal={false} />
			<Traits traits={item.sharedTraits} />
		</TwinCard>
	);
}

export function CityCard({
	item,
	level,
	home,
	homePopularity,
	onPlan,
	busy,
	selected,
}: { item: CityTwin; level: "country" | "world"; home: string; homePopularity?: number } & CardActions) {
	const season = item.season;
	const month = monthName(season?.month);
	const badges = [
		season?.isPeak ? (
			<Badge key="season" tone="warning" title="Qloo month tags">
				Busy in {month}
			</Badge>
		) : season?.isBestMonth ? (
			<Badge key="season" tone="good" title="Qloo month tags">
				{month} is a best month
			</Badge>
		) : season?.isOffSeason ? (
			<Badge key="season" tone="neutral" title="Qloo month tags">
				Off-season in {month}
			</Badge>
		) : null,
		...(season?.events.slice(0, 1).map((event) => (
			<Badge key={event} icon="calendar">
				{event}
			</Badge>
		)) ?? []),
		item.smallCommunity ? (
			<Badge key="small" icon="users">
				Small community, visit gently
			</Badge>
		) : null,
		item.origin === "agent" ? (
			<Badge key="agent" icon="sparkle">
				Proposed by the agent, scored by Qloo
			</Badge>
		) : null,
	].filter(Boolean);
	return (
		<TwinCard
			photo={localitySubject(item.city)}
			fallback={item.highlights[0] ? placeSubject(item.highlights[0]) : undefined}
			score={item.score}
			eyebrow={`Twin of ${home}`}
			title={item.city.name}
			meta={[item.city.region, item.city.country, `${km(item.distanceKm)} away`].filter(Boolean).join(" · ")}
			action={<PlanButton onClick={() => onPlan({ level, itemId: item.id })} busy={busy} selected={selected} />}
		>
			{badges.length > 0 ? <div className="flex flex-wrap gap-1.5">{badges}</div> : null}
			<PopularityShift from={homePopularity} to={item.city.popularity} fromLabel={home} toLabel={item.city.name} />
			<ScoreMeters score={item.score} showTotal={false} />
			<Traits traits={item.sharedTraits} />
			{item.highlights.length > 0 ? (
				<p className="text-[0.8125rem] text-ink-2">
					For you: {item.highlights.slice(0, 3).map((p) => p.name).join(", ")}
				</p>
			) : null}
		</TwinCard>
	);
}
