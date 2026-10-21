export interface LatLon {
	lat: number;
	lon: number;
}

const EARTH_RADIUS_KM = 6371;

export function haversineKm(a: LatLon, b: LatLon): number {
	const toRad = (deg: number) => (deg * Math.PI) / 180;
	const dLat = toRad(b.lat - a.lat);
	const dLon = toRad(b.lon - a.lon);
	const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
	return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function centroid(points: LatLon[]): LatLon {
	if (points.length === 0) return { lat: 0, lon: 0 };
	const sum = points.reduce((acc, p) => ({ lat: acc.lat + p.lat, lon: acc.lon + p.lon }), { lat: 0, lon: 0 });
	return { lat: sum.lat / points.length, lon: sum.lon / points.length };
}

const BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";

export function geohashEncode(lat: number, lon: number, precision = 6): string {
	let latMin = -90;
	let latMax = 90;
	let lonMin = -180;
	let lonMax = 180;
	let hash = "";
	let bit = 0;
	let ch = 0;
	let evenBit = true;
	while (hash.length < precision) {
		if (evenBit) {
			const mid = (lonMin + lonMax) / 2;
			if (lon >= mid) {
				ch = (ch << 1) | 1;
				lonMin = mid;
			} else {
				ch <<= 1;
				lonMax = mid;
			}
		} else {
			const mid = (latMin + latMax) / 2;
			if (lat >= mid) {
				ch = (ch << 1) | 1;
				latMin = mid;
			} else {
				ch <<= 1;
				latMax = mid;
			}
		}
		evenBit = !evenBit;
		if (++bit === 5) {
			hash += BASE32[ch];
			bit = 0;
			ch = 0;
		}
	}
	return hash;
}

export interface Bounds {
	minLat: number;
	maxLat: number;
	minLon: number;
	maxLon: number;
}

export function geohashBounds(hash: string): Bounds {
	let latMin = -90;
	let latMax = 90;
	let lonMin = -180;
	let lonMax = 180;
	let evenBit = true;
	for (const char of hash.toLowerCase()) {
		const index = BASE32.indexOf(char);
		if (index < 0) throw new Error(`Invalid geohash: ${hash}`);
		for (let n = 4; n >= 0; n--) {
			const bitN = (index >> n) & 1;
			if (evenBit) {
				const mid = (lonMin + lonMax) / 2;
				if (bitN === 1) lonMin = mid;
				else lonMax = mid;
			} else {
				const mid = (latMin + latMax) / 2;
				if (bitN === 1) latMin = mid;
				else latMax = mid;
			}
			evenBit = !evenBit;
		}
	}
	return { minLat: latMin, maxLat: latMax, minLon: lonMin, maxLon: lonMax };
}

export function geohashCenter(hash: string): LatLon {
	const b = geohashBounds(hash);
	return { lat: (b.minLat + b.maxLat) / 2, lon: (b.minLon + b.maxLon) / 2 };
}

/** The eight cells around a geohash. */
export function geohashNeighbors(hash: string): string[] {
	const b = geohashBounds(hash);
	const dLat = b.maxLat - b.minLat;
	const dLon = b.maxLon - b.minLon;
	const center = geohashCenter(hash);
	const neighbors: string[] = [];
	for (const dy of [-1, 0, 1]) {
		for (const dx of [-1, 0, 1]) {
			if (dx === 0 && dy === 0) continue;
			const lat = Math.max(-89.999, Math.min(89.999, center.lat + dy * dLat));
			const lon = ((center.lon + dx * dLon + 540) % 360) - 180;
			neighbors.push(geohashEncode(lat, lon, hash.length));
		}
	}
	return neighbors;
}

/** Closed GeoJSON ring ([lon, lat] pairs) for a geohash cell. */
export function geohashRing(hash: string): [number, number][] {
	const b = geohashBounds(hash);
	return [
		[b.minLon, b.minLat],
		[b.maxLon, b.minLat],
		[b.maxLon, b.maxLat],
		[b.minLon, b.maxLat],
		[b.minLon, b.minLat],
	];
}
