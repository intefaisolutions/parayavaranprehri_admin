import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  User,
  Phone,
  Mail,
  Briefcase,
  MapPin,
  Building2,
  Landmark,
  Star,
  ShieldCheck,
  TreePine,
} from "lucide-react";
import { apiFetch } from "../../utils/apiConfig";
import {
  getDistrictOptions,
  getStateOptions,
} from "../../utils/indiaLocations";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig, SelectOption } from "../../components/form/SmartForm";
import { FormPageHeader } from "../../components/form/FormPageHeader";

export interface MitrasFormData {
  _id?: string;
  mitraId?: string;
  name: string;
  mobile: string;
  email?: string;
  profession?: string;
  state: string;
  district: string;
  vidhanSabha: string;
  landId: string;
  landName: string;
  treePick: string;
  assignedZone: string;
  membership: string;
  status: string;
}

type VsRow = {
  _id: string;
  vidhanSabhaName: string;
  district?: string;
  state?: string;
};
type LandRow = {
  _id: string;
  landName: string;
  district?: string;
  vidhanSabha?: string;
};
type TreeRow = {
  _id: string;
  treeName?: string;
  species?: string;
  landId?: string;
  status?: string;
};

const TREE_NONE = "__none__";
const TREE_ALL = "__all__";

const emptyForm: MitrasFormData = {
  name: "",
  mobile: "",
  email: "",
  profession: "",
  state: "",
  district: "",
  vidhanSabha: "",
  landId: "",
  landName: "",
  treePick: TREE_NONE,
  assignedZone: "",
  membership: "free",
  status: "Approved",
};

function treePickFromMitra(m: any): string {
  if (m?.treeAssignment === "ALL") return TREE_ALL;
  if (m?.treeAssignment === "SINGLE" && m?.assignedTreeId) {
    return String(m.assignedTreeId);
  }
  return TREE_NONE;
}

