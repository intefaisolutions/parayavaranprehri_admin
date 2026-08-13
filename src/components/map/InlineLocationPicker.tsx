import React, { useEffect, useMemo, useRef } from "react";
import {
  GeoJSON,
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

type GeoBoundary = {
  type: "Polygon" | "MultiPolygon";
  coordinates: number[][][] | number[][][][];
};

const INDIA_CENTER: LatLng = { lat: 23.66, lng: 78.11 };
const FOCUS_ZOOM = 16;
const OVERVIEW_ZOOM = 5;

function isValidCoord(lat?: number | "", lng?: number | "") {
  if (lat === "" || lng === "" || lat == null || lng == null) return false;
  const la = Number(lat);
  const ln = Number(lng);
  return Number.isFinite(la) && Number.isFinite(ln);
}

function ClickPick({
  position,
  onPick,
}: {
  position: LatLng | null;
  onPick: (coords: LatLng) => void;
}) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  if (!position) return null;
  return (
    <Marker
      position={[position.lat, position.lng]}
      draggable
      eventHandlers={{
        dragend: (e) => {
          const m = e.target as L.Marker;
          const p = m.getLatLng();
          onPick({ lat: p.lat, lng: p.lng });
        },
      }}
    />
  );
}

/** Fly / snap to focus — does not re-fly when user drags the pin. */
function SnapToFocus({
  target,
  snapKey,
  zoom = FOCUS_ZOOM,
  boundary,
}: {
  target: LatLng | null;
  snapKey: string;
  zoom?: number;
  boundary?: GeoBoundary | null;
}) {
  const map = useMap();
  const lastSnap = useRef("");

  useEffect(() => {
    const t = window.setTimeout(() => map.invalidateSize(), 80);
    return () => window.clearTimeout(t);
  }, [map, snapKey]);

  useEffect(() => {
    if (!snapKey || snapKey === "empty") return;
    if (lastSnap.current === snapKey) return;
    lastSnap.current = snapKey;

    const run = () => {
      map.invalidateSize();
      if (boundary?.coordinates) {
        try {
          const layer = L.geoJSON(boundary as GeoJSON.GeoJsonObject);
          const bounds = layer.getBounds();
          if (bounds.isValid()) {
            map.fitBounds(bounds.pad(0.15));
            return;
          }
        } catch {
          /* fall through to point */
        }
      }
      if (target) {
        map.setView([target.lat, target.lng], zoom, { animate: true });
      }
    };
    run();
    const t = window.setTimeout(run, 140);
    return () => window.clearTimeout(t);
  }, [target, snapKey, zoom, map, boundary]);

  return null;
}

export interface InlineLocationPickerProps {
  latitude?: number | "";
  longitude?: number | "";
  landLatitude?: number | "";
  landLongitude?: number | "";
  /** Camera center only — does not place a planting pin. */
  viewLatitude?: number | "";
  viewLongitude?: number | "";
  landId?: string;
  /** Optional Vidhan Sabha / land area outline to show on map. */
  boundary?: GeoBoundary | null;
  height?: number;
  loading?: boolean;
  statusNote?: string;
  onChange: (coords: LatLng) => void;
  hint?: string;
}

export const InlineLocationPicker: React.FC<InlineLocationPickerProps> = ({
  latitude,
  longitude,
  landLatitude,
  landLongitude,
  viewLatitude = "",
  viewLongitude = "",
  landId = "",
  boundary = null,
  height = 300,
  loading = false,
  statusNote,
  onChange,
  hint,
}) => {
  const hasPin = isValidCoord(latitude, longitude);
  const hasLand = isValidCoord(landLatitude, landLongitude);
  const hasView = isValidCoord(viewLatitude, viewLongitude);
  const hasFocus = hasPin || hasLand || hasView;

  const focusTarget = useMemo<LatLng | null>(() => {
    if (hasPin) return { lat: Number(latitude), lng: Number(longitude) };
    if (hasLand)
      return { lat: Number(landLatitude), lng: Number(landLongitude) };
    if (hasView)
      return { lat: Number(viewLatitude), lng: Number(viewLongitude) };
    return null;
  }, [
    hasPin,
    hasLand,
    hasView,
    latitude,
    longitude,
    landLatitude,
    landLongitude,
    viewLatitude,
    viewLongitude,
  ]);

  const pin = hasPin
    ? { lat: Number(latitude), lng: Number(longitude) }
    : null;

  const snapKey = landId
    ? `land:${landId}:${hasPin ? "pin" : hasFocus ? "view" : "pending"}`
    : hasFocus && focusTarget
      ? `coords:${focusTarget.lat.toFixed(4)},${focusTarget.lng.toFixed(4)}`
      : "empty";

  const mapKey = `${landId || "noland"}-${hasFocus ? "focused" : "empty"}`;

  const startCenter = focusTarget || INDIA_CENTER;
  const startZoom = hasFocus ? FOCUS_ZOOM : OVERVIEW_ZOOM;

  return (
    <div style={{ marginTop: 4 }}>
      {statusNote ? (
        <div
          style={{
            marginBottom: 8,
            padding: "8px 12px",
            borderRadius: 8,
            background: "rgba(43,150,79,0.08)",
            border: "1px solid rgba(43,150,79,0.25)",
            fontSize: 12,
            color: "var(--text-secondary)",
            lineHeight: 1.45,
          }}
        >
          {statusNote}
        </div>
      ) : null}
      <div
        style={{
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid var(--border-color)",
          height,
          position: "relative",
          background: "#eef5ef",
        }}
      >
        {loading ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 500,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,0.55)",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--accent-color, #2B964F)",
            }}
          >
            Finding land area on map…
          </div>
        ) : null}
        <MapContainer
          key={mapKey}
          center={[startCenter.lat, startCenter.lng]}
          zoom={startZoom}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {boundary?.type && boundary.coordinates ? (
            <GeoJSON
              key={`b-${landId || "x"}`}
              data={boundary as GeoJSON.GeoJsonObject}
              style={{
                color: "#2B964F",
                weight: 2,
                fillColor: "#2B964F",
                fillOpacity: 0.18,
              }}
            />
          ) : null}
          <SnapToFocus
            target={focusTarget}
            snapKey={snapKey}
            zoom={FOCUS_ZOOM}
            boundary={boundary}
          />
          <ClickPick position={pin} onPick={onChange} />
        </MapContainer>
      </div>
      <p
        style={{
          margin: "8px 0 0",
          fontSize: 12,
          color: "var(--text-secondary)",
          lineHeight: 1.45,
        }}
      >
        {hint ||
          (hasPin
            ? "Drag or click again to fine-tune the planting pin on the land."
            : hasFocus
              ? "Map is only zoomed to the area. Click on the land to drop the planting pin (required)."
              : "Select a Land Parcel above — then click the map on the land to set the planting pin.")}
      </p>
    </div>
  );
};

export default InlineLocationPicker;
