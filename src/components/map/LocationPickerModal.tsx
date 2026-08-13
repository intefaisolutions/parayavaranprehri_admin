import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  GeoJSON,
  MapContainer,
  Marker,
  Polygon,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import {
  Loader2,
  LocateFixed,
  MapPin,
  Search,
  X,
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import "./LocationPickerModal.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

type LatLng = { lat: number; lng: number };

type SearchHit = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
};

type GeoBoundary = {
  type: "Polygon" | "MultiPolygon";
  coordinates: number[][][] | number[][][][];
};

interface LocationPickerModalProps {
  open: boolean;
  initialLat?: number | "";
  initialLng?: number | "";
  /** Prefills search + auto-focuses map (e.g. "Barwara, Katni, Madhya Pradesh"). */
  initialSearch?: string;
  /** Optional Vidhan Sabha outline to show under the pin. */
  contextBoundary?: GeoBoundary | null;
  /** Land footprint in square meters — draws a square around the pin. */
  areaSqMeters?: number;
  areaLabel?: string;
  onClose: () => void;
  onConfirm: (coords: LatLng) => void;
}

const SQ_METERS_PER_ACRE = 4046.8564224;

/** Axis-aligned square (approx) covering `areaSqMeters` around center. */
export function squareRingAround(
  center: LatLng,
  areaSqMeters: number,
): LatLng[] {
  if (!Number.isFinite(areaSqMeters) || areaSqMeters <= 0) return [];
  const sideM = Math.sqrt(areaSqMeters);
  const half = sideM / 2;
  const latDelta = half / 111_320;
  const cosLat = Math.cos((center.lat * Math.PI) / 180);
  const lngDelta = half / (111_320 * Math.max(0.2, cosLat));
  return [
    { lat: center.lat - latDelta, lng: center.lng - lngDelta },
    { lat: center.lat - latDelta, lng: center.lng + lngDelta },
    { lat: center.lat + latDelta, lng: center.lng + lngDelta },
    { lat: center.lat + latDelta, lng: center.lng - lngDelta },
  ];
}

function ClickToSetMarker({
  position,
  onPick,
}: {
  position: LatLng | null;
  onPick: (coords: LatLng, label?: string) => void;
}) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  if (!position) return null;
  return <Marker position={[position.lat, position.lng]} />;
}

function FlyToTarget({
  target,
  zoom = 15,
}: {
  target: (LatLng & { zoom?: number }) | null;
  zoom?: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    map.flyTo([target.lat, target.lng], target.zoom ?? zoom, {
      duration: 1.1,
    });
  }, [target, map, zoom]);
  return null;
}

function FitLatLngs({ points }: { points: LatLng[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length < 2) return;
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
    if (bounds.isValid()) {
      map.fitBounds(bounds.pad(0.2), { animate: true });
    }
  }, [points, map]);
  return null;
}

function MapAutoResize() {
  const map = useMap();
  useEffect(() => {
    const invalidate = () => map.invalidateSize();
    const timer = window.setTimeout(invalidate, 80);
    window.addEventListener("resize", invalidate);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", invalidate);
    };
  }, [map]);
  return null;
}

async function searchPlaces(query: string): Promise<SearchHit[]> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "6");
  url.searchParams.set("countrycodes", "in");
  url.searchParams.set("accept-language", "en");

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "User-Agent": "ParyavaranPrahriAdmin/1.0 (map-search)",
    },
  });
  if (!res.ok) throw new Error("Search failed");
  return (await res.json()) as SearchHit[];
}

