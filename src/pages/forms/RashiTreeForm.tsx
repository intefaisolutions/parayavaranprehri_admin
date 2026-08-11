import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Heart,
  Images,
  Info,
  Leaf,
  ListOrdered,
  Plus,
  Sparkles,
  Sprout,
  ToggleLeft,
} from "lucide-react";
import { apiFetch } from "../../utils/apiConfig";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig } from "../../components/form/SmartForm";
import { FormPageHeader } from "../../components/form/FormPageHeader";

const RASHI_OPTIONS = [
  { label: "1 - Aries (मेष)", value: "1|Aries|मेष", deity: "Mangal", nakshatras: ["Ashwini", "Bharani", "Krittika"] },
  { label: "2 - Taurus (वृषभ)", value: "2|Taurus|वृषभ", deity: "Shukra", nakshatras: ["Krittika", "Rohini", "Mrigashira"] },
  { label: "3 - Gemini (मिथुन)", value: "3|Gemini|मिथुन", deity: "Budh", nakshatras: ["Mrigashira", "Ardra", "Punarvasu"] },
  { label: "4 - Cancer (कर्क)", value: "4|Cancer|कर्क", deity: "Chandra", nakshatras: ["Punarvasu", "Pushya", "Ashlesha"] },
  { label: "5 - Leo (सिंह)", value: "5|Leo|सिंह", deity: "Surya", nakshatras: ["Magha", "Purva Phalguni", "Uttara Phalguni"] },
  { label: "6 - Virgo (कन्या)", value: "6|Virgo|कन्या", deity: "Budh", nakshatras: ["Uttara Phalguni", "Hasta", "Chitra"] },
  { label: "7 - Libra (तुला)", value: "7|Libra|तुला", deity: "Shukra", nakshatras: ["Chitra", "Swati", "Vishakha"] },
  { label: "8 - Scorpio (वृश्चिक)", value: "8|Scorpio|वृश्चिक", deity: "Mangal", nakshatras: ["Vishakha", "Anuradha", "Jyeshtha"] },
  { label: "9 - Sagittarius (धनु)", value: "9|Sagittarius|धनु", deity: "Guru", nakshatras: ["Mula", "Purva Ashadha", "Uttara Ashadha"] },
  { label: "10 - Capricorn (मकर)", value: "10|Capricorn|मकर", deity: "Shani", nakshatras: ["Uttara Ashadha", "Shravana", "Dhanishta"] },
  { label: "11 - Aquarius (कुंभ)", value: "11|Aquarius|कुंभ", deity: "Shani", nakshatras: ["Dhanishta", "Shatabhisha", "Purva Bhadrapada"] },
  { label: "12 - Pisces (मीन)", value: "12|Pisces|मीन", deity: "Guru", nakshatras: ["Purva Bhadrapada", "Uttara Bhadrapada", "Revati"] },
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
  deity: string;
  nakshatras: string[];
  karmaBonus: number | "";
  vitalityBonus: number | "";
  harmonyBonus: number | "";
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
  deity: "",
  nakshatras: [],
  karmaBonus: "",
  vitalityBonus: "",
  harmonyBonus: "",
  isActive: true,
  displayOrder: 0,
};

