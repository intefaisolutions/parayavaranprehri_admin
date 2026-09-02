import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Car, Trees, ShieldCheck } from "lucide-react";
import { apiFetch } from "../../utils/apiConfig";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig } from "../../components/form/SmartForm";
import { FormPageHeader } from "../../components/form/FormPageHeader";

export interface VehicleTreeRuleData {
  _id?: string;
  vehicleType: string;
  treesRequired: number;
  isActive: boolean;
}

const emptyForm: VehicleTreeRuleData = {
  vehicleType: "",
  treesRequired: 1,
  isActive: true,
};

export const VehicleTreeRuleForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const editRule = location.state?.rule;
  const isEditing = !!editRule;

  const [formData, setFormData] = useState<VehicleTreeRuleData>(
    editRule ? { ...emptyForm, ...editRule } : emptyForm
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const { _id, ...rest } = formData;
    const payload = {
      ...rest,
      treesRequired: Number(rest.treesRequired),
    };

    try {
      if (isEditing && _id) {
        await apiFetch(`/api/v1/vehicle-tree-rules/${_id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/v1/vehicle-tree-rules", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      navigate("/vehicle-tree-rules");
    } catch (err: any) {
      setError(err.message || "Failed to save rule");
    } finally {
      setSubmitting(false);
    }
  };

  const sections: FormSectionConfig[] = [
    {
      title: "Rule Configuration",
      description: "Define the required number of trees for a vehicle type.",
      icon: Trees,
      fields: [
        {
          name: "vehicleType",
          label: "Vehicle Type",
          type: "text",
          icon: Car,
          required: true,
          placeholder: "e.g., 2-Wheeler, 4-Wheeler",
        },
        {
          name: "treesRequired",
          label: "Trees Required",
          type: "number",
          icon: Trees,
          required: true,
          min: 0,
        },
        {
          name: "isActive",
          label: "Status",
          type: "select",
          icon: ShieldCheck,
          required: true,
          options: [
            { label: "Active", value: true as any },
            { label: "Inactive", value: false as any },
          ],
        },
      ],
    },
  ];

  return (
    <div className="dashboard-area">
      <FormPageHeader
        icon={Trees}
        title={isEditing ? "Edit Rule" : "Add Rule"}
        subtitle="Configure vehicle to tree mapping."
        onBack={() => navigate("/vehicle-tree-rules")}
      />

      <div className="card">
        <SmartForm
          sections={sections}
          formData={formData}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={error}
          submitLabel={isEditing ? "Update Rule" : "Add Rule"}
          cancelLabel="Cancel"
          onCancel={() => navigate("/vehicle-tree-rules")}
        />
      </div>
    </div>
  );
};
