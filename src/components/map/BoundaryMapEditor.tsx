import React, { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import { Eraser, Loader2, Pencil, RefreshCw, Search } from "lucide-react";
import "./BoundaryMapEditor.css";

export type GeoBoundary = {
  type: "Polygon" | "MultiPolygon";
  coordinates: number[][][] | number[][][][];
};

type LatLng = { lat: number; lng: number };

interface BoundaryMapEditorProps {
  boundary: GeoBoundary | null;
  onChange: (boundary: GeoBoundary | null) => void;
  state?: string;
  district?: string;
  name?: string;
  country?: string;
  onAutoLoad?: () => Promise<{
    boundary: GeoBoundary;
    center?: LatLng;
    message?: string;
  } | null>;
  onFocusPlace?: () => Promise<LatLng | null>;
}

function serializeBoundary(b: GeoBoundary | null): string {
  if (!b) return "";
  try {
    return JSON.stringify(b);
  } catch {
    return "";
  }
}

function MapTools({
  boundary,
  onChange,
  flyTo,
}: {
  boundary: GeoBoundary | null;
  onChange: (b: GeoBoundary | null) => void;
  flyTo: (LatLng & { zoom?: number }) | null;
}) {
  const map = useMap();
  const featureGroupRef = useRef<L.FeatureGroup | null>(null);
  const onChangeRef = useRef(onChange);
  const lastEmittedRef = useRef<string>("");
  onChangeRef.current = onChange;

  const emitFromGroup = (group: L.FeatureGroup) => {
    const layers = group.getLayers();
    if (layers.length === 0) {
      lastEmittedRef.current = "";
      onChangeRef.current(null);
      return;
    }
    const geo = (layers[0] as L.Polygon).toGeoJSON() as GeoJSON.Feature;
    if (
      geo.geometry?.type === "Polygon" ||
      geo.geometry?.type === "MultiPolygon"
    ) {
      const next = geo.geometry as GeoBoundary;
      lastEmittedRef.current = serializeBoundary(next);
      onChangeRef.current(next);
    }
  };

  useEffect(() => {
    const group = new L.FeatureGroup();
    featureGroupRef.current = group;
    map.addLayer(group);

    const drawControl = new L.Control.Draw({
      position: "topright",
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
          shapeOptions: { color: "#2B964F", weight: 2 },
        },
        rectangle: {
          shapeOptions: { color: "#2B964F", weight: 2 },
        },
        polyline: false,
        circle: false,
        circlemarker: false,
        marker: false,
      },
      edit: {
        featureGroup: group,
        remove: true,
      },
    });
    map.addControl(drawControl);

    const onCreated = (e: L.LeafletEvent) => {
      const event = e as L.DrawEvents.Created;
      group.clearLayers();
      group.addLayer(event.layer);
      emitFromGroup(group);
    };
    const onEdited = () => emitFromGroup(group);
    const onDeleted = () => {
      group.clearLayers();
      lastEmittedRef.current = "";
      onChangeRef.current(null);
    };

    map.on(L.Draw.Event.CREATED, onCreated);
    map.on(L.Draw.Event.EDITED, onEdited);
    map.on(L.Draw.Event.DELETED, onDeleted);

    const invalidate = () => map.invalidateSize();
    const timer = window.setTimeout(invalidate, 120);
    window.addEventListener("resize", invalidate);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", invalidate);
      map.off(L.Draw.Event.CREATED, onCreated);
      map.off(L.Draw.Event.EDITED, onEdited);
      map.off(L.Draw.Event.DELETED, onDeleted);
      map.removeControl(drawControl);
      map.removeLayer(group);
      featureGroupRef.current = null;
    };
  }, [map]);

  // Sync external boundary (auto-load / edit form load) → map layers
  useEffect(() => {
    const group = featureGroupRef.current;
    if (!group) return;

    const key = serializeBoundary(boundary);
    if (key === lastEmittedRef.current) return;

    group.clearLayers();
    lastEmittedRef.current = key;

    if (!boundary) return;

    try {
      const layer = L.geoJSON(boundary as GeoJSON.GeoJsonObject, {
        style: { color: "#2B964F", weight: 2, fillOpacity: 0.2 },
      });
      layer.eachLayer((l) => group.addLayer(l));
      const bounds = group.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds.pad(0.15));
      }
    } catch {
      /* ignore invalid geojson */
    }
  }, [boundary, map]);

  useEffect(() => {
    if (!flyTo) return;
    map.flyTo([flyTo.lat, flyTo.lng], flyTo.zoom ?? 11, { duration: 0.9 });
  }, [flyTo, map]);

  useEffect(() => {
    const startDraw = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const drawer = new (L as any).Draw.Polygon(map, {
        allowIntersection: false,
        shapeOptions: { color: "#2B964F", weight: 2 },
      });
      drawer.enable();
    };
    const startEdit = () => {
      const group = featureGroupRef.current;
      if (!group || group.getLayers().length === 0) return;
      // Prefer built-in toolbar edit button if present
      const editBtn = map
        .getContainer()
        .querySelector(".leaflet-draw-edit-edit") as HTMLElement | null;
      if (editBtn) {
        editBtn.click();
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const editor = new (L as any).EditToolbar.Edit(map, {
        featureGroup: group,
      });
      editor.enable();
    };
    const clearAll = () => {
      featureGroupRef.current?.clearLayers();
      lastEmittedRef.current = "";
      onChangeRef.current(null);
    };

    const root = map.getContainer().closest(".boundary-editor");
    if (!root) return;

    root.addEventListener("boundary:draw", startDraw);
    root.addEventListener("boundary:edit", startEdit);
    root.addEventListener("boundary:clear", clearAll);
    return () => {
      root.removeEventListener("boundary:draw", startDraw);
      root.removeEventListener("boundary:edit", startEdit);
      root.removeEventListener("boundary:clear", clearAll);
    };
  }, [map]);

  return null;
}

