import React from "react";
import { X, Settings as SettingsIcon, Tag, FileText, ToggleLeft } from "lucide-react";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig } from "../../components/form/SmartForm";

export interface SettingFormData {
  _id?: string;
  settingName: string;
  category: string;
  value: string;
  isActive: boolean;
}

interface SystemSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing: boolean;
  formData: SettingFormData;
  submitting?: boolean;
  onFieldChange: (name: string, value: any) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

const CATEGORY_OPTIONS = [
  { label: "General", value: "General" },
  { label: "Security", value: "Security" },
  { label: "Notification", value: "Notification" },
  { label: "Email", value: "Email" },
  { label: "Payment", value: "Payment" },
  { label: "User Management", value: "User Management" },
];

const SystemSettingModal: React.FC<SystemSettingModalProps> = ({
  isOpen,
  onClose,
  editing,
  formData,
  submitting,
  onFieldChange,
  handleSubmit,
}) => {
  if (!isOpen) return null;

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
    <div className="modal-overlay">
      <div className="modal" style={{ width: 640 }}>
        <div className="modal-header">
          <h2>{editing ? "Edit System Setting" : "Add System Setting"}</h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <SmartForm
          sections={sections}
          formData={formData}
          onFieldChange={onFieldChange}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitLabel={editing ? "Update Setting" : "Add Setting"}
          cancelLabel="Cancel"
          onCancel={onClose}
        />
      </div>
    </div>
  );
};

export default SystemSettingModal;
