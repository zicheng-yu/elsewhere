/**
 * Deterministic planner used when no LLM key is configured (and as a fallback).
 * It calls the same tools as the Claude agent, in a fixed order, with template
 * narration.
 */
import { ZOOM_LEVELS, type PlanPrefs, type PlanTargetRef, type ZoomLevel } from "../../shared/types.ts";
import { narrateHotspot, narratePlan, narrateZoom } from "../narrate.ts";
import { findDupesTool, planLocalTool, resolveTripTool, type ToolContext } from "./tools.ts";

function say(ctx: ToolContext, text: string): void {
	if (!text) return;
	ctx.state.narrative.push(text);
	ctx.emit({ type: "text.delta", text: `${text}\n\n` });
}

export function defaultZooms(flexibility: "booked" | "flexible"): ZoomLevel[] {
	return flexibility === "booked" ? ["city", "region"] : ["city", "region", "country", "world"];
}

export async function runScriptedJourney(ctx: ToolContext): Promise<void> {
	const request = ctx.state.request;
	await resolveTripTool(ctx, request);
	const hotspot = ctx.state.hotspot;
	if (!hotspot) return;
	say(ctx, narrateHotspot(hotspot));

	const order = ZOOM_LEVELS.map((z) => z.id);
	const levels = [...new Set(request.zooms?.length ? request.zooms : defaultZooms(request.flexibility))].sort(
		(a, b) => order.indexOf(a) - order.indexOf(b),
	);
	// Run the levels concurrently (each lands on screen as soon as it is ready),
	// but narrate them in reading order: nearest first.
	const runs = levels.map((level) =>
		findDupesTool(ctx, { level }).then(
			() => undefined,
			(error: unknown) => error,
		),
	);
	for (const [index, level] of levels.entries()) {
		const error = await runs[index];
		if (error !== undefined) {
			ctx.emit({
				type: "error",
				message: `Couldn't compute the ${level} level: ${error instanceof Error ? error.message : String(error)}`,
				recoverable: true,
			});
			continue;
		}
		const result = ctx.state.zooms.find((z) => z.level === level);
		if (result) say(ctx, narrateZoom(result, hotspot));
	}
	say(ctx, "Pick any alternative and choose “Go like a local” for a day-by-day plan.");
}

export async function runScriptedPlan(ctx: ToolContext, target: PlanTargetRef, prefs: PlanPrefs): Promise<void> {
	await planLocalTool(ctx, { ...target, ...prefs });
	if (ctx.state.plan) say(ctx, narratePlan(ctx.state.plan));
}
