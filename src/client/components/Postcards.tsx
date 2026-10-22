import { HERO_COVERS } from "../lib/covers.ts";
import { Icon } from "./ui.tsx";

/** The home page's idea in one picture: the crowded classic, and its quiet twin as a postcard. */
export function Postcards() {
	const { crowded, twin } = HERO_COVERS;
	return (
		<figure className="relative mx-auto h-[32rem] w-full max-w-[36rem] sm:h-[37rem]">
			<div className="absolute top-0 right-0 h-[85%] w-[86%] overflow-hidden rounded-[1.75rem] bg-frame">
				<img src={crowded.url} alt={crowded.alt} className="size-full object-cover" fetchPriority="high" />
				<div className="absolute inset-x-4 top-4 flex flex-wrap justify-between gap-2">
					<span className="inline-flex items-center gap-2 rounded-full bg-card/95 px-3 py-1.5 text-[0.8125rem] font-medium text-ink">
						<span className="size-2 rounded-full bg-viz-muted" />
						Fushimi Inari Taisha
					</span>
					<span className="rounded-full bg-black/65 px-3 py-1.5 text-[0.8125rem] text-white">Where everyone goes</span>
				</div>
				<a href={crowded.pageUrl} target="_blank" rel="noreferrer" className="photo-credit right-3 bottom-3">
					Wikipedia
				</a>
			</div>

			<div className="absolute bottom-0 left-0 w-1/2 -rotate-[2.5deg] rounded-[1.25rem] bg-card p-2.5 pb-4 shadow-[0_0_0_1px_rgb(24_24_27/0.06),0_24px_48px_-16px_rgb(24_24_27/0.35)]">
				<div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-frame">
					<img src={twin.url} alt={twin.alt} className="size-full object-cover" />
					<a href={twin.pageUrl} target="_blank" rel="noreferrer" className="photo-credit right-2 bottom-2">
						Wikipedia
					</a>
				</div>
				<figcaption className="space-y-1 px-1.5 pt-3">
					<span className="flex items-center gap-1.5 text-xs text-ink-2">
						<span className="size-2 rounded-full bg-accent" />
						Quiet twin, 17 km north
					</span>
					<span className="block font-serif text-[1.65rem] leading-none">Kurama-dera</span>
					<span className="block text-xs text-muted">A mountain temple above Kyoto</span>
				</figcaption>
			</div>

			<span className="absolute bottom-[10.5rem] left-[44%] inline-flex items-center gap-2 rounded-full bg-ink px-3.5 py-2 text-[0.8125rem] font-medium text-paper shadow-[0_12px_24px_-10px_rgb(24_24_27/0.5)]">
				<Icon name="sparkle" className="size-3.5" />
				Same soul
			</span>
		</figure>
	);
}
