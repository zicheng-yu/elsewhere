import { useEffect, useState } from "react";

export type Route = { name: "home" } | { name: "journey"; id: string };

function parse(pathname: string): Route {
	const match = /^\/j\/([0-9a-f-]{36})\/?$/i.exec(pathname);
	return match?.[1] ? { name: "journey", id: match[1] } : { name: "home" };
}

export function navigate(path: string, replace = false): void {
	if (window.location.pathname === path) return;
	if (replace) window.history.replaceState(null, "", path);
	else window.history.pushState(null, "", path);
	window.dispatchEvent(new PopStateEvent("popstate"));
}

export function useRoute(): Route {
	const [route, setRoute] = useState<Route>(() => parse(window.location.pathname));
	useEffect(() => {
		const onChange = () => setRoute(parse(window.location.pathname));
		window.addEventListener("popstate", onChange);
		return () => window.removeEventListener("popstate", onChange);
	}, []);
	return route;
}
