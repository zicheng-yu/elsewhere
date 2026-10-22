/**
 * Ad-hoc Qloo queries for tuning, with a compact summary of each entity.
 *
 *   node --env-file=.dev.vars scripts/qloo.ts /v2/insights filter.type=urn:entity:place signal.interests.entities=<id> take=10
 *
 * Repeat a key to send a list (comma-joined). --json prints the first raw entity.
 * Responses are cached in the git-ignored .qloo-cache/http/.
 */
import { LiveTransport, QlooClient, type QlooParams } from "../src/engine/qloo/client.ts";
import { FileCache } from "./lib/file-cache.ts";

const apiKey = process.env.QLOO_API_KEY;
if (!apiKey) {
	console.error("Set QLOO_API_KEY (e.g. node --env-file=.dev.vars ...).");
	process.exit(1);
}
const [path, ...rest] = process.argv.slice(2);
if (!path) {
	console.error("Usage: scripts/qloo.ts <path> key=value ...");
	process.exit(1);
}
const params: Record<string, string[]> = {};
for (const arg of rest.filter((a) => !a.startsWith("--"))) {
	const [key, ...value] = arg.split("=");
	if (key) (params[key] ??= []).push(value.join("="));
}
const client = new QlooClient({ transport: new LiveTransport({ apiKey }), cache: new FileCache() });
const data = (await client.get(path, Object.fromEntries(Object.entries(params).map(([k, v]) => [k, v.length > 1 ? v : v[0]])) as QlooParams)) as Record<string, unknown>;

type Entity = Record<string, any>;
const results = data.results as Entity | Entity[] | undefined;
const list: Entity[] = Array.isArray(results) ? results : (results?.entities ?? results?.heatmap ?? results?.tags ?? []);
if (data.warnings) console.log("warnings:", JSON.stringify(data.warnings));
console.log(`${list.length} results · ${JSON.stringify(data).length.toLocaleString()} bytes`);
if (rest.includes("--json")) console.log(JSON.stringify(list[0], null, 1).slice(0, 6000));

const tagId = (t: Entity) => t.tag_id ?? t.id ?? "";
for (const e of list.slice(0, 50)) {
	const p = e.properties ?? {};
	const q = e.query ?? {};
	const latin = (p.akas ?? []).find((a: Entity) => a.language === "en")?.value ?? (p.akas ?? []).find((a: Entity) => /^[\x20-\x7eÀ-ɏ]+$/.test(a.value ?? "") && a.language)?.value;
	const cats = (e.tags ?? []).filter((t: Entity) => /category:place|genre:locality/.test(tagId(t))).map((t: Entity) => tagId(t).split(":").pop());
	const months = (e.tags ?? []).filter((t: Entity) => /month|season/.test(tagId(t))).map((t: Entity) => tagId(t).replace("urn:tag:", ""));
	const country = (p.ancestors ?? []).find((a: Entity) => a.place === "country")?.name;
	const fields = [
		(e.name ?? e.tag_id ?? e.location?.geohash ?? "?").toString().slice(0, 40).padEnd(40),
		e.entity_id ?? e.id ?? "",
		e.popularity !== undefined ? `pop ${Number(e.popularity).toFixed(4)}` : "",
		q.affinity !== undefined ? `aff ${Number(q.affinity).toFixed(3)}` : "",
		q.distance !== undefined ? `${(q.distance / 1000).toFixed(1)} km` : "",
		p.place ? `place=${p.place}/${p.admin_level}` : "",
		latin ? `aka=${latin}` : "",
		country ? `country=${country}` : "",
		p.geocode ? `${p.geocode.city ?? "?"}, ${p.geocode.country_code ?? "?"}` : "",
		p.primary_genre?.id ? `genre=${p.primary_genre.id.split(":").pop()}` : "",
		cats.length ? `cats=${cats.slice(0, 5).join("|")}` : "",
		months.length ? `months=${months.slice(0, 6).join("|")}` : "",
		e.type && !e.entity_id ? `type=${e.type}` : "",
	];
	console.log(fields.filter(Boolean).join("  "));
}
