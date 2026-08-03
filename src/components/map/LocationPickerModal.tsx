import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  Marker,
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

interface LocationPickerModalProps {
  open: boolean;
  initialLat?: number | "";
  initialLng?: number | "";
  onClose: () => void;
  onConfirm: (coords: LatLng) => void;
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
  const searchSeq = useRef(0);

  useEffect(() => {
    if (!open) return;
    setPicked(hasInitial ? start : null);
    setPlaceLabel("");
    setFlyTarget(null);
    setQuery("");
    setResults([]);
    setSearchError("");
  }, [open, hasInitial, start]);

  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setSearching(false);
      setSearchError("");
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
  }, [query, open]);

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
                Search a place, or click the map to drop a pin
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
              {searching ? (
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

            {(searchError || searching) && results.length === 0 && query.trim().length >= 2 && (
              <div className="loc-picker-search-status">
                {searching ? "Searching…" : searchError}
              </div>
            )}
          </div>

          <div className="loc-picker-hint">
            <MapPin size={14} />
            Tap map to move pin
          </div>

          <MapContainer
            key={`map-${open}-${start.lat}-${start.lng}`}
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
