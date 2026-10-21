import { useEffect, useState } from "react";

type Health = { ok: boolean; qlooMode: string; agentMode: string };

const ZOOM_LEVELS = [
	{ label: "Same city", detail: "Quieter twins of the spots you planned" },
	{ label: "Day trip", detail: "Nearby towns with the same feel" },
	{ label: "Same country", detail: "A twin city, off the beaten path" },
	{ label: "Anywhere", detail: "The same soul, somewhere new" },
];

export function App() {
	const [health, setHealth] = useState<Health | null>(null);

	useEffect(() => {
		fetch("/api/health")
			.then((res) => (res.ok ? (res.json() as Promise<Health>) : null))
			.then(setHealth)
			.catch(() => setHealth(null));
	}, []);

	return (
		<main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-10 px-4 py-16 sm:px-8">
			<header className="space-y-4">
				<p className="text-sm uppercase tracking-[0.2em] text-muted">Elsewhere</p>
				<h1 className="font-serif text-5xl leading-tight sm:text-6xl">
					Same soul,
					<br />
					fewer crowds.
				</h1>
				<p className="max-w-xl text-lg text-muted">
					An agent that finds your taste-matched alternative to overtouristed places, from a
					quieter temple across town to a twin city across the world, then guides you there like
					a local.
				</p>
			</header>

			<ol className="grid gap-3 sm:grid-cols-2">
				{ZOOM_LEVELS.map((level, i) => (
					<li key={level.label} className="rounded-xl border border-line p-4">
						<p className="text-sm text-muted">{i + 1}</p>
						<p className="font-serif text-xl">{level.label}</p>
						<p className="text-sm text-muted">{level.detail}</p>
					</li>
				))}
			</ol>

			<footer className="flex items-center gap-2 text-sm text-muted">
				<span
					className={`inline-block size-2 rounded-full ${health?.ok ? "bg-emerald-500" : "bg-amber-500"}`}
				/>
				{health?.ok
					? `In development · Qloo ${health.qlooMode} · agent ${health.agentMode}`
					: "In development"}
				<span aria-hidden>·</span>
				<span>Built for the Qloo Agentic Hackathon</span>
			</footer>
		</main>
	);
}
