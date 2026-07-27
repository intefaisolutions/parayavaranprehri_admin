import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Settings as SettingsIcon, Tag, FileText, ToggleLeft } from "lucide-react";
import { apiFetch } from "../../utils/apiConfig";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig } from "../../components/form/SmartForm";
import { FormPageHeader } from "../../components/form/FormPageHeader";

export interface SettingFormData {
  _id?: string;
  settingName: string;
  category: string;
  value: string;
  isActive: boolean;
}

const CATEGORY_OPTIONS = [
  { label: "General", value: "General" },
  { label: "Security", value: "Security" },
  { label: "Notification", value: "Notification" },
  { label: "Email", value: "Email" },
  { label: "Payment", value: "Payment" },
  { label: "User Management", value: "User Management" },
];

const emptyForm: SettingFormData = {
  settingName: "",
  category: "General",
  value: "",
  isActive: true,
};

export const SystemSettingForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const editSetting = location.state?.setting;
  const isEditing = !!editSetting;

  const [formData, setFormData] = useState<SettingFormData>(
    editSetting ? { ...emptyForm, ...editSetting } : emptyForm
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

    const { _id, ...payload } = formData;

    try {
      if (isEditing && _id) {
        await apiFetch(`/api/v1/settings/${_id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/v1/settings", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      navigate("/settings");
    } catch (err: any) {
      setError(err.message || "Failed to save setting");
    } finally {
      setSubmitting(false);
    }
  };

  const sections: FormSectionConfig[] = [
    {
      title: "Setting Details",
      description: "Define the configuration key, its category, and its current value.",
      icon: SettingsIcon,
      fields: [
        { name: "settingName", label: "Setting Name", type: "text", icon: SettingsIcon, required: true, span: 2 },
        {
          name: "category",
          label: "Category",
          type: "select",
          icon: Tag,
          required: true,
          options: CATEGORY_OPTIONS,
        },
        {
          name: "isActive",
          label: "Active",
          type: "boolean",
          icon: ToggleLeft,
          helpText: "Inactive settings are ignored by the application.",
        },
        { name: "value", label: "Value", type: "textarea", icon: FileText, required: true, span: 2 },
      ],
    },
  ];

  return (
    <div className="dashboard-area">
      <FormPageHeader
        icon={SettingsIcon}
        title={isEditing ? "Edit System Setting" : "Add System Setting"}
        subtitle="Manage application configuration settings."
        onBack={() => navigate("/settings")}
      />

      <div className="card">
        <SmartForm
          sections={sections}
          formData={formData}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={error}
          submitLabel={isEditing ? "Update Setting" : "Add Setting"}
          cancelLabel="Cancel"
          onCancel={() => navigate("/settings")}
        />
      </div>
    </div>
  );
};

export default SystemSettingForm;
