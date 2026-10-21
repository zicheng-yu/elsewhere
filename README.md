# Elsewhere

**Same soul, fewer crowds.** Elsewhere is an AI travel agent that finds your taste-matched alternative to an overtouristed place, then guides you there like a local. The alternative can be a quieter temple across town, a day trip with the same feel, or a twin city across the world.

Built for the [Qloo Agentic Hackathon](https://qloo.devpost.com/), on [Qloo](https://www.qloo.com/)'s taste graph.

**Live demo:** https://elsewhere.zichengyu.com

## Why

Overtourism is mostly a concentration problem: visitors bunch into a few places at the same times. Japan's Tourism Agency frames it this way, and Kyoto now promotes "decentralized tourism". The usual alternatives lists are generic, and they are written by the same sources that made the hotspots famous.

Elsewhere does it differently:
1. It asks Qloo's taste graph which places are loved by the people who love your must-sees.
2. It re-ranks those places by your own taste in film, music and books.
3. It keeps only the ones that are measurably less popular.

## How it works

It starts by reading the hotspot: Qloo's peak, best and off-season month tags for the destination, and a crowd calendar of its weekly attention over the past year.

Then pick how far you'll go:

| Zoom level | Question it answers | Qloo signal |
| --- | --- | --- |
| Same city | "Where can I get the Fushimi Inari feeling without the queue?" | Place-to-place affinity inside the city, capped by popularity |
| Day trip | "Which nearby town has the same feel?" | Place affinity within 150 km, excluding the crowded city |
| Same country | "What is my Kyoto, minus the crowds?" | Locality-to-locality affinity, re-scored against your taste |
| Beyond borders | "Where else has this soul?" | The same, across borders |

Every alternative gets a transparent **Dupe Score** built from four components: soul match, your taste, crowd relief, and proximity or season fit. Each number traces back to a Qloo field, and every request is listed in the in-app evidence drawer.

Choosing **Go like a local** builds the rest of the trip:
- where to base yourself, from Qloo's taste heatmap;
- a day-by-day plan of taste-matched places;
- respectful local customs and "be a good guest" notes.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the request flow, the full Qloo endpoint map and the scoring formula.

## Agentic design

The agent works through three tools: `resolve_trip`, `find_dupes` and `plan_local`.

- **Claude agent** (`claude-opus-5-5`, Anthropic SDK tool runner with streaming):
  - decides which zoom levels fit your constraints;
  - may propose extra candidate cities, which Qloo then scores like any other candidate;
  - writes the narrative and handles follow-ups such as "even quieter, and add a jazz bar".
- **Scripted planner:** without an LLM key, a deterministic planner calls the same tools in a fixed order with template narration.

Result cards always come from tool output, never from model text. The model cannot invent a place.

## Run it locally

Requires Node.js 22.18 or later.

```sh
npm install
npm run dev          # Vite + the Workers runtime (Cloudflare Vite plugin)
npm test             # engine tests (synthetic transport)
npm run typecheck
npm run eval         # scenarios × personas against the synthetic world
```

**No keys needed.** By default the app uses a **synthetic demo world** (`QLOO_MODE=mock`) and the scripted planner (`AGENT_MODE=scripted`). The synthetic world uses real place names and approximate coordinates. Every popularity value, rating and taste vector is invented, and nothing in the repository comes from Qloo.

**Live data and the LLM agent:**
1. Copy `.dev.vars.example` to `.dev.vars` and add `QLOO_API_KEY` and `ANTHROPIC_API_KEY`.
2. Set `QLOO_MODE: "live"` and `AGENT_MODE: "claude"` in `cloudflare.config.ts`.
3. On key day, run `QLOO_API_KEY=... npm run validate:qloo` to check the live API. It writes a data report to the git-ignored `.qloo-cache/`.

## Deploy

```sh
npx cf deploy        # Cloudflare Workers via the cf CLI
```

Upload secrets with `cf deploy --secrets-file <file>`, or with `npx wrangler secret put QLOO_API_KEY --name elsewhere`.

## Stack

- Cloudflare Workers, with static assets, KV, D1 and Rate Limiting, built and deployed with the `cf` CLI.
- React 19, Vite 8 and Tailwind 4 on the front end; Hono and Zod on the API.
- Qloo Insights API; Anthropic TypeScript SDK; MapLibre GL with OpenFreeMap tiles.

## Data and attribution

- Taste data: Qloo Insights API. Qloo responses are cached privately on the server and never stored in this repository.
- Maps: © OpenStreetMap contributors, OpenFreeMap.
- City photos: Wikipedia (CC BY-SA).
- Popularity is Qloo's cultural-attention percentile, not a visitor count.

## License

[MIT](./LICENSE)
