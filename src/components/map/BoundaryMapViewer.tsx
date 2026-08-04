import React, { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { GeoBoundary } from "./BoundaryMapEditor";

function FitBoundary({ boundary }: { boundary: GeoBoundary | null }) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    if (!boundary) {
      map.setView([23.25, 77.41], 7);
      return;
    }
    try {
      const layer = L.geoJSON(boundary as GeoJSON.GeoJsonObject, {
        style: { color: "#2B964F", weight: 2, fillOpacity: 0.22 },
      });
      layer.addTo(map);
      const bounds = layer.getBounds();
      if (bounds.isValid()) map.fitBounds(bounds.pad(0.12));
      return () => {
        map.removeLayer(layer);
      };
    } catch {
      return undefined;
    }
  }, [boundary, map]);

  return null;
}

export const BoundaryMapViewer: React.FC<{
  boundary: GeoBoundary | null;
  height?: number | string;
}> = ({ boundary, height = 320 }) => {
  return (
    <div
      style={{
        height,
        width: "100%",
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid var(--border-color, #e5e7eb)",
        background: "#e8f0ea",
      }}
    >
      <MapContainer
        center={[23.25, 77.41]}
        zoom={7}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBoundary boundary={boundary} />
      </MapContainer>
    </div>
  );
};

export default BoundaryMapViewer;
