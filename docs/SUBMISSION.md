# Devpost submission

The app is live at https://elsewhere.zichengyu.com with live Qloo data and the LLM agent. Every number below comes from live runs.

## Tagline

Same soul, fewer crowds: an agent that finds your taste-matched alternative to an overtouristed place, then guides you there like a local.

## Inspiration

Overtourism is mostly a concentration problem. Japan's Tourism Agency describes it as visitors bunching into specific places at specific times. Venice charges day-trippers an access fee, and Montmartre now draws more visitors to Sacré-Cœur than the Eiffel Tower. Travelers are already acting on it: in Expedia's Unpack '24 survey, one in three had booked a "dupe" destination, and 36% named deeper contact with local culture as one of their reasons.

The usual "alternatives to Kyoto" lists are generic, and they come from the same sources that made Kyoto famous. A good alternative is personal. If you love Studio Ghibli and quiet gardens, your Fushimi Inari twin is a different place than it is for a night owl who loves Wong Kar-wai. Qloo's taste graph can tell those two travelers apart; a general-purpose model on its own cannot.

## What it does

Tell Elsewhere where you were headed, when, what you planned to see, and what you love: films, music, books, chefs. Then pick how far you'll go:

- **Same city:** quieter twins of each crowded must-see, scored by Qloo place affinity and capped by popularity.
- **Day trip:** nearby towns Qloo knows as destinations that share the hotspot's genres, outside the crowded city.
- **Same country:** a twin city, found with Qloo's destination-to-destination affinity and re-scored against your taste.
- **Beyond borders:** the same soul in another country.

Every card shows a transparent **Dupe Score**, which combines:
- soul match;
- character, from the Qloo destination genres a twin shares with the original;
- your taste;
- crowd relief, from Qloo popularity percentiles;
- distance, and season fit wherever Qloo has month tags for the place.

An evidence drawer lists every Qloo request behind the results.

Choose **Go like a local** and the agent builds the rest of the trip:
- where to stay, from Qloo's taste heatmap;
- a day-by-day plan of taste-matched places;
- local customs;
- responsible-travel notes for the places it sends you to.

## How we built it

- **Agent:**
  - An LLM agent (Claude Haiku 5.5 through OpenRouter, with a fallback model) runs a streaming tool-calling loop with three tools: `resolve_trip`, `find_dupes` and `plan_local`. A journey costs about $0.002, and a spending ledger caps daily and total use.
  - It chooses zoom levels from the traveler's constraints and can propose extra candidate cities, which Qloo then scores.
  - It handles follow-ups such as "even quieter, and add a jazz bar".
  - Result cards are always tool output, so the model cannot invent places.
- **Qloo:**
  - `/search` and `/v2/tags` resolve entities and vibes.
  - `/v2/insights` provides place, destination, locality and heatmap outputs, using location, category-tag, popularity, exclusion and result-entity filters.
  - Locality month tags draw a crowd calendar: peak, best and worst months, with each month's events and travel advisories. `/v2/analysis/compare` adds shared traits between twin cities.
  - Every request is a GET to the hackathon host, cached privately in D1.
- **Platform:**
  - One Cloudflare Worker serves the React app and a Hono API.
  - The agent streams its trace over server-sent events.
  - D1 stores journeys for share links and replays.
  - MapLibre with OpenFreeMap draws the crowded spots, their quiet twins and the taste heatmap.
- **Quality:**
  - Engine tests run against a synthetic transport that mimics Qloo's parameters.
  - An eval script runs eight featured hotspots with four taste profiles each. It checks that each level returns the right kind of place, measures crowd relief, and measures how often the top pick changes with taste. On live Qloo data all 64 level checks pass, the alternatives average 88% crowd relief, and the top pick changes with the traveler's taste in 6 of 16 scenario-levels.

## Why it needs Qloo

Take Qloo away and Elsewhere stops working, and we built the proof instead of asserting it:

