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

It starts by reading the hotspot: Qloo's peak, best, off-season and worst months for the destination, with each month's events and travel advisories.

Then pick how far you'll go:

| Zoom level | Question it answers | Qloo signal |
| --- | --- | --- |
| Same city | "Where can I get the Fushimi Inari feeling without the queue?" | Place-to-place affinity inside the city, capped by popularity |
| Day trip | "Which nearby town has the same feel?" | Qloo's destinations within 120 km that share the city's genres, and their best-matching places |
| Same country | "What is my Kyoto, minus the crowds?" | Destination-to-destination affinity and shared genres, re-scored against your taste |
| Beyond borders | "Where else has this soul?" | The same, across borders |

Every alternative gets a transparent **Dupe Score** built from soul match, character (shared Qloo destination genres), your taste, crowd relief, and proximity or season fit. Each number traces back to a Qloo field, and every request is listed in the in-app evidence drawer.

Choosing **Go like a local** builds the rest of the trip:
- where to base yourself, from Qloo's taste heatmap;
- a day-by-day plan of taste-matched places;
- respectful local customs and "be a good guest" notes.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the request flow, the full Qloo endpoint map and the scoring formula.

## Agentic design

The agent works through three tools: `resolve_trip`, `find_dupes` and `plan_local`.

- **LLM agent** (a streaming tool-calling loop over OpenRouter; `anthropic/claude-haiku-5.5` by default, with `openai/gpt-6-luna` as the fallback):
  - decides which zoom levels fit your constraints and runs them in parallel;
  - may propose extra candidate cities, which Qloo then scores like any other candidate;
  - writes the narrative and handles follow-ups such as "even quieter, and add a jazz bar".
- **Scripted planner:** without an LLM key, a deterministic planner calls the same tools in a fixed order with template narration.

Result cards always come from tool output, never from model text. The model cannot invent a place.

A journey costs about $0.002 in model usage. Every model call is checked against a spending ledger in D1 first (a daily and an all-time cap, `LLM_DAILY_USD` and `LLM_TOTAL_USD`); past either cap the scripted planner answers instead.

## Run it locally

Requires Node.js 22.18 or later.

```sh
npm install
npm run dev          # Vite + the Workers runtime, synthetic data, scripted planner
npm run dev:live     # the same against live Qloo data and the LLM agent (needs .dev.vars.live)
npm test             # engine and agent-loop tests (synthetic transport, stubbed model)
npm run typecheck
npm run eval         # scenarios × personas against the synthetic world
node --env-file=.dev.vars.live scripts/eval.ts --live   # the same on live Qloo data (cached in .qloo-cache/)
```

**No keys needed.** By default the app uses a **synthetic demo world** (`QLOO_MODE=mock`) and the scripted planner (`AGENT_MODE=scripted`). The synthetic world uses real place names and approximate coordinates. Every popularity value, rating and taste vector is invented, and nothing in the repository comes from Qloo.

**Live data and the LLM agent:**
1. Copy `.dev.vars.example` to `.dev.vars.live` and add `QLOO_API_KEY` and `OPENROUTER_API_KEY`.
2. Run `npm run dev:live` (`cf dev --mode live`). The `live` mode switches `QLOO_MODE` to `live` and `AGENT_MODE` to `llm`; every other mode, including a plain deploy, stays on synthetic data and the scripted planner.
3. Developer tools, all caching Qloo responses in the git-ignored `.qloo-cache/`:
   - `node --env-file=.dev.vars.live scripts/run-journey.ts kyoto-april --plan=city` runs a journey end to end and prints every level;
   - `node --env-file=.dev.vars.live scripts/qloo.ts /v2/insights filter.type=... take=10` summarizes any query;
   - `node --env-file=.dev.vars.live scripts/explore-destinations.ts kyoto-april [--foreign] [--nearby]` lists the destinations Qloo finds similar to a scenario's city, or within a day trip, with genres and popularity;
   - `node scripts/cpu-bench.ts kyoto-april` measures the engine's CPU time and D1 queries on cached responses;
   - `npm run validate:qloo` checks the endpoints Elsewhere relies on.

## Deploy

```sh
npx cf deploy        # Cloudflare Workers via the cf CLI
```

This deploys the synthetic-data version. Going live means deploying in the `live` mode with the secrets attached: `npx cf deploy --mode live --secrets-file .dev.vars.live`. Set a credit limit on the OpenRouter key as an outer backstop to the app's own caps.

Then warm the cache: `npm run warm -- --scripted` runs every featured scenario and plans each level's top pick with the scripted planner, which makes the same Qloo requests as the agent without any model calls. Add `--base=http://localhost:5175` to warm a local `dev:live` server instead.

## Stack

- Cloudflare Workers, with static assets, D1 and Rate Limiting, built and deployed with the `cf` CLI.
- React 19, Vite 8 and Tailwind 4 on the front end; Hono and Zod on the API.
- Qloo Insights API; OpenRouter (OpenAI-compatible chat completions over plain `fetch`); MapLibre GL with OpenFreeMap tiles.

## Data and attribution

- Taste data: Qloo Insights API. Qloo responses are cached privately on the server and never stored in this repository.
- Maps: © OpenStreetMap contributors, OpenFreeMap.
- City photos: Wikipedia (CC BY-SA).
- Popularity is Qloo's cultural-attention percentile, not a visitor count.
- Local customs notes are fact-checked against official tourism, city and transport sources; every note's verdict and sources are listed in [docs/customs-sources/](docs/customs-sources/).

## License

[MIT](./LICENSE)
