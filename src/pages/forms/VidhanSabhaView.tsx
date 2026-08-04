import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Building,
  Calendar,
  Leaf,
  MapPin,
  Pencil,
  ShieldCheck,
  TreePine,
  UserCog,
  Wind,
} from "lucide-react";
import { DetailView } from "../../components/view/DetailView";
import { BoundaryMapViewer } from "../../components/map/BoundaryMapViewer";
import type { GeoBoundary } from "../../components/map/BoundaryMapEditor";
import { apiFetch } from "../../utils/apiConfig";

type VsDetail = {
  _id: string;
  vidhanSabhaName: string;
  district?: string;
  state?: string;
  country?: string;
  assignedAdmin?: string;
  status?: string;
  boundary?: GeoBoundary | null;
  hasBoundary?: boolean;
  areaKm2?: number | null;
  perimeterKm?: number | null;
  greenCoverPercent?: number | null;
  totalLands?: number;
  villageCount?: number;
  pendingPlantationRequests?: number;
  totalPersons?: number;
  totalVehicles?: number;
  governmentLandAcres?: number;
  privateLandAcres?: number;
  totalTrees?: number;
  totalAnnualOxygenKg?: number;
  estimatedOxygenTonsPerYear?: number;
  estimatedCo2TonsPerYear?: number;
  remainingPlantationCapacity?: number;
  totalMitras?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
};

const fmt = (n?: number | null, suffix = "") => {
  if (n == null || Number.isNaN(Number(n))) return "—";
  return `${Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 })}${suffix}`;
};

const fmtDate = (iso?: string) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

