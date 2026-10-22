import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { api, type Suggestion, type SuggestionKind } from "../lib/api.ts";

function useSuggestions(kind: SuggestionKind, query: string, near?: { lat: number; lon: number }) {
	const [items, setItems] = useState<Suggestion[]>([]);
	useEffect(() => {
		const q = query.trim();
		if (q.length < 2) {
			setItems([]);
			return;
		}
		const controller = new AbortController();
		const timer = setTimeout(() => {
			api
				.search(kind, q, near, controller.signal)
				.then(setItems)
				.catch(() => undefined);
		}, 220);
		return () => {
			clearTimeout(timer);
			controller.abort();
		};
	}, [kind, query, near?.lat, near?.lon]);
	return items;
}

interface ComboboxProps {
	kind: SuggestionKind;
	value: string;
	onValueChange: (value: string) => void;
	onPick: (suggestion: Suggestion | string) => void;
	placeholder?: string;
	near?: { lat: number; lon: number };
	inputId?: string;
	onBackspaceEmpty?: () => void;
	ariaLabel?: string;
	inputClassName?: string;
}

/** Text input with a suggestion listbox (ARIA combobox pattern). Enter picks the highlighted item or the typed text. */
export function Combobox({
	kind,
	value,
	onValueChange,
	onPick,
	placeholder,
	near,
	inputId,
	onBackspaceEmpty,
	ariaLabel,
	inputClassName = "py-0.5 text-[0.95rem]",
}: ComboboxProps) {
	const suggestions = useSuggestions(kind, value, near);
	const [open, setOpen] = useState(false);
	const [active, setActive] = useState(-1);
	const listId = useId();
	const blurTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const show = open && suggestions.length > 0;

	const pick = (item: Suggestion | string) => {
		onPick(item);
		setOpen(false);
		setActive(-1);
	};

	const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "ArrowDown" && suggestions.length > 0) {
			event.preventDefault();
			setOpen(true);
			setActive((i) => (i + 1) % suggestions.length);
		} else if (event.key === "ArrowUp" && suggestions.length > 0) {
			event.preventDefault();
			setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
		} else if (event.key === "Enter") {
			event.preventDefault();
			const highlighted = show && active >= 0 ? suggestions[active] : undefined;
			if (highlighted) pick(highlighted);
			else if (value.trim()) pick(value.trim());
		} else if (event.key === "Escape") {
			setOpen(false);
		} else if (event.key === "Backspace" && value === "") {
			onBackspaceEmpty?.();
		}
	};

	return (
		<div className="relative flex-1">
			<input
				id={inputId}
				role="combobox"
				aria-label={ariaLabel}
				aria-expanded={show}
				aria-controls={listId}
				aria-autocomplete="list"
				aria-activedescendant={show && active >= 0 ? `${listId}-${active}` : undefined}
				className={`w-full min-w-[8rem] bg-transparent outline-none placeholder:text-muted ${inputClassName}`}
				value={value}
				placeholder={placeholder}
				onChange={(event) => {
					onValueChange(event.target.value);
					setOpen(true);
					setActive(-1);
				}}
				onFocus={() => setOpen(true)}
				onBlur={() => {
					blurTimer.current = setTimeout(() => setOpen(false), 120);
				}}
				onKeyDown={onKeyDown}
			/>
			{show ? (
				<ul
					id={listId}
					role="listbox"
					className="absolute top-full right-0 left-0 z-30 mt-2 max-h-72 min-w-[16rem] overflow-auto rounded-2xl border border-line bg-card p-1 shadow-lg"
				>
					{suggestions.map((item, index) => (
						<li
							key={item.id}
							id={`${listId}-${index}`}
							role="option"
							aria-selected={index === active}
							className={`cursor-pointer rounded-xl px-3 py-2 text-sm ${index === active ? "bg-wash" : ""}`}
							onMouseDown={(event) => {
								event.preventDefault();
								clearTimeout(blurTimer.current);
								pick(item);
							}}
							onMouseEnter={() => setActive(index)}
						>
							<span className="block">{item.name}</span>
							{item.subtitle ? <span className="block text-xs text-muted">{item.subtitle}</span> : null}
						</li>
					))}
				</ul>
			) : null}
		</div>
	);
}

/** Multi-value chip input backed by the combobox. */
export function ChipInput({
	kind,
	label,
	values,
	onChange,
	placeholder,
	near,
	max = 6,
	quickPicks = [],
	hint,
}: {
	kind: SuggestionKind;
	label: string;
	values: string[];
	onChange: (values: string[]) => void;
	placeholder?: string;
	near?: { lat: number; lon: number };
	max?: number;
	quickPicks?: string[];
	hint?: string;
}) {
	const [text, setText] = useState("");
	const id = useId();
	const add = (item: Suggestion | string) => {
		const name = typeof item === "string" ? item : item.name;
		if (!name || values.some((v) => v.toLowerCase() === name.toLowerCase()) || values.length >= max) return;
		onChange([...values, name]);
		setText("");
	};
	const remaining = quickPicks.filter((pick) => !values.includes(pick));
	return (
		<div>
			<label className="field-label" htmlFor={id}>
				{label}
			</label>
			<div className="input flex flex-wrap items-center gap-1.5">
				{values.map((value) => (
					<span key={value} className="chip">
						{value}
						<button
							type="button"
							className="text-muted hover:text-ink"
							aria-label={`Remove ${value}`}
							onClick={() => onChange(values.filter((v) => v !== value))}
						>
							×
						</button>
					</span>
				))}
				{values.length < max ? (
					<Combobox
						kind={kind}
						inputId={id}
						value={text}
						onValueChange={setText}
						onPick={add}
						placeholder={values.length === 0 ? placeholder : "Add another"}
						near={near}
						onBackspaceEmpty={() => onChange(values.slice(0, -1))}
					/>
				) : null}
			</div>
			{hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
			{remaining.length > 0 && values.length < max ? (
				<div className="mt-2 flex flex-wrap gap-1.5">
					{remaining.slice(0, 8).map((pick) => (
						<button
							key={pick}
							type="button"
							className="rounded-full border border-line px-3 py-1 text-[0.8125rem] text-ink-2 hover:border-ink hover:text-ink"
							onClick={() => add(pick)}
						>
							+ {pick}
						</button>
					))}
				</div>
			) : null}
		</div>
	);
}
