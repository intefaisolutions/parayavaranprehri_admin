import React from "react";
import { X, Languages as LanguagesIcon, Hash, Percent, ShieldCheck } from "lucide-react";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig } from "../../components/form/SmartForm";

export interface LanguageFormData {
  _id?: string;
  languageName: string;
  languageCode: string;
  translationProgress: number | "";
  status: string;
}

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing: boolean;
  formData: LanguageFormData;
  submitting?: boolean;
  error?: string;
  onFieldChange: (name: string, value: any) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

const LanguageModal: React.FC<LanguageModalProps> = ({
  isOpen,
  onClose,
  editing,
  formData,
  submitting,
  error,
  onFieldChange,
  handleSubmit,
}) => {
  if (!isOpen) return null;

  const sections: FormSectionConfig[] = [
    {
      title: "Language Details",
      description: "Core identity of this application language.",
      icon: LanguagesIcon,
      fields: [
        { name: "languageName", label: "Language Name", type: "text", icon: LanguagesIcon, required: true, span: 2, placeholder: "e.g. English" },
        { name: "languageCode", label: "Language Code", type: "text", icon: Hash, required: true, placeholder: "EN, HI, ES" },
        { name: "translationProgress", label: "Translation Progress (%)", type: "number", icon: Percent, placeholder: "0" },
      ],
    },
    {
      title: "Status",
      icon: ShieldCheck,
      fields: [
        {
          name: "status",
          label: "Status",
          type: "select",
          icon: ShieldCheck,
          required: true,
          options: [
            { label: "Active", value: "Active" },
            { label: "Inactive", value: "Inactive" },
          ],
        },
      ],
    },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ width: 560 }}>
        <div className="modal-header">
          <h2>{editing ? "Edit Language" : "Add Language"}</h2>
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
          error={error}
          submitLabel={editing ? "Update Language" : "Add Language"}
          cancelLabel="Cancel"
          onCancel={onClose}
        />
      </div>
    </div>
  );
};

export default LanguageModal;
