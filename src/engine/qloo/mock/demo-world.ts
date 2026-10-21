import { ASIA_LOCALITIES, ASIA_PLACES } from "./world-data-asia.ts";
import { EUROPE_LOCALITIES, EUROPE_PLACES } from "./world-data-europe.ts";
import { TASTES } from "./world-taste.ts";
import { WorldIndex } from "./world.ts";

let world: WorldIndex | undefined;

/** The SYNTHETIC demo world (built once per isolate; immutable afterwards). */
export function demoWorld(): WorldIndex {
	world ??= new WorldIndex({
		localities: [...ASIA_LOCALITIES, ...EUROPE_LOCALITIES],
		places: [...ASIA_PLACES, ...EUROPE_PLACES],
		tastes: TASTES,
	});
	return world;
}