export const VidhanSabhaDetailView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const stateVs = location.state?.vidhanSabha as VsDetail | undefined;
  const [data, setData] = useState<VsDetail | null>(stateVs || null);
  const [loading, setLoading] = useState(!!stateVs?._id);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!stateVs?._id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    apiFetch<VsDetail>(`/api/v1/vidhan-sabhas/${stateVs._id}`)
      .then((row) => {
        if (!cancelled) setData(row);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load Vidhan Sabha");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [stateVs?._id]);

  if (!stateVs && !data) {
    return (
      <div className="dashboard-area">
        <DetailView
          title="Vidhan Sabha Details"
          onBack={() => navigate("/vidhansabha")}
          headline="Not found"
          sections={[]}
          error="Open from Vidhan Sabha Management → View / Map."
        />
      </div>
    );
  }

  const vs = data || stateVs!;
  const hasBoundary = !!(vs.hasBoundary ?? vs.boundary);

  return (
    <div className="dashboard-area">
      <DetailView
        title="Vidhan Sabha Details"
        subtitle="Boundary, land & plantation overview"
        onBack={() => navigate("/vidhansabha")}
        headline={vs.vidhanSabhaName}
        subheadline={[vs.district, vs.state, vs.country || "India"]
          .filter(Boolean)
          .join(" · ")}
        badges={[
          {
            label: vs.status || "Active",
            tone: vs.status === "Inactive" ? "neutral" : "success",
          },
          {
            label: hasBoundary ? "Boundary Added" : "No Boundary",
            tone: hasBoundary ? "success" : "danger",
          },
        ]}
        meta={[
          {
            label: "Area",
            value: hasBoundary && vs.areaKm2 != null ? `${fmt(vs.areaKm2)} km²` : "—",
            icon: MapPin,
          },
          {
            label: "Green Cover",
            value:
              vs.greenCoverPercent != null ? `${fmt(vs.greenCoverPercent)}%` : "—",
            icon: Leaf,
          },
          {
            label: "Total Lands",
            value: fmt(vs.totalLands, ""),
            icon: MapPin,
          },
          {
            label: "Pending Requests",
            value: fmt(vs.pendingPlantationRequests, ""),
            icon: TreePine,
          },
        ]}
        sections={[
          {
            title: "Geography",
            icon: MapPin,
            fields: [
              {
                label: "Area",
                value:
                  hasBoundary && vs.areaKm2 != null
                    ? `${fmt(vs.areaKm2)} km²`
                    : "—",
                icon: MapPin,
              },
              {
                label: "Perimeter",
                value:
                  hasBoundary && vs.perimeterKm != null
                    ? `${fmt(vs.perimeterKm)} km`
                    : "—",
                icon: MapPin,
              },
              {
                label: "Number of Villages",
                value: fmt(vs.villageCount, ""),
                icon: Building,
              },
              {
                label: "Green Cover %",
                value:
                  vs.greenCoverPercent != null
                    ? `${fmt(vs.greenCoverPercent)}%`
                    : "—",
                icon: Leaf,
              },
            ],
          },
          {
            title: "Resources",
            icon: TreePine,
            fields: [
              {
                label: "Total Persons",
                value: fmt(vs.totalPersons, ""),
                icon: ShieldCheck,
              },
              {
                label: "Total Vehicles",
                value: fmt(vs.totalVehicles, ""),
                icon: ShieldCheck,
              },
              {
                label: "Govt Land",
                value: `${fmt(vs.governmentLandAcres)} Ac`,
                icon: MapPin,
              },
              {
                label: "Private Land",
                value: `${fmt(vs.privateLandAcres)} Ac`,
                icon: MapPin,
              },
              {
                label: "Total Trees",
                value: fmt(vs.totalTrees, ""),
                icon: TreePine,
              },
              {
                label: "Estimated O₂",
                value:
                  vs.estimatedOxygenTonsPerYear != null
                    ? `${fmt(vs.estimatedOxygenTonsPerYear)} t/yr`
                    : "—",
                icon: Wind,
              },
              {
                label: "CO₂ Absorption",
                value:
                  vs.estimatedCo2TonsPerYear != null
                    ? `${fmt(vs.estimatedCo2TonsPerYear)} t/yr`
                    : "—",
                icon: Leaf,
              },
              {
                label: "Remaining Plantation Capacity",
                value: fmt(vs.remainingPlantationCapacity, ""),
                icon: TreePine,
              },
              {
                label: "Total Mitras",
                value: fmt(vs.totalMitras, ""),
                icon: ShieldCheck,
              },
              {
                label: "Plantation Requests (Pending)",
                value: fmt(vs.pendingPlantationRequests, ""),
                icon: TreePine,
              },
            ],
          },
          {
            title: "Administration",
            icon: UserCog,
            fields: [
              {
                label: "Assigned Admin",
                value: vs.assignedAdmin || "—",
                icon: UserCog,
              },
              {
                label: "Created By",
                value: vs.createdBy || "—",
                icon: UserCog,
              },
              {
                label: "Created Date",
                value: fmtDate(vs.createdAt),
                icon: Calendar,
              },
              {
                label: "Last Updated",
                value: fmtDate(vs.updatedAt),
                icon: Calendar,
              },
            ],
          },
        ]}
        actions={
          <button
            type="button"
            className="btn-primary"
            onClick={() =>
              navigate("/vidhansabha/edit", { state: { vidhanSabha: vs } })
            }
          >
            <Pencil size={16} /> Edit
          </button>
        }
        loading={loading}
        error={error}
      >
        <div className="form-section" style={{ marginTop: 8 }}>
          <div className="form-section-header">
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div className="form-section-icon">
                <MapPin size={18} />
              </div>
              <div>
                <div className="form-section-title">Interactive Map</div>
                <div className="form-section-description">
                  {hasBoundary
                    ? "Constituency boundary polygon"
                    : "No boundary drawn yet — edit to add one."}
                </div>
              </div>
            </div>
          </div>
          <BoundaryMapViewer
            boundary={hasBoundary ? (vs.boundary as GeoBoundary) : null}
            height={360}
          />
        </div>
      </DetailView>
    </div>
  );
};

export default VidhanSabhaDetailView;
