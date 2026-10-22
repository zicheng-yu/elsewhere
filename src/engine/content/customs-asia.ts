/**
 * Curated etiquette and responsible-travel notes (Asia) for the "Go like a
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
export const CUSTOMS_ASIA: CustomsEntry[] = [
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
];
