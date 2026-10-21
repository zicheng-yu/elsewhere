/**
 * Curated etiquette and responsible-travel notes for the "Go like a local"
 * guide, also given to the agent as grounding.
 *
 * Editorial rules: English only; plain, warm and practical; stable customs
 * over changeable rules. Fees, access limits, visiting hours and fines change,
 * so they are described generally and travelers are pointed to current local
 * guidance. No prices, specific dates or fine amounts.
 *
 * Last reviewed: 2026-10-21.
 */

import type { CustomsEntry } from "./customs-schema.ts";

/** Universal good-guest guidance, shown everywhere and used as the fallback. */
export const GENERIC_CUSTOMS: CustomsEntry = {
	countryCode: "*",
	notes: [
		{
			topic: "Greetings",
			text: "Learn to say hello, please and thank you in the local language. A greeting before a question, in shops or on the street, is welcome almost everywhere.",
		},
		{
			topic: "Places of worship",
			text: "Cover shoulders and knees, speak softly and follow posted rules. Avoid sightseeing during services unless you are joining in.",
		},
		{
			topic: "Photography",
			text: "Ask before photographing people, especially children and anyone at prayer. Respect no-photo signs, skip the flash indoors, and check local rules before flying a drone.",
		},
		{
			topic: "Neighborhoods",
			text: "Historic lanes are often people's homes. Keep voices low, don't block doorways or peer into windows, and never enter courtyards or gardens uninvited.",
		},
		{
			topic: "Public transport",
			text: "Let people off before boarding, keep bags off seats and offer priority seats to those who need them. Keep calls and music quiet.",
		},
		{
			topic: "Changing rules",
			text: "Fees, timed tickets, visitor limits and opening hours change often at busy places. Check current official guidance shortly before you go.",
		},
	],
	goodGuest: [
		"Visit famous sights early in the morning or late in the day, and give a quieter alternative nearby a try.",
		"Spread your spending: eat, shop and stay at small, locally owned businesses.",
		"Leave no trace: carry out your rubbish, stay on marked paths and don't feed wildlife.",
		"Travel outside peak season when you can, and stay longer in fewer places.",
	],
};

/**
 * Country entries (no `locality`) and locality entries (matched
 * case-insensitively by name), grouped by country.
 */
