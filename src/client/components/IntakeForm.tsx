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
		<form onSubmit={submit} className="card space-y-5 p-5 sm:p-6" aria-label="Plan a trip">
			<div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
				<div>
					<label className="field-label" htmlFor="destination">
						Where were you planning to go?
					</label>
					<div className="input">
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
						/>
					</div>
				</div>
				<div>
					<label className="field-label" htmlFor="month">
						When?
					</label>
					<select
						id="month"
						className="input"
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
			</div>

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
							className={`cursor-pointer rounded-xl border p-3 text-sm ${flexibility === value ? "border-ink bg-wash" : "border-line"}`}
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
				<div className="flex flex-wrap gap-2" role="group" aria-label="Zoom levels">
					{ZOOM_LEVELS.map((level) => (
						<button
							key={level.id}
							type="button"
							aria-pressed={zooms.includes(level.id)}
							onClick={() => toggleZoom(level.id)}
							className={`rounded-full border px-3 py-1 text-xs ${zooms.includes(level.id) ? "border-ink bg-ink text-card" : "border-line text-ink-2"}`}
						>
							{level.label}
						</button>
					))}
				</div>
			</fieldset>

			<button type="submit" className="btn btn-primary w-full py-3 text-base" disabled={busy || !destination.trim() || zooms.length === 0}>
				{busy ? <Icon name="spinner" /> : <Icon name="sparkle" />}
				Find my elsewhere
			</button>
		</form>
	);
}
