import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Building,
  Globe2,
  Landmark,
  MapPin,
  ShieldCheck,
  ToggleLeft,
  TreePine,
} from "lucide-react";
import { apiFetch } from "../../utils/apiConfig";
import { SmartForm } from "../../components/form/SmartForm";
import type {
  FormSectionConfig,
  SelectOption,
} from "../../components/form/SmartForm";
import { FormPageHeader } from "../../components/form/FormPageHeader";
import {
  BoundaryMapEditor,
  type GeoBoundary,
} from "../../components/map/BoundaryMapEditor";
import {
  fetchConstituencies,
  fetchConstituencyBoundary,
  fetchCountries,
  fetchDistricts,
  fetchStates,
  type GeoConstituency,
} from "../../utils/geoCatalog";
import { getLocationCenter } from "../../utils/locationCenters";

interface VidhanSabhaFormData {
  _id?: string;
  country: string;
  state: string;
  district: string;
  masterId: string;
  vidhanSabhaName: string;
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
  masterId: "",
  vidhanSabhaName: "",
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
  const [boundaryHint, setBoundaryHint] = useState("");
  const [loadingBoundary, setLoadingBoundary] = useState(false);

  const [countryOptions, setCountryOptions] = useState<SelectOption[]>([]);
  const [stateOptions, setStateOptions] = useState<SelectOption[]>([]);
  const [districtOptions, setDistrictOptions] = useState<SelectOption[]>([]);
  const [constituencies, setConstituencies] = useState<GeoConstituency[]>([]);

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
          country: editEntry.country || "India",
          masterId: editEntry.masterId || "",
          vidhanSabhaName: editEntry.vidhanSabhaName || "",
          totalOxygenDisplay:
            editEntry.estimatedOxygenTonsPerYear != null
              ? `${editEntry.estimatedOxygenTonsPerYear} tonnes/year`
              : formatOxygen(editEntry.totalAnnualOxygenKg),
        }
      : emptyForm,
  );

  const vsOptions: SelectOption[] = useMemo(() => {
    const opts = constituencies.map((c) => ({
      label: c.hasBoundary === false ? `${c.name} (no boundary)` : c.name,
      value: c.id,
    }));
    if (
      formData.masterId &&
      !opts.some((o) => o.value === formData.masterId)
    ) {
      opts.unshift({
        label: `${formData.vidhanSabhaName || formData.masterId} (saved)`,
        value: formData.masterId,
      });
    }
    return opts;
  }, [constituencies, formData.masterId, formData.vidhanSabhaName]);

  useEffect(() => {
    fetchCountries()
      .then(setCountryOptions)
      .catch(() => setCountryOptions([{ label: "India", value: "India" }]));
  }, []);

  useEffect(() => {
    if (!formData.country) return;
    fetchStates(formData.country)
      .then(setStateOptions)
      .catch(() => setStateOptions([]));
  }, [formData.country]);

  useEffect(() => {
    if (!formData.state) {
      setDistrictOptions([]);
      return;
    }
    fetchDistricts(formData.state, formData.country)
      .then(setDistrictOptions)
      .catch(() => setDistrictOptions([]));
  }, [formData.state, formData.country]);

  useEffect(() => {
    if (!formData.district) {
      setConstituencies([]);
      return;
    }
    fetchConstituencies(formData.state, formData.district, formData.country)
      .then(setConstituencies)
      .catch(() => setConstituencies([]));
  }, [formData.state, formData.district, formData.country]);

  const handleLoadBoundary = async () => {
    if (!formData.masterId) {
      setBoundaryHint("Select a Vidhan Sabha first");
      return;
    }
    setLoadingBoundary(true);
    setBoundaryHint("Loading boundary…");
    try {
      const data = await fetchConstituencyBoundary(formData.masterId);
      setBoundary(data.boundary);
      setBoundaryCleared(false);
      setBoundaryHint(
        data.message || "Boundary loaded. Edit if needed, then save.",
      );
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : "";
      const label = formData.vidhanSabhaName || "this Vidhan Sabha";
      const missing =
        /boundary not found|draw the boundary manually|no boundary/i.test(raw);
      setBoundaryHint(
        missing
          ? `No ready map outline for “${label}”. Use Draw Polygon on the map (Focus District → draw → Save). This is normal when the boundary file is not imported yet.`
          : raw || "Could not load boundary. Please draw it manually on the map.",
      );
    } finally {
      setLoadingBoundary(false);
    }
  };

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => {
      if (name === "country") {
        setBoundary(null);
        setBoundaryCleared(true);
        setBoundaryHint("");
        return {
          ...prev,
          country: value,
          state: "",
          district: "",
          masterId: "",
          vidhanSabhaName: "",
        };
      }
      if (name === "state") {
        setBoundary(null);
        setBoundaryCleared(true);
        setBoundaryHint("");
        return {
          ...prev,
          state: value,
          district: "",
          masterId: "",
          vidhanSabhaName: "",
        };
      }
      if (name === "district") {
        setBoundary(null);
        setBoundaryCleared(true);
        setBoundaryHint("");
        return {
          ...prev,
          district: value,
          masterId: "",
          vidhanSabhaName: "",
        };
      }
      if (name === "masterId") {
        const hit = constituencies.find((c) => c.id === value);
        setBoundary(null);
        setBoundaryCleared(true);
        setBoundaryHint(
          hit
            ? "Click Load Boundary to show the polygon on the map."
            : "",
        );
        return {
          ...prev,
          masterId: value,
          vidhanSabhaName: hit?.name || prev.vidhanSabhaName,
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleBoundaryChange = (next: GeoBoundary | null) => {
    setBoundary(next);
    setBoundaryCleared(next === null);
    if (next === null) setBoundaryHint("Boundary cleared");
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
    if (!formData.masterId && !formData.vidhanSabhaName.trim()) {
      setError("Please select a Vidhan Sabha");
      return;
    }

    setSubmitting(true);

    const {
      _id,
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
      masterId: formData.masterId || undefined,
      vidhanSabhaName: formData.vidhanSabhaName,
      country: formData.country || "India",
      state: formData.state,
      district: formData.district,
      status: formData.status,
    };

    if (boundary) {
      payload.boundary = boundary;
    } else if (boundaryCleared && editEntry?._id) {
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
      <>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 12,
            alignItems: "center",
          }}
        >
          <button
            type="button"
            className="btn-primary"
            onClick={handleLoadBoundary}
            disabled={!formData.masterId || loadingBoundary}
          >
            {loadingBoundary ? "Loading…" : "Load Boundary"}
          </button>
          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            Loads GeoJSON from master id, then you can edit on the map.
          </span>
        </div>
        <BoundaryMapEditor
          boundary={boundary}
          onChange={handleBoundaryChange}
          country={formData.country}
          state={formData.state}
          district={formData.district}
          name={formData.vidhanSabhaName}
          onFocusPlace={async () =>
            getLocationCenter(formData.state, formData.district)
          }
          onAutoLoad={async () => {
            if (!formData.masterId) {
              throw new Error("Select a Vidhan Sabha first");
            }
            const data = await fetchConstituencyBoundary(formData.masterId);
            return {
              boundary: data.boundary,
              center: data.center,
              message: data.message,
            };
          }}
        />
        {boundaryHint && (
          <div
            style={{
              marginTop: 10,
              padding: "10px 12px",
              borderRadius: 10,
              fontSize: 13,
              lineHeight: 1.45,
              color: /no ready map outline|draw polygon/i.test(boundaryHint)
                ? "#8a5a00"
                : "var(--text-secondary)",
              background: /no ready map outline|draw polygon/i.test(boundaryHint)
                ? "rgba(245, 180, 40, 0.12)"
                : "rgba(43, 150, 79, 0.06)",
              border: `1px solid ${
                /no ready map outline|draw polygon/i.test(boundaryHint)
                  ? "rgba(245, 180, 40, 0.35)"
                  : "rgba(43, 150, 79, 0.2)"
              }`,
            }}
            role="status"
          >
            {boundaryHint}
          </div>
        )}
      </>
    ),
    [
      boundary,
      boundaryHint,
      formData.country,
      formData.state,
      formData.district,
      formData.vidhanSabhaName,
      formData.masterId,
      loadingBoundary,
    ],
  );

  const sections: FormSectionConfig[] = [
    {
      title: "Location",
      description:
        "Country → State → District → Vidhan Sabha (master catalog). Then Load Boundary.",
      icon: Globe2,
      fields: [
        {
          name: "country",
          label: "Country",
          type: "select",
          icon: Globe2,
          required: true,
          options: countryOptions,
        },
        {
          name: "state",
          label: "State",
          type: "select",
          icon: MapPin,
          required: true,
          options: stateOptions,
        },
        {
          name: "district",
          label: "District",
          type: "select",
          icon: Landmark,
          required: true,
          options: districtOptions,
        },
        {
          name: "masterId",
          label: "Vidhan Sabha",
          type: "select",
          icon: Building,
          required: true,
          options: vsOptions,
          span: 2,
          helpText: formData.district
            ? vsOptions.length
              ? "Master catalog id is saved as masterId (e.g. mp-indore-3)."
              : "No master constituencies for this district yet."
            : "Select a district first.",
        },
      ],
    },
    {
      title: "Status",
      description: "Constituency active or inactive. Mitras are assigned when creating a Mitra.",
      icon: ToggleLeft,
      fields: [
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
      title: "Boundary",
      description:
        "Click Load Boundary, edit on map if needed, then Save Vidhan Sabha.",
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
        subtitle="Select master constituency → Load Boundary → Save (stores masterId)."
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
