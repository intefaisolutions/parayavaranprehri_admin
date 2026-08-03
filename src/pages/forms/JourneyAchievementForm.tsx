import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Award,
  CalendarDays,
  Image as ImageIcon,
  Hash,
  Type,
  AlignLeft,
  ToggleLeft,
} from "lucide-react";
import { apiFetch } from "../../utils/apiConfig";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig } from "../../components/form/SmartForm";
import { FormPageHeader } from "../../components/form/FormPageHeader";

export interface JourneyAchievementFormData {
  _id?: string;
  year: string;
  type: string;
  title: string;
  subtitle: string;
  imageUrl?: string;
  displayOrder?: string | number;
  isActive?: boolean;
}

const emptyForm: JourneyAchievementFormData = {
  year: "",
  type: "recognition",
  title: "",
  subtitle: "",
  imageUrl: "",
  displayOrder: 0,
  isActive: true,
};

export const JourneyAchievementForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editItem = location.state?.achievement;
  const isEditing = !!editItem;

  const [formData, setFormData] = useState<JourneyAchievementFormData>(
    editItem
      ? {
          ...emptyForm,
          ...editItem,
          displayOrder: editItem.displayOrder ?? 0,
          isActive: editItem.isActive !== false,
        }
      : emptyForm,
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
      imageUrl: rest.imageUrl || undefined,
      displayOrder:
        rest.displayOrder === "" || rest.displayOrder === undefined
          ? 0
          : Number(rest.displayOrder),
      isActive: rest.isActive !== false,
    };

    try {
      if (isEditing && _id) {
        await apiFetch(`/api/v1/journey/achievements/${_id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/v1/journey/achievements", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      navigate("/journey");
    } catch (err: any) {
      setError(err.message || "Failed to save achievement");
    } finally {
      setSubmitting(false);
    }
  };

  const sections: FormSectionConfig[] = [
    {
      title: "Achievement Details",
      description: "Timeline entry shown in the citizen app.",
      icon: Award,
      fields: [
        { name: "year", label: "Year", type: "text", icon: CalendarDays, required: true },
        {
          name: "type",
          label: "Type",
          type: "select",
          icon: Type,
          required: true,
          options: [
            { label: "Recognition", value: "recognition" },
            { label: "Award", value: "award" },
            { label: "Record", value: "record" },
            { label: "Doctorate", value: "doctorate" },
            { label: "International", value: "international" },
          ],
        },
        { name: "title", label: "Title", type: "text", icon: Award, required: true, span: 2 },
        {
          name: "subtitle",
          label: "Subtitle / Organization",
          type: "text",
          icon: AlignLeft,
          required: true,
          span: 2,
        },
        {
          name: "imageUrl",
          label: "Image",
          type: "image",
          icon: ImageIcon,
          uploadCategory: "general",
          span: 2,
        },
        {
          name: "displayOrder",
          label: "Display Order",
          type: "number",
          icon: Hash,
        },
        {
          name: "isActive",
          label: "Active",
          type: "boolean",
          icon: ToggleLeft,
        },
      ],
    },
  ];

  return (
    <div className="dashboard-area">
      <FormPageHeader
        icon={Award}
        title={isEditing ? "Edit Achievement" : "Add Achievement"}
        subtitle="Journey & Achievements CMS"
        onBack={() => navigate("/journey")}
      />
      <div className="card">
        <SmartForm
          sections={sections}
          formData={formData}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={error}
          submitLabel={isEditing ? "Update Achievement" : "Add Achievement"}
          cancelLabel="Cancel"
          onCancel={() => navigate("/journey")}
        />
      </div>
    </div>
  );
};

export default JourneyAchievementForm;