function shortPlaceName(displayName: string) {
  const parts = displayName.split(",").map((p) => p.trim());
  return parts.slice(0, 2).join(", ");
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  open,
  initialLat,
  initialLng,
  initialSearch = "",
  contextBoundary = null,
  areaSqMeters,
  areaLabel,
  onClose,
  onConfirm,
}) => {
  const hasInitial =
    initialLat !== "" &&
    initialLat != null &&
    initialLng !== "" &&
    initialLng != null &&
    !Number.isNaN(Number(initialLat)) &&
    !Number.isNaN(Number(initialLng));

  const start: LatLng = useMemo(
    () =>
      hasInitial
        ? { lat: Number(initialLat), lng: Number(initialLng) }
        : { lat: 23.66, lng: 78.11 },
    [hasInitial, initialLat, initialLng],
  );

  const [picked, setPicked] = useState<LatLng | null>(
    hasInitial ? start : null,
  );
  const [placeLabel, setPlaceLabel] = useState("");
  const [flyTarget, setFlyTarget] = useState<
    (LatLng & { zoom?: number }) | null
  >(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [locating, setLocating] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(false);
  const searchSeq = useRef(0);
  const bootstrapDone = useRef(false);

  const landSquare = useMemo(() => {
    if (!picked || !areaSqMeters || areaSqMeters <= 0) return [];
    // Cap extreme sizes so map stays usable (e.g. typo 999999 acres)
    const capped = Math.min(areaSqMeters, 50_000 * SQ_METERS_PER_ACRE);
    return squareRingAround(picked, capped);
  }, [picked, areaSqMeters]);

  useEffect(() => {
    if (!open) {
      bootstrapDone.current = false;
      return;
    }
    setPicked(hasInitial ? start : null);
    setPlaceLabel("");
    setFlyTarget(null);
    setQuery(initialSearch.trim());
    setResults([]);
    setSearchError("");
  }, [open, hasInitial, start, initialSearch]);

  // On open: search Vidhan Sabha / place and focus map
  useEffect(() => {
    if (!open || bootstrapDone.current) return;
    const q = initialSearch.trim();
    if (!q || hasInitial) {
      bootstrapDone.current = true;
      if (hasInitial) setFlyTarget({ ...start, zoom: 15 });
      return;
    }

    bootstrapDone.current = true;
    let cancelled = false;
    setBootstrapping(true);
    setSearching(true);
    searchPlaces(q)
      .then((hits) => {
        if (cancelled) return;
        const hit = hits[0];
        if (!hit) {
          setSearchError(
            `Could not find “${q}” on the map — search manually or click the area.`,
          );
          return;
        }
        const lat = Number(hit.lat);
        const lng = Number(hit.lon);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
        setPicked({ lat, lng });
        setPlaceLabel(hit.display_name);
        setQuery(shortPlaceName(hit.display_name));
        setFlyTarget({ lat, lng, zoom: 13 });
        setResults([]);
      })
      .catch(() => {
        if (!cancelled) {
          setSearchError("Place search unavailable — zoom/click the map manually.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setSearching(false);
          setBootstrapping(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, initialSearch, hasInitial, start]);

  useEffect(() => {
    if (!open) return;
    // Skip live search while bootstrap owns the query
    if (bootstrapping) return;
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    // Don't re-search the same bootstrap query immediately after auto-pick
    if (initialSearch.trim() && q === shortPlaceName(initialSearch) && picked) {
      return;
    }

    const seq = ++searchSeq.current;
    setSearching(true);
    setSearchError("");
    const timer = setTimeout(() => {
      searchPlaces(q)
        .then((hits) => {
          if (seq !== searchSeq.current) return;
          setResults(hits);
          if (hits.length === 0) {
            setSearchError("No places found — try a village, city or PIN");
          }
        })
        .catch(() => {
          if (seq !== searchSeq.current) return;
          setSearchError("Search unavailable right now");
          setResults([]);
        })
        .finally(() => {
          if (seq === searchSeq.current) setSearching(false);
        });
    }, 400);

    return () => clearTimeout(timer);
  }, [query, open, bootstrapping, initialSearch, picked]);

  if (!open) return null;

  const display = picked || start;

  const pickAt = (coords: LatLng, label?: string, zoom = 15) => {
    setPicked(coords);
    setPlaceLabel(label || "");
    setFlyTarget({ ...coords, zoom });
  };

  const handleSelectResult = (hit: SearchHit) => {
    const lat = Number(hit.lat);
    const lng = Number(hit.lon);
    pickAt({ lat, lng }, hit.display_name, 15);
    setQuery(shortPlaceName(hit.display_name));
    setResults([]);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setSearchError("GPS not supported in this browser");
      return;
    }
    setLocating(true);
    setSearchError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        pickAt(
          {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          },
          "Current GPS location",
          16,
        );
        setLocating(false);
      },
      () => {
        setSearchError("Could not get your GPS location");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div
      className="loc-picker-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Pick location on map"
      onClick={onClose}
    >
      <div className="loc-picker-modal" onClick={(e) => e.stopPropagation()}>
        <div className="loc-picker-header">
          <div className="loc-picker-title-row">
            <div className="loc-picker-icon">
              <MapPin size={20} />
            </div>
            <div>
              <div className="loc-picker-title">Pick Location on Map</div>
              <div className="loc-picker-subtitle">
                {initialSearch
                  ? `Focused on ${initialSearch}. Click to set the land pin.`
                  : "Search a place, or click the map to drop a pin"}
              </div>
            </div>
          </div>
          <button
            type="button"
            className="loc-picker-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="loc-picker-body">
          <div className="loc-picker-search">
            <div className="loc-picker-search-box">
              {searching || bootstrapping ? (
                <Loader2 size={18} className="spin" color="#2B964F" />
              ) : (
                <Search size={18} color="#2B964F" />
              )}
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search village, city, landmark, PIN…"
                autoFocus
                autoComplete="off"
              />
              {query && (
                <button
                  type="button"
                  className="loc-picker-search-clear"
                  onClick={() => {
                    setQuery("");
                    setResults([]);
                    setSearchError("");
                  }}
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {results.length > 0 && (
              <div className="loc-picker-suggestions" role="listbox">
                {results.map((hit) => (
                  <button
                    key={hit.place_id}
                    type="button"
                    className="loc-picker-suggestion"
                    onClick={() => handleSelectResult(hit)}
                  >
                    <MapPin size={16} color="#2B964F" style={{ marginTop: 2 }} />
                    <div>
                      <div className="loc-picker-suggestion-title">
                        {shortPlaceName(hit.display_name)}
                      </div>
                      <div className="loc-picker-suggestion-meta">
                        {hit.display_name}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {(searchError || searching || bootstrapping) &&
              results.length === 0 &&
              query.trim().length >= 2 && (
                <div className="loc-picker-search-status">
                  {bootstrapping || searching
                    ? "Finding Vidhan Sabha on map…"
                    : searchError}
                </div>
              )}
          </div>

          <div className="loc-picker-hint">
            <MapPin size={14} />
            {landSquare.length
              ? `Green square ≈ ${areaLabel || "land area"} around the pin (approximate)`
              : "Tap map to move pin"}
          </div>

          <MapContainer
            key={`map-${open}-${initialSearch || "x"}-${hasInitial ? "pin" : "vs"}`}
            center={[start.lat, start.lng]}
            zoom={hasInitial ? 15 : 12}
            className="loc-picker-map"
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapAutoResize />
            <FlyToTarget target={flyTarget} />
            {contextBoundary?.type && contextBoundary.coordinates ? (
              <GeoJSON
                key="vs-boundary"
                data={contextBoundary as GeoJSON.GeoJsonObject}
                style={{
                  color: "#1b6b38",
                  weight: 2,
                  fillColor: "#2B964F",
                  fillOpacity: 0.08,
                }}
              />
            ) : null}
            {landSquare.length >= 4 ? (
              <>
                <Polygon
                  positions={landSquare.map((p) => [p.lat, p.lng] as [number, number])}
                  pathOptions={{
                    color: "#2B964F",
                    weight: 2,
                    fillColor: "#2B964F",
                    fillOpacity: 0.22,
                  }}
                />
                <FitLatLngs points={landSquare} />
              </>
            ) : null}
            <ClickToSetMarker
              position={picked}
              onPick={(coords) => pickAt(coords)}
            />
          </MapContainer>
        </div>

        <div className="loc-picker-footer">
          <div className="loc-picker-coords">
            <span className="loc-picker-coords-label">Selected coordinates</span>
            <span className="loc-picker-coords-value">
              {display.lat.toFixed(6)}, {display.lng.toFixed(6)}
            </span>
            {placeLabel ? (
              <span className="loc-picker-coords-place" title={placeLabel}>
                {placeLabel}
              </span>
            ) : !picked ? (
              <span className="loc-picker-coords-place">
                Search or click the map to set a pin
              </span>
            ) : null}
          </div>

          <div className="loc-picker-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleUseMyLocation}
              disabled={locating}
            >
              {locating ? (
                <Loader2 size={16} className="spin" style={{ marginRight: 6 }} />
              ) : (
                <LocateFixed size={16} style={{ marginRight: 6 }} />
              )}
              My location
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={!picked}
              onClick={() => {
                if (!picked) return;
                onConfirm({
                  lat: Number(picked.lat.toFixed(6)),
                  lng: Number(picked.lng.toFixed(6)),
                });
              }}
            >
              Use this location
            </button>
          </div>
        </div>
      </div>

      <style>{`.spin { animation: loc-spin 0.9s linear infinite; } @keyframes loc-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default LocationPickerModal;
