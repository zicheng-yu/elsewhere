# Devpost submission (draft)

> Placeholders in [brackets] are filled in once live Qloo data and the LLM agent are switched on.

## Tagline

Same soul, fewer crowds: an agent that finds your taste-matched alternative to an overtouristed place, then guides you there like a local.

## Inspiration

Overtourism is mostly a concentration problem. Japan's Tourism Agency describes it as visitors bunching into specific places at specific times. Venice charges day-trippers an access fee. Fodor's "No List" grows every year. Meanwhile, one in three travelers has already booked a "dupe" destination (Expedia, Unpack '24), and most say they want deeper contact with local culture.

The usual "alternatives to Kyoto" lists are generic, and they come from the same sources that made Kyoto famous. A good alternative is personal. If you love Studio Ghibli and quiet gardens, your Fushimi Inari twin is a different place than it is for a night owl who loves Wong Kar-wai. Qloo's taste graph can tell those two travelers apart; a general-purpose model on its own cannot.

## What it does

Tell Elsewhere where you were headed, when, what you planned to see, and what you love: films, music, books, chefs. Then pick how far you'll go:

- **Same city:** quieter twins of each crowded must-see, scored by Qloo place affinity and capped by popularity.
- **Day trip:** nearby towns that share the hotspot's feel, outside the crowded city.
- **Same country:** a twin city, found with Qloo's locality-to-locality affinity and re-scored against your taste.
- **Beyond borders:** the same soul in another country.

Every card shows a transparent **Dupe Score**, which combines four components:
- soul match;
- your taste;
- crowd relief, from Qloo popularity percentiles;
- proximity or season fit, from Qloo's peak-season and best-month tags.

An evidence drawer lists every Qloo request behind the results.

Choose **Go like a local** and the agent builds the rest of the trip:
- where to stay, from Qloo's taste heatmap;
- a day-by-day plan of taste-matched places;
- local customs;
- "be a good guest" notes, including a "visit gently" flag for small communities.

## How we built it

- **Agent:**
  - Claude (`claude-opus-5-5`) runs on the Anthropic TypeScript SDK's tool runner, with streaming and three tools: `resolve_trip`, `find_dupes` and `plan_local`.
  - It chooses zoom levels from the traveler's constraints and can propose extra candidate cities, which Qloo then scores.
  - It handles follow-ups such as "even quieter, and add a jazz bar".
  - Result cards are always tool output, so the model cannot invent places.
- **Qloo:**
  - `/search` and `/v2/tags` resolve entities and vibes.
  - `/v2/insights` provides place, locality and heatmap outputs, using location, radius, exclusion, popularity and result-entity filters.
  - `/v2/analysis/compare` adds shared traits, and `/v2/trending` draws a crowd calendar: the destination's weekly attention over the past year, over Qloo's peak, best and off-season month tags.
  - Every request is a GET to the hackathon host, cached privately in Workers KV.
- **Platform:**
  - One Cloudflare Worker serves the React app and a Hono API.
  - The agent streams its trace over server-sent events.
  - D1 stores journeys for share links and replays.
  - MapLibre with OpenFreeMap draws the crowded spots, their quiet twins and the taste heatmap.
- **Quality:**
  - Engine tests run against a synthetic transport that mimics Qloo's parameters.
  - An eval script runs eight featured hotspots with four taste profiles each. It checks that each level returns the right kind of place, measures crowd relief, and measures how often the top pick changes with taste. [Live numbers.]

## Challenges we ran into

- Qloo's locality output only accepts locality signals, so personal taste can't steer city recommendations directly. We split the work in two:
  - Qloo finds cities with the hotspot's soul.
  - Each candidate is then re-scored by how Qloo rates that city's places against the traveler's favorites.
- "Less crowded" had to be honest. Qloo popularity is a cultural-attention percentile, not a head count. We score crowd relief on tail shares, and never claim visitor numbers.
- Keeping the agent grounded: numbers are computed in code, and cards come only from tool results.

## Accomplishments that we're proud of

- Four zoom levels that turn "go somewhere else" into a choice travelers can actually make, even after booking flights.
- A Dupe Score where every number traces to a Qloo field.
- [Personalization result from the live eval.]

## What we learned

[After live testing.]

## What's next

- A dashboard for tourism boards of under-visited towns: which travelers already share their soul.
- Capacity-aware suggestions, so the alternatives don't become the next hotspot.
- Booking partners for the plans.

## Built with

Qloo Insights API · Claude (Anthropic TypeScript SDK) · Cloudflare Workers, KV, D1 · Hono · React · Vite · Tailwind CSS · MapLibre GL · OpenFreeMap · Zod · Vitest

## Testing instructions

Open https://elsewhere.zichengyu.com. No login is needed.
1. Run a featured journey, such as "Kyoto in April". Swap the taste profile to see the picks change.
2. Choose "Go like a local" on any card to get a plan.
3. Open the evidence drawer from the agent trace to see every Qloo request.
