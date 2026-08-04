import { apiFetch } from "./apiConfig";
import type { SelectOption } from "../components/form/SmartForm";

export type GeoCountry = { id: string; name: string };
export type GeoState = { id: string; name: string; country?: string };
export type GeoDistrict = {
  id: string;
  name: string;
  state?: string;
  stateId?: string;
};
export type GeoConstituency = {
  id: string;
  name: string;
  country?: string;
  state?: string;
  district?: string;
  hasBoundary?: boolean;
};

export type ConstituencyBoundaryResponse = {
  id: string;
  name: string;
  country?: string;
  state?: string;
  district?: string;
  boundary: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
  center?: { lat: number; lng: number };
  message?: string;
};

export async function fetchCountries(): Promise<SelectOption[]> {
  const rows = await apiFetch<GeoCountry[]>("/api/v1/geo/countries");
  return (rows || []).map((r) => ({ label: r.name, value: r.name }));
}

export async function fetchStates(country = "India"): Promise<SelectOption[]> {
  const params = new URLSearchParams({ country });
  const rows = await apiFetch<GeoState[]>(
    `/api/v1/geo/states?${params.toString()}`,
  );
  return (rows || []).map((r) => ({ label: r.name, value: r.name }));
}

export async function fetchDistricts(
  state: string,
  country = "India",
): Promise<SelectOption[]> {
  const params = new URLSearchParams({ state, country });
  const rows = await apiFetch<GeoDistrict[]>(
    `/api/v1/geo/districts?${params.toString()}`,
  );
  return (rows || []).map((r) => ({ label: r.name, value: r.name }));
}

export async function fetchConstituencies(
  state: string,
  district: string,
  country = "India",
): Promise<GeoConstituency[]> {
  const params = new URLSearchParams({ state, district, country });
  return (
    (await apiFetch<GeoConstituency[]>(
      `/api/v1/geo/constituencies?${params.toString()}`,
    )) || []
  );
}

export async function fetchConstituencyBoundary(
  masterId: string,
): Promise<ConstituencyBoundaryResponse> {
  return apiFetch<ConstituencyBoundaryResponse>(
    `/api/v1/geo/constituencies/${encodeURIComponent(masterId)}/boundary`,
  );
}
