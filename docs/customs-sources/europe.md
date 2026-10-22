# Elsewhere: Europe customs fact-check sources (2026-10-21)

Files reviewed:
- `src/engine/content/customs-europe.ts` (`CUSTOMS_EUROPE`)
- `GENERIC_CUSTOMS` in `src/engine/content/customs-data.ts`

## Summary

| Verdict | Count |
|---|---|
| Kept | 92 |
| Rewritten | 22 |
| Removed | 0 |
| Added | 2 |

There were 114 original items (notes plus goodGuest lines). There are now 116.

`npx tsc -p tsconfig.worker.json` passes with no errors. `test/engine.test.ts` passes (11 tests).

### Method and limits

- Rules, bans and recent changes were checked against official sources first: city governments, transport operators, site authorities and UK FCDO travel advice (pages updated Aug to Oct 2026). Reputable news was used for recent rule changes.
- The shared web-search budget ran out partway through. After that, only known official URLs were fetched directly. No search engines, proxies or archives were used after that point.
- Several official sites block automated reading:
  - comune.venezia.it and cda.ve.it (Incapsula). The Comune's English "Good rules" page and its Italian FAQ were read through Wayback snapshots dated 2026-10-08 and 2025-11-18, before the budget ran out.
  - stjohnscocathedral.com (Cloudflare). Its text was confirmed through search snippets.
  - visitportugal.com (Anubis), lisboa.pt and festasdelisboa.com (403). These were not bypassed.
- Items marked **"kept (not re-fetched)"** are stable, low-risk etiquette. They match the other sources gathered here, but no dedicated confirming page could be fetched once the budget ran out. They are listed again at the end for a quick human spot-check.

---

## GENERIC_CUSTOMS (`*`)

