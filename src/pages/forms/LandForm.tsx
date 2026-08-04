import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Building2,
  Globe2,
  Hash,
  Landmark,
  MapPin,
  Navigation,
  Phone,
  RefreshCw,
  Ruler,
  TreePine,
  User,
  MapPinned,
} from "lucide-react";
import { apiFetch } from "../../utils/apiConfig";
import {
  recommendMaxTreeCapacity,
  type AreaUnit,
} from "../../utils/landCapacity";
import {
  mergeLocationAutoFill,
  reverseGeocodeLocation,
} from "../../utils/locationAutoFill";
import {
  fetchCountries,
  fetchDistricts,
  fetchStates,
} from "../../utils/geoCatalog";

type RegisteredVidhanSabha = {
  _id: string;
  vidhanSabhaName: string;
  masterId?: string;
  district?: string;
  state?: string;
  status?: string;
};
import { SmartForm } from "../../components/form/SmartForm";
import type {
  FormSectionConfig,
  SelectOption,
} from "../../components/form/SmartForm";
import { FormPageHeader } from "../../components/form/FormPageHeader";
import { LocationPickerModal } from "../../components/map/LocationPickerModal";

interface LandFormData {
  _id?: string;
  landId?: string;
  landName: string;
  ownershipType: string;
  departmentName: string;
  ownerName: string;
  mobile: string;
  country: string;
  state: string;
  district: string;
  tehsil: string;
  villageOrCity: string;
  landAddress: string;
  landmark: string;
  pinCode: string;
  masterId: string;
  vidhanSabha: string;
  vidhanSabhaId: string;
  khasraNumber: string;
  totalArea: number | "";
  areaUnit: AreaUnit;
  maxTreeCapacity: number | "";
  maxCapacityManual: boolean;
  plantedTrees?: number;
  availableCapacity?: number;
  latitude: number | "";
  longitude: number | "";
  status: string;
  remarks: string;
}

const emptyForm: LandFormData = {
  landName: "",
  ownershipType: "GOVERNMENT",
  departmentName: "",
  ownerName: "",
  mobile: "",
  country: "India",
  state: "",
  district: "",
  tehsil: "",
  villageOrCity: "",
  landAddress: "",
  landmark: "",
  pinCode: "",
  masterId: "",
  vidhanSabha: "",
  vidhanSabhaId: "",
  khasraNumber: "",
  totalArea: "",
  areaUnit: "ACRE",
  maxTreeCapacity: "",
  maxCapacityManual: false,
  latitude: "",
  longitude: "",
  status: "AVAILABLE",
  remarks: "",
};