- **The alternatives come from Qloo.** Crowded spots, their quieter twins, day-trip towns, twin cities, shared genres and crowd relief are all Qloo entities, affinities and popularity percentiles. No list of ours decides them.
- **The agent's tools are Qloo queries.** `resolve_trip`, `find_dupes` and `plan_local` run the Qloo calls; the model only chooses which ones and what to say.
- **The same question, asked without Qloo.** The "why not just ask an LLM?" panel sends the same request and the same model (Haiku 5.5) to OpenRouter with no Qloo access. The result is a generic list of well-known suggestions; it cannot see which quieter place shares this traveler's taste, and it cannot tell you that your Pinot-and-vermouth bars cluster in one Kyoto neighbourhood.
- **The numbers are Qloo's.** A Dupe Score card cites the Qloo fields behind it, and the evidence drawer lists every request the run made.

## Challenges we ran into

- Real data behaved differently from the docs' examples, and the engine had to adapt:
  - Famous sights such as Fushimi Inari Taisha exist in search only as stubs that insights rejects as signals, so must-sees are matched against the city's insights-ranked sights, with the nearest popular sight of the same kind standing in.
  - Administrative localities are named in the local script and carry heavy boundary polygons; destination entities carry English names and a popularity that compares cities, so twin cities run on destinations and only the seasons come from localities.
  - Responses are trimmed before caching so a journey fits the Workers CPU budget.
- "Less crowded" had to be honest. Qloo popularity is a cultural-attention percentile, not a head count. We score crowd relief on tail shares, and never claim visitor numbers.
- Keeping the agent grounded: numbers are computed in code, and cards come only from tool results.

## Accomplishments that we're proud of

- Four zoom levels that turn "go somewhere else" into a choice travelers can actually make, even after booking flights.
- A Dupe Score where every number traces to a Qloo field.
- Taste changes the answer: on live data, three persona profiles change the top pick in 6 of 16 scenario-levels. A food explorer escaping the Eiffel Tower gets Le Marais, a contemplative one the Colonne Vendôme.

## What we learned

- Qloo's destination-to-destination affinity mirrors who travels as much as what a place is like: for Kyoto, its closest foreign matches were Korean beach cities, and for Seoul, Ulaanbaatar, through shared audiences. Weighing it against the destination genres Qloo tags (Art & Culture, For the History, Snow and Ski) turned it into a "same soul" signal: Kyoto's twin abroad is now Tainan, Taiwan's old capital, and Interlaken's is Zell am See.
- Qloo already knows the towns travelers know. Asking for destinations inside a 120 km circle returns Versailles, Fontainebleau and Giverny around Paris, and one query over a `MULTIPOLYGON` of circles fetches all their places at once.
- A free plan is a design constraint, not a footnote: D1's 50 queries per invocation led to a cache that batches lookups and writes, and Qloo popularity percentiles needed care (a city listed twice at the 76th and 96th percentile takes the higher reading).

## What's next

- A dashboard for tourism boards of under-visited towns: which travelers already share their soul.
- Capacity-aware suggestions, so the alternatives don't become the next hotspot.
- Booking partners for the plans.

## Built with

Qloo Insights API · Claude Haiku 5.5 via OpenRouter · Cloudflare Workers, D1 · Hono · React · Vite · Tailwind CSS · MapLibre GL · OpenFreeMap · Zod · Vitest

## Testing instructions

Open https://elsewhere.zichengyu.com. No login, no setup, and the agent is on live Qloo data.
1. Run a featured journey such as "Kyoto in April" (the featured ones are warm and answer in seconds).
2. Swap the taste profile before running and watch the picks change; or type your own destination, month, must-sees and favourites.
3. Choose "Go like a local" on a card for a day-by-day plan with local customs.
4. Ask a follow-up such as "even quieter, and add a jazz bar".
5. Open "Why not just ask an LLM?" for the same request answered by the same model without Qloo.
6. Open the evidence drawer from the agent trace: every Qloo request behind the run, with its parameters and result count.
7. Share a journey with the share link; it replays without running anything again.
