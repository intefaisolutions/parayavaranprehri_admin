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