export const LandForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editLand = location.state?.land;
  const isEditing = !!editLand;

  const [formData, setFormData] = useState<LandFormData>(
    editLand
      ? {
          ...emptyForm,
          ...editLand,
          country: editLand.country || "India",
          villageOrCity:
            editLand.villageOrCity || editLand.village || "",
          landAddress: editLand.landAddress || "",
          landmark: editLand.landmark || "",
          pinCode: editLand.pinCode || "",
          masterId: editLand.masterId || "",
          vidhanSabha: editLand.vidhanSabha || "",
          vidhanSabhaId: editLand.vidhanSabhaId
            ? String(editLand.vidhanSabhaId)
            : "",
          totalArea: editLand.totalArea ?? "",
          maxTreeCapacity: editLand.maxTreeCapacity ?? "",
          latitude: editLand.latitude ?? "",
          longitude: editLand.longitude ?? "",
          maxCapacityManual: !!editLand.maxCapacityManual,
        }
      : emptyForm,
  );
  const [submitting, setSubmitting] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [mapOpen, setMapOpen] = useState(false);
  const [countryOptions, setCountryOptions] = useState<SelectOption[]>([]);
  const [stateOptions, setStateOptions] = useState<SelectOption[]>([]);
  const [districtOptions, setDistrictOptions] = useState<SelectOption[]>([]);
  const [registeredVs, setRegisteredVs] = useState<RegisteredVidhanSabha[]>(
    [],
  );

  const recommended = useMemo(() => {
    const area = formData.totalArea === "" ? 0 : Number(formData.totalArea);
    return recommendMaxTreeCapacity(area, formData.areaUnit);
  }, [formData.totalArea, formData.areaUnit]);

  const vsOptions: SelectOption[] = useMemo(() => {
    const opts = registeredVs.map((v) => ({
      label: v.vidhanSabhaName,
      value: String(v._id),
    }));
    // Keep current selection visible when editing even if filters differ
    if (
      formData.vidhanSabhaId &&
      !opts.some((o) => o.value === formData.vidhanSabhaId)
    ) {
      opts.unshift({
        label: formData.vidhanSabha || formData.vidhanSabhaId,
        value: formData.vidhanSabhaId,
      });
    }
    return opts;
  }, [registeredVs, formData.vidhanSabhaId, formData.vidhanSabha]);

  useEffect(() => {
    if (!formData.maxCapacityManual) {
      setFormData((prev) => ({
        ...prev,
        maxTreeCapacity: recommended || "",
      }));
    }
  }, [recommended, formData.maxCapacityManual]);

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
      setRegisteredVs([]);
      return;
    }
    const params = new URLSearchParams({
      limit: "200",
      sortBy: "vidhanSabhaName",
      sortOrder: "asc",
      district: formData.district,
    });

    apiFetch<RegisteredVidhanSabha[]>(
      `/api/v1/vidhan-sabhas?${params.toString()}`,
    )
      .then((rows) => {
        let items = Array.isArray(rows) ? rows : [];
        if (formData.state) {
          const stateLc = formData.state.toLowerCase();
          const byState = items.filter(
            (v) => !v.state || String(v.state).toLowerCase() === stateLc,
          );
          if (byState.length) items = byState;
        }
        setRegisteredVs(items);
      })
      .catch(() => setRegisteredVs([]));
  }, [formData.state, formData.district]);

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => {
      if (name === "maxTreeCapacity") {
        return {
          ...prev,
          maxTreeCapacity: value,
          maxCapacityManual: true,
        };
      }
      if (name === "country") {
        return {
          ...prev,
          country: value,
          state: "",
          district: "",
          masterId: "",
          vidhanSabha: "",
          vidhanSabhaId: "",
        };
      }
      if (name === "state") {
        return {
          ...prev,
          state: value,
          district: "",
          masterId: "",
          vidhanSabha: "",
          vidhanSabhaId: "",
        };
      }
      if (name === "district") {
        return {
          ...prev,
          district: value,
          masterId: "",
          vidhanSabha: "",
          vidhanSabhaId: "",
        };
      }
      if (name === "vidhanSabhaId") {
        const hit = registeredVs.find((v) => String(v._id) === value);
        return {
          ...prev,
          vidhanSabhaId: value,
          vidhanSabha: hit?.vidhanSabhaName || prev.vidhanSabha,
          masterId: hit?.masterId || "",
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const runAutoDetect = async (latitude: number, longitude: number) => {
    setDetecting(true);
    setError("");
    setInfo("");
    try {
      const fill = await reverseGeocodeLocation(latitude, longitude);
      setFormData((prev) => mergeLocationAutoFill(prev, fill));
      setInfo(
        fill.vidhanSabha
          ? `Location detected. Vidhan Sabha: ${fill.vidhanSabha}. You can edit any field before saving.`
          : "Location detected from coordinates. Vidhan Sabha not found for this point — check VS boundary or edit manually.",
      );
    } catch (err: any) {
      setError(err.message || "Failed to auto-detect location");
    } finally {
      setDetecting(false);
    }
  };

  const handleAutoDetectFromCoords = async () => {
    if (formData.latitude === "" || formData.longitude === "") {
      setError("Enter Latitude and Longitude first, or pick on the map");
      return;
    }
    await runAutoDetect(Number(formData.latitude), Number(formData.longitude));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!formData.landName.trim()) {
      setError("Land name is required");
      return;
    }
    if (!formData.state) {
      setError("Please select a State");
      return;
    }
    if (!formData.district) {
      setError("Please select a District");
      return;
    }
    if (formData.totalArea === "" || Number(formData.totalArea) <= 0) {
      setError("Land area is required");
      return;
    }

    setSubmitting(true);
    const {
      _id,
      landId: _landId,
      plantedTrees: _pt,
      availableCapacity: _ac,
      ...rest
    } = formData as any;

    const payload = {
      ...rest,
      country: formData.country || "India",
      villageOrCity: formData.villageOrCity || undefined,
      landAddress: formData.landAddress || undefined,
      landmark: formData.landmark || undefined,
      pinCode: formData.pinCode || undefined,
      // Preview only — backend remaps from lat/lng polygon on save
      totalArea: Number(formData.totalArea),
      maxTreeCapacity:
        formData.maxTreeCapacity === ""
          ? undefined
          : Number(formData.maxTreeCapacity),
      latitude:
        formData.latitude === "" ? undefined : Number(formData.latitude),
      longitude:
        formData.longitude === "" ? undefined : Number(formData.longitude),
      departmentName: formData.departmentName || undefined,
      ownerName: formData.ownerName || undefined,
      mobile: formData.mobile || undefined,
      tehsil: formData.tehsil || undefined,
      remarks: formData.remarks || undefined,
      masterId: formData.masterId || undefined,
      vidhanSabha: formData.vidhanSabha || undefined,
      vidhanSabhaId: formData.vidhanSabhaId || undefined,
    };

    try {
      if (isEditing && editLand._id) {
        await apiFetch(`/api/v1/lands/${editLand._id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/v1/lands", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      navigate("/lands");
    } catch (err: any) {
      setError(err.message || "Failed to save land");
    } finally {
      setSubmitting(false);
    }
  };

  const coordinateActions = (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      <button
        type="button"
        className="btn-primary"
        onClick={() => setMapOpen(true)}
        disabled={detecting}
      >
        <MapPin size={16} style={{ marginRight: 6 }} />
        {isEditing ? "Update from Map" : "Pick Location on Map"}
      </button>
      <button
        type="button"
        className="btn-secondary"
        onClick={handleAutoDetectFromCoords}
        disabled={detecting}
      >
        <RefreshCw
          size={16}
          style={{
            marginRight: 6,
            animation: detecting ? "spin 1s linear infinite" : undefined,
          }}
        />
        {detecting
          ? "Detecting…"
          : isEditing
            ? "Refresh Address"
            : "Auto Detect from Coordinates"}
      </button>
    </div>
  );

  const sections: FormSectionConfig[] = [
    {
      title: "Land Ownership",
      icon: MapPinned,
      fields: [
        {
          name: "ownershipType",
          label: "Land Ownership",
          type: "select",
          icon: Building2,
          required: true,
          options: [
            { label: "Government", value: "GOVERNMENT" },
            { label: "Private", value: "PRIVATE" },
            { label: "Forest Department", value: "FOREST_DEPARTMENT" },
            { label: "School/College", value: "SCHOOL_COLLEGE" },
            { label: "Panchayat", value: "PANCHAYAT" },
            { label: "NGO", value: "NGO" },
            { label: "Corporate (CSR)", value: "CORPORATE_CSR" },
            { label: "Other", value: "OTHER" },
          ],
        },
        {
          name: "departmentName",
          label: "Department / Org Name",
          type: "text",
          icon: Building2,
        },
        {
          name: "ownerName",
          label: "Owner / Contact Person",
          type: "text",
          icon: User,
        },
        {
          name: "mobile",
          label: "Mobile",
          type: "tel",
          icon: Phone,
        },
        {
          name: "status",
          label: "Land Status",
          type: "select",
          icon: TreePine,
          options: [
            { label: "Available for Plantation", value: "AVAILABLE" },
            { label: "Partially Occupied", value: "PARTIALLY_OCCUPIED" },
            { label: "Fully Occupied", value: "FULLY_OCCUPIED" },
            { label: "Under Maintenance", value: "UNDER_MAINTENANCE" },
            { label: "Restricted", value: "RESTRICTED" },
          ],
        },
      ],
    },
    {
      title: "Land Details",
      icon: Landmark,
      fields: [
        {
          name: "landName",
          label: "Land Name",
          type: "text",
          icon: MapPinned,
          required: true,
          placeholder: "e.g., Green Park",
          span: 2,
        },
        {
          name: "khasraNumber",
          label: "Survey / Khasra No.",
          type: "text",
          icon: Hash,
        },
        {
          name: "totalArea",
          label: "Land Area",
          type: "number",
          icon: Ruler,
          required: true,
        },
        {
          name: "areaUnit",
          label: "Unit",
          type: "select",
          icon: Ruler,
          required: true,
          options: [
            { label: "Sq. Ft.", value: "SQ_FT" },
            { label: "Sq. Meter", value: "SQ_METER" },
            { label: "Acre", value: "ACRE" },
            { label: "Hectare", value: "HECTARE" },
          ],
        },
        {
          name: "maxTreeCapacity",
          label: "Maximum Tree Capacity",
          type: "number",
          icon: TreePine,
          helpText: `Auto: ${recommended.toLocaleString()} trees (400/acre). Edit to override.`,
        },
      ],
    },
    {
      title: "Coordinates",
      description:
        "Pick on map or paste lat/lng, then auto-detect fills address hierarchy. All fields stay editable.",
      icon: Navigation,
      headerAction: coordinateActions,
      fields: [
        {
          name: "latitude",
          label: "Latitude",
          type: "number",
          icon: Navigation,
          helpText: "Paste coords then click Auto Detect, or pick on map",
        },
        {
          name: "longitude",
          label: "Longitude",
          type: "number",
          icon: Navigation,
        },
      ],
    },
    {
      title: "Location Hierarchy",
      description:
        "Auto-filled from coordinates — change any value if reverse geocoding is wrong.",
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
          name: "vidhanSabhaId",
          label: "Vidhan Sabha",
          type: "select",
          icon: Landmark,
          options: vsOptions,
          helpText: vsOptions.length
            ? "Only Vidhan Sabhas already created in Location Masters for this district."
            : "No Vidhan Sabha created for this district yet. Create one under Location Masters → Vidhan Sabha.",
        },
        {
          name: "tehsil",
          label: "Tehsil (optional)",
          type: "text",
          icon: MapPin,
          placeholder: "e.g. Gyaraspur",
        },
        {
          name: "villageOrCity",
          label: "Village / City",
          type: "text",
          icon: MapPin,
          placeholder: "e.g. Gyaraspur",
        },
      ],
    },
    {
      title: "Address",
      description: "Auto-filled from reverse geocoding — editable for corrections.",
      icon: MapPin,
      fields: [
        {
          name: "landAddress",
          label: "Land Address",
          type: "textarea",
          icon: MapPin,
          span: 2,
          placeholder: "Full address",
        },
        {
          name: "landmark",
          label: "Landmark",
          type: "text",
          icon: Landmark,
          placeholder: "Near school / temple / highway",
        },
        {
          name: "pinCode",
          label: "PIN Code",
          type: "text",
          icon: Hash,
          placeholder: "e.g. 464331",
        },
        {
          name: "remarks",
          label: "Remarks",
          type: "textarea",
          icon: Hash,
          span: 2,
        },
      ],
    },
  ];

  const planted = Number(formData.plantedTrees || 0);
  const maxCap =
    formData.maxTreeCapacity === ""
      ? recommended
      : Number(formData.maxTreeCapacity);
  const remaining = Math.max(0, maxCap - planted);

  return (
    <div className="dashboard-area">
      <FormPageHeader
        icon={MapPinned}
        title={isEditing ? "Edit Land" : "Add Land"}
        subtitle="Map → Lat/Lng → Auto address → Vidhan Sabha → edit if needed → Save"
        onBack={() => navigate("/lands")}
      />

      <div
        className="card"
        style={{
          padding: 16,
          marginBottom: 16,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            Recommended Capacity
          </div>
          <strong>{recommended.toLocaleString()} trees</strong>
        </div>
        <div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            Trees Already Planted
          </div>
          <strong>{planted.toLocaleString()}</strong>
        </div>
        <div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            Available Space
          </div>
          <strong style={{ color: "var(--accent-color)" }}>
            {remaining.toLocaleString()}
          </strong>
        </div>
      </div>

      {info && (
        <div
          className="card"
          style={{
            padding: "12px 16px",
            marginBottom: 16,
            fontSize: 13,
            color: "var(--text-secondary)",
            borderLeft: "3px solid var(--accent-color)",
          }}
        >
          {info}
        </div>
      )}

      <div className="card">
        <SmartForm
          sections={sections}
          formData={formData}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          submitting={submitting || detecting}
          error={error}
          submitLabel={isEditing ? "Update Land" : "Save Land"}
          cancelLabel="Cancel"
          onCancel={() => navigate("/lands")}
        />
      </div>

      <LocationPickerModal
        open={mapOpen}
        initialLat={formData.latitude}
        initialLng={formData.longitude}
        onClose={() => setMapOpen(false)}
        onConfirm={async ({ lat, lng }) => {
          setFormData((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
          }));
          setMapOpen(false);
          await runAutoDetect(lat, lng);
        }}
      />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default LandForm;
