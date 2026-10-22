import { useState } from "react";
import type { TripRequest } from "../../shared/types.ts";
import { api } from "../lib/api.ts";
import { Icon } from "./ui.tsx";

/** The same model without Qloo: shows what taste data adds. */
export function BaselinePanel({ request }: { request?: TripRequest }) {
	const [state, setState] = useState<{ status: "idle" | "loading" | "done"; text?: string; reason?: string }>({ status: "idle" });
	if (!request) return null;

	const run = async () => {
		setState({ status: "loading" });
		try {
			const result = await api.baseline(request);
			setState({ status: "done", text: result.text, reason: result.available ? undefined : result.reason });
		} catch {
			setState({ status: "done", reason: "The comparison is unavailable right now." });
		}
	};

	return (
		<section className="card space-y-3 p-5" aria-label="Comparison with a plain language model">
			<div className="flex items-center justify-between gap-3">
				<h2 className="text-[0.95rem] font-semibold">Why not just ask an LLM?</h2>
				{state.status === "idle" ? (
					<button type="button" className="btn btn-quiet px-3 py-1 text-xs" onClick={run}>
						Compare
					</button>
				) : null}
			</div>
			{state.status === "idle" ? (
				<p className="text-xs text-muted">Ask the same model the same question, without Qloo's taste graph.</p>
			) : null}
			{state.status === "loading" ? (
				<p className="flex items-center gap-2 text-sm text-ink-2">
					<Icon name="spinner" /> Asking the model without Qloo…
				</p>
			) : null}
			{state.reason ? <p className="text-sm text-ink-2">{state.reason}</p> : null}
			{state.text ? (
				<div className="space-y-2">
					<p className="text-xs text-muted">Same model, no Qloo tools, no evidence:</p>
					<div className="max-h-72 space-y-2 overflow-auto rounded-2xl bg-wash p-3 text-sm">
						{state.text.replace(/\*\*/g, "").split(/\n{2,}/).map((paragraph) => (
							<p key={paragraph.slice(0, 24)}>{paragraph}</p>
						))}
					</div>
				</div>
			) : null}
		</section>
	);
}
