import { useState, type FormEvent } from "react";
import type { RunModes } from "../../shared/types.ts";
import type { TraceStep } from "../lib/journey.ts";
import { Icon } from "./ui.tsx";

function StepIcon({ status }: { status: TraceStep["status"] }) {
	if (status === "running") return <Icon name="spinner" className="size-4 text-ink-2" />;
	if (status === "error") return <Icon name="alert" className="size-4 text-serious" />;
	return <Icon name="check" className="size-4 text-good" />;
}

export function AgentTrace({
	steps,
	thinking,
	running,
	evidenceCount,
	onShowEvidence,
}: {
	steps: TraceStep[];
	thinking: string;
	running: boolean;
	evidenceCount: number;
	onShowEvidence: () => void;
}) {
	return (
		<section className="card p-4" aria-label="Agent trace" aria-live="polite">
			<div className="mb-3 flex items-center justify-between">
				<h2 className="text-sm font-semibold">What the agent did</h2>
				<button type="button" className="text-xs text-ink-2 underline-offset-2 hover:underline" onClick={onShowEvidence} disabled={evidenceCount === 0}>
					{evidenceCount} Qloo calls
				</button>
			</div>
			{steps.length === 0 && running ? (
				<p className="flex items-center gap-2 text-sm text-ink-2">
					<Icon name="spinner" /> Starting…
				</p>
			) : null}
			<ol className="space-y-2.5">
				{steps.map((step) => (
					<li key={step.id} className="grid grid-cols-[1rem_1fr] gap-2.5 text-sm">
						<span className="mt-0.5">
							<StepIcon status={step.status} />
						</span>
						<span>
							<span className="block">{step.label}</span>
							{step.detail || step.ms !== undefined ? (
								<span className="block text-xs text-muted">
									{[step.detail, step.ms !== undefined ? `${(step.ms / 1000).toFixed(1)} s` : undefined].filter(Boolean).join(" · ")}
								</span>
							) : null}
						</span>
					</li>
				))}
			</ol>
			{running && thinking ? <p className="mt-3 border-t border-line pt-3 text-xs text-muted italic">{thinking.slice(-220)}</p> : null}
		</section>
	);
}

function Paragraph({ text }: { text: string }) {
	if (text.startsWith("› ")) {
		return <p className="ml-6 rounded-2xl rounded-tr-sm bg-wash px-3 py-2 text-sm">{text.slice(2)}</p>;
	}
	return <p className="text-[0.95rem] leading-relaxed">{text}</p>;
}

export function Narrative({ text, running }: { text: string; running: boolean }) {
	const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
	return (
		<section className="card space-y-3 p-4" aria-label="Elsewhere's notes" aria-live="polite">
			<h2 className="text-sm font-semibold">Elsewhere</h2>
			{paragraphs.length === 0 && running ? (
				<div className="space-y-2" aria-hidden="true">
					<div className="h-3 w-11/12 animate-pulse rounded bg-wash" />
					<div className="h-3 w-9/12 animate-pulse rounded bg-wash" />
				</div>
			) : null}
			{paragraphs.map((paragraph, index) => (
				<Paragraph key={`${index}-${paragraph.slice(0, 12)}`} text={paragraph} />
			))}
		</section>
	);
}

export function FollowUp({ modes, busy, onSend }: { modes?: RunModes; busy: boolean; onSend: (message: string) => void }) {
	const [text, setText] = useState("");
	if (modes?.agent !== "claude") {
		return (
			<p className="px-1 text-xs text-muted">
				This deployment runs the scripted planner. Free-form follow-ups switch on with the language model; meanwhile, use the plan controls on each card.
			</p>
		);
	}
	const submit = (event: FormEvent) => {
		event.preventDefault();
		if (!text.trim()) return;
		onSend(text.trim());
		setText("");
	};
	return (
		<form onSubmit={submit} className="card flex items-center gap-2 p-2">
			<input
				className="flex-1 bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted"
				placeholder="Even quieter? Add a jazz bar? Ask away…"
				value={text}
				onChange={(event) => setText(event.target.value)}
				aria-label="Ask Elsewhere to adjust the plan"
			/>
			<button type="submit" className="btn btn-primary px-3 py-1.5" disabled={busy || !text.trim()} aria-label="Send">
				{busy ? <Icon name="spinner" /> : <Icon name="arrow" />}
			</button>
		</form>
	);
}