export const RashiTreeForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const editEntry = location.state?.rashiTree;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loadingTrees, setLoadingTrees] = useState(true);
  const [treeOptions, setTreeOptions] = useState<
    { label: string; value: string; meta?: any }[]
  >([]);

  const [formData, setFormData] = useState<RashiTreeFormData>(
    editEntry
      ? {
          ...emptyForm,
          ...editEntry,
          rashiPicker: editEntry.zodiacNumber
            ? String(editEntry.zodiacNumber)
            : "",
          benefits: editEntry.benefits || [],
          galleryImages: editEntry.galleryImages || [],
          nakshatras: editEntry.nakshatras || [],
          deity: editEntry.deity || "",
          karmaBonus:
            editEntry.karmaBonus !== undefined && editEntry.karmaBonus !== null
              ? editEntry.karmaBonus
              : "",
          vitalityBonus:
            editEntry.vitalityBonus !== undefined &&
            editEntry.vitalityBonus !== null
              ? editEntry.vitalityBonus
              : "",
          harmonyBonus:
            editEntry.harmonyBonus !== undefined &&
            editEntry.harmonyBonus !== null
              ? editEntry.harmonyBonus
              : "",
        }
      : emptyForm,
  );

  useEffect(() => {
    setLoadingTrees(true);
    apiFetch<any[]>("/api/v1/tree-masters?isActive=true")
      .then((list) => {
        const items = Array.isArray(list) ? list : [];
        const options = items.map((t) => ({
          label: `${t.name}${
            t.scientificName ? ` (${t.scientificName})` : ""
          }${t.availability === "OUT_OF_STOCK" ? " — Out of Stock" : ""}`,
          value: t.name,
          meta: t,
        }));

        // Keep edit value selectable even if master was deactivated
        if (
          editEntry?.recommendedTree &&
          !options.some((o) => o.value === editEntry.recommendedTree)
        ) {
          options.unshift({
            label: `${editEntry.recommendedTree} (saved)`,
            value: editEntry.recommendedTree,
            meta: undefined,
          });
        }

        setTreeOptions(options);
      })
      .catch(() => setTreeOptions([]))
      .finally(() => setLoadingTrees(false));
  }, [editEntry?.recommendedTree]);

  // Sync rashiPicker label value for SmartForm select (needs full "1|Aries|मेष")
  useEffect(() => {
    if (!editEntry?.zodiacNumber) return;
    const match = RASHI_OPTIONS.find((o) =>
      o.value.startsWith(`${editEntry.zodiacNumber}|`),
    );
    if (match) {
      setFormData((prev) => ({ ...prev, rashiPicker: match.value }));
    }
  }, [editEntry]);

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => {
      if (name === "rashiPicker") {
        const [num, en, hi] = String(value).split("|");
        const meta = RASHI_OPTIONS.find((o) => o.value === value);
        return {
          ...prev,
          rashiPicker: value,
          zodiacNumber: num ? Number(num) : "",
          rashiName: en || "",
          rashiNameHindi: hi || "",
          // Prefill deity / nakshatras when empty so CMS starts with real values
          deity: prev.deity || meta?.deity || "",
          nakshatras:
            prev.nakshatras?.length > 0
              ? prev.nakshatras
              : meta?.nakshatras || [],
        };
      }
      if (name === "recommendedTree") {
        const master = treeOptions.find((t) => t.value === value)?.meta;
        if (!master) {
          return { ...prev, recommendedTree: value };
        }
        return {
          ...prev,
          recommendedTree: master.name,
          scientificName: master.scientificName || prev.scientificName,
          localName: prev.localName || master.species || "",
          description: prev.description || master.description || "",
          benefits:
            prev.benefits?.length > 0
              ? prev.benefits
              : master.benefits || [],
          image: prev.image || master.image || "",
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
    if (!formData.recommendedTree.trim()) {
      setError("Please select a Recommended Tree from Tree Master Catalog");
      return;
    }

    setSubmitting(true);

    const {
      _id,
      rashiPicker: _rashiPicker,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      ...rest
    } = formData as any;

    const payload = {
      ...rest,
      karmaBonus:
        formData.karmaBonus === "" || formData.karmaBonus === null
          ? undefined
          : Number(formData.karmaBonus),
      vitalityBonus:
        formData.vitalityBonus === "" || formData.vitalityBonus === null
          ? undefined
          : Number(formData.vitalityBonus),
      harmonyBonus:
        formData.harmonyBonus === "" || formData.harmonyBonus === null
          ? undefined
          : Number(formData.harmonyBonus),
      deity: formData.deity?.trim() || undefined,
      nakshatras: formData.nakshatras || [],
    };

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
          helpText:
            "English & Hindi names and the zodiac number are filled in automatically.",
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
      title: "Astrological attributes",
      description:
        "Shown on the Rashi Van reveal screen in the mobile app (CMS-driven).",
      icon: Sparkles,
      fields: [
        {
          name: "deity",
          label: "Deity",
          type: "text",
          icon: Sparkles,
          placeholder: "e.g. Mangal",
          helpText: "Auto-suggested when you pick a Rashi — editable.",
        },
        {
          name: "nakshatras",
          label: "Nakshatras",
          type: "tags",
          icon: Sparkles,
          placeholder: "Type a nakshatra and press Enter…",
          helpText: "Optional list shown under Nakshatra badge.",
          span: 2,
        },
        {
          name: "karmaBonus",
          label: "Karma +%",
          type: "number",
          icon: Heart,
          placeholder: "e.g. 15",
          helpText: "0–100. Leave empty to hide on the app.",
        },
        {
          name: "vitalityBonus",
          label: "Vitality +%",
          type: "number",
          icon: Heart,
          placeholder: "e.g. 18",
        },
        {
          name: "harmonyBonus",
          label: "Harmony +%",
          type: "number",
          icon: Heart,
          placeholder: "e.g. 16",
        },
      ],
    },
    {
      title: "Tree Details",
      description:
        "Pick a tree from Tree Master Catalog. Scientific name & details auto-fill.",
      icon: Sprout,
      fields: [
        {
          name: "recommendedTree",
          label: "Recommended Tree",
          type: "select",
          icon: Leaf,
          required: true,
          options: treeOptions,
          helpText: loadingTrees
            ? "Loading Tree Master catalog…"
            : treeOptions.length === 0
              ? "No trees in catalog — create one in Tree Master Catalog first"
              : "From Tree Master Catalog",
          span: 2,
        },
        {
          name: "scientificName",
          label: "Scientific Name",
          type: "text",
          icon: BookOpen,
          placeholder: "Auto from Tree Master",
          helpText: "Filled from Tree Master — editable if needed",
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
          helpText:
            "Add each benefit separately (press Enter or comma after typing).",
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
        title={
          editEntry
            ? "Edit Rashi Tree Recommendation"
            : "Add Rashi Tree Recommendation"
        }
        subtitle="Assign one or more recommended trees to each Rashi (zodiac sign). Users see these based on DOB or manual selection."
        onBack={() => navigate("/rashi-trees")}
      />

      {treeOptions.length === 0 && !loadingTrees && (
        <div
          className="card"
          style={{
            marginBottom: 16,
            padding: 14,
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Create the tree in Tree Master Catalog first, then select it here.
          </span>
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate("/tree-masters/add")}
          >
            <Plus size={16} /> Create Tree Master
          </button>
        </div>
      )}

      <div className="card">
        <SmartForm
          sections={sections}
          formData={formData}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={error}
          submitLabel={
            editEntry ? "Update Recommendation" : "Save Recommendation"
          }
          cancelLabel="Cancel"
          onCancel={() => navigate("/rashi-trees")}
        />
      </div>
    </div>
  );
};

export default RashiTreeForm;
