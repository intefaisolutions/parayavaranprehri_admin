import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Cloud,
  Droplets,
  Hash,
  Leaf,
  ListOrdered,
  Sprout,
  Thermometer,
  ToggleLeft,
  Wind,
} from "lucide-react";
import { apiFetch } from "../../utils/apiConfig";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig } from "../../components/form/SmartForm";
import { FormPageHeader } from "../../components/form/FormPageHeader";

interface TreeMasterFormData {
  _id?: string;
  name: string;
  scientificName: string;
  species: string;
  category: string;
  expectedLifespanYears: number | "";
  oxygenRateKgPerYear: number | "";
  co2RateKgPerYear: number | "";
  waterRequirement: string;
  growthRate: string;
  suitableClimate: string;
  description: string;
  benefits: string[];
  image: string;
  availability: string;
  isActive: boolean;
  displayOrder: number | "";
}

const emptyForm: TreeMasterFormData = {
  name: "",
  scientificName: "",
  species: "",
  category: "Medicinal",
  expectedLifespanYears: "",
  oxygenRateKgPerYear: "",
  co2RateKgPerYear: "",
  waterRequirement: "MEDIUM",
  growthRate: "MEDIUM",
  suitableClimate: "Tropical",
  description: "",
  benefits: [],
  image: "",
  availability: "AVAILABLE",
  isActive: true,
  displayOrder: 0,
};

export const TreeMasterForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editEntry = location.state?.treeMaster;
  const isEditing = !!editEntry;

  const [formData, setFormData] = useState<TreeMasterFormData>(
    editEntry
      ? {
          ...emptyForm,
          ...editEntry,
          expectedLifespanYears: editEntry.expectedLifespanYears ?? "",
          oxygenRateKgPerYear: editEntry.oxygenRateKgPerYear ?? "",
          co2RateKgPerYear: editEntry.co2RateKgPerYear ?? "",
          benefits: editEntry.benefits || [],
          displayOrder: editEntry.displayOrder ?? 0,
        }
      : emptyForm,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => {
      if (name === "name" && !prev.species) {
        return { ...prev, name: value, species: value };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!formData.name.trim()) {
      setError("Tree name is required");
      return;
    }

    setSubmitting(true);
    const { _id, ...rest } = formData as any;
    const payload = {
      ...rest,
      name: formData.name.trim(),
      species: (formData.species || formData.name).trim(),
      expectedLifespanYears:
        formData.expectedLifespanYears === ""
          ? undefined
          : Number(formData.expectedLifespanYears),
      oxygenRateKgPerYear:
        formData.oxygenRateKgPerYear === ""
          ? 0
          : Number(formData.oxygenRateKgPerYear),
      co2RateKgPerYear:
        formData.co2RateKgPerYear === ""
          ? 0
          : Number(formData.co2RateKgPerYear),
      displayOrder:
        formData.displayOrder === "" ? 0 : Number(formData.displayOrder),
      benefits: formData.benefits || [],
    };

    try {
      if (isEditing && editEntry._id) {
        await apiFetch(`/api/v1/tree-masters/${editEntry._id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/v1/tree-masters", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      navigate("/tree-masters");
    } catch (err: any) {
      setError(err.message || "Failed to save Tree Master");
    } finally {
      setSubmitting(false);
    }
  };

  const sections: FormSectionConfig[] = [
    {
      title: "Tree Identity",
      icon: Leaf,
      fields: [
        {
          name: "name",
          label: "Tree Name",
          type: "text",
          icon: Leaf,
          required: true,
          placeholder: "e.g. Neem",
        },
        {
          name: "scientificName",
          label: "Scientific Name",
          type: "text",
          icon: Sprout,
          placeholder: "e.g. Azadirachta indica",
        },
        {
          name: "species",
          label: "Species Key",
          type: "text",
          icon: Hash,
          helpText: "Defaults to tree name — used for matching/O₂ utils",
        },
        {
          name: "category",
          label: "Category",
          type: "select",
          icon: ListOrdered,
          options: [
            { label: "Medicinal", value: "Medicinal" },
            { label: "Fruit", value: "Fruit" },
            { label: "Shade", value: "Shade" },
            { label: "Timber", value: "Timber" },
            { label: "Ornamental", value: "Ornamental" },
            { label: "Sacred", value: "Sacred" },
            { label: "Other", value: "Other" },
          ],
        },
        {
          name: "image",
          label: "Tree Image",
          type: "image",
          icon: Leaf,
          uploadCategory: "trees",
          span: 2,
        },
      ],
    },
    {
      title: "Environmental Profile",
      icon: Wind,
      fields: [
        {
          name: "expectedLifespanYears",
          label: "Expected Lifespan (Years)",
          type: "number",
          icon: Hash,
          placeholder: "200",
        },
        {
          name: "oxygenRateKgPerYear",
          label: "Average Oxygen (Kg/Year)",
          type: "number",
          icon: Wind,
          placeholder: "118",
        },
        {
          name: "co2RateKgPerYear",
          label: "Average CO₂ Absorption (Kg/Year)",
          type: "number",
          icon: Cloud,
          placeholder: "28",
        },
        {
          name: "waterRequirement",
          label: "Water Requirement",
          type: "select",
          icon: Droplets,
          options: [
            { label: "Low", value: "LOW" },
            { label: "Medium", value: "MEDIUM" },
            { label: "High", value: "HIGH" },
          ],
        },
        {
          name: "growthRate",
          label: "Growth Rate",
          type: "select",
          icon: Sprout,
          options: [
            { label: "Slow", value: "SLOW" },
            { label: "Medium", value: "MEDIUM" },
            { label: "Fast", value: "FAST" },
          ],
        },
        {
          name: "suitableClimate",
          label: "Suitable Climate",
          type: "text",
          icon: Thermometer,
          placeholder: "Tropical",
        },
      ],
    },
    {
      title: "Catalog & Availability",
      icon: ToggleLeft,
      fields: [
        {
          name: "description",
          label: "Description",
          type: "textarea",
          icon: Leaf,
          span: 2,
        },
        {
          name: "benefits",
          label: "Benefits",
          type: "tags",
          icon: Sprout,
          span: 2,
          helpText: "Press Enter to add each benefit",
        },
        {
          name: "availability",
          label: "Availability",
          type: "select",
          icon: ToggleLeft,
          options: [
            { label: "✅ Available", value: "AVAILABLE" },
            { label: "❌ Out of Stock", value: "OUT_OF_STOCK" },
            { label: "🔔 Available on Request", value: "AVAILABLE_ON_REQUEST" },
          ],
        },
        {
          name: "isActive",
          label: "Active in Catalog",
          type: "boolean",
          icon: ToggleLeft,
        },
        {
          name: "displayOrder",
          label: "Display Order",
          type: "number",
          icon: ListOrdered,
        },
      ],
    },
  ];

  return (
    <div className="dashboard-area">
      <FormPageHeader
        icon={Leaf}
        title={isEditing ? "Edit Tree Master" : "Add Tree Master"}
        subtitle="Catalog entry — created once, referenced by every plantation"
        onBack={() => navigate("/tree-masters")}
      />
      <div className="card">
        <SmartForm
          sections={sections}
          formData={formData}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={error}
          submitLabel={isEditing ? "Update Tree Master" : "Save Tree Master"}
          cancelLabel="Cancel"
          onCancel={() => navigate("/tree-masters")}
        />
      </div>
    </div>
  );
};

export default TreeMasterForm;
