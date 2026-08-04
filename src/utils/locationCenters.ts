/**
 * Offline map focus helpers. Used when OpenStreetMap Nominatim is unreachable
 * from the browser (DNS / firewall / offline). Approximate centroids only.
 */

export type LatLng = { lat: number; lng: number };

const STATE_CENTERS: Record<string, LatLng> = {
  "Andhra Pradesh": { lat: 15.91, lng: 79.74 },
  "Arunachal Pradesh": { lat: 28.22, lng: 94.73 },
  Assam: { lat: 26.2, lng: 92.94 },
  Bihar: { lat: 25.1, lng: 85.31 },
  Chhattisgarh: { lat: 21.28, lng: 81.87 },
  Goa: { lat: 15.3, lng: 74.12 },
  Gujarat: { lat: 22.26, lng: 71.19 },
  Haryana: { lat: 29.06, lng: 76.09 },
  "Himachal Pradesh": { lat: 31.1, lng: 77.17 },
  Jharkhand: { lat: 23.61, lng: 85.28 },
  Karnataka: { lat: 15.32, lng: 75.71 },
  Kerala: { lat: 10.85, lng: 76.27 },
  "Madhya Pradesh": { lat: 23.47, lng: 77.95 },
  Maharashtra: { lat: 19.75, lng: 75.71 },
  Manipur: { lat: 24.66, lng: 93.91 },
  Meghalaya: { lat: 25.47, lng: 91.37 },
  Mizoram: { lat: 23.16, lng: 92.94 },
  Nagaland: { lat: 26.16, lng: 94.56 },
  Odisha: { lat: 20.95, lng: 85.1 },
  Punjab: { lat: 31.15, lng: 75.34 },
  Rajasthan: { lat: 27.02, lng: 74.22 },
  Sikkim: { lat: 27.53, lng: 88.51 },
  "Tamil Nadu": { lat: 11.13, lng: 78.66 },
  Telangana: { lat: 18.11, lng: 79.02 },
  Tripura: { lat: 23.94, lng: 91.99 },
  "Uttar Pradesh": { lat: 26.85, lng: 80.91 },
  Uttarakhand: { lat: 30.07, lng: 79.02 },
  "West Bengal": { lat: 22.99, lng: 87.85 },
  Delhi: { lat: 28.61, lng: 77.21 },
  "Jammu and Kashmir": { lat: 33.78, lng: 76.58 },
  Ladakh: { lat: 34.23, lng: 77.56 },
  Chandigarh: { lat: 30.73, lng: 76.78 },
  Puducherry: { lat: 11.94, lng: 79.81 },
};

/** key: `${state}::${district}` lowercased */
const DISTRICT_CENTERS: Record<string, LatLng> = {
  // Madhya Pradesh
  "madhya pradesh::agar malwa": { lat: 23.71, lng: 76.02 },
  "madhya pradesh::bhopal": { lat: 23.26, lng: 77.41 },
  "madhya pradesh::indore": { lat: 22.72, lng: 75.86 },
  "madhya pradesh::jabalpur": { lat: 23.18, lng: 79.99 },
  "madhya pradesh::gwalior": { lat: 26.22, lng: 78.18 },
  "madhya pradesh::ujjain": { lat: 23.18, lng: 75.78 },
  "madhya pradesh::sagar": { lat: 23.84, lng: 78.74 },
  "madhya pradesh::rewa": { lat: 24.53, lng: 81.3 },
  "madhya pradesh::satna": { lat: 24.58, lng: 80.83 },
  "madhya pradesh::vidisha": { lat: 23.53, lng: 77.81 },
  "madhya pradesh::khargone": { lat: 21.82, lng: 75.61 },
  "madhya pradesh::khandwa": { lat: 21.83, lng: 76.35 },
  "madhya pradesh::betul": { lat: 21.9, lng: 77.9 },
  "madhya pradesh::chhindwara": { lat: 22.06, lng: 78.94 },
  "madhya pradesh::seoni": { lat: 22.09, lng: 79.55 },
  "madhya pradesh::mandsaur": { lat: 24.07, lng: 75.08 },
  "madhya pradesh::ratlam": { lat: 23.33, lng: 75.04 },
  "madhya pradesh::dewas": { lat: 22.96, lng: 76.05 },
  "madhya pradesh::dhar": { lat: 22.6, lng: 75.3 },
  "madhya pradesh::sehore": { lat: 23.2, lng: 77.08 },
  "madhya pradesh::raisen": { lat: 23.33, lng: 77.78 },
  "madhya pradesh::hoshangabad (narmadapuram)": { lat: 22.75, lng: 77.72 },
  // Bihar
  "bihar::patna": { lat: 25.59, lng: 85.14 },
  "bihar::gaya": { lat: 24.8, lng: 85.0 },
  "bihar::muzaffarpur": { lat: 26.12, lng: 85.39 },
  "bihar::bhagalpur": { lat: 25.25, lng: 87.0 },
  "bihar::katihar": { lat: 25.54, lng: 87.58 },
  "bihar::purnia": { lat: 25.78, lng: 87.47 },
  "bihar::darbhanga": { lat: 26.15, lng: 85.9 },
  "bihar::nalanda": { lat: 25.2, lng: 85.52 },
  "bihar::rohtas": { lat: 24.95, lng: 84.0 },
  "bihar::saran": { lat: 25.85, lng: 84.85 },
  "bihar::siwan": { lat: 26.22, lng: 84.36 },
  "bihar::begusarai": { lat: 25.42, lng: 86.13 },
  "bihar::samastipur": { lat: 25.86, lng: 85.78 },
  "bihar::madhubani": { lat: 26.35, lng: 86.07 },
  "bihar::aurangabad": { lat: 24.75, lng: 84.37 },
};

function norm(s: string) {
  return s.trim().toLowerCase();
}

/** Approximate map center for state/district — works offline. */
export function getLocationCenter(
  state?: string,
  district?: string,
): LatLng | null {
  if (state && district) {
    const key = `${norm(state)}::${norm(district)}`;
    if (DISTRICT_CENTERS[key]) return DISTRICT_CENTERS[key];
  }
  if (state && STATE_CENTERS[state]) return STATE_CENTERS[state];
  // fuzzy state match
  if (state) {
    const hit = Object.keys(STATE_CENTERS).find(
      (k) => norm(k) === norm(state),
    );
    if (hit) return STATE_CENTERS[hit];
  }
  return { lat: 22.97, lng: 78.66 }; // India centroid fallback
}

/** Small demo polygon around a center (lng/lat GeoJSON). */
export function demoBoundaryAround(
  center: LatLng,
  deltaDeg = 0.035,
): {
  type: "Polygon";
  coordinates: number[][][];
} {
  const { lat, lng } = center;
  return {
    type: "Polygon",
    coordinates: [
      [
        [lng - deltaDeg, lat - deltaDeg],
        [lng + deltaDeg, lat - deltaDeg],
        [lng + deltaDeg, lat + deltaDeg],
        [lng - deltaDeg, lat + deltaDeg],
        [lng - deltaDeg, lat - deltaDeg],
      ],
    ],
  };
}
