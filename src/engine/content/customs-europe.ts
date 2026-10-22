/**
 * Curated etiquette and responsible-travel notes (Europe) for the "Go like a
 * local" guide, also given to the agent as grounding.
 *
 * Editorial rules: English only; plain, warm and practical; stable customs
 * over changeable rules. Fees, access limits, visiting hours and fines change,
 * so they are described generally and travelers are pointed to current local
 * guidance. No prices, specific dates or fine amounts.
 *
 * Last reviewed: 2026-10-21.
 */

import type { CustomsEntry } from "./customs-schema.ts";

/** Country entries (no `locality`) and locality entries, grouped by country. */
export const CUSTOMS_EUROPE: CustomsEntry[] = [
	// France
	{
		countryCode: "FR",
		notes: [
			{
				topic: "Greetings",
				text: "Say \"bonjour\" (or \"bonsoir\" in the evening) before any question or request, to shopkeepers, bus drivers or passers-by, and \"merci, au revoir\" when leaving.",
			},
			{
				topic: "Tipping",
				text: "Service is included in French prices. Rounding up or leaving a little extra for good service is appreciated but never required.",
			},
			{
				topic: "Dining",
				text: "Restaurant meals are unhurried, and the bill won't come until you ask for \"l'addition\". Many restaurants stop serving between lunch and dinner, especially outside big cities.",
			},
			{
				topic: "Water",
				text: "Ask for \"une carafe d'eau\" and restaurants will bring free tap water with your meal.",
			},
			{
				topic: "Churches",
				text: "Many churches are active places of worship. Dress modestly, speak softly, and avoid sightseeing during Mass unless you're attending.",
			},
			{
				topic: "Opening hours",
				text: "Many shops close on Sundays and some on Mondays, and small-town businesses may close at lunchtime. Check opening hours as you plan your day.",
			},
			{
				topic: "Markets",
				text: "At open-air markets, let the vendor pick and weigh produce for you unless self-service is clearly invited, and bring your own bag.",
			},
		],
		goodGuest: [
			"Look beyond Paris and the Riviera to France's smaller cities and rural regions, and travel between them by train.",
			"Shop at open-air markets, independent bakeries and family-run restaurants.",
			"Travel in spring or autumn rather than midsummer when you can.",
		],
	},
	{
		countryCode: "FR",
		locality: "Paris",
		notes: [
			{
				topic: "Greetings",
				text: "Say \"bonjour\" as you enter a shop, café or boutique, and \"merci, au revoir\" as you leave. Skipping the greeting can come across as rude.",
			},
			{
				topic: "Metro",
				text: "Let passengers off first, take off your backpack, and stand up from the fold-down seats when the car gets crowded. On escalators, stand on the right.",
			},
			{
				topic: "Cafés",
				text: "Prices can differ at the counter, at a table and on the terrace. Lingering over one coffee is normal; catch the server's eye when you're ready to pay.",
			},
			{
				topic: "Sacré-Cœur",
				text: "Sacré-Cœur is a place of continuous prayer: no photos in the nave, no phone calls, and quiet throughout. Montmartre's backstreets are homes, so keep voices low there too.",
			},
			{
				topic: "Love locks",
				text: "Please don't attach padlocks to bridges or railings. Their weight has damaged monuments, and the city removes them.",
			},
			{
				topic: "Museums",
				text: "Major museums such as the Louvre use timed-entry slots, and booking ahead is the surest way in. Arrive on time, and check which day each museum closes.",
			},
		],
		goodGuest: [
			"Trade crowded hilltop Montmartre for village-like neighborhoods such as Butte-aux-Cailles or Belleville.",
			"Visit headline sights early or during evening openings, and wander quieter arrondissements in between.",
			"Eat and shop at neighborhood markets, bakeries and independent boutiques.",
		],
	},

	// Spain
	{
		countryCode: "ES",
		notes: [
			{
				topic: "Greetings",
				text: "Say \"hola\" or \"buenos días\" when entering shops and bars. Two kisses on the cheek are a common social greeting, especially among women; handshakes are usual between men and in business.",
			},
			{
				topic: "Meal times",
				text: "Lunch is often around 2 p.m. and dinner from about 9 p.m. Many kitchens close between services, especially away from tourist areas.",
			},
			{
				topic: "Tipping",
				text: "Tipping isn't obligatory. Leaving small change or rounding up for good service is common.",
			},
			{
				topic: "Churches",
				text: "Cover shoulders and knees in churches and cathedrals, keep your voice low, and avoid sightseeing during services.",
			},
			{
				topic: "Opening hours",
				text: "Smaller shops may close for a few hours in the afternoon and on Sundays, especially outside big cities.",
			},
			{
				topic: "Beachwear",
				text: "Swimwear is for the beach. Many coastal towns expect you to cover up in streets, shops and bars, and some fine people who don't.",
			},
			{
				topic: "Local languages",
				text: "Spain has several co-official languages, including Catalan, Basque and Galician. A greeting or thank-you in the local language is a friendly touch.",
			},
		],
		goodGuest: [
			"Explore quieter inland towns and smaller cities, and visit coastal hotspots outside midsummer.",
			"Choose properly licensed accommodation, and respect quiet hours in residential buildings.",
			"Eat in family-run bars and markets, and shop at independent businesses.",
		],
	},
	{
		countryCode: "ES",
		locality: "Barcelona",
		notes: [
			{
				topic: "Beachwear",
				text: "Beachwear belongs on the beach. Walking around the city in swimwear or without a shirt can lead to a fine, so cover up before heading into town.",
			},
			{
				topic: "Quiet hours",
				text: "Many visitors stay in residential buildings. Keep noise down on stairs, balconies and terraces, especially late at night, when neighbors are sleeping.",
			},
			{
				topic: "Catalan",
				text: "Catalan and Spanish are both official here. A \"bon dia\" (good morning) or \"gràcies\" (thank you) in Catalan is a friendly touch.",
			},
			{
				topic: "Gaudí sites",
				text: "Sagrada Família and Park Güell use timed tickets. Book ahead, arrive on time, and dress respectfully in the basilica, which is a place of worship.",
			},
			{
				topic: "Markets",
				text: "La Boqueria and neighborhood markets are where locals do their daily shopping. Shop or snack there, ask before photographing vendors or their stalls up close, and keep the aisles clear.",
			},
			{
				topic: "Street drinking",
				text: "Drinking alcohol in streets and squares can be fined, especially in groups, near homes at night or where children gather; organized pub crawls are banned. Have your drink at a bar or terrace.",
			},
		],
		goodGuest: [
			"Explore Gràcia's squares, Sant Andreu or Poblenou, and the modernist pavilions of Sant Pau, not just the busiest sights.",
			"Book early or late visitor slots at the Gaudí landmarks; at Park Güell, the first and last hours of the day are reserved for residents.",
			"Stay in licensed accommodation, and check that holiday rentals show a registration number.",
		],
	},

	// Switzerland
	{
		countryCode: "CH",
		notes: [
			{
				topic: "Greetings",
				text: "Greet shopkeepers and fellow hikers: \"Grüezi\" in German-speaking areas, \"Bonjour\" in French-speaking ones and \"Buongiorno\" in Italian-speaking ones.",
			},
			{
				topic: "Quiet hours",
				text: "Many towns and apartment buildings observe quiet hours at night and on Sundays. Keep noise down, especially in holiday rentals.",
			},
			{
				topic: "Recycling",
				text: "Sort rubbish carefully: glass, PET bottles, cans and paper are collected separately, and many towns require official bags for household waste.",
			},
			{
				topic: "Tipping",
				text: "Service is included in Swiss prices. Rounding up or leaving a little extra for good service is appreciated but optional.",
			},
			{
				topic: "Trains",
				text: "Trains and buses keep tight schedules, so be on the platform a few minutes early. Many intercity trains have first-class quiet zones; everywhere, keep calls and music low.",
			},
			{
				topic: "Sundays",
				text: "Most shops close on Sundays, apart from those in larger stations, airports and some tourist areas. Plan groceries ahead.",
			},
			{
				topic: "Trails",
				text: "Stay on marked trails, close pasture gates behind you, and give grazing cattle room. Carry all your rubbish back down.",
			},
		],
		goodGuest: [
			"Buy cheese and produce from village shops and alpine dairies, and eat in family-run restaurants.",
			"Leave the car behind: trains, buses, boats and cable cars reach almost every village.",
			"Explore quieter valleys and towns beyond the most famous viewpoints, and stay a few nights rather than day-tripping.",
		],
	},
	{
		countryCode: "CH",
		locality: "Interlaken",
		notes: [
			{
				topic: "Iseltwald",
				text: "Iseltwald charges a fee for its famous boat pier, which is still a working pier. Arrive by bus or boat, keep voices low, and stay off private property.",
			},
			{
				topic: "Trails and pastures",
				text: "Stay on marked trails, close pasture gates behind you, and give grazing cows plenty of room, especially mothers with calves. Keep dogs on a lead near livestock.",
			},
			{
				topic: "Mountain huts",
				text: "In mountain huts, swap boots for hut slippers and respect the night's quiet. Book ahead and cancel if plans change, as hut teams may fear an accident when booked guests don't arrive.",
			},
			{
				topic: "Lauterbrunnen Valley",
				text: "Wengen and Mürren are car-free, and drones are banned across the Lauterbrunnen Valley. Houses, gardens and benches are private even without fences, so keep to paths and keep noise down at night.",
			},
			{
				topic: "Mountain trains",
				text: "Mountain trains and cable cars fill up at peak times, and the Jungfraujoch railway needs a seat reservation in the busy season. Travel early or late, and keep bags out of the aisles.",
			},
			{
				topic: "Lakeshores",
				text: "Along Lake Thun and Lake Brienz, respect private shores and nature reserves, keep clear of boat piers, and take everything you bring back with you.",
			},
		],
		goodGuest: [
			"Start hikes early, and consider quieter side valleys such as the Diemtigtal or the Lötschental.",
			"Use trains, buses, boats and cable cars instead of a car; parking in the valleys is limited.",
			"Carry all litter, including food scraps, back down, and leave wildflowers for others to enjoy.",
		],
	},

	// Italy
	{
		countryCode: "IT",
		notes: [
			{
				topic: "Greetings",
				text: "Say \"buongiorno\" or \"buonasera\" when entering shops and bars, and \"grazie\" when you leave.",
			},
			{
				topic: "Churches",
				text: "Cover shoulders and knees in churches and basilicas; some larger ones will turn you away otherwise. Speak softly and avoid sightseeing during Mass.",
			},
			{
				topic: "Coffee bars",
				text: "Coffee at the counter often costs less than at a table. In some bars you pay at the till first, then show your receipt at the counter.",
			},
			{
				topic: "Restaurant bills",
				text: "A per-person cover charge (coperto) is common and normal. Tipping isn't expected beyond rounding up or leaving a little for good service.",
			},
			{
				topic: "Monuments and fountains",
				text: "Many cities ban sitting on certain monuments or steps, eating in some historic spots and wading in fountains. Follow posted signs; fines can apply.",
			},
			{
				topic: "Tickets",
				text: "Validate paper tickets for regional trains and many buses before boarding, as inspectors can fine passengers with unvalidated tickets.",
			},
			{
				topic: "Meal times",
				text: "Lunch usually starts around 1 p.m. and dinner around 8 p.m. Many kitchens close in between, especially outside big cities.",
			},
		],
		goodGuest: [
			"Look beyond the famous cities to smaller towns and lesser-known regions, and visit in spring or autumn.",
			"Eat at family-run trattorias, and buy from local markets and artisans.",
			"Stay a night or more rather than day-tripping, and travel between cities by train.",
		],
	},
	{
		countryCode: "IT",
		locality: "Venice",
		notes: [
			{
				topic: "Bridges and monuments",
				text: "Don't sit down to eat or drink on bridges, monuments, church steps or canal banks, or lie down in public spaces. Keep moving across bridges, and step aside for photos.",
			},
			{
				topic: "Walking",
				text: "Keep to the right in narrow streets (calli) so others can pass, and lift wheeled luggage over bridge steps rather than dragging it.",
			},
			{
				topic: "Access fee",
				text: "Venice charges day-trippers an access fee on certain peak dates. Check whether it applies on your dates; overnight guests are exempt but may still need to register.",
			},
			{
				topic: "Dress",
				text: "Swimwear and bare chests aren't allowed in the streets, in shops and cafés, or on the vaporetto. Cover shoulders and knees to enter churches.",
			},
			{
				topic: "Canals and squares",
				text: "Swimming or diving in the canals is banned, and so is feeding pigeons anywhere in the city. In St Mark's Square, eat and drink only at its cafés and restaurants.",
			},
			{
				topic: "Vaporetto",
				text: "Take off your backpack on board and let passengers off first. At busy stops, use the \"All passengers\" gates; red \"Priority\" gates are for residents, commuters and people with reduced mobility.",
			},
		],
		goodGuest: [
			"Stay at least one night, and explore early in the morning or in the evening, when day-trippers have gone.",
			"Wander Cannaregio and Castello, or quieter lagoon islands such as Mazzorbo, Sant'Erasmo or Pellestrina.",
			"Buy from Venetian artisans and family-run bacari, and consider nearby towns like Chioggia or Treviso.",
			"Book small-group tours with qualified local guides; Venice limits tour-group sizes and bans loudspeakers.",
		],
	},

	// Portugal
	{
		countryCode: "PT",
		notes: [
			{
				topic: "Greetings",
				text: "Say \"bom dia\" or \"boa tarde\" when entering shops. To say thanks, men say \"obrigado\" and women \"obrigada\"; it matches the speaker, not the listener.",
			},
			{
				topic: "Couvert",
				text: "Bread, olives and other starters placed on the table usually aren't free. You pay only for what you eat or open, and it's fine to send them back.",
			},
			{
				topic: "Tipping",
				text: "Tipping isn't obligatory. Rounding up or leaving a small tip for good table service is appreciated.",
			},
			{
				topic: "Churches",
				text: "Dress modestly in churches and monasteries, speak softly, and avoid sightseeing during Mass.",
			},
			{
				topic: "Coffee",
				text: "Coffee is often taken standing at the counter. Ask for \"um café\" for an espresso; in Lisbon you may hear it called \"uma bica\".",
			},
			{
				topic: "Meal times",
				text: "Lunch usually starts around 1 p.m. and dinner around 8 p.m. Many restaurants close between lunch and dinner service.",
			},
			{
				topic: "Beachwear",
				text: "Swimwear is for the beach. Cover up in towns, shops and cafés, and especially in churches; some resorts, such as Albufeira, fine people in swimwear away from the beach.",
			},
		],
		goodGuest: [
			"Look beyond Lisbon, Porto and the Algarve to cities like Coimbra, Évora or Aveiro and the villages of the interior.",
			"Eat at tascas and family-run restaurants, and shop in local markets and independent stores.",
			"Choose licensed local accommodation, and be a considerate neighbor in residential buildings.",
		],
	},
	{
		countryCode: "PT",
		locality: "Lisbon",
		notes: [
			{
				topic: "Trams",
				text: "Historic trams like the 28 are everyday transport for residents. Ride early or late or walk instead, offer priority seats to older passengers, and keep bags in front of you in crowds.",
			},
			{
				topic: "Alfama and Mouraria",
				text: "These old neighborhoods are homes first. Keep voices low, don't photograph through windows or doorways, and keep late-night noise down on the stairways.",
			},
			{
				topic: "Fado",
				text: "In fado houses, silence is expected while someone sings. Pause conversation and ordering, keep phones away, and ask before taking any photos.",
			},
			{
				topic: "Viewpoints",
				text: "Miradouros are shared public spaces, and some, such as Santa Catarina, close at night. Keep gatherings relaxed and quiet, especially after dark, and take your rubbish with you.",
			},
			{
				topic: "June festivities",
				text: "In June, the Santos Populares festivities fill neighborhoods like Alfama with street parties. Join in warmly, support the neighborhood stalls, and expect noise and crowds.",
			},
			{
				topic: "Nightlife",
				text: "Late at night, bars and shops can't sell alcohol to take out onto the street. In Bairro Alto and Cais do Sodré, drink inside or seated on terraces, and keep noise down for residents.",
			},
		],
		goodGuest: [
			"Explore neighborhoods such as Campo de Ourique, Alvalade or Marvila, where everyday Lisbon life goes on.",
			"Visit Sintra early on a weekday, go by train, and book palace tickets ahead.",
			"Stay in licensed accommodation, and eat and shop at neighborhood businesses.",
		],
	},

	// Malta
	{
		countryCode: "MT",
		notes: [
			{
				topic: "Churches",
				text: "Cover shoulders and knees in churches, and avoid sightseeing during Mass. St John's Co-Cathedral doesn't allow stiletto or narrow heels, to protect its marble floor.",
			},
			{
				topic: "Village festas",
				text: "From about late spring to early autumn, villages celebrate patron-saint festas with processions, band marches and fireworks. Join in respectfully, and give processions room to pass.",
			},
			{
				topic: "Beachwear",
				text: "Swimwear is for the beach and pool. Cover up in towns, shops and restaurants, and especially in churches.",
			},
			{
				topic: "Language",
				text: "Maltese and English are both official. A \"bonġu\" (good morning) or \"grazzi\" (thank you) is a friendly touch.",
			},
			{
				topic: "Hypogeum",
				text: "The Ħal Saflieni Hypogeum admits only small groups and doesn't allow photography. Book well ahead, as tickets sell out.",
			},
			{
				topic: "Popular coves",
				text: "Some popular spots, such as Comino's Blue Lagoon, limit visitor numbers in season. Check whether you need to book a time slot before you go.",
			},
			{
				topic: "Tipping",
				text: "Tipping is appreciated but not obligatory. Check whether service is already on the bill; if not, rounding up or a small tip is fine.",
			},
		],
		goodGuest: [
			"Visit Valletta and Mdina early or in the evening, and keep voices low in Mdina's quiet residential streets.",
			"Explore Gozo's villages and the Three Cities across the harbor from Valletta.",
			"Water is precious on the islands, so keep showers short and reuse towels.",
		],
	},
];
