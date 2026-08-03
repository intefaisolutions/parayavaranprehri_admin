import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserRound,
  Image as ImageIcon,
  AlignLeft,
  Hash,
  ToggleLeft,
  Loader2,
} from "lucide-react";
import { apiFetch } from "../../utils/apiConfig";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig } from "../../components/form/SmartForm";
import { FormPageHeader } from "../../components/form/FormPageHeader";

interface JourneyProfileFormData {
  name: string;
  subtitle: string;
  photo?: string;
  inspirationText?: string;
  tags?: string[];
  statsText?: string;
  isActive?: boolean;
}

const emptyForm: JourneyProfileFormData = {
  name: "Dr. Ram Patidar",
  subtitle: "Journey & Achievements",
  photo: "",
  inspirationText: "",
  tags: [],
  statsText: "",
  isActive: true,
};

function statsToText(stats?: { value: string; label: string }[]) {
  if (!stats?.length) return "";
  return stats.map((s) => `${s.value}|${s.label}`).join("\n");
}

function textToStats(text?: string) {
  if (!text?.trim()) return [];
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [value, ...rest] = line.split("|");
      return { value: value.trim(), label: rest.join("|").trim() || value.trim() };
    })
    .filter((s) => s.value && s.label);
}

export const JourneyProfileForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<JourneyProfileFormData>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const profile = await apiFetch<any>("/api/v1/journey/profile");
        if (!mounted || !profile) return;
        setFormData({
          name: profile.name || emptyForm.name,
          subtitle: profile.subtitle || emptyForm.subtitle,
          photo: profile.photo || "",
          inspirationText: profile.inspirationText || "",
          tags: profile.tags || [],
          statsText: statsToText(profile.stats),
          isActive: profile.isActive !== false,
        });
      } catch (err: any) {
        if (mounted) setError(err.message || "Failed to load profile");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await apiFetch("/api/v1/journey/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name: formData.name,
          subtitle: formData.subtitle,
          photo: formData.photo || undefined,
          inspirationText: formData.inspirationText || undefined,
          tags: formData.tags || [],
          stats: textToStats(formData.statsText),
          isActive: formData.isActive !== false,
        }),
      });
      navigate("/journey");
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
    } finally {
      setSubmitting(false);
    }
  };

  const sections: FormSectionConfig[] = [
    {
      title: "Journey Profile",
      description: "Hero profile content for the Journey & Achievements screen.",
      icon: UserRound,
      fields: [
        { name: "name", label: "Name", type: "text", icon: UserRound, required: true },
        { name: "subtitle", label: "Subtitle", type: "text", icon: AlignLeft },
        {
          name: "photo",
          label: "Photo",
          type: "image",
          icon: ImageIcon,
          uploadCategory: "general",
          span: 2,
        },
        {
          name: "inspirationText",
          label: "Inspiration Text",
          type: "textarea",
          icon: AlignLeft,
          span: 2,
          rows: 5,
        },
        {
          name: "tags",
          label: "Tags",
          type: "tags",
          icon: Hash,
          placeholder: "Type and press Enter...",
          span: 2,
        },
        {
          name: "statsText",
          label: "Stats (one per line: value|label)",
          type: "textarea",
          icon: Hash,
          span: 2,
          rows: 4,
          placeholder: "1,00,000+|Trees Planted",
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

  if (loading) {
    return (
      <div className="dashboard-area">
        <div className="card" style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <Loader2 size={24} className="spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-area">
      <FormPageHeader
        icon={UserRound}
        title="Edit Journey Profile"
        subtitle="Singleton profile for the Journey screen"
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
          submitLabel="Save Profile"
          cancelLabel="Cancel"
          onCancel={() => navigate("/journey")}
        />
      </div>
    </div>
  );
};

export default JourneyProfileForm;