export const BoundaryMapEditor: React.FC<BoundaryMapEditorProps> = ({
  boundary,
  onChange,
  state,
  district,
  name,
  onAutoLoad,
  onFocusPlace,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [flyTo, setFlyTo] = useState<(LatLng & { zoom?: number }) | null>(
    null,
  );

  const center = useMemo(() => ({ lat: 23.25, lng: 77.41 }), []);

  const dispatch = (eventName: string) => {
    rootRef.current?.dispatchEvent(
      new CustomEvent(eventName, { bubbles: true }),
    );
  };

  const handleFocusDistrict = async () => {
    if (!onFocusPlace) return;
    setLoading(true);
    setError("");
    try {
      const c = await onFocusPlace();
      if (c) {
        setFlyTo({ ...c, zoom: district ? 11 : 8 });
        setStatus(
          district
            ? `Map focused on ${district}${state ? `, ${state}` : ""}`
            : "Map focused",
        );
      } else {
        setError("Could not find that district on the map");
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to focus map");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!district || !onFocusPlace) return;
    let cancelled = false;
    (async () => {
      try {
        const c = await onFocusPlace();
        if (!cancelled && c) setFlyTo({ ...c, zoom: 11 });
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [district, state]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAutoLoad = async () => {
    if (!onAutoLoad) return;
    if (!name?.trim() && !district?.trim()) {
      setError("Enter Vidhan Sabha name (and district) before Auto Load");
      return;
    }
    setLoading(true);
    setError("");
    setStatus("Loading boundary…");
    try {
      const result = await onAutoLoad();
      if (!result?.boundary) {
        setError("No boundary found. Draw polygon manually.");
        setStatus("");
        return;
      }
      onChange(result.boundary);
      if (result.center) setFlyTo({ ...result.center, zoom: 12 });
      setStatus(
        result.message ||
          "Boundary loaded — edit if needed, then save the form.",
      );
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Auto Load failed");
      setStatus("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="boundary-editor" ref={rootRef}>
      <div className="boundary-editor-toolbar">
        <div className="boundary-editor-toolbar-left">
          <span className="boundary-editor-hint">
            Select district → map zooms there. Auto Load boundary, or Draw /
            Edit like Google Maps. Use map toolbar (top-right) to finish edits.
          </span>
        </div>
        <div className="boundary-editor-toolbar-right">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleFocusDistrict}
            disabled={loading || !district}
          >
            <Search size={15} style={{ marginRight: 6 }} />
            Focus District
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleAutoLoad}
            disabled={loading}
          >
            {loading ? (
              <Loader2 size={15} className="spin" style={{ marginRight: 6 }} />
            ) : (
              <RefreshCw size={15} style={{ marginRight: 6 }} />
            )}
            Auto Load Boundary
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => dispatch("boundary:draw")}
          >
            <Pencil size={15} style={{ marginRight: 6 }} />
            Draw Polygon
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => dispatch("boundary:edit")}
            disabled={!boundary}
          >
            <Pencil size={15} style={{ marginRight: 6 }} />
            Edit
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              dispatch("boundary:clear");
              onChange(null);
              setStatus("Boundary cleared");
            }}
            disabled={!boundary}
          >
            <Eraser size={15} style={{ marginRight: 6 }} />
            Clear
          </button>
        </div>
      </div>

      <MapContainer
        center={[center.lat, center.lng]}
        zoom={7}
        className="boundary-editor-map"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapTools boundary={boundary} onChange={onChange} flyTo={flyTo} />
      </MapContainer>

      <div
        className={`boundary-editor-status${
          error ? " is-error" : boundary ? " has-boundary" : ""
        }`}
      >
        {error
          ? error
          : status ||
            (boundary
              ? "Boundary ready — Save Vidhan Sabha to store it."
              : "No boundary yet. Auto Load or Draw Polygon.")}
      </div>

      <style>{`.spin{animation:bspin .9s linear infinite}@keyframes bspin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default BoundaryMapEditor;
