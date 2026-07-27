import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Languages as LanguagesIcon, Hash, Percent, ShieldCheck } from "lucide-react";
import { apiFetch } from "../../utils/apiConfig";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig } from "../../components/form/SmartForm";
import { FormPageHeader } from "../../components/form/FormPageHeader";

export interface LanguageFormData {
  _id?: string;
  languageName: string;
  languageCode: string;
  translationProgress: number | "";
  status: string;
}

const emptyForm: LanguageFormData = {
  languageName: "",
  languageCode: "",
  translationProgress: 0,
  status: "Active",
};

export const LanguageForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const editLanguage = location.state?.language;
  const isEditing = !!editLanguage;

  const [formData, setFormData] = useState<LanguageFormData>(
    editLanguage ? { ...emptyForm, ...editLanguage } : emptyForm
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
    const body = {
      ...payload,
      translationProgress: payload.translationProgress === "" ? 0 : Number(payload.translationProgress),
    };

    try {
      if (isEditing && _id) {
        await apiFetch(`/api/v1/languages/${_id}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
      } else {
        await apiFetch("/api/v1/languages", {
          method: "POST",
          body: JSON.stringify(body),
        });
      }
      navigate("/languages");
    } catch (err: any) {
      setError(err.message || "Failed to save Language");
    } finally {
      setSubmitting(false);
    }
  };

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
    <div className="dashboard-area">
      <FormPageHeader
        icon={LanguagesIcon}
        title={isEditing ? "Edit Language" : "Add Language"}
        subtitle="Manage application languages and translations."
        onBack={() => navigate("/languages")}
      />

      <div className="card">
        <SmartForm
          sections={sections}
          formData={formData}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={error}
          submitLabel={isEditing ? "Update Language" : "Add Language"}
          cancelLabel="Cancel"
          onCancel={() => navigate("/languages")}
        />
      </div>
    </div>
  );
};

export default LanguageForm;
