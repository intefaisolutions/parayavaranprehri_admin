import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { Loader2, MapPinned, RefreshCw, TreePine } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { apiFetch } from "../utils/apiConfig";
import "./MapManagement.css";

type LandPin = {
  _id: string;
  landName?: string;
  district?: string;
  state?: string;
  vidhanSabha?: string;
  status?: string;
  latitude?: number;
  longitude?: number;
};

type TreePin = {
  _id: string;
  treeName?: string;
  species?: string;
  landName?: string;
  landId?: string;
  status?: string;
  district?: string;
  latitude?: number;
  longitude?: number;
};

const MP_CENTER: [number, number] = [23.2599, 77.4126];

const landIcon = L.divIcon({
  className: "",
  html: `<span style="display:block;width:16px;height:16px;border-radius:50%;background:#2563eb;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></span>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -8],
});

const treeIcon = L.divIcon({
  className: "",
  html: `<span style="display:block;width:14px;height:14px;border-radius:50%;background:#16a34a;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></span>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  popupAnchor: [0, -7],
});

function hasCoords(lat?: number, lng?: number) {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    !(lat === 0 && lng === 0)
  );
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  const key = points.map((p) => p.join(",")).join("|");

  useEffect(() => {
    if (points.length === 0) {
      map.setView(MP_CENTER, 6);
      return;
    }
    if (points.length === 1) {
      map.setView(points[0], 14);
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [48, 48], maxZoom: 15 });
  }, [map, key]);

  return null;
}

