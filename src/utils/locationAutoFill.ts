import { apiFetch } from "./apiConfig";
import { DISTRICTS_BY_STATE, INDIAN_STATES } from "./indiaLocations";

export interface ReverseGeocodeResult {
  latitude: number;
  longitude: number;
  country: string;
  state: string;
  district: string;
  tehsil: string;
  villageOrCity: string;
  pinCode: string;
  landAddress: string;
  landmark: string;
  vidhanSabha: string | null;
  vidhanSabhaId: string | null;
  rawDisplayName?: string;
  source?: string;
}

/** Location fields that reverse-geocode can populate (all remain editable). */
export interface LocationAutoFillFields {
  latitude: number | "";
  longitude: number | "";
  country: string;
  state: string;
  district: string;
  tehsil: string;
  villageOrCity: string;
  pinCode: string;
  landAddress: string;
  landmark: string;
  vidhanSabha: string;
}

function normalizeKey(value: string) {
  return value
    .toLowerCase()
    .replace(/[()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchIndianState(raw?: string | null): string {
  if (!raw?.trim()) return "";
  const key = normalizeKey(raw);
  const exact = INDIAN_STATES.find((s) => normalizeKey(s) === key);
  if (exact) return exact;
  const partial = INDIAN_STATES.find(
    (s) =>
      normalizeKey(s).includes(key) || key.includes(normalizeKey(s)),
  );
  return partial || raw.trim();
}

export function matchIndianDistrict(
  state: string,
  raw?: string | null,
): string {
  if (!raw?.trim()) return "";
  const districts = DISTRICTS_BY_STATE[state] || [];
  const key = normalizeKey(raw);
  const exact = districts.find((d) => normalizeKey(d) === key);
  if (exact) return exact;
  const partial = districts.find(
    (d) =>
      normalizeKey(d).includes(key) || key.includes(normalizeKey(d)),
  );
  return partial || raw.trim();
}

/**
 * Call backend reverse geocode (OSM + Vidhan Sabha polygon detect),
 * then normalize state/district to admin dropdown values.
 */
export async function reverseGeocodeLocation(
  latitude: number,
  longitude: number,
): Promise<LocationAutoFillFields> {
  const data = await apiFetch<ReverseGeocodeResult>("/api/v1/geo/reverse", {
    method: "POST",
    body: JSON.stringify({ latitude, longitude }),
  });

  const state = matchIndianState(data.state);
  const district = matchIndianDistrict(state, data.district);
  const country =
    !data.country || /india/i.test(data.country) ? "India" : data.country;

  return {
    latitude: data.latitude,
    longitude: data.longitude,
    country,
    state,
    district,
    tehsil: data.tehsil || "",
    villageOrCity: data.villageOrCity || "",
    pinCode: data.pinCode || "",
    landAddress: data.landAddress || "",
    landmark: data.landmark || "",
    vidhanSabha: data.vidhanSabha || "",
  };
}

export function mergeLocationAutoFill<T extends Record<string, any>>(
  prev: T,
  fill: LocationAutoFillFields,
): T {
  return {
    ...prev,
    ...fill,
  };
}

export type LatLngPair = { lat: number; lng: number };

/** Read lat/lng from land document (flat fields or GeoJSON Point). */
export function coordsFromLand(land?: {
  latitude?: number | string | null;
  longitude?: number | string | null;
  location?: { coordinates?: number[] } | null;
} | null): LatLngPair | null {
  if (!land) return null;
  const geo = land.location?.coordinates;
  const rawLat = land.latitude ?? (Array.isArray(geo) ? geo[1] : undefined);
  const rawLng = land.longitude ?? (Array.isArray(geo) ? geo[0] : undefined);
  if (rawLat == null || rawLng == null || rawLat === "" || rawLng === "") {
    return null;
  }
  const lat = Number(rawLat);
  const lng = Number(rawLng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

/** Approximate centroid of a GeoJSON Polygon / MultiPolygon (outer rings). */
export function boundaryCentroid(boundary?: {
  type?: string;
  coordinates?: number[][][] | number[][][][];
} | null): LatLngPair | null {
  if (!boundary?.type || !boundary.coordinates) return null;

  const rings: number[][][] = [];
  if (boundary.type === "Polygon") {
    rings.push(boundary.coordinates[0] as number[][]);
  } else if (boundary.type === "MultiPolygon") {
    for (const poly of boundary.coordinates as number[][][][]) {
      if (poly?.[0]) rings.push(poly[0]);
    }
  }
  let sumLat = 0;
  let sumLng = 0;
  let n = 0;
  for (const ring of rings) {
    for (const pt of ring) {
      const lng = Number(pt[0]);
      const lat = Number(pt[1]);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
      sumLat += lat;
      sumLng += lng;
      n += 1;
    }
  }
  if (n === 0) return null;
  return { lat: sumLat / n, lng: sumLng / n };
}

/** Forward geocode a place name in India via OpenStreetMap Nominatim. */
export async function forwardGeocodePlace(
  query: string,
): Promise<LatLngPair | null> {
  const q = query.trim();
  if (q.length < 3) return null;

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", q);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "in");
  url.searchParams.set("accept-language", "en");

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "User-Agent": "ParyavaranPrahriAdmin/1.0 (planting-spot)",
    },
  });
  if (!res.ok) return null;
  const hits = (await res.json()) as Array<{ lat: string; lon: string }>;
  const hit = hits[0];
  if (!hit) return null;
  const lat = Number(hit.lat);
  const lng = Number(hit.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}
