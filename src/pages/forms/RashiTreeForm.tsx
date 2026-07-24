import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Heart,
  Images,
  Info,
  Leaf,
  ListOrdered,
  Sparkles,
  Sprout,
  ToggleLeft,
} from "lucide-react";
import { apiFetch } from "../../utils/apiConfig";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig } from "../../components/form/SmartForm";
import { FormPageHeader } from "../../components/form/FormPageHeader";

const RASHI_OPTIONS = [
  { label: "1 - Aries (मेष)", value: "1|Aries|मेष" },
  { label: "2 - Taurus (वृषभ)", value: "2|Taurus|वृषभ" },
  { label: "3 - Gemini (मिथुन)", value: "3|Gemini|मिथुन" },
  { label: "4 - Cancer (कर्क)", value: "4|Cancer|कर्क" },
  { label: "5 - Leo (सिंह)", value: "5|Leo|सिंह" },
  { label: "6 - Virgo (कन्या)", value: "6|Virgo|कन्या" },
  { label: "7 - Libra (तुला)", value: "7|Libra|तुला" },
  { label: "8 - Scorpio (वृश्चिक)", value: "8|Scorpio|वृश्चिक" },
  { label: "9 - Sagittarius (धनु)", value: "9|Sagittarius|धनु" },
  { label: "10 - Capricorn (मकर)", value: "10|Capricorn|मकर" },
  { label: "11 - Aquarius (कुंभ)", value: "11|Aquarius|कुंभ" },
  { label: "12 - Pisces (मीन)", value: "12|Pisces|मीन" },
];

interface RashiTreeFormData {
  _id?: string;
  rashiPicker?: string;
  rashiName: string;
  rashiNameHindi: string;
  zodiacNumber: number | "";
  recommendedTree: string;
  scientificName: string;
  localName: string;
  description: string;
  benefits: string[];
  careInstructions: string;
  image: string;
  galleryImages: string[];
  isActive: boolean;
  displayOrder: number | "";
}

const emptyForm: RashiTreeFormData = {
  rashiPicker: "",
  rashiName: "",
  rashiNameHindi: "",
  zodiacNumber: "",
  recommendedTree: "",
  scientificName: "",
  localName: "",
  description: "",
  benefits: [],
  careInstructions: "",
  image: "",
  galleryImages: [],
  isActive: true,
  displayOrder: 0,
};

export const RashiTreeForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const editEntry = location.state?.rashiTree;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<RashiTreeFormData>(
    editEntry
      ? {
          ...emptyForm,
          ...editEntry,
          rashiPicker: editEntry.zodiacNumber ? String(editEntry.zodiacNumber) : "",
          benefits: editEntry.benefits || [],
          galleryImages: editEntry.galleryImages || [],
        }
      : emptyForm
  );

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => {
      if (name === "rashiPicker") {
        const [num, en, hi] = String(value).split("|");
        return {
          ...prev,
          rashiPicker: value,
          zodiacNumber: num ? Number(num) : "",
          rashiName: en || "",
          rashiNameHindi: hi || "",
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.zodiacNumber) {
      setError("Please select a Rashi (zodiac sign)");
      return;
    }

    setSubmitting(true);

    const {
      _id,
      rashiPicker: _rashiPicker,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      ...payload
    } = formData as any;

    try {
      if (editEntry?._id) {
        await apiFetch(`/api/v1/rashi-trees/${editEntry._id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/v1/rashi-trees", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      navigate("/rashi-trees");
    } catch (err: any) {
      setError(err.message || "Failed to save Rashi tree recommendation");
    } finally {
      setSubmitting(false);
    }
  };

  const sections: FormSectionConfig[] = [
    {
      title: "Rashi Identity",
      description: "Select the zodiac sign this tree recommendation applies to.",
      icon: Sparkles,
      fields: [
        {
          name: "rashiPicker",
          label: "Rashi (Zodiac Sign)",
          type: "select",
          icon: Sparkles,
          required: true,
          options: RASHI_OPTIONS,
          helpText: "English & Hindi names and the zodiac number are filled in automatically.",
          span: 2,
        },
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
          label: "Active",
          type: "boolean",
          icon: ToggleLeft,
          helpText: "Only active recommendations are shown to end users.",
        },
      ],
    },
    {
      title: "Tree Details",
      description: "The recommended tree for this Rashi and how it's identified.",
      icon: Sprout,
      fields: [
        {
          name: "recommendedTree",
          label: "Recommended Tree",
          type: "text",
          icon: Leaf,
          required: true,
          placeholder: "e.g. Amla",
        },
        {
          name: "scientificName",
          label: "Scientific Name",
          type: "text",
          icon: BookOpen,
          placeholder: "e.g. Phyllanthus emblica",
        },
        {
          name: "localName",
          label: "Local Name",
          type: "text",
          icon: BookOpen,
          placeholder: "e.g. Aonla",
        },
        {
          name: "description",
          label: "Description",
          type: "textarea",
          icon: Info,
          placeholder: "Describe this tree and why it suits this Rashi...",
          span: 2,
        },
        {
          name: "benefits",
          label: "Benefits",
          type: "tags",
          icon: Heart,
          placeholder: "Type a benefit and press Enter...",
          helpText: "Add each benefit separately (press Enter or comma after typing).",
          span: 2,
        },
        {
          name: "careInstructions",
          label: "Care Instructions",
          type: "textarea",
          icon: Info,
          placeholder: "How should this tree be cared for?",
          span: 2,
        },
      ],
    },
    {
      title: "Media",
      description: "Upload the primary tree image and optional gallery photos.",
      icon: Images,
      fields: [
        {
          name: "image",
          label: "Tree Image",
          type: "image",
          uploadCategory: "trees",
          placeholder: "https://...",
          span: 2,
        },
        {
          name: "galleryImages",
          label: "Gallery Images",
          type: "gallery",
          uploadCategory: "trees",
          span: 2,
        },
      ],
    },
  ];

  return (
    <div className="dashboard-area">
      <FormPageHeader
        icon={Leaf}
        title={editEntry ? "Edit Rashi Tree Recommendation" : "Add Rashi Tree Recommendation"}
        subtitle="Manage which tree is recommended for each Rashi (zodiac sign), shown to users based on their DOB or manual selection."
        onBack={() => navigate("/rashi-trees")}
      />

      <div className="card">
        <SmartForm
          sections={sections}
          formData={formData}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={error}
          submitLabel={editEntry ? "Update Recommendation" : "Save Recommendation"}
          cancelLabel="Cancel"
          onCancel={() => navigate("/rashi-trees")}
        />
      </div>
    </div>
  );
};

export default RashiTreeForm;
