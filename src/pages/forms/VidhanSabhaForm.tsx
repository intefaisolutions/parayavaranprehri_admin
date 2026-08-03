import React, { useState } from "react";
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
  /** GeoJSON Polygon/MultiPolygon or [[lng,lat], ...] ring as JSON text */
  boundaryText: string;
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
  boundaryText: "",
};

function boundaryToText(boundary: unknown): string {
  if (!boundary) return "";
  try {
    return JSON.stringify(boundary, null, 2);
  } catch {
    return "";
  }
}

export const VidhanSabhaForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const editEntry = location.state?.vidhanSabha;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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
          boundaryText: boundaryToText(editEntry.boundary),
          totalOxygenDisplay:
            editEntry.estimatedOxygenTonsPerYear != null
              ? `${editEntry.estimatedOxygenTonsPerYear} tonnes/year`
              : formatOxygen(editEntry.totalAnnualOxygenKg),
        }
      : emptyForm
  );

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => {
      if (name === "state") {
        // Changing the state invalidates whatever district was picked before.
        return { ...prev, state: value, district: "" };
      }
      return { ...prev, [name]: value };
    });
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

    let boundary: unknown = undefined;
    const rawBoundary = formData.boundaryText?.trim();
    if (rawBoundary) {
      try {
        boundary = JSON.parse(rawBoundary);
      } catch {
        setError(
          "Boundary must be valid JSON: GeoJSON Polygon or [[lng,lat], ...] ring",
        );
        return;
      }
    }

    setSubmitting(true);

    const {
      _id,
      country: _country,
      boundaryText: _boundaryText,
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

    const payload = {
      ...rest,
      country: formData.country || "India",
      ...(boundary !== undefined ? { boundary } : {}),
    };

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

  const sections: FormSectionConfig[] = [
    {
      title: "Location",
      description: "Pick the Country, State and District first - the Vidhan Sabha belongs to that district.",
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
          helpText: "Districts update automatically based on the selected state.",
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
        },
        {
          name: "assignedAdmin",
          label: "Assigned Admin",
          type: "text",
          icon: UserCog,
          placeholder: "Name of the admin/coordinator managing this constituency",
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
        "Polygon used to auto-map lands by latitude/longitude. Coordinates are [longitude, latitude].",
      icon: MapPin,
      fields: [
        {
          name: "boundaryText",
          label: "Boundary JSON",
          type: "textarea",
          icon: MapPin,
          span: 2,
          placeholder:
            '[[77.10,23.50],[77.20,23.50],[77.20,23.60],[77.10,23.60]]\nor\n{"type":"Polygon","coordinates":[[[lng,lat],...]]}',
          helpText:
            "Simple ring [[lng,lat], ...] or full GeoJSON Polygon/MultiPolygon. Saving remaps all lands with coordinates.",
        },
      ],
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
        subtitle="District-level constituency with optional GeoJSON boundary. Lands are auto-mapped when their point falls inside the polygon."
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
