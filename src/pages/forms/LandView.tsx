import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Building2,
  Hash,
  Landmark,
  MapPin,
  MapPinned,
  Phone,
  TreePine,
  User,
  Pencil,
} from "lucide-react";
import { DetailView } from "../../components/view/DetailView";
import { apiFetch } from "../../utils/apiConfig";
import { OWNERSHIP_LABELS, STATUS_LABELS } from "../../utils/landCapacity";
import type { LandRow } from "../Lands";

export const LandView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const stateLand = location.state?.land as LandRow | undefined;
  const [land, setLand] = useState<any>(stateLand || null);
  const [loading, setLoading] = useState(!!stateLand?._id);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!stateLand?._id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    apiFetch(`/api/v1/lands/${stateLand._id}`)
      .then((data) => {
        if (!cancelled) setLand(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load land");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [stateLand?._id]);

  if (!stateLand && !land) {
    return (
      <div className="dashboard-area">
        <DetailView
          title="Land Details"
          onBack={() => navigate("/lands")}
          headline="Land not found"
          sections={[]}
          error="Open from Land Management → View."
        />
      </div>
    );
  }

  const data = land || stateLand;

  return (
    <div className="dashboard-area">
      <DetailView
        title="Land Details"
        subtitle="Plantation land parcel"
        onBack={() => navigate("/lands")}
        headline={data.landName}
        subheadline={[data.landId, data.vidhanSabha, data.district]
          .filter(Boolean)
          .join(" · ")}
        badges={[
          {
            label: OWNERSHIP_LABELS[data.ownershipType] || data.ownershipType,
            tone: "info",
          },
          {
            label: STATUS_LABELS[data.status] || data.status,
            tone:
              data.status === "AVAILABLE"
                ? "success"
                : data.status === "FULLY_OCCUPIED"
                  ? "danger"
                  : "warning",
          },
        ]}
        meta={[
          {
            label: "Tree Capacity",
            value: data.maxTreeCapacity?.toLocaleString?.() ?? data.maxTreeCapacity,
            icon: TreePine,
          },
          {
            label: "Trees Planted",
            value: data.plantedTrees?.toLocaleString?.() ?? data.plantedTrees,
            icon: TreePine,
          },
          {
            label: "Remaining",
            value:
              data.availableCapacity?.toLocaleString?.() ??
              data.availableCapacity,
            icon: TreePine,
          },
          {
            label: "Area",
            value: `${data.totalArea} ${String(data.areaUnit || "").replace("_", " ")}`,
            icon: MapPinned,
          },
        ]}
        sections={[
          {
            title: "Ownership",
            icon: Building2,
            fields: [
              {
                label: "Ownership Type",
                value: OWNERSHIP_LABELS[data.ownershipType] || data.ownershipType,
                icon: Building2,
              },
              {
                label: "Department / Org",
                value: data.departmentName,
                icon: Building2,
              },
              { label: "Owner / Contact", value: data.ownerName, icon: User },
              { label: "Mobile", value: data.mobile, icon: Phone },
            ],
          },
          {
            title: "Land & Location",
            icon: MapPin,
            fields: [
              { label: "Land ID", value: data.landId, icon: Hash },
              {
                label: "Khasra / Survey No.",
                value: data.khasraNumber,
                icon: Hash,
              },
              { label: "State", value: data.state, icon: Building2 },
              { label: "District", value: data.district, icon: Landmark },
              {
                label: "Vidhan Sabha",
                value: data.vidhanSabha,
                icon: Landmark,
              },
              { label: "Country", value: data.country || "India", icon: MapPin },
              { label: "Tehsil", value: data.tehsil, icon: MapPin },
              {
                label: "Village / City",
                value: data.villageOrCity || data.village,
                icon: MapPin,
              },
              {
                label: "Land Address",
                value: data.landAddress,
                icon: MapPin,
              },
              { label: "Landmark", value: data.landmark, icon: Landmark },
              { label: "PIN Code", value: data.pinCode, icon: Hash },
              {
                label: "Latitude",
                value: data.latitude,
                icon: MapPin,
              },
              {
                label: "Longitude",
                value: data.longitude,
                icon: MapPin,
              },
              {
                label: "Area (acres)",
                value: data.totalAreaAcres,
                icon: MapPinned,
              },
            ],
          },
        ]}
        actions={
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate("/lands/edit", { state: { land: data } })}
          >
            <Pencil size={16} /> Edit Land
          </button>
        }
        loading={loading}
        error={error}
      />
    </div>
  );
};

export default LandView;
