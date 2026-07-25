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
  totalPersons?: number;
  totalVehicles?: number;
  totalTrees?: number;
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

export const VidhanSabhaForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const editEntry = location.state?.vidhanSabha;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<VidhanSabhaFormData>(
    editEntry
      ? {
          ...emptyForm,
          ...editEntry,
          country: "India",
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

    setSubmitting(true);

    const {
      _id,
      country: _country,
      totalPersons: _totalPersons,
      totalVehicles: _totalVehicles,
      totalTrees: _totalTrees,
      totalMitras: _totalMitras,
      ...payload
    } = formData as any;

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
      title: "Current Stats",
      description:
        "Read-only counts tracked automatically as Persons, Vehicles, Trees and Mitras get linked to this Vidhan Sabha.",
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
          name: "totalTrees",
          label: "Total Trees Planted",
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
      // Only show once the Vidhan Sabha actually exists - these are computed
      // over time, not something an admin fills in when creating one.
      visibleWhen: (data) => !!data._id,
    },
  ];

  return (
    <div className="dashboard-area">
      <FormPageHeader
        icon={Building}
        title={editEntry ? "Edit Vidhan Sabha" : "Add Vidhan Sabha"}
        subtitle="Country → State → District → Vidhan Sabha. Person/Vehicle/Tree/Mitra counts are tracked automatically as they get linked here."
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