export const MitraForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const editMitra = location.state?.mitra;
  const isEditing = !!editMitra;

  const [formData, setFormData] = useState<MitrasFormData>(
    editMitra
      ? {
          ...emptyForm,
          ...editMitra,
          state: editMitra.state || "",
          district: editMitra.district || "",
          vidhanSabha: editMitra.vidhanSabha || "",
          landId: editMitra.landId ? String(editMitra.landId) : "",
          landName: editMitra.landName || "",
          treePick: treePickFromMitra(editMitra),
          assignedZone: editMitra.assignedZone || "",
        }
      : emptyForm,
  );

  const [vsOptions, setVsOptions] = useState<SelectOption[]>([]);
  const [landOptions, setLandOptions] = useState<
    { label: string; value: string; meta?: LandRow }[]
  >([]);
  const [treeOptions, setTreeOptions] = useState<SelectOption[]>([]);
  const [loadingVs, setLoadingVs] = useState(false);
  const [loadingLands, setLoadingLands] = useState(false);
  const [loadingTrees, setLoadingTrees] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!formData.district) {
      setVsOptions([]);
      return;
    }
    setLoadingVs(true);
    // Filter mainly by district (created VS). State is soft-matched client-side.
    const params = new URLSearchParams({
      limit: "200",
      sortBy: "vidhanSabhaName",
      sortOrder: "asc",
      district: formData.district,
    });
    apiFetch<VsRow[]>(`/api/v1/vidhan-sabhas?${params.toString()}`)
      .then((rows) => {
        let items = Array.isArray(rows) ? rows : [];
        if (formData.state) {
          const stateLc = formData.state.toLowerCase();
          const byState = items.filter(
            (v) => !v.state || String(v.state).toLowerCase() === stateLc,
          );
          // Prefer state match; if none, still show district matches
          if (byState.length) items = byState;
        }
        const opts = items.map((v) => ({
          label: v.district
            ? `${v.vidhanSabhaName} · ${v.district}`
            : v.vidhanSabhaName,
          value: v.vidhanSabhaName,
        }));
        if (
          formData.vidhanSabha &&
          !opts.some((o) => o.value === formData.vidhanSabha)
        ) {
          opts.unshift({
            label: formData.vidhanSabha,
            value: formData.vidhanSabha,
          });
        }
        setVsOptions(opts);
      })
      .catch(() => setVsOptions([]))
      .finally(() => setLoadingVs(false));
  }, [formData.state, formData.district]);

  useEffect(() => {
    if (!formData.state || !formData.district || !formData.vidhanSabha) {
      setLandOptions([]);
      return;
    }
    setLoadingLands(true);
    const params = new URLSearchParams({
      state: formData.state,
      district: formData.district,
      vidhanSabha: formData.vidhanSabha,
    });
    apiFetch<LandRow[]>(`/api/v1/lands?${params.toString()}`)
      .then((list) => {
        const items = Array.isArray(list) ? list : [];
        const opts = items.map((l) => ({
          label: l.landName,
          value: l._id,
          meta: l,
        }));
        if (
          formData.landId &&
          !opts.some((o) => o.value === formData.landId)
        ) {
          opts.unshift({
            label: formData.landName || formData.landId,
            value: formData.landId,
            meta: {
              _id: formData.landId,
              landName: formData.landName || formData.landId,
            },
          });
        }
        setLandOptions(opts);
      })
      .catch(() => setLandOptions([]))
      .finally(() => setLoadingLands(false));
  }, [formData.state, formData.district, formData.vidhanSabha]);

  useEffect(() => {
    if (!formData.landId) {
      setTreeOptions([]);
      return;
    }
    setLoadingTrees(true);
    apiFetch<TreeRow[]>("/api/v1/trees")
      .then((list) => {
        const items = (Array.isArray(list) ? list : []).filter(
          (t) => String(t.landId || "") === formData.landId,
        );
        const opts: SelectOption[] = [
          { label: "No tree (land / VS only)", value: TREE_NONE },
          {
            label: `All trees on this land (${items.length})`,
            value: TREE_ALL,
          },
          ...items.map((t) => ({
            label: `${t.treeName || t.species || "Tree"}${
              t.species && t.treeName !== t.species ? ` · ${t.species}` : ""
            }`,
            value: t._id,
          })),
        ];
        setTreeOptions(opts);
      })
      .catch(() =>
        setTreeOptions([
          { label: "No tree (land / VS only)", value: TREE_NONE },
          { label: "All trees on this land", value: TREE_ALL },
        ]),
      )
      .finally(() => setLoadingTrees(false));
  }, [formData.landId]);

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => {
      if (name === "state") {
        return {
          ...prev,
          state: value,
          district: "",
          vidhanSabha: "",
          landId: "",
          landName: "",
          treePick: TREE_NONE,
        };
      }
      if (name === "district") {
        return {
          ...prev,
          district: value,
          vidhanSabha: "",
          landId: "",
          landName: "",
          treePick: TREE_NONE,
        };
      }
      if (name === "vidhanSabha") {
        return {
          ...prev,
          vidhanSabha: value,
          landId: "",
          landName: "",
          treePick: TREE_NONE,
        };
      }
      if (name === "landId") {
        const land = landOptions.find((l) => l.value === value)?.meta;
        return {
          ...prev,
          landId: value,
          landName: land?.landName || "",
          treePick: TREE_NONE,
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const treeAssignmentPayload = useMemo(() => {
    if (!formData.landId || formData.treePick === TREE_NONE) {
      return {
        treeAssignment: "NONE" as const,
        assignedTreeId: undefined,
        assignedTreeName: undefined,
      };
    }
    if (formData.treePick === TREE_ALL) {
      return {
        treeAssignment: "ALL" as const,
        assignedTreeId: undefined,
        assignedTreeName: undefined,
      };
    }
    const label =
      treeOptions.find((t) => t.value === formData.treePick)?.label || "";
    return {
      treeAssignment: "SINGLE" as const,
      assignedTreeId: formData.treePick,
      assignedTreeName: label,
    };
  }, [formData.landId, formData.treePick, treeOptions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.state || !formData.district) {
      setError("Please select State and District");
      return;
    }
    if (!formData.vidhanSabha.trim()) {
      setError("Vidhan Sabha is required for assignment");
      return;
    }

    setSubmitting(true);

    const {
      _id,
      mitraId: _mitraId,
      treePick: _treePick,
      landId,
      landName,
      ...rest
    } = formData;

    const payload = {
      ...rest,
      vidhanSabha: formData.vidhanSabha,
      state: formData.state,
      district: formData.district,
      landId: landId || null,
      landName: landId ? landName || null : null,
      treeAssignment: landId
        ? treeAssignmentPayload.treeAssignment
        : "NONE",
      assignedTreeId: landId
        ? treeAssignmentPayload.assignedTreeId || null
        : null,
      assignedTreeName: landId
        ? treeAssignmentPayload.assignedTreeName || null
        : null,
      assignedZone: formData.assignedZone || undefined,
      email: formData.email || undefined,
      profession: formData.profession || undefined,
    };

    try {
      if (isEditing && _id) {
        await apiFetch(`/api/v1/mitras/${_id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/v1/mitras", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      navigate("/mitras");
    } catch (err: any) {
      setError(err.message || "Failed to save Mitra");
    } finally {
      setSubmitting(false);
    }
  };

  const sections: FormSectionConfig[] = [
    {
      title: "Volunteer Details",
      description: "Core identity and contact information for this Mitra.",
      icon: User,
      fields: [
        {
          name: "name",
          label: "Full Name",
          type: "text",
          icon: User,
          required: true,
          span: 2,
        },
        {
          name: "mobile",
          label: "Mobile Number",
          type: "tel",
          icon: Phone,
          required: true,
        },
        { name: "email", label: "Email", type: "email", icon: Mail },
        {
          name: "profession",
          label: "Profession",
          type: "text",
          icon: Briefcase,
          span: 2,
        },
      ],
    },
    {
      title: "Assignment",
      description:
        "State → District → Vidhan Sabha (required). Land and tree are optional.",
      icon: MapPin,
      fields: [
        {
          name: "state",
          label: "State",
          type: "select",
          icon: Building2,
          required: true,
          options: getStateOptions(),
        },
        {
          name: "district",
          label: "District",
          type: "select",
          icon: Landmark,
          required: true,
          optionsFor: (data) => getDistrictOptions(data.state),
        },
        {
          name: "vidhanSabha",
          label: "Vidhan Sabha",
          type: "select",
          icon: Landmark,
          required: true,
          options: vsOptions,
          disabled: !formData.district,
          helpText: loadingVs
            ? "Loading created Vidhan Sabhas…"
            : !formData.district
              ? "Pick State and District first"
              : vsOptions.length
                ? `${vsOptions.length} created VS in ${formData.district}`
                : "No created Vidhan Sabha for this district — create one under Location Masters → Vidhan Sabha",
        },
        {
          name: "landId",
          label: "Land (optional)",
          type: "select",
          icon: MapPin,
          options: landOptions,
          disabled: !formData.vidhanSabha,
          helpText: !formData.vidhanSabha
            ? "Select Vidhan Sabha first — then lands under it appear here"
            : loadingLands
              ? "Loading lands…"
              : landOptions.length
                ? `${landOptions.length} land(s) under ${formData.vidhanSabha}`
                : "No lands under this VS yet — VS-only assignment is fine",
        },
        {
          name: "treePick",
          label: "Tree assignment (optional)",
          type: "select",
          icon: TreePine,
          options: treeOptions.length
            ? treeOptions
            : [
                { label: "No tree (land / VS only)", value: TREE_NONE },
                { label: "All trees on this land", value: TREE_ALL },
              ],
          disabled: !formData.landId,
          helpText: !formData.landId
            ? "Optional — select a Land first to assign one/all trees"
            : loadingTrees
              ? "Loading trees…"
              : "None · one tree · or all trees on the selected land",
        },
        {
          name: "assignedZone",
          label: "Assigned Zone (optional note)",
          type: "text",
          icon: MapPin,
          placeholder: "e.g. Ward 4 / Beat area",
        },
      ],
    },
    {
      title: "Membership & Status",
      icon: ShieldCheck,
      fields: [
        {
          name: "membership",
          label: "Membership",
          type: "select",
          icon: Star,
          required: true,
          options: [
            { label: "Free", value: "free" },
            { label: "Premium", value: "premium" },
          ],
        },
        {
          name: "status",
          label: "Status",
          type: "select",
          icon: ShieldCheck,
          required: true,
          options: [
            { label: "Approved", value: "Approved" },
            { label: "Pending", value: "Pending" },
            { label: "Cancelled", value: "Cancelled" },
          ],
        },
      ],
    },
  ];

  return (
    <div className="dashboard-area">
      <FormPageHeader
        icon={User}
        title={isEditing ? "Edit Mitra" : "Assign New Mitra"}
        subtitle="Master record of every volunteer (Mitra) registered on the platform."
        onBack={() => navigate("/mitras")}
      />

      {isEditing && formData.mitraId && (
        <div
          className="card"
          style={{
            marginBottom: 16,
            fontSize: 13,
            color: "var(--text-secondary)",
            padding: "10px 16px",
          }}
        >
          Mitra ID:{" "}
          <strong style={{ color: "var(--text-primary)" }}>
            {formData.mitraId}
          </strong>
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
          submitLabel={isEditing ? "Update Mitra" : "Add Mitra"}
          cancelLabel="Cancel"
          onCancel={() => navigate("/mitras")}
        />
      </div>
    </div>
  );
};

export default MitraForm;
