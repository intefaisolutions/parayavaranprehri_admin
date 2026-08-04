import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Building,
  Globe2,
  Landmark,
  MapPin,
  ShieldCheck,
  ToggleLeft,
  TreePine,
  UserCog,
} from "lucide-react";
import { apiFetch } from "../../utils/apiConfig";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig } from "../../components/form/SmartForm";
import { FormPageHeader } from "../../components/form/FormPageHeader";
import {
  BoundaryMapEditor,
  type GeoBoundary,
} from "../../components/map/BoundaryMapEditor";
import {
  COUNTRY_OPTIONS,
  getDistrictOptions,
  getStateOptions,
} from "../../utils/indiaLocations";

interface VidhanSabhaFormData {
  _id?: string;
  country: string;
  state: string;
  district: string;
  vidhanSabhaName: string;
  assignedAdmin: string;
  status: "Active" | "Inactive";
  totalPersons?: number;
  totalVehicles?: number;
  totalTrees?: number;
  totalAnnualOxygenKg?: number;
  totalOxygenDisplay?: string;
  governmentLandAcres?: number;
  privateLandAcres?: number;
  remainingPlantationCapacity?: number;
  estimatedOxygenTonsPerYear?: number;
  totalMitras?: number;
}

const emptyForm: VidhanSabhaFormData = {
  country: "India",
  state: "Madhya Pradesh",
  district: "",
  vidhanSabhaName: "",
  assignedAdmin: "",
  status: "Active",
};

function asGeoBoundary(raw: unknown): GeoBoundary | null {
  if (!raw || typeof raw !== "object") return null;
  const b = raw as { type?: string; coordinates?: unknown };
  if (
    (b.type === "Polygon" || b.type === "MultiPolygon") &&
    Array.isArray(b.coordinates)
  ) {
    return b as GeoBoundary;
  }
  return null;
}

async function geocodePlace(
  query: string,
): Promise<{ lat: number; lng: number } | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "in");
  url.searchParams.set("accept-language", "en");

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "User-Agent": "ParyavaranPrahriAdmin/1.0 (vs-boundary-focus)",
    },
  });
  if (!res.ok) return null;
  const rows = (await res.json()) as Array<{ lat: string; lon: string }>;
  if (!rows[0]) return null;
  return { lat: Number(rows[0].lat), lng: Number(rows[0].lon) };
}

type BoundaryLookupResponse = {
  name?: string;
  boundary: GeoBoundary;
  center?: { lat: number; lng: number };
  message?: string;
  source?: string;
};