export const MapView = () => {
  const navigate = useNavigate();
  const [lands, setLands] = useState<LandPin[]>([]);
  const [trees, setTrees] = useState<TreePin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showLands, setShowLands] = useState(true);
  const [showTrees, setShowTrees] = useState(true);
  const [district, setDistrict] = useState("");
  const [search, setSearch] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [landRows, treeRows] = await Promise.all([
        apiFetch<LandPin[]>("/api/v1/lands"),
        apiFetch<TreePin[]>("/api/v1/trees"),
      ]);
      setLands(Array.isArray(landRows) ? landRows : []);
      setTrees(Array.isArray(treeRows) ? treeRows : []);
    } catch (err: any) {
      setError(err.message || "Failed to load map data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const districtOptions = useMemo(() => {
    const set = new Set<string>();
    for (const l of lands) if (l.district) set.add(l.district);
    for (const t of trees) if (t.district) set.add(t.district);
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [lands, trees]);

  const q = search.trim().toLowerCase();

  const filteredLands = useMemo(() => {
    if (!showLands) return [];
    return lands.filter((l) => {
      if (!hasCoords(l.latitude, l.longitude)) return false;
      if (district && l.district !== district) return false;
      if (!q) return true;
      const hay = `${l.landName || ""} ${l.district || ""} ${l.vidhanSabha || ""} ${l.status || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [lands, showLands, district, q]);

  const filteredTrees = useMemo(() => {
    if (!showTrees) return [];
    return trees.filter((t) => {
      if (!hasCoords(t.latitude, t.longitude)) return false;
      if (district && t.district !== district) return false;
      if (!q) return true;
      const hay = `${t.treeName || ""} ${t.species || ""} ${t.landName || ""} ${t.status || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [trees, showTrees, district, q]);

  const boundsPoints = useMemo(() => {
    const pts: [number, number][] = [];
    for (const l of filteredLands) pts.push([l.latitude!, l.longitude!]);
    for (const t of filteredTrees) pts.push([t.latitude!, t.longitude!]);
    return pts;
  }, [filteredLands, filteredTrees]);

  const landWithCoords = lands.filter((l) =>
    hasCoords(l.latitude, l.longitude),
  ).length;
  const treeWithCoords = trees.filter((t) =>
    hasCoords(t.latitude, t.longitude),
  ).length;

  return (
    <div className="dashboard-area plantation-map-page">
      <div className="page-header">
        <div className="page-title">
          <h1>Plantation Map</h1>
          <p>
            Live view of lands and planted trees from Land &amp; Tree records.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={loadData}
          disabled={loading}
        >
          {loading ? <Loader2 size={18} className="spin" /> : <RefreshCw size={18} />}
          Refresh
        </button>
      </div>

      {error && (
        <div
          style={{
            background: "rgba(255, 61, 0, 0.1)",
            color: "#ff3d00",
            padding: "12px",
            borderRadius: "8px",
          }}
        >
          {error}
        </div>
      )}

      <div className="plantation-map-toolbar">
        <span className="plantation-map-stat lands">
          <MapPinned size={14} />
          {landWithCoords} lands on map
        </span>
        <span className="plantation-map-stat">
          <TreePine size={14} />
          {treeWithCoords} trees on map
        </span>
        <span className="plantation-map-stat muted">
          Showing {filteredLands.length + filteredTrees.length} pins
        </span>

        <input
          className="plantation-map-search"
          type="search"
          placeholder="Search name, species, VS…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="plantation-map-select"
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
        >
          <option value="">All districts</option>
          {districtOptions.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <div className="plantation-map-toggles">
          <label className="plantation-map-toggle">
            <input
              type="checkbox"
              checked={showLands}
              onChange={(e) => setShowLands(e.target.checked)}
            />
            Lands
          </label>
          <label className="plantation-map-toggle">
            <input
              type="checkbox"
              checked={showTrees}
              onChange={(e) => setShowTrees(e.target.checked)}
            />
            Trees
          </label>
        </div>
      </div>

      <div className="plantation-map-shell">
        {loading && (
          <div className="plantation-map-empty">
            <Loader2 size={28} className="spin" />
          </div>
        )}

        {!loading && boundsPoints.length === 0 && (
          <div className="plantation-map-empty">
            No land or tree coordinates to show.
            <br />
            Add lat/lng on Land or Tree forms, then refresh.
          </div>
        )}

        <div className="plantation-map-legend">
          <div className="plantation-map-legend-row">
            <span className="plantation-map-dot land" /> Land
          </div>
          <div className="plantation-map-legend-row">
            <span className="plantation-map-dot tree" /> Tree
          </div>
        </div>

        <MapContainer
          center={MP_CENTER}
          zoom={6}
          scrollWheelZoom
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds points={boundsPoints} />

          {filteredLands.map((land) => (
            <Marker
              key={`land-${land._id}`}
              position={[land.latitude!, land.longitude!]}
              icon={landIcon}
            >
              <Popup>
                <div className="plantation-map-popup">
                  <h4>{land.landName || "Land"}</h4>
                  <p>
                    {[land.district, land.vidhanSabha, land.status]
                      .filter(Boolean)
                      .join(" · ") || "Land record"}
                  </p>
                  <div className="plantation-map-popup-actions">
                    <button
                      type="button"
                      className="primary"
                      onClick={() =>
                        navigate("/lands/view", { state: { land } })
                      }
                    >
                      View
                    </button>
                    <button
                      type="button"
                      className="ghost"
                      onClick={() =>
                        navigate("/lands/edit", { state: { land } })
                      }
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {filteredTrees.map((tree) => (
            <Marker
              key={`tree-${tree._id}`}
              position={[tree.latitude!, tree.longitude!]}
              icon={treeIcon}
            >
              <Popup>
                <div className="plantation-map-popup">
                  <h4>{tree.treeName || tree.species || "Tree"}</h4>
                  <p>
                    {[tree.species, tree.landName, tree.status]
                      .filter(Boolean)
                      .join(" · ") || "Tree record"}
                  </p>
                  <div className="plantation-map-popup-actions">
                    <button
                      type="button"
                      className="primary"
                      onClick={() =>
                        navigate("/trees/edit", { state: { tree } })
                      }
                    >
                      Open tree
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};
