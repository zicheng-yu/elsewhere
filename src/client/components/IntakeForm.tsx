import { useState, type FormEvent } from "react";
import { MONTH_NAMES, ZOOM_LEVELS, type TripRequest, type ZoomLevel } from "../../shared/types.ts";
import type { Suggestion } from "../lib/api.ts";
import { ChipInput, Combobox } from "./Autocomplete.tsx";
import { Icon } from "./ui.tsx";

const VIBE_PICKS = ["quiet", "matcha", "temples", "jazz", "street food", "markets", "natural wine", "hiking", "art", "architecture"];

const DEFAULT_ZOOMS: Record<TripRequest["flexibility"], ZoomLevel[]> = {
	booked: ["city", "region"],
	flexible: ["city", "region", "country", "world"],
};

export function IntakeForm({ onSubmit, busy }: { onSubmit: (request: TripRequest) => void; busy: boolean }) {
	const [destination, setDestination] = useState("");
	const [near, setNear] = useState<{ lat: number; lon: number } | undefined>();
	const [month, setMonth] = useState<number | undefined>(new Date().getMonth() + 2 > 12 ? 1 : new Date().getMonth() + 2);
	const [mustSees, setMustSees] = useState<string[]>([]);
	const [favorites, setFavorites] = useState<string[]>([]);
	const [vibes, setVibes] = useState<string[]>([]);
	const [flexibility, setFlexibility] = useState<TripRequest["flexibility"]>("booked");
	const [zooms, setZooms] = useState<ZoomLevel[]>(DEFAULT_ZOOMS.booked);

	const pickDestination = (item: Suggestion | string) => {
		if (typeof item === "string") {
			setDestination(item);
			setNear(undefined);
		} else {
			setDestination(item.name);
			setNear(item.lat !== undefined && item.lon !== undefined ? { lat: item.lat, lon: item.lon } : undefined);
		}
	};

	const submit = (event: FormEvent) => {
		event.preventDefault();
		if (!destination.trim()) return;
		onSubmit({ destination: destination.trim(), month, mustSees, favorites, vibes, flexibility, zooms });
	};

	const toggleZoom = (level: ZoomLevel) =>
		setZooms((current) => (current.includes(level) ? current.filter((z) => z !== level) : [...current, level]));

	return (
		<form onSubmit={submit} className="space-y-6" aria-label="Plan a trip">
			<div className="flex flex-wrap gap-1 rounded-[1.375rem] border border-line bg-card p-1.5 shadow-[0_1px_2px_rgb(24_24_27/0.04),0_12px_32px_-16px_rgb(24_24_27/0.2)]">
				<div className="min-w-0 flex-[2_1_13rem] rounded-2xl px-4 py-2.5 focus-within:bg-wash">
					<label className="block text-xs font-medium text-ink-2" htmlFor="destination">
						Where were you headed?
					</label>
					<Combobox
						kind="destination"
						inputId="destination"
						value={destination}
						onValueChange={(value) => {
							setDestination(value);
							setNear(undefined);
						}}
						onPick={pickDestination}
						placeholder="Kyoto, Venice, Barcelona…"
						inputClassName="py-0.5 text-[1.05rem] font-medium"
					/>
				</div>
				<div className="min-w-0 flex-[1_1_8rem] rounded-2xl px-4 py-2.5 focus-within:bg-wash sm:border-l sm:border-line">
					<label className="block text-xs font-medium text-ink-2" htmlFor="month">
						When?
					</label>
					<select
						id="month"
						className="w-full cursor-pointer bg-transparent py-0.5 text-[1.05rem] font-medium outline-none"
						value={month ?? ""}
						onChange={(event) => setMonth(event.target.value ? Number(event.target.value) : undefined)}
					>
						<option value="">Any time</option>
						{MONTH_NAMES.map((name, index) => (
							<option key={name} value={index + 1}>
								{name}
							</option>
						))}
					</select>
				</div>
				<button
					type="submit"
					className="btn btn-primary min-h-14 flex-[1_0_auto] rounded-2xl px-6 text-[0.95rem] font-semibold"
					disabled={busy || !destination.trim() || zooms.length === 0}
				>
					{busy ? <Icon name="spinner" /> : <Icon name="search" />}
					Find my elsewhere
				</button>
			</div>

			<div className="space-y-4">
				<ChipInput
					kind="taste"
					label="Things you love"
					values={favorites}
					onChange={setFavorites}
					placeholder="A film, an artist, a book, a chef…"
					hint="Qloo maps your taste across film, music, books and places."
					max={6}
				/>
				<ChipInput kind="vibe" label="Vibes" values={vibes} onChange={setVibes} placeholder="quiet, matcha, jazz…" quickPicks={VIBE_PICKS} max={5} />
			</div>

			<details className="group">
				<summary className="cursor-pointer list-none text-sm text-ink underline decoration-line underline-offset-4 hover:decoration-ink [&::-webkit-details-marker]:hidden">
					More options: must-sees, flexibility, how far you'll go
				</summary>
				<div className="mt-5 space-y-5">
					<ChipInput
						kind="place"
						label="Must-sees you planned"
						values={mustSees}
						onChange={setMustSees}
						near={near}
						placeholder="Fushimi Inari Taisha, Rialto Bridge…"
						hint="Leave empty and Elsewhere will pick the most popular sights."
						max={4}
					/>
					<fieldset className="space-y-3">
						<legend className="field-label">How fixed are your plans?</legend>
						<div className="grid gap-2 sm:grid-cols-2">
							{(
								[
									["booked", "Booked", "Keep this destination; swap spots and add day trips."],
									["flexible", "Flexible", "Also show twin cities, at home and abroad."],
								] as const
							).map(([value, title, text]) => (
								<label
									key={value}
									className={`cursor-pointer rounded-2xl border p-3.5 text-sm ${flexibility === value ? "border-ink bg-wash" : "border-line"}`}
								>
									<input
										type="radio"
										name="flexibility"
										className="sr-only"
										checked={flexibility === value}
										onChange={() => {
											setFlexibility(value);
											setZooms(DEFAULT_ZOOMS[value]);
										}}
									/>
									<span className="block font-medium">{title}</span>
									<span className="text-ink-2">{text}</span>
								</label>
							))}
						</div>
						<div className="segmented" role="group" aria-label="Zoom levels">
							{ZOOM_LEVELS.map((level) => (
								<button key={level.id} type="button" className="segment" aria-pressed={zooms.includes(level.id)} onClick={() => toggleZoom(level.id)}>
									{level.label}
								</button>
							))}
						</div>
					</fieldset>
				</div>
			</details>
		</form>
	);
}