export const CUSTOMS: CustomsEntry[] = [
	// Japan
	{
		countryCode: "JP",
		notes: [
			{
				topic: "Shrines and temples",
				text: "At shrines, it's customary to bow at the torii gate, walk to the side of the central path and rinse your hands at the water basin. Speak softly in temple halls.",
			},
			{
				topic: "Shoes off",
				text: "Take off your shoes where you see a raised step, a shoe rack or slippers: in homes, ryokan, temple halls and some restaurants. Toilet slippers stay in the toilet.",
			},
			{
				topic: "On trains",
				text: "Keep conversations low, set your phone to silent and avoid calls. Eating is usually avoided on local trains but fine on long-distance ones such as the shinkansen.",
			},
			{
				topic: "Tipping",
				text: "Tipping isn't customary, and staff may politely decline one. At the register, place cash or your card on the small tray if there is one.",
			},
			{
				topic: "Cash",
				text: "Cards and transit IC cards are widely accepted, but some small shops, shrines, temples and rural eateries take cash only. Carry some yen.",
			},
			{
				topic: "Rubbish",
				text: "Public bins are scarce, so carry a small bag and take your rubbish with you. It's considerate to eat beside the stall where you bought food rather than while walking.",
			},
			{
				topic: "Baths and onsen",
				text: "Wash and rinse thoroughly before entering a shared bath, keep your towel out of the water and skip swimwear unless the facility asks for it. Tattoo policies vary, so check ahead.",
			},
		],
		goodGuest: [
			"Spend in family-run shops, eateries and inns, especially in regional towns that see fewer visitors.",
			"See the most famous sights at opening time or near closing, and spend the busiest hours in lesser-known neighborhoods.",
			"Send large luggage ahead with a forwarding service (takkyubin) so you're not taking up space on crowded trains and buses.",
		],
	},
	{
		countryCode: "JP",
		locality: "Kyoto",
		notes: [
			{
				topic: "Gion lanes",
				text: "Some private lanes in Gion are closed to visitors or ban photography, and fines can apply. Follow the posted signs and enjoy the district from its public streets.",
			},
			{
				topic: "Maiko and geiko",
				text: "Maiko and geiko are usually on their way to work. Don't follow, block or touch them, and don't photograph them without permission; just let them pass.",
			},
			{
				topic: "Getting around",
				text: "Kyoto asks visitors to use trains and the subway where possible, so city buses have room for residents, and to keep large suitcases off buses.",
			},
			{
				topic: "Temples and gardens",
				text: "Many temples don't allow photos inside their halls, and temple gardens ask you to keep off the moss and raked gravel. Follow each temple's signs.",
			},
			{
				topic: "Nishiki Market",
				text: "Nishiki Market asks visitors not to eat while walking. Eat in front of or inside the shop where you bought the food, and use its bin.",
			},
			{
				topic: "Residential lanes",
				text: "Many machiya lanes are homes. Keep voices low, step aside rather than stopping in narrow streets, and don't sit on the bamboo fences or touch lanterns outside houses.",
			},
		],
		goodGuest: [
			"Check Kyoto's official crowd forecast, visit headline temples at opening time, and spend midday in quieter areas such as Ohara, Takao or Yamashina.",
			"Use luggage delivery or storage services so you can travel hands-free on buses and trains.",
			"Eat and shop beyond Gion and Nishiki, in neighborhood shops and family-run restaurants.",
		],
	},
	{
		countryCode: "JP",
		locality: "Nara",
		notes: [
			{
				topic: "The deer",
				text: "Nara's deer are wild animals protected as a national Natural Monument. Feed them only the deer crackers (shika senbei) sold in the park, never your own snacks.",
			},
			{
				topic: "Around the deer",
				text: "Deer can bite, butt or kick, especially in autumn and when protecting fawns. Don't tease them with crackers, and show your empty hands when you have none left.",
			},
			{
				topic: "Rubbish",
				text: "Deer will eat plastic bags and wrappers, which can kill them. Keep bags and paper maps out of reach, and take all your rubbish with you.",
			},
			{
				topic: "Temple halls",
				text: "Todai-ji, Kofuku-ji and Kasuga Taisha are active places of worship. Speak softly, follow the photography signs inside halls, and keep to the paths.",
			},
			{
				topic: "Naramachi",
				text: "Many of Naramachi's old townhouses are still homes. Keep voices low, don't linger in doorways, and ask before photographing residents.",
			},
		],
		goodGuest: [
			"Stay overnight rather than day-tripping, and enjoy the park early in the morning or in the evening, when it's calm.",
			"Explore beyond Nara Park, for example the Nishinokyo temples of Yakushi-ji and Toshodai-ji.",
		],
	},
	{
		countryCode: "JP",
		locality: "Kanazawa",
		notes: [
			{
				topic: "Teahouse districts",
				text: "Higashi Chaya and the other chaya districts are home to residents and working teahouses. Keep voices low, stay on public streets, and don't peer into windows or doorways.",
			},
			{
				topic: "Geisha",
				text: "Kanazawa's geisha, known as geigi, may pass by on their way to work. Give them room, and don't follow or photograph them without permission.",
			},
			{
				topic: "Teahouse visits",
				text: "Some historic teahouses are open to visitors, each with its own photography rules. Follow the signs and staff, and take off your shoes where asked.",
			},
			{
				topic: "Gardens",
				text: "In Kenroku-en and other gardens, stay on the paths and don't touch the moss, trees or stones.",
			},
			{
				topic: "Omicho Market",
				text: "Omicho Market still supplies local cooks and restaurants. Eat at the stall or a seating area rather than while walking through the busy aisles.",
			},
			{
				topic: "Nagamachi",
				text: "Some houses in the former samurai district of Nagamachi are private homes. Keep to the lanes, keep voices low and respect no-entry signs.",
			},
		],
		goodGuest: [
			"Visit Higashi Chaya early in the morning, and spend time in the quieter Kazuemachi and Nishi Chaya districts.",
			"Buy crafts such as gold leaf, lacquerware and Kutani porcelain directly from local workshops and makers.",
		],
	},
	{
		countryCode: "JP",
		locality: "Takayama",
		notes: [
			{
				topic: "Old town",
				text: "Sanmachi's old merchant houses include homes, shops and working sake breweries. Keep voices low, don't sit on doorsteps, and go inside only where a business welcomes you.",
			},
			{
				topic: "Morning markets",
				text: "The Miyagawa and Jinya-mae morning markets are run by local growers and makers. Ask before photographing stallholders, and keep the walkways clear.",
			},
			{
				topic: "Street food",
				text: "Many stalls sell snacks to eat on the spot. Eat beside the stall where you bought it and use its bin, rather than walking with food.",
			},
			{
				topic: "Ryokan stays",
				text: "In a ryokan, wrap your yukata left side over right, follow the posted bath times, and let staff know if you'll be late for the set dinner.",
			},
			{
				topic: "Shirakawa-go",
				text: "If you visit Shirakawa-go, remember that people live and farm in its thatched houses. Stay off private property and check current visitor guidance before you go.",
			},
		],
		goodGuest: [
			"Stay overnight: the old town is calmest early in the morning and after the day-trip buses leave.",
			"Explore quieter Hida towns such as Hida-Furukawa, with its canals and white-walled storehouses.",
			"Buy from morning-market stallholders and from local woodworkers and lacquer makers.",
		],
	},

	// South Korea
	{
		countryCode: "KR",
		notes: [
			{
				topic: "Greetings",
				text: "A slight bow with \"annyeonghaseyo\" is a polite hello. Give and receive things with both hands, or support your right arm with your left, especially with older people.",
			},
			{
				topic: "Shoes off",
				text: "Take off your shoes in homes, hanok guesthouses, temple halls and restaurants with floor seating. A step up or a row of shoes at the entrance is your cue.",
			},
			{
				topic: "Dining",
				text: "It's polite to let older diners start first and to pour drinks for others rather than yourself. Don't stand chopsticks or a spoon upright in rice.",
			},
			{
				topic: "Ordering",
				text: "Some barbecue and hot pot restaurants require at least two portions. Solo diners can order two or look for places that serve single portions.",
			},
			{
				topic: "Temples",
				text: "Use the side doors of a temple's main hall; the central door is traditionally reserved for monks and nuns. Speak softly and don't disturb people at prayer.",
			},
			{
				topic: "Subway and buses",
				text: "Keep voices low, and leave priority seats, including the pink seats for pregnant passengers, free for those who need them.",
			},
			{
				topic: "Tipping and side dishes",
				text: "Tipping isn't customary. Side dishes (banchan) come with most meals, and refills are often free; ask politely or look for a self-serve counter.",
			},
		],
		goodGuest: [
			"Visit palaces and hanok neighborhoods on weekday mornings, and explore smaller cities and regions beyond Seoul and Busan.",
			"Eat at traditional markets and family-run restaurants, and stay in locally owned guesthouses.",
		],
	},
	{
		countryCode: "KR",
		locality: "Seoul",
		notes: [
			{
				topic: "Bukchon",
				text: "Bukchon Hanok Village is a residential neighborhood. Part of it limits visitor hours, so check the posted times, keep quiet, and don't photograph homes or residents.",
			},
			{
				topic: "Residential lanes",
				text: "Hanok areas and hillside villages such as Ihwa are homes first. Keep voices down, don't open gates or climb walls for photos, and respect no-entry signs.",
			},
			{
				topic: "Palaces",
				text: "Seoul's palaces each close one day a week, and the day differs. Check before you go, stay on the paths and keep out of roped-off halls.",
			},
			{
				topic: "City temples",
				text: "Jogyesa and other city temples are active places of worship. Speak softly, walk around people who are bowing, and stay at the back if you enter during a service.",
			},
			{
				topic: "Metro",
				text: "Line up at the platform markings, let passengers off first, and keep conversations and calls quiet.",
			},
			{
				topic: "Markets",
				text: "At markets like Gwangjang, sit down to eat at the stall where you order, and keep the aisles clear for shoppers and deliveries.",
			},
		],
		goodGuest: [
			"Explore quieter neighborhoods with hanok, cafés and markets, such as Seochon, Seongbuk-dong or Mangwon.",
			"Visit Bukchon briefly and quietly during permitted hours, ideally on a weekday morning.",
			"Support small family-run restaurants and market stalls.",
		],
	},
	{
		countryCode: "KR",
		locality: "Gyeongju",
		notes: [
			{
				topic: "Royal tombs",
				text: "The grassy mounds in Daereungwon and around town are royal tombs. Never climb them or cross their fences; penalties can be severe.",
			},
			{
				topic: "Bulguksa",
				text: "Bulguksa is an active temple. Dress modestly, use the side doors of halls, speak softly, and don't disturb people bowing or praying.",
			},
			{
				topic: "Seokguram",
				text: "Photography isn't allowed inside Seokguram Grotto, where the Buddha is viewed through glass. Put your camera away and take in the moment quietly.",
			},
			{
				topic: "Hanok streets",
				text: "Hwangnidan-gil and Gyochon Village sit among people's homes. Keep voices low, especially at night, and don't wander into private courtyards.",
			},
			{
				topic: "Cycling",
				text: "Many visitors cycle between sites. Ride slowly on shared paths, give way to pedestrians, and park bikes where they won't block walkways.",
			},
			{
				topic: "Namsan trails",
				text: "Mount Namsan is dotted with Buddhist carvings and pagodas that are still revered. Stay on trails, don't touch or climb the carvings, and carry out your rubbish.",
			},
		],
		goodGuest: [
			"Visit Bulguksa and the tomb parks early in the morning, before tour groups arrive.",
			"Stay overnight to enjoy the town after day-trippers leave, and spend in local bakeries, cafés and guesthouses.",
		],
	},

	// Taiwan
	{
		countryCode: "TW",
		notes: [
			{
				topic: "Temple doors",
				text: "Many temples follow \"in by the dragon door, out by the tiger door\": enter on the right as you face the temple, and leave the central door to the gods.",
			},
			{
				topic: "Inside temples",
				text: "Step over door thresholds rather than on them, don't touch offerings or ritual objects, and ask before photographing people at prayer.",
			},
			{
				topic: "Metro rules",
				text: "Eating, drinking (even water) and chewing gum aren't allowed past the yellow line at metro gates, and fines apply. Leave priority seats for those who need them.",
			},
			{
				topic: "Tipping",
				text: "Tipping isn't expected. Some sit-down restaurants and hotels add a service charge to the bill instead.",
			},
			{
				topic: "Cash",
				text: "Night markets, street stalls and small eateries are often cash-only, so carry small notes. Transit cards like EasyCard also work in many convenience stores.",
			},
			{
				topic: "Rubbish",
				text: "Street bins are rare. Carry your rubbish with you, and sort recycling where separate bins are provided, such as in convenience stores and stations.",
			},
			{
				topic: "Night markets",
				text: "Eat at the stall's seats or step aside to eat, keep the narrow lanes moving, and join the queue where a line has formed.",
			},
		],
		goodGuest: [
			"Visit popular spots such as Jiufen on weekdays, and explore smaller towns beyond the usual circuit.",
			"Eat at family-run stalls and shops, and use Taiwan's trains and buses to reach quieter regions.",
		],
	},

	// Indonesia
	{
		countryCode: "ID",
		notes: [
			{
				topic: "Right hand",
				text: "Use your right hand, or both hands, to give, receive, eat and shake hands; using the left alone can seem impolite. Point with your thumb rather than a finger.",
			},
			{
				topic: "Head and feet",
				text: "Avoid touching anyone's head, including children's, and don't point your feet at people or sacred objects. Remove shoes before entering homes and places of worship.",
			},
			{
				topic: "Regional customs",
				text: "Customs vary by island: most regions are Muslim-majority, while Bali is mainly Hindu. In Bali, wear a sarong and sash at temples and never step on the small offerings on the ground.",
			},
			{
				topic: "Temples and sacred sites",
				text: "At temples and sacred sites, dress modestly, follow posted rules, and don't climb on statues, shrines or stupas. Some sites limit access to protect them, so check before you go.",
			},
			{
				topic: "Mosques and Ramadan",
				text: "At mosques, cover arms and legs (women also cover their hair) and visit outside prayer times. During Ramadan, in Muslim-majority areas, be discreet about eating and drinking in public by day.",
			},
			{
				topic: "Dress",
				text: "Away from the beach, cover up: shoulders and knees covered is a good guide in towns, villages and markets.",
			},
			{
				topic: "Bargaining and tipping",
				text: "Friendly bargaining is normal at markets but not in fixed-price shops. Tipping isn't required; many restaurants add a service charge, and rounding up is appreciated.",
			},
		],
		goodGuest: [
			"Look beyond the busiest areas: Indonesia has thousands of islands, and many quieter regions welcome visitors.",
			"Hire local guides, eat at warungs (small family-run eateries) and buy crafts directly from their makers.",
			"Carry a refillable bottle and shopping bag to cut single-use plastic.",
		],
	},
	{
		countryCode: "ID",
		locality: "Ubud",
		notes: [
			{
				topic: "Temple dress",
				text: "Wear a sarong and sash (selendang) at Balinese temples, with shoulders covered. Many temples lend or rent them at the entrance.",
			},
			{
				topic: "Offerings",
				text: "Small palm-leaf offerings (canang sari) are placed on pavements, doorsteps and shrines every day. Walk around them, never step on them, and don't move or touch them.",
			},
			{
				topic: "Sacred spaces",
				text: "Inner temple courtyards are often for worshippers only. Never climb shrines, walls, statues or sacred trees for photos, and follow each temple's posted rules.",
			},
			{
				topic: "Ceremonies",
				text: "Processions may pause traffic; wait patiently and don't walk through them. At ceremonies, stay to the side, don't stand higher than priests or offerings, and avoid flash.",
			},
			{
				topic: "Nyepi",
				text: "On Nyepi, Bali's Day of Silence (usually in March), the island stops for a day: visitors stay in their accommodation, lights stay low and the airport closes. Check the date.",
			},
			{
				topic: "Monkey Forest",
				text: "In the Sacred Monkey Forest, don't feed or touch the monkeys, keep food and loose items like sunglasses out of reach, and follow staff instructions.",
			},
			{
				topic: "Visitor rules",
				text: "Bali charges foreign visitors a tourism levy and has published a code of conduct covering dress, temples and behavior. Check the current requirements before you arrive.",
			},
		],
		goodGuest: [
			"Visit temples and rice terraces early in the morning, and explore quieter areas such as Sidemen, Munduk or Amed.",
			"Treat rice terraces as working farms: stay on the paths and pay any entry donation requested.",
			"Carry a refillable bottle and bag; Bali restricts many single-use plastics.",
			"Book local guides and drivers, eat at warungs and buy crafts directly from village artisans.",
		],
	},

	// Vietnam
	{
		countryCode: "VN",
		notes: [
			{
				topic: "Pagodas and temples",
				text: "Cover shoulders and knees, take off your shoes where others have, and speak softly. Don't touch altars or offerings, and ask before photographing worshippers or monks.",
			},
			{
				topic: "Greetings",
				text: "Greet older people first, and give or receive things with both hands. A smile and \"xin chào\" (hello) go a long way.",
			},
			{
				topic: "Dining",
				text: "Let the host or the eldest start, and don't stand chopsticks upright in a rice bowl; it recalls the incense offered for the dead.",
			},
			{
				topic: "Photos of people",
				text: "Ask before photographing people, including market traders, children and residents of highland villages, and accept a no with a smile.",
			},
			{
				topic: "Bargaining",
				text: "Friendly bargaining is normal at markets and with some street vendors, but not where prices are marked. Agree on boat or cyclo prices before setting off.",
			},
			{
				topic: "Tipping",
				text: "Tipping isn't traditionally expected but is appreciated for guides, drivers and good service in tourist areas.",
			},
			{
				topic: "Crossing streets",
				text: "Cross at a slow, steady pace so motorbike riders can predict your path, and avoid stopping or running suddenly.",
			},
		],
		goodGuest: [
			"Visit popular old towns and bays early in the day or outside peak season, and give lesser-known provinces some of your time.",
			"Choose locally owned homestays, guides and eateries so your spending stays in the community.",
			"Skip single-use plastic where you can, and avoid souvenirs made from wildlife.",
		],
	},

	// Laos
	{
		countryCode: "LA",
		notes: [
			{
				topic: "Greetings",
				text: "The nop, palms pressed together with a slight bow, is the traditional greeting, often with \"sabaidee\" (hello). A smile and a nod are always welcome.",
			},
			{
				topic: "Temples",
				text: "Cover shoulders and knees, take off your shoes before entering temple buildings, and sit with your feet pointing away from Buddha images and monks.",
			},
			{
				topic: "Monks",
				text: "Don't touch monks or their robes. By tradition, women don't hand things to monks directly; offerings can be placed on a cloth or tray instead.",
			},
			{
				topic: "Head and feet",
				text: "Avoid touching people's heads, and don't point your feet at people or step over someone sitting on the floor.",
			},
			{
				topic: "Dress",
				text: "Modest dress is appreciated beyond temples too. Save swimwear for pools and swimming spots, and cover up in towns and villages.",
			},
			{
				topic: "Rural paths",
				text: "In rural areas, stick to established paths and roads, and follow local guides; unexploded ordnance remains in parts of the country.",
			},
			{
				topic: "Tipping and cash",
				text: "Tipping isn't traditionally expected, though small tips are appreciated. Carry Lao kip in small notes, as cards are often not accepted outside larger towns.",
			},
		],
		goodGuest: [
			"Travel slowly and spread your time beyond the main stops, for example to Nong Khiaw or the Bolaven Plateau.",
			"Buy textiles and crafts directly from weavers and makers, and avoid souvenirs made from wildlife.",
			"Choose locally owned guesthouses, guides and eateries.",
		],
	},
	{
		countryCode: "LA",
		locality: "Luang Prabang",
		notes: [
			{
				topic: "Alms procession",
				text: "Each dawn, monks walk the old town collecting alms (tak bat). Watch quietly from across the street or at a distance, and never stand in or block their path.",
			},
			{
				topic: "Photography",
				text: "Don't use flash or take close-up photos of the monks. Don't follow the procession, and avoid watching from vehicles or from above it.",
			},
			{
				topic: "Taking part",
				text: "Only give alms if it is meaningful to you. Dress modestly, remove your shoes, kneel or sit as locals do, stay silent and don't touch the monks.",
			},
			{
				topic: "Offerings",
				text: "If you take part, buy sticky rice at a local market rather than from vendors selling to visitors along the route, and be in place before the monks arrive.",
			},
			{
				topic: "Temples",
				text: "The old town's temples are working monasteries. Visit quietly, cover shoulders and knees, and stay out of monks' living quarters unless invited.",
			},
			{
				topic: "Evenings",
				text: "The town winds down early, and many bars close by late evening. Keep noise low on the way back to your guesthouse.",
			},
		],
		goodGuest: [
			"Watch the alms procession on a quieter side street away from the busiest stretch, and leave plenty of space.",
			"Shop at the night market and local weaving workshops, and bargain gently.",
			"Visit popular waterfalls such as Kuang Si early, and explore villages along the Mekong.",
		],
	},

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
				text: "Sacré-Cœur is a place of continuous prayer: photos aren't allowed inside and silence is expected. Montmartre's backstreets are homes, so keep voices low there too.",
			},
			{
				topic: "Love locks",
				text: "Please don't attach padlocks to bridges or railings. Their weight has damaged monuments, and the city removes them.",
			},
			{
				topic: "Museums",
				text: "Major museums often require timed-entry booking. Reserve ahead, arrive on time, and check which day each one closes.",
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
				text: "A cheerful \"hola\" or \"buenos días\" when entering shops and bars is expected. Friends often greet with two kisses on the cheek; a handshake suits new acquaintances.",
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
				text: "La Boqueria and the neighborhood markets are where people do their daily shopping. Buy or snack there, ask before photographing stalls, and keep the aisles clear.",
			},
			{
				topic: "Street drinking",
				text: "Drinking alcohol in streets and squares is restricted and can be fined. Enjoy a drink at a bar or terrace instead.",
			},
		],
		goodGuest: [
			"Explore Gràcia's squares, Sant Andreu or Poblenou, and the modernist pavilions of Sant Pau, not just the busiest sights.",
			"Visit the Gaudí landmarks first thing in the morning or late in the day.",
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
				text: "Trains and buses keep tight schedules, so be on the platform a few minutes early. Some carriages have quiet zones; keep calls and music low throughout.",
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
				topic: "Lakeside villages",
				text: "Some lakeside villages, such as Iseltwald, have introduced visitor controls like fees or access limits at popular photo spots. Check current rules and respect residents' privacy.",
			},
			{
				topic: "Trails and pastures",
				text: "Stay on marked trails, close pasture gates behind you, and give grazing cows plenty of room, especially mothers with calves. Keep dogs on a lead near livestock.",
			},
			{
				topic: "Mountain huts",
				text: "In mountain huts, leave boots in the boot room and wear hut slippers. Book ahead and tell the hut if plans change; a no-show may be treated as a possible emergency.",
			},
			{
				topic: "Car-free villages",
				text: "Wengen and Mürren are car-free villages reached by train or cable car. Keep to the paths, and keep noise down at night near homes and hotels.",
			},
			{
				topic: "Mountain trains",
				text: "Mountain trains and cable cars fill up at peak times. Travel early or late, let passengers off first, and keep large bags out of the aisles.",
			},
			{
				topic: "Lakeshores",
				text: "Along Lake Thun and Lake Brienz, respect private shores and nature reserves, keep clear of boat piers, and take everything you bring back with you.",
			},
		],
		goodGuest: [
			"Start hikes early, and consider quieter valleys such as Kandersteg, the Lötschental or Engelberg.",
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
				text: "Don't sit on monuments, bridges or church steps to rest or eat. Keep moving on narrow bridges, and step aside to take photos.",
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
				text: "Walking around in swimwear or without a shirt isn't allowed in the city. Cover shoulders and knees to enter churches, including St Mark's Basilica.",
			},
			{
				topic: "Canals and squares",
				text: "Swimming in the canals is prohibited, and so is feeding pigeons in St Mark's Square. Picnicking is also off-limits around the square.",
			},
			{
				topic: "Vaporetto",
				text: "Take off backpacks on board, let passengers off first, and use the general entrances; some stops have priority gates for residents.",
			},
		],
		goodGuest: [
			"Stay at least one night, and explore early in the morning or in the evening, when day-trippers have gone.",
			"Wander Cannaregio and Castello, or quieter lagoon islands such as Mazzorbo, Sant'Erasmo or Pellestrina.",
			"Buy from Venetian artisans and family-run bacari, and consider nearby towns like Chioggia or Treviso.",
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
				text: "Bread, olives and other starters placed on the table usually aren't free. You're charged only for what you eat, and it's fine to send them back.",
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
				text: "Lunch usually starts around 1 p.m. and dinner around 8 p.m. Small family restaurants may close one day a week.",
			},
			{
				topic: "Beachwear",
				text: "Swimwear is for the beach. Cover up in towns, shops and cafés, and especially in churches.",
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
				text: "Historic trams such as the 28 are also everyday transport for residents. Ride outside peak hours, give seats to older passengers, and consider walking or another route.",
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
				text: "Miradouros are shared public spaces, and some now have set opening hours. Keep gatherings relaxed and quiet, especially at night, and take your rubbish with you.",
			},
			{
				topic: "June festivities",
				text: "In June, the Santos Populares festivities fill neighborhoods like Alfama with street parties. Join in warmly, support the neighborhood stalls, and expect noise and crowds.",
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
