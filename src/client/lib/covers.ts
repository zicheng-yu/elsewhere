/** Hand-picked Wikipedia photos (CC BY-SA) for the home page and the featured journeys. */
export interface Cover {
	url: string;
	pageUrl: string;
	alt: string;
}

/** A Wikimedia Commons thumbnail; `file` is the URL-encoded "a/ab/Name.jpg" path. */
function commons(file: string, width = 960): string {
	return `https://upload.wikimedia.org/wikipedia/commons/thumb/${file}/${width}px-${file.split("/").at(-1)}`;
}

const wiki = (title: string) => `https://en.wikipedia.org/wiki/${title}`;

export const HERO_COVERS: { crowded: Cover; twin: Cover } = {
	crowded: {
		url: commons("0/0e/Torii_path_with_lantern_at_Fushimi_Inari_Taisha_Shrine%2C_Kyoto%2C_Japan.jpg", 1280),
		pageUrl: wiki("Fushimi_Inari-taisha"),
		alt: "Vermilion torii gates lining a path at Fushimi Inari Taisha",
	},
	twin: {
		url: commons("e/e4/Kurama-dera_sanmon.jpg"),
		pageUrl: wiki("Kurama-dera"),
		alt: "The red gate of Kurama-dera among trees",
	},
};

/** Keyed by scenario id. */
export const SCENARIO_COVERS: Record<string, Cover> = {
	"kyoto-april": {
		url: commons("3/30/Kamogawa_sakura.jpg"),
		pageUrl: wiki("Kamo_River"),
		alt: "Cherry trees in bloom along the Kamo River in Kyoto",
	},
	"paris-june": {
		url: commons("c/c5/Le_sacre_coeur.jpg"),
		pageUrl: wiki("Sacr%C3%A9-C%C5%93ur,_Paris"),
		alt: "The white domes of the Sacré-Cœur Basilica",
	},
	"barcelona-july": {
		url: commons("3/33/Parc_guell_-_panoramio.jpg"),
		pageUrl: wiki("Park_G%C3%BCell"),
		alt: "Gaudí pavilions at the entrance of Park Güell",
	},
	"jungfrau-july": {
		url: commons("2/29/1_lauterbrunnen_valley_wengen_2022.jpg"),
		pageUrl: wiki("Lauterbrunnen"),
		alt: "The Lauterbrunnen valley under snowy peaks",
	},
	"bali-july": {
		url: commons("5/5d/Ubud_%2849818456887%29.jpg"),
		pageUrl: wiki("Ubud"),
		alt: "A busy shopping street in Ubud",
	},
	"venice-august": {
		url: commons("4/4f/Venezia_aerial_view.jpg"),
		pageUrl: wiki("Venice"),
		alt: "Aerial view of Venice and its lagoon",
	},
	"lisbon-june": {
		url: commons("f/f2/Lisboa_-_Portugal_%2852597836992%29.jpg"),
		pageUrl: wiki("Lisbon"),
		alt: "Lisbon rooftops rising above the Tagus",
	},
	"seoul-october": {
		url: commons("6/63/%EA%B4%91%ED%99%94%EB%AC%B8_%EC%9B%94%EB%8C%80.jpg"),
		pageUrl: wiki("Gyeongbokgung"),
		alt: "Gyeongbokgung Palace below Bugaksan mountain",
	},
};
