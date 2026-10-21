# Elsewhere

**Same soul, fewer crowds.** Elsewhere is an agent that finds your taste-matched alternative to an overtouristed place. It works at four zoom levels: a quieter twin of the temple you planned to visit, a day-trip town with the same feel, a twin city in the same country, or the same soul somewhere new. Then it guides you there like a local.

Built for the [Qloo Agentic Hackathon](https://qloo.devpost.com/). Recommendations are grounded in [Qloo](https://www.qloo.com/)'s taste graph.

> Status: in active development.

## How it works

| Zoom level | Question it answers | Qloo signal |
| --- | --- | --- |
| Same city | "Where can I get the Fushimi Inari feeling without the queue?" | Place-to-place affinity within the city, capped by popularity |
| Day trip | "Which nearby town has the same feel?" | Place affinity within a radius, excluding the crowded city |
| Same country | "What is my Kyoto, minus the crowds?" | Locality-to-locality affinity, scored against your taste |
| Anywhere | "Where else has this soul?" | Locality affinity without borders |

Every candidate is scored with a transparent Dupe Score that combines four things: soul match, your personal taste fit, crowd relief, and season fit. Each number traces back to a Qloo field.

## Stack

- Cloudflare Workers (static assets + API), built and deployed with the [`cf` CLI](https://developers.cloudflare.com/cf/)
- React + Vite + Tailwind on the front end, Hono on the API
- Qloo Insights API for taste, place, locality, and heatmap data

## Development

```sh
npm install
npm run dev        # local dev server (Workers runtime via the Cloudflare Vite plugin)
npm run typecheck
npm run deploy     # cf deploy
```

Elsewhere runs end-to-end without API keys. `QLOO_MODE=mock` serves synthetic fixtures that mirror the documented response shapes, and `AGENT_MODE=scripted` runs a deterministic planner in place of the LLM agent. The fixtures contain no Qloo data.

## License

[MIT](./LICENSE)