export const VidhanSabhaForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const editEntry = location.state?.vidhanSabha;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [boundary, setBoundary] = useState<GeoBoundary | null>(() =>
    asGeoBoundary(editEntry?.boundary),
  );
  const [boundaryCleared, setBoundaryCleared] = useState(false);

  const formatOxygen = (kg?: number) => {
    const value = Number(kg || 0);
    if (value >= 1000) {
      return `${(value / 1000).toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })} tonnes/year`;
    }
    return `${value.toLocaleString()} kg/year`;
  };

  const [formData, setFormData] = useState<VidhanSabhaFormData>(
    editEntry
      ? {
          ...emptyForm,
          ...editEntry,
          country: "India",
          totalOxygenDisplay:
            editEntry.estimatedOxygenTonsPerYear != null
              ? `${editEntry.estimatedOxygenTonsPerYear} tonnes/year`
              : formatOxygen(editEntry.totalAnnualOxygenKg),
        }
      : emptyForm,
  );

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => {
      if (name === "state") {
        return { ...prev, state: value, district: "" };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleBoundaryChange = (next: GeoBoundary | null) => {
    setBoundary(next);
    setBoundaryCleared(next === null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.state) {
      setError("Please select a State");
      return;
    }
    if (!formData.district) {
      setError("Please select a District");
      return;
    }
    if (!formData.vidhanSabhaName.trim()) {
      setError("Please enter the Vidhan Sabha name");
      return;
    }

    setSubmitting(true);

    const {
      _id,
      country: _country,
      totalPersons: _totalPersons,
      totalVehicles: _totalVehicles,
      totalTrees: _totalTrees,
      totalAnnualOxygenKg: _totalO2,
      totalOxygenDisplay: _totalOxygenDisplay,
      governmentLandAcres: _gov,
      privateLandAcres: _priv,
      remainingPlantationCapacity: _rem,
      estimatedOxygenTonsPerYear: _tons,
      totalMitras: _totalMitras,
      ...rest
    } = formData as any;

    const payload: Record<string, unknown> = {
      ...rest,
      country: formData.country || "India",
    };

    if (boundary) {
      payload.boundary = boundary;
    } else if (boundaryCleared && editEntry?._id) {
      // Explicit clear on edit — send null so backend can unset
      payload.boundary = null;
    }

    try {
      if (editEntry?._id) {
        await apiFetch(`/api/v1/vidhan-sabhas/${editEntry._id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/v1/vidhan-sabhas", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      navigate("/vidhansabha");
    } catch (err: any) {
      setError(err.message || "Failed to save Vidhan Sabha");
    } finally {
      setSubmitting(false);
    }
  };

  const boundarySection = useMemo(
    () => (
      <BoundaryMapEditor
        boundary={boundary}
        onChange={handleBoundaryChange}
        country={formData.country}
        state={formData.state}
        district={formData.district}
        name={formData.vidhanSabhaName}
        onFocusPlace={async () => {
          if (!formData.district) return null;
          const q = [formData.district, formData.state, "India"]
            .filter(Boolean)
            .join(", ");
          return geocodePlace(q);
        }}
        onAutoLoad={async () => {
          const params = new URLSearchParams();
          if (formData.country) params.set("country", formData.country);
          if (formData.state) params.set("state", formData.state);
          if (formData.district) params.set("district", formData.district);
          if (formData.vidhanSabhaName.trim()) {
            params.set("name", formData.vidhanSabhaName.trim());
          }
          const data = await apiFetch<BoundaryLookupResponse>(
            `/api/v1/geo/boundary-lookup?${params.toString()}`,
          );
          if (!data?.boundary) return null;
          return {
            boundary: data.boundary,
            center: data.center,
            message: data.message,
          };
        }}
      />
    ),
    [
      boundary,
      formData.country,
      formData.state,
      formData.district,
      formData.vidhanSabhaName,
    ],
  );

  const sections: FormSectionConfig[] = [
    {
      title: "Location",
      description:
        "Pick the Country, State and District first - the Vidhan Sabha belongs to that district.",
      icon: Globe2,
      fields: [
        {
          name: "country",
          label: "Country",
          type: "select",
          icon: Globe2,
          required: true,
          options: COUNTRY_OPTIONS,
          disabled: true,
          helpText: "Currently India-only.",
        },
        {
          name: "state",
          label: "State",
          type: "select",
          icon: MapPin,
          required: true,
          options: getStateOptions(),
          helpText: "Selecting a state loads its districts below.",
        },
        {
          name: "district",
          label: "District",
          type: "select",
          icon: Landmark,
          required: true,
          optionsFor: (data) => getDistrictOptions(data.state),
          helpText: "Map zooms to this district for boundary drawing.",
        },
      ],
    },
    {
      title: "Vidhan Sabha Details",
      description: "Identify the constituency and who manages it.",
      icon: Building,
      fields: [
        {
          name: "vidhanSabhaName",
          label: "Vidhan Sabha Name",
          type: "text",
          icon: Building,
          required: true,
          placeholder: "e.g. Bhopal Dakshin-Paschim",
          span: 2,
          helpText:
            "Used for Auto Load Boundary (DB match or OpenStreetMap lookup).",
        },
        {
          name: "assignedAdmin",
          label: "Assigned Admin",
          type: "text",
          icon: UserCog,
          placeholder:
            "Name of the admin/coordinator managing this constituency",
        },
        {
          name: "status",
          label: "Status",
          type: "select",
          icon: ToggleLeft,
          options: [
            { label: "Active", value: "Active" },
            { label: "Inactive", value: "Inactive" },
          ],
        },
      ],
    },
    {
      title: "Boundary (GeoJSON)",
      description:
        "Auto Load from data/OSM, or draw/edit the polygon on the map. Lands with lat/lng inside this polygon are auto-mapped on save.",
      icon: MapPin,
      fields: [],
      customContent: boundarySection,
    },
    {
      title: "Current Stats",
      description:
        "Trees and O₂ are summed automatically from trees linked to this Vidhan Sabha.",
      icon: TreePine,
      fields: [
        {
          name: "totalPersons",
          label: "Total Persons",
          type: "number",
          icon: ShieldCheck,
          disabled: true,
        },
        {
          name: "totalVehicles",
          label: "Total Vehicles",
          type: "number",
          icon: ShieldCheck,
          disabled: true,
        },
        {
          name: "governmentLandAcres",
          label: "Government Land (Acres)",
          type: "number",
          icon: TreePine,
          disabled: true,
        },
        {
          name: "privateLandAcres",
          label: "Private Land (Acres)",
          type: "number",
          icon: TreePine,
          disabled: true,
        },
        {
          name: "totalTrees",
          label: "Total Trees Planted",
          type: "number",
          icon: TreePine,
          disabled: true,
        },
        {
          name: "totalOxygenDisplay",
          label: "Estimated Annual Oxygen",
          type: "text",
          icon: TreePine,
          disabled: true,
        },
        {
          name: "remainingPlantationCapacity",
          label: "Remaining Plantation Capacity",
          type: "number",
          icon: TreePine,
          disabled: true,
        },
        {
          name: "totalMitras",
          label: "Total Mitras",
          type: "number",
          icon: ShieldCheck,
          disabled: true,
        },
      ],
      visibleWhen: (data) => !!data._id,
    },
  ];

  return (
    <div className="dashboard-area">
      <FormPageHeader
        icon={Building}
        title={editEntry ? "Edit Vidhan Sabha" : "Add Vidhan Sabha"}
        subtitle="Select location → Auto Load or draw boundary on the map → Save. Lands are auto-mapped when their point falls inside the polygon."
        onBack={() => navigate("/vidhansabha")}
      />

      <div className="card">
        <SmartForm
          sections={sections}
          formData={formData}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={error}
          submitLabel={editEntry ? "Update Vidhan Sabha" : "Save Vidhan Sabha"}
          cancelLabel="Cancel"
          onCancel={() => navigate("/vidhansabha")}
        />
      </div>
    </div>
  );
};

export default VidhanSabhaForm;
