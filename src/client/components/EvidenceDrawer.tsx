import { useEffect, useRef } from "react";
import type { Evidence } from "../../shared/types.ts";
import { Icon } from "./ui.tsx";

const KEY_PARAMS = [
	"filter.type",
	"query",
	"signal.interests.entities",
	"signal.interests.tags",
	"filter.location",
	"filter.location.radius",
	"filter.exclude.location",
	"filter.popularity.max",
	"filter.tags",
	"filter.results.entities",
	"sort_by",
	"take",
];

function shortValue(value: string): string {
	const parts = value.split(",");
	const text = parts.length > 3 ? `${parts.slice(0, 3).join(",")} +${parts.length - 3}` : value;
	return text.length > 64 ? `${text.slice(0, 61)}…` : text;
}

/** Every Qloo request behind the results, so each recommendation is auditable. */
export function EvidenceDrawer({ open, evidence, mock, onClose }: { open: boolean; evidence: Evidence[]; mock: boolean; onClose: () => void }) {
	const dialog = useRef<HTMLDialogElement>(null);
	useEffect(() => {
		const node = dialog.current;
		if (!node) return;
		if (open && !node.open) node.showModal();
		if (!open && node.open) node.close();
	}, [open]);

	return (
		<dialog
			ref={dialog}
			onClose={onClose}
			className="m-auto max-h-[85vh] w-[min(56rem,calc(100vw-2rem))] rounded-2xl border border-line bg-card p-0 text-ink backdrop:bg-black/40"
			aria-label="Qloo evidence"
		>
			<div className="flex items-center justify-between border-b border-line px-5 py-4">
				<div>
					<h2 className="font-serif text-xl">Evidence</h2>
					<p className="text-xs text-muted">
						{evidence.length} requests to the Qloo API{mock ? " (synthetic demo data in this deployment)" : ""}. Responses are cached privately on the server.
					</p>
				</div>
				<button type="button" className="btn btn-quiet px-2.5" onClick={onClose} aria-label="Close">
					<Icon name="x" />
				</button>
			</div>
			<div className="max-h-[65vh] overflow-auto px-5 py-3">
				<table className="w-full text-left text-xs">
					<thead className="text-muted">
						<tr>
							<th className="py-2 pr-3 font-medium">Endpoint</th>
							<th className="py-2 pr-3 font-medium">Key parameters</th>
							<th className="py-2 pr-3 text-right font-medium">Results</th>
							<th className="py-2 text-right font-medium">Time</th>
						</tr>
					</thead>
					<tbody className="tabular">
						{evidence.map((item) => (
							<tr key={item.id} className="border-t border-line align-top">
								<td className="py-2 pr-3 font-mono">{item.endpoint}</td>
								<td className="py-2 pr-3">
									{item.note ? <p className="mb-1 text-ink-2">{item.note}</p> : null}
									<ul className="space-y-0.5 font-mono text-[11px] text-muted">
										{KEY_PARAMS.filter((key) => item.params[key]).map((key) => (
											<li key={key}>
												{key}={shortValue(item.params[key] ?? "")}
											</li>
										))}
									</ul>
								</td>
								<td className="py-2 pr-3 text-right">{item.ok ? item.resultCount : "error"}</td>
								<td className="py-2 text-right text-muted">{item.cached ? "cached" : `${item.ms} ms`}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</dialog>
	);
}
