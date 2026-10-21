import { km, monthName, percentile } from "../../shared/format.ts";
import type { CityTwin, PlanTargetRef, SpotTwin, TownTwin } from "../../shared/types.ts";
import { useWikiImage } from "../lib/wiki.ts";
import { PopularityShift, ScoreMeters } from "./ScoreMeters.tsx";
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
				<span key={trait} className="chip text-ink-2">
					{trait}
				</span>
			))}
		</div>
	);
}

function PlanButton({ onClick, busy, selected, label = "Go like a local" }: { onClick: () => void; busy: boolean; selected: boolean; label?: string }) {
	return (
		<button type="button" className={`btn ${selected ? "btn-quiet" : "btn-primary"} w-full`} onClick={onClick} disabled={busy}>
			{selected ? <Icon name="check" /> : <Icon name="arrow" />}
			{selected ? "Planned below" : label}
		</button>
	);
}

export function SpotTwinCard({ item, onPlan, busy, selected }: { item: SpotTwin } & CardActions) {
	return (
		<article className="card flex flex-col gap-4 p-5">
			<header className="space-y-1">
				<p className="text-xs text-muted">Instead of {item.original.name}</p>
				<h3 className="font-serif text-xl leading-snug">{item.twin.name}</h3>
				<p className="text-sm text-ink-2">
					{[item.twin.categories[0], item.twin.neighborhood, `${km(item.distanceKm)} away`].filter(Boolean).join(" · ")}
				</p>
			</header>
			<PopularityShift from={item.original.popularity} to={item.twin.popularity} fromLabel={item.original.name} toLabel={item.twin.name} />
			<ScoreMeters score={item.score} compact />
			<Traits traits={item.sharedTraits} />
			<div className="mt-auto">
				<PlanButton onClick={() => onPlan({ level: "city", itemId: item.id })} busy={busy} selected={selected} />
			</div>
		</article>
	);
}

export function TownCard({ item, home, onPlan, busy, selected }: { item: TownTwin; home: string } & CardActions) {
	return (
		<article className="card flex flex-col gap-4 p-5">
			<header className="space-y-1">
				<p className="text-xs text-muted">Day trip from {home}</p>
				<h3 className="font-serif text-xl leading-snug">{item.town.name}</h3>
				<p className="text-sm text-ink-2">{km(item.distanceKm)} away</p>
			</header>
			<ul className="space-y-1 text-sm">
				{item.places.slice(0, 3).map((place) => (
					<li key={place.id} className="flex items-baseline justify-between gap-3">
						<span>{place.name}</span>
						<span className="shrink-0 text-xs text-muted">{percentile(place.popularity)} pct</span>
					</li>
				))}
			</ul>
			<ScoreMeters score={item.score} compact />
			<Traits traits={item.sharedTraits} />
			<div className="mt-auto">
				<PlanButton onClick={() => onPlan({ level: "region", itemId: item.id })} busy={busy} selected={selected} label="Plan the day" />
			</div>
		</article>
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
	const image = useWikiImage(item.city);
	const month = monthName(item.season.month);
	return (
		<article className="card flex flex-col overflow-hidden">
			<div className="relative h-36 bg-wash">
				{image ? (
					<img src={image.url} alt="" className="size-full object-cover" loading="lazy" />
				) : (
					<div className="grid size-full place-items-center font-serif text-3xl text-muted">{item.city.name.slice(0, 1)}</div>
				)}
				{image ? (
					<a href={image.pageUrl} target="_blank" rel="noreferrer" className="absolute right-2 bottom-2 rounded bg-black/55 px-1.5 py-0.5 text-[10px] text-white">
						Wikipedia
					</a>
				) : null}
			</div>
			<div className="flex flex-1 flex-col gap-4 p-5">
				<header className="space-y-1">
					<p className="text-xs text-muted">Twin of {home}</p>
					<h3 className="font-serif text-xl leading-snug">{item.city.name}</h3>
					<p className="text-sm text-ink-2">{[item.city.country, `${km(item.distanceKm)} away`].filter(Boolean).join(" · ")}</p>
				</header>
				<div className="flex flex-wrap gap-1.5">
					{item.season.isPeak ? (
						<Badge tone="warning" title="Qloo month tags">
							Busy in {month}
						</Badge>
					) : item.season.isBestMonth ? (
						<Badge tone="good" title="Qloo month tags">
							{month} is a best month
						</Badge>
					) : item.season.isOffSeason ? (
						<Badge tone="neutral" title="Qloo month tags">
							Off-season in {month}
						</Badge>
					) : null}
					{item.season.events.slice(0, 1).map((event) => (
						<Badge key={event} icon="calendar">
							{event}
						</Badge>
					))}
					{item.smallCommunity ? <Badge icon="users">Small community, visit gently</Badge> : null}
					{item.origin === "agent" ? <Badge icon="sparkle">Proposed by the agent, scored by Qloo</Badge> : null}
				</div>
				<PopularityShift from={homePopularity} to={item.city.popularity} fromLabel={home} toLabel={item.city.name} />
				<ScoreMeters score={item.score} compact />
				<Traits traits={item.sharedTraits} />
				{item.highlights.length > 0 ? (
					<p className="text-sm text-ink-2">
						For you: {item.highlights.slice(0, 3).map((p) => p.name).join(", ")}
					</p>
				) : null}
				<div className="mt-auto">
					<PlanButton onClick={() => onPlan({ level, itemId: item.id })} busy={busy} selected={selected} />
				</div>
			</div>
		</article>
	);
}