- **Greetings**: kept. Source: [Cultural Atlas, French greetings](https://culturalatlas.sbs.com.au/french-culture/french-culture-greetings) (a greeting precedes any request). The same pattern appears in the PT, IT and ES sources.
- **Places of worship**: rewritten. Sources: [St Peter's Basilica rules](https://www.basilicasanpietro.va/en/rules-for-the-common-good) (appropriate clothing, no hats); [Sagrada Família rules](https://sagradafamilia.org/en/rules-and-regulations). Reason: the fallback is shown worldwide, so it now mentions modest dress "usually" covering shoulders and knees, plus posted rules on shoes and head coverings. These differ by faith, for example removing shoes in temples, or head coverings in mosques and gurdwaras.
- **Photography**: kept. Sources: [Sacré-Cœur visitor rules](https://www.sacre-coeur-montmartre.com/en/info-and-visits/practical-information/hours-and-directions/); [Lauterbrunnen FAQ (drone ban)](https://lauterbrunnen.swiss/en/service/guest-service/faq.html).
- **Neighborhoods**: kept. Sources: [Lauterbrunnen FAQ](https://lauterbrunnen.swiss/en/service/guest-service/faq.html) (unfenced gardens and benches are private); [Iseltwald official page](https://www.iseltwald.ch/_rte/sehenswuerdigkeit/30046).
- **Public transport**: kept. Sources: [RATP civility campaign](https://www.ratp.fr/en/services-aux-voyageurs/incivilites); [Carris good practices](https://boaspraticas.carris.pt/).
- **Changing rules**: kept. Sources: [MTA Blue Lagoon booking](https://mta.com.mt/news/new-visitor-booking-system-cominos-blue-lagoon/); [Jungfrau Railways FAQ (seasonal seat reservation)](https://www.jungfrau.ch/en-gb/faq/).
- goodGuest **"Visit famous sights early…"**: kept. Source: [Comune di Venezia good rules (#1, #12)](https://www.comune.venezia.it/en/content/buone-pratiche-il-visitatore-responsabile).
- goodGuest **"Spread your spending…"**: kept. Source: same Venice rules (#3, #4).
- goodGuest **"Leave no trace…"**: kept. Sources: [SAC hut etiquette](https://www.sac-cas.ch/de/huetten-und-touren/sac-huetten/huetten-informationen/) (take rubbish back to the valley); [Schweizer Wanderwege](https://www.schweizer-wanderwege.ch/de/wandern/unterwegs/tiere).
- goodGuest **"Travel outside peak season…"**: kept. Source: Venice rules (#12).

---

## France (FR)

- **Greetings**: kept. Source: [Cultural Atlas, French etiquette](https://culturalatlas.sbs.com.au/french-culture/french-culture-etiquette) ("bonjour" at any service counter).
- **Tipping**: kept. Source: [DGCCRF, restaurants](https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/restaurants-droits-et-obligations-des-professionnels) (prices must be displayed "service compris").
- **Dining**: kept (not re-fetched). Cultural Atlas confirms that meals are long and unhurried. "Bill on request" and the mid-afternoon kitchen closures are standard, but no page was fetched for them.
- **Water**: kept. Sources: [DGCCRF, restaurants](https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/restaurants-droits-et-obligations-des-professionnels) (a free carafe of water with a meal); [DGCCRF, cafés and bars](https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/cafes-et-bars-quelles-obligations-pour-les-professionnels).
- **Churches**: kept. Source: [Sacré-Cœur visitor rules](https://www.sacre-coeur-montmartre.com/en/info-and-visits/practical-information/hours-and-directions/) ("dress appropriately and remain quiet").
- **Opening hours**: kept (not re-fetched).
- **Markets**: kept. Source: [Rick Steves, markets in France](https://www.ricksteves.com/watch-read-listen/read/articles/local-markets-in-france) ("don't touch; let the vendor serve you").
- goodGuest lines 1–3: kept. These are recommendations, not factual claims.

## Paris

- **Greetings**: kept. Source: [Cultural Atlas, French etiquette](https://culturalatlas.sbs.com.au/french-culture/french-culture-etiquette).
- **Metro**: kept. Sources:
  - [RATP 2024 civility campaign](https://www.ratp.fr/en/services-aux-voyageurs/incivilites): take off your backpack, let people off first.
  - [RATP "savoir voyager" rules](https://www.ratp.fr/sites/default/files/inline-files/savoir_voyager_tram.pdf): no fold-down seats when crowded.
  - [RATP Askip'](https://askip.ratpgroup.com/question/dou-vient-lhabitude-de-se-tenir-a-droite-de-lescalator/): stand on the right on escalators.
- **Cafés**: kept. Source: [DGCCRF, cafés and bars](https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/cafes-et-bars-quelles-obligations-pour-les-professionnels) (separate counter, room and terrace price displays).
- **Sacré-Cœur**: rewritten. Source: [Sacré-Cœur official visitor rules, updated Sept–Oct 2026](https://www.sacre-coeur-montmartre.com/en/info-and-visits/practical-information/hours-and-directions/). Reason: photos are banned only in the nave. They are allowed in the side aisles and the ambulatory. The basilica also asks for no phone calls and quiet throughout. "Photos aren't allowed inside" was wrong.
- **Love locks**: kept. Source: [Géoconfluences (ENS Lyon)](https://geoconfluences.ens-lyon.fr/informations-scientifiques/a-la-une/image-a-la-une/artefacts-metalliques-cadenas-d-amour-a-paris): a Pont des Arts grille collapsed, and the city removed the locks and fitted glass panels.
- **Museums**: rewritten. Source: [Louvre FAQ (Apr 2026)](https://contact.louvre.fr/hc/fr/articles/12837462851229-La-r%C3%A9servation-est-elle-obligatoire-Peut-on-acheter-sur-place-le-jour-m%C3%AAme). Reason: the Louvre says booking is "strongly recommended" and the only guarantee of entry, not strictly required. "Often require" overstated it.
- goodGuest lines 1–3: kept. Recommendations; evening openings are confirmed by the Louvre's late-opening hours.

---

## Spain (ES)

- **Greetings**: rewritten. Sources: [Cultural Atlas, Spanish greetings](https://culturalatlas.sbs.com.au/spanish-culture/spanish-culture-greetings); [Expatica](https://www.expatica.com/es/living/integration/etiquette-in-spain-108364/). Reason: two kisses are the normal social greeting, including when meeting people for the first time, especially among women. Handshakes are usual between men and in business, so "a handshake suits new acquaintances" was misleading.
- **Meal times**: kept. Source: [Cultural Atlas, Spanish etiquette](https://culturalatlas.sbs.com.au/spanish-culture/spanish-culture-etiquette) (lunch roughly 2–4 p.m., dinner 9–11:30 p.m.).
- **Tipping**: kept. Sources: [Cultural Atlas](https://culturalatlas.sbs.com.au/spanish-culture/spanish-culture-etiquette); [Expatica](https://www.expatica.com/es/living/integration/etiquette-in-spain-108364/).
- **Churches**: kept. Source: [Sagrada Família rules](https://sagradafamilia.org/en/rules-and-regulations) (Catholic-church dress code).
- **Opening hours**: kept (not re-fetched).
- **Beachwear**: kept. Sources: [FCDO Spain (Aug 2026)](https://www.gov.uk/foreign-travel-advice/spain/safety-and-security) ("illegal in some parts… fined on the seafront promenade or adjacent streets"); [idealista (June 2026)](https://www.idealista.com/en/news/lifestyle-in-spain/2026/06/02/899901-shirtless-in-spain-new-fines-for-wearing-swimwear).
- **Local languages**: kept. Source: [Spanish Constitution, art. 3 (BOE)](https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229).
- goodGuest 1: kept.
- goodGuest 2: kept. Source: [idealista on the national short-term-rental registry](https://www.idealista.com/news/inmobiliario/vivienda/2025/06/30/851333-en-funcionamiento-el-registro-de-alquileres-de-corta-duracion-desde-el-1-de-julio).
- goodGuest 3: kept.

## Barcelona

The new Ordinance of coexistence (Ordenança de convivència) was approved on 19 Dec 2025 and has been in force since 15 Feb 2026. Its official text is in the [Gaseta Municipal, 15 Jan 2026](https://w123.bcn.cat/APPS/egaseta/home.do?reqCode=downloadFile&publicacionsId=33425): Arts 46–47 cover alcohol and Art. 74 bis covers nudity and swimwear.

- **Beachwear**: kept. Source: Gaseta, Art. 74 bis:
  - no swimwear in public spaces except beaches and pools (seafront promenades and adjacent streets are exempt);
  - no going shirtless except during sport.
- **Quiet hours**: kept. Sources: Gaseta, Art. 46.2(a) (disturbing neighbors' rest); [Ajuntament press release (July 2026)](https://ajuntament.barcelona.cat/premsa/2026/07/22/la-nova-ordenanca-de-convivencia-consolida-una-actuacio-mes-focalitzada-en-les-conductes-que-afecten-el-descans-veinal-la-neteja-i-lus-de-lespai-public/).
- **Catalan**: kept (not re-fetched). Stable fact: Catalan is co-official under the Statute of Autonomy.
- **Gaudí sites**: kept. Sources: [Park Güell, access regulation](https://parkguell.barcelona/en/a-park-for-everone/why-are-the-access-points-regulated) (tickets, hourly cap); [Sagrada Família rules](https://sagradafamilia.org/en/rules-and-regulations) (dress code).
- **Markets**: rewritten (minor). Sources: [barcelona.com, Boqueria](https://www.barcelona.com/barcelona-markets/boqueria-market); [Hosteltur (Boqueria group limits)](https://www.hosteltur.com/110568_boqueria-barcelona-regula-grupos-turistas.html). Reason: the guidance is to ask before photographing vendors or their stalls up close. "Ask before photographing stalls" was stricter than the sources.
- **Street drinking**: rewritten. Sources: Gaseta, Arts 46–47; [Ajuntament press release (16 Feb 2026)](https://ajuntament.barcelona.cat/premsa/2026/02/16/entra-en-vigor-la-nova-ordenanca-de-convivencia-amb-mes-eines-contra-lincivisme-i-la-impunitat-2/). Reason: public drinking is banned when it seriously disturbs others, which the ordinance defines as:
  - disturbing neighbors' rest;
  - drinking in zones with nightlife-noise measures;
  - drinking in groups of three or more;
  - drinking where children gather.

  Organized pub crawls are now banned outright. Terraces are exempt. The new text names these conditions.
- goodGuest 1: kept.
- goodGuest 2: rewritten. Source: [Park Güell, access regulation](https://parkguell.barcelona/en/a-park-for-everone/why-are-the-access-points-regulated) ("the early morning… and the evening [time bands]… are reserved for citizens"). Reason: "go first thing or late" doesn't work at Park Güell, where the earliest and latest hours are for residents only.
- goodGuest 3: kept. Source: [Chekin, Barcelona rental rules 2026](https://chekin.com/blog/regulacion-pisos-turisticos-barcelona/) (an HUTB number must appear in every listing).

---

## Switzerland (CH)

- **Greetings**: kept. Source: [MySwitzerland, general information](https://www.myswitzerland.com/en-us/planning/about-switzerland/general-facts/general-information/) (Grüezi, Bonjour, Buongiorno).
- **Quiet hours**: kept. Sources: [ch.ch, noise and tenancy](https://www.ch.ch/de/wohnen/miete/larm--mangel--mietzins/); [hausinfo.ch](https://hausinfo.ch/de/recht/wohnen-recht/mietrecht/musik.html) (night, midday and Sunday quiet set by municipalities and house rules).
- **Recycling**: kept. Source: [BAFU (Federal Office for the Environment), packaging](https://www.bafu.admin.ch/en/packaging-general) (separate free collection of glass, PET, cans and paper; fee bags by canton or municipality).
- **Tipping**: kept. Source: [MySwitzerland, food and drink](https://www.myswitzerland.com/en-us/planning/about-switzerland/general-facts/general-information/food-and-drink/) ("tips are included in the price… rounding up").
- **Trains**: rewritten. Source: [SBB, first class](https://www.sbb.ch/en/travel-information/services-on-train/comfort-classes/first-class.html). Reason: SBB quiet zones are a first-class feature on many intercity trains, so the note now says so.
- **Sundays**: kept. Source: [MySwitzerland, money and shopping](https://www.myswitzerland.com/en-us/planning/about-switzerland/general-facts/money-and-shopping/) ("Many stores are closed on Sundays… open at train stations, airports…").
- **Trails**: kept. Sources: [Schweizer Wanderwege, animals](https://www.schweizer-wanderwege.ch/de/wandern/unterwegs/tiere); [alpwirtschaft.ch pasture rules](https://www.alpwirtschaft.ch/wp-content/uploads/2021/05/210513_Texte_Verhaltensregeln_Weidegebiet_d.pdf) (close gates).
- goodGuest lines 1–3: kept. Recommendations.

## Interlaken (Jungfrau region)

- **Lakeside villages → Iseltwald**: rewritten. Source: [Gemeinde Iseltwald official page](https://www.iseltwald.ch/_rte/sehenswuerdigkeit/30046). The page says:
  - there is an entrance fee for the boat pier, which keeps "its original function as a boat pier";
  - coaches need a reservation, and visitors are asked to come by bus or boat;
  - visitors should keep voices low and stay off private property.

  Reason: the vague "fees or access limits" was replaced with the confirmed specifics.
- **Trails and pastures**: kept. Source: [Schweizer Wanderwege](https://www.schweizer-wanderwege.ch/de/wandern/unterwegs/tiere) (keep your distance, never touch calves, keep dogs on a short leash).
- **Mountain huts**: rewritten (minor). Sources:
  - [SAC hut etiquette](https://www.sac-cas.ch/de/huetten-und-touren/sac-huetten/huetten-informationen/): book ahead, cancel in time, no-show fees, night quiet.
  - [SAC "Die Alpen" on no-shows](https://www.sac-cas.ch/de/die-alpen/nicht-annullierte-huettenreservationen-eine-gefaehrliche-nachlaessigkeit-19227/): wardens may have to consider a rescue.
  - [wegwandern.ch hut etiquette](https://wegwandern.ch/huetten-knigge/): hut slippers.

  Reason: added the night's quiet and softened "treated as an emergency" to match the SAC wording.
- **Car-free villages → Lauterbrunnen Valley**: rewritten. Sources: [Lauterbrunnen FAQ](https://lauterbrunnen.swiss/en/service/guest-service/faq.html) ("Flying drones is not permitted in the Lauterbrunnen Valley, including Wengen and Mürren"; houses, gardens and benches are private even without fences); [Jungfrau Region influencer guide](https://jungfrauregion.swiss/en/landingpages-en/influencer-guide.html). Reason: added the official drone ban and the private-property guidance.
  - Note: Lauterbrunnen's proposed day fee for car tourists (2024, [SRF](https://www.srf.ch/news/schweiz/massentourismus-eindaemmen-lauterbrunnen-will-gebuehr-fuer-touristen-die-mit-dem-auto-kommen)) was never confirmed as implemented, so it is not mentioned.
- **Mountain trains**: rewritten. Source: [Jungfrau Railways FAQ](https://www.jungfrau.ch/en-gb/faq/) (a seat reservation is mandatory on the Jungfraujoch line in the summer and autumn season). Reason: added the seasonal reservation requirement, without dates or prices.
- **Lakeshores**: kept. Source: [Iseltwald official page](https://www.iseltwald.ch/_rte/sehenswuerdigkeit/30046) (piers are working piers). The general shoreline advice is stable.
- goodGuest 1: rewritten. Source: [MySwitzerland, Diemtigtal](https://www.myswitzerland.com/en-us/destinations/diemtigtal/) (a nature-park side valley "for vacationers in search of rest and relaxation"). Reason: Engelberg (Titlis) and Kandersteg (Oeschinensee) are major excursion hotspots themselves, so they were poor examples of "quieter". This is an editorial judgment that was not re-sourced. The Lötschental was kept from the original; its MySwitzerland page could not be loaded.
- goodGuest 2: kept. Sources: Iseltwald page ("parking spaces… are rare"); Lauterbrunnen FAQ (parking).
- goodGuest 3: kept.

---

## Italy (IT)

- **Greetings**: kept (not re-fetched).
- **Churches**: kept. Source: [St Peter's Basilica rules](https://www.basilicasanpietro.va/en/rules-for-the-common-good) ("Entry… permitted only with appropriate clothing… Excessively short clothing, sleeveless tops, or hats are not allowed").
- **Coffee bars**: kept (not re-fetched).
- **Restaurant bills**: kept (not re-fetched). Possible nuance worth a check: some regions (notably Lazio/Rome) restrict charging a "coperto" by that name, and restaurants may bill bread instead.
- **Monuments and fountains**: kept. Source: [FCDO Italy (updated 21 Oct 2026)](https://www.gov.uk/foreign-travel-advice/italy/safety-and-security) ("laws against… sitting on monument steps, eating and drinking next to main churches… bathe in public fountains… Florence and Rome").
- **Tickets**: kept. Source: [FCDO Italy](https://www.gov.uk/foreign-travel-advice/italy/safety-and-security) ("you must validate it… on-the-spot fine").
- **Meal times**: kept (not re-fetched).
- goodGuest lines 1–3: kept. Recommendations.

## Venice

Official sources for this section:
- [Comune di Venezia, "Good rules for the responsible visitor"](https://www.comune.venezia.it/en/content/buone-pratiche-il-visitatore-responsabile), read via a [2026-10-08 snapshot](https://web.archive.org/web/20261008155253/https://www.comune.venezia.it/en/content/buone-pratiche-il-visitatore-responsabile).
- [Comune FAQ](https://www.comune.venezia.it/it/content/faq-0), which summarizes the Regolamento di Polizia e Sicurezza Urbana (art. 30) and the animal regulation (art. 24). Read via a 2025-11-18 snapshot.
- [ACTV priority boarding](https://actv.avmspa.it/it/content/inizio-di-imbarco-prioritario-ai-servizi-di-navigazione).
- [AVM/Actv conditions of carriage](https://avm.avmspa.it/it/condizioni-generali-trasporto-AVM-Actv).

Notes:
- **Bridges and monuments**: rewritten. Sources: Comune FAQ ("vietato sdraiarsi sul suolo pubblico e comunque sedersi e sostare per consumare cibi o bevande"); good rules #6 and #7 (do not stop on bridges; steps of churches, bridges, wells, monuments and canal banks are not picnic areas). Reason: the ban is on sitting or stopping to eat or drink, and on lying down. It is not on sitting to rest, so the note now uses the official wording.
- **Walking**: kept. Source: good rule #6 ("Walk on the right"). The luggage clause is sensible etiquette but was not re-sourced.
- **Access fee**: kept. Sources: [FCDO Italy](https://www.gov.uk/foreign-travel-advice/italy/safety-and-security) (fee applies on some dates, with exemptions); [Moonlight Venice guide](https://moonlightvenice.com/guide/venice-access-fee) (exempt overnight guests). The note already describes the fee generally, with no amounts or dates, and hedges the registration point ("may still need to register"), because sources disagree on whether the exemption is automatic.
- **Dress**: rewritten. Source: Comune FAQ, art. 30 (no beachwear or bare chests in the streets, in public places and businesses, or on public transport). Reason:
  - added that the rule covers the vaporetto, shops and cafés;
  - dropped the "St Mark's Basilica" mention, because no official dress-code page could be fetched. The general church-dress advice remains, supported by St Peter's rules.
- **Canals and squares**: rewritten. Sources: Comune FAQ (diving and swimming banned in canals and the St Mark's basin; feeding pigeons banned on public land across the municipality, art. 24); good rule #8 (in St Mark's Square, eat and drink only at its bars and restaurants). Reason: the pigeon-feeding ban is citywide, not just in St Mark's Square.
- **Vaporetto**: rewritten. Sources:
  - ACTV priority boarding: red "PRIORITY VENEZIA UNICA" gates at major stops such as Ferrovia, Rialto, San Zaccaria and Piazzale Roma, for residents, registered commuters and concession-card holders, plus wheelchair access via the exit corridor; black "ALL PASSENGERS" gates for everyone.
  - AVM conditions: bags, including shoulder bags, must be put down on board.

  Reason: the flagged claim is confirmed as resident-*priority* gates, not resident-only boats. The note now explains which gate to use.
- goodGuest 1–3: kept. Source: good rules #1–#4 and #12.
- goodGuest 4 (**added**): "Book small-group tours with qualified local guides; Venice limits tour-group sizes and bans loudspeakers." Sources: good rule #5 (qualified guides); [Euronews, Aug 2024](https://www.euronews.com/2024/08/01/venice-puts-further-limits-on-tourists-to-protect-the-city) and [NPR](https://www.npr.org/2024/01/01/1222393894/venice-tour-groups-loudspeakers) (group cap and loudspeaker ban in force since Aug 2024; no repeal reported).

---

## Portugal (PT)

- **Greetings**: kept (not re-fetched). Stable grammar point: "obrigado/obrigada" agrees with the speaker.
- **Couvert**: rewritten (minor). Sources: [ASAE restaurant prices FAQ](https://www.asae.gov.pt/perguntas-frequentes1/area-economica/precos/precos-em-servicos-de-restauracao.aspx) (DL 10/2015 art. 135: couvert can't be charged if not requested, unless it is eaten or opened); [DECO Proteste](https://www.deco.proteste.pt/familia-consumo/ferias-lazer/dicas/restaurantes-regras-cobranca-entradas-gelo-copos-agua) ("inutilizado" means eaten or handled). Reason: added "or open", because opening the butter or bread makes it chargeable.
- **Tipping**: kept (not re-fetched).
- **Churches**: kept. Source: [Cultural Atlas, Portuguese etiquette](https://culturalatlas.sbs.com.au/portuguese-culture/portuguese-culture-etiquette) (don't visit during Mass; remove hats).
- **Coffee**: kept (not re-fetched).
- **Meal times**: rewritten (second sentence). Source: [Turismo de Lisboa, traveller information](https://www.visitlisboa.com/en/traveller-information) (restaurants serve lunch 12–3 and dinner 7–10). Reason: replaced the unsourced "may close one day a week" with the sourced break between services.
- **Beachwear**: rewritten. Sources: [FCDO Portugal](https://www.gov.uk/foreign-travel-advice/portugal/safety-and-security) (Albufeira Code of Conduct); [ECO, June 2025](https://eco.sapo.pt/2025/06/24/codigo-de-comportamentos-de-albufeira-entra-em-vigor-com-proibicao-de-biquinis-nas-zonas-publicas/). Reason: added Albufeira's fines for swimwear away from bathing areas. Portugal has no national ban.
- goodGuest lines 1–3: kept. Recommendations.

## Lisbon

- **Trams**: rewritten. Sources: [Carris good practices](https://boaspraticas.carris.pt/) (give up priority seats, validate tickets); [FCDO Portugal](https://www.gov.uk/foreign-travel-advice/portugal/safety-and-security) ("Take care on public transport and at crowded bus and tram stops"). Reason: added a pickpocket caution and kept the overtourism nudge to ride early or late, or walk.
- **Alfama and Mouraria**: kept. Source: [Observador (Feb 2026)](https://observador.pt/2026/02/14/proibicao-de-venda-de-bebidas-alcoolicas-para-consumo-no-exterior-em-lisboa-entra-em-vigor/) (the city's stated aim is residents' right to rest).
- **Fado**: kept (not re-fetched). Widely documented etiquette. VisitPortugal and Museu do Fado pages could not be read or did not cover it. **Spot-check recommended.**
- **Viewpoints**: rewritten. Sources: [Público (Oct 2019)](https://www.publico.pt/2019/10/03/local/noticia/miradouro-adamastor-lisboa-reabre-proxima-semana-horario-limitado-1888805) (Santa Catarina/Adamastor fenced, with set hours); [Dica de Portugal (2026)](https://dicadeportugal.com/pontos-turisticos/miradouro-de-santa-catarina-em-lisboa/) (still closes at night). Reason: named the one miradouro confirmed to close at night (since 2019) instead of the vague "some now have set opening hours". No hours are given.
- **June festivities**: kept. Source: [Observador](https://observador.pt/2026/02/14/proibicao-de-venda-de-bebidas-alcoolicas-para-consumo-no-exterior-em-lisboa-entra-em-vigor/) (the annual Festas de Lisboa in June).
- **Nightlife** (**added**): Sources: [Observador](https://observador.pt/2026/02/14/proibicao-de-venda-de-bebidas-alcoolicas-para-consumo-no-exterior-em-lisboa-entra-em-vigor/); [Público (Feb 2026)](https://www.publico.pt/2026/02/14/local/noticia/proibicao-venda-alcool-consumo-exterior-entra-hoje-vigor-lisboa-2164810). Since Feb 2026, a citywide ban stops venues and shops selling alcohol for drinking outside late at night. Seated terraces are exempt. The city calls it preventive, pending a regulation update, so it may change.
- goodGuest 1: kept.
- goodGuest 2 (Sintra): kept. Source: [Sintra Explorers (2026)](https://www.sintraexplorers.com/post/driving-to-pena-palace-is-it-possible) (timed palace tickets; roads up to the palaces closed to private cars). The official parquesdesintra.pt page was not fetched.
- goodGuest 3: kept.

---

## Malta (MT)

- **Churches**: kept. Sources: [St John's Co-Cathedral, Visit](https://www.stjohnscocathedral.com/visit/) ("Stiletto and narrow heels are not allowed"); [St John's event notice](https://www.stjohnscocathedral.com/2023/04/03/holy-week-2023-liturgical-celebrations/) ("not permitted on the inlaid marble floor").
- **Village festas**: kept. Sources: [ManicMalta (2026 season)](https://manicmalta.com/malta-village-festas-2026/); [maltabudget.com](https://www.maltabudget.com/the-festa-season/).
- **Beachwear**: kept (not re-fetched). Cultural Atlas notes that the Maltese "dress formally and modestly".
- **Language**: kept (not re-fetched). Stable: Maltese and English are official under the Constitution.
- **Hypogeum**: kept. Source: [Heritage Malta access statement](https://heritagemalta.mt/app/uploads/2022/06/Hypo-Access-Statement_REV1-003.pdf) (10 visitors per tour; no photography or filming; book well ahead).
- **Popular coves**: kept. Sources: [Malta Tourism Authority](https://mta.com.mt/news/new-visitor-booking-system-cominos-blue-lagoon/) (free time-slot booking with a visitor cap); [Lovin Malta (June 2026)](https://lovinmalta.com/news/local/blue-lagoon-limited-to-4000-visitors-per-time-slot-as-booking-system-reopens/) (back in force in 2026).
- **Tipping**: kept (not re-fetched).
- goodGuest 1: kept. Mdina is the "Silent City".
- goodGuest 2: kept. Recommendation.
- goodGuest 3 (water): kept (not re-fetched). Stable: Malta is among the EU's most water-scarce countries.

---

## Remaining uncertainties and spot-check list

1. **Venice access fee:** sources disagree on whether overnight guests must request an exemption QR code themselves or are covered automatically, so the note keeps "may still need to register". No 2027 calendar has been published.
2. **Venice group cap and loudspeaker ban:** coverage dates from 2024. There are no reports of repeal, but also no 2026 official page.
3. **Lisbon late-night alcohol-sales ban:** described by the city as preventive until its opening-hours regulation is amended; a review was due in August 2026. It may change.
4. **Santa Catarina miradouro night closure:** confirmed by 2019 news and 2026 guides, but no official 2026 page.
5. **Spain's national short-term-rental registry (NRUA):** one source reports a May 2026 Supreme Court ruling against the procedure. The Barcelona goodGuest line relies on Barcelona's HUTB number, which is unaffected.
6. **Not re-fetched, stable etiquette (spot-check if time allows):**
   - France: Dining, Opening hours.
   - Spain: Opening hours.
   - Italy: Greetings, Coffee bars, Restaurant bills (Lazio "coperto" nuance), Meal times.
   - Portugal: Greetings, Tipping, Coffee.
   - Lisbon: Fado.
   - Malta: Beachwear, Language, Tipping, water line.
   - Barcelona: Catalan.
   - Venice: luggage clause in "Walking".
   - Interlaken: the Lötschental as a "quieter" valley.
