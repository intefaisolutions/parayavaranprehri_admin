import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { User, Award, Building2, Image as ImageIcon, ListOrdered, ToggleLeft } from "lucide-react";
import { apiFetch } from "../../utils/apiConfig";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig } from "../../components/form/SmartForm";
import { FormPageHeader } from "../../components/form/FormPageHeader";

export interface LeaderFormData {
  _id?: string;
  leaderName: string;
  designation: string;
  organization: string;
  photo: string;
  displayOrder: number | "";
  isActive: boolean;
}

const emptyForm: LeaderFormData = {
  leaderName: "",
  designation: "",
  organization: "",
  photo: "",
  displayOrder: 0,
  isActive: true,
};

export const LeaderForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const editLeader = location.state?.leader;
  const isEditing = !!editLeader;

  const [formData, setFormData] = useState<LeaderFormData>(
    editLeader
      ? {
          ...emptyForm,
          ...editLeader,
          displayOrder: editLeader.displayOrder ?? 0,
        }
      : emptyForm
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
      displayOrder: rest.displayOrder === "" ? undefined : Number(rest.displayOrder),
    };

    try {
      if (isEditing && _id) {
        await apiFetch(`/api/v1/leaders/${_id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/v1/leaders", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      navigate("/leaders");
    } catch (err: any) {
      setError(err.message || "Failed to save Initiative Leader");
    } finally {
      setSubmitting(false);
    }
  };

  const sections: FormSectionConfig[] = [
    {
      title: "Leader Details",
      description: "Core identity and role of this initiative leader.",
      icon: User,
      fields: [
        { name: "leaderName", label: "Leader Name", type: "text", icon: User, required: true, span: 2 },
        { name: "designation", label: "Designation", type: "text", icon: Award, required: true },
        { name: "organization", label: "Organization", type: "text", icon: Building2 },
      ],
    },
    {
      title: "Photo",
      icon: ImageIcon,
      fields: [
        { name: "photo", label: "Photo", type: "image", icon: ImageIcon, uploadCategory: "general", span: 2 },
      ],
    },
    {
      title: "Display Settings",
      icon: ListOrdered,
      fields: [
        {
          name: "displayOrder",
          label: "Display Order",
          type: "number",
          icon: ListOrdered,
          placeholder: "0",
          helpText: "Lower numbers are shown first in lists.",
        },
        {
          name: "isActive",
          label: "Visible",
          type: "boolean",
          icon: ToggleLeft,
          helpText: "Only visible leaders are shown to end users.",
        },
      ],
    },
  ];

  return (
    <div className="dashboard-area">
      <FormPageHeader
        icon={User}
        title={isEditing ? "Edit Initiative Leader" : "Add Initiative Leader"}
        subtitle="Manage the leaders showcased for this environmental initiative."
        onBack={() => navigate("/leaders")}
      />

      <div className="card">
        <SmartForm
          sections={sections}
          formData={formData}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={error}
          submitLabel={isEditing ? "Update Leader" : "Add Leader"}
          cancelLabel="Cancel"
          onCancel={() => navigate("/leaders")}
        />
      </div>
    </div>
  );
};

export default LeaderForm;
