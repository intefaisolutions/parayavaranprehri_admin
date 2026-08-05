import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Building2,
  Calendar,
  ClipboardList,
  Flag,
  Layers,
  MapPin,
  Landmark,
  MapPinned,
  ShieldCheck,
  Tag,
  User,
  FileText,
  TreePine,
} from "lucide-react";
import { apiFetch } from "../../utils/apiConfig";
import {
  getDistrictOptions,
  getStateOptions,
} from "../../utils/indiaLocations";
import { SmartForm } from "../../components/form/SmartForm";
import type {
  FormSectionConfig,
  SelectOption,
} from "../../components/form/SmartForm";
import { FormPageHeader } from "../../components/form/FormPageHeader";

const TREE_NONE = "__none__";
const TREE_ALL = "__all__";

type MitraOption = {
  _id: string;
  mitraId?: string;
  name: string;
  mobile?: string;
  status?: string;
  state?: string;
  district?: string;
  vidhanSabha?: string;
};

type LandRow = { _id: string; landName: string };
type TreeRow = {
  _id: string;
  treeName?: string;
  species?: string;
  landId?: string;
};

interface TaskFormData {
  _id?: string;
  taskTitle: string;
  description: string;
  taskType: string;
  assignedMitra: string;
  state: string;
  district: string;
  vidhanSabha: string;
  landId: string;
  landName: string;
  treePick: string;
  dueDate: string;
  priority: string;
  status: string;
}

const emptyForm: TaskFormData = {
  taskTitle: "",
  description: "",
  taskType: "Survey",
  assignedMitra: "",
  state: "Madhya Pradesh",
  district: "",
  vidhanSabha: "",
  landId: "",
  landName: "",
  treePick: TREE_NONE,
  dueDate: "",
  priority: "Medium",
  status: "Pending",
};

function treePickFromTask(task: any): string {
  if (task?.treeAssignment === "ALL") return TREE_ALL;
  if (task?.treeAssignment === "SINGLE" && task?.assignedTreeId) {
    return String(task.assignedTreeId);
  }
  return TREE_NONE;
}

export const TaskForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const editTask = location.state?.task;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [mitras, setMitras] = useState<MitraOption[]>([]);
  const [loadingMitras, setLoadingMitras] = useState(true);
  const [vsOptions, setVsOptions] = useState<{ label: string; value: string }[]>(
    [],
  );
  const [loadingVs, setLoadingVs] = useState(false);
  const [landOptions, setLandOptions] = useState<
    { label: string; value: string; meta?: LandRow }[]
  >([]);
  const [loadingLands, setLoadingLands] = useState(false);
  const [treeOptions, setTreeOptions] = useState<SelectOption[]>([]);
  const [loadingTrees, setLoadingTrees] = useState(false);

  const [formData, setFormData] = useState<TaskFormData>(
    editTask
      ? {
          ...emptyForm,
          ...editTask,
          state: editTask.state || emptyForm.state,
          district: editTask.district || "",
          vidhanSabha: editTask.vidhanSabha || "",
          landId: editTask.landId ? String(editTask.landId) : "",
          landName: editTask.landName || "",
          treePick: treePickFromTask(editTask),
          dueDate: editTask.dueDate ? String(editTask.dueDate).slice(0, 10) : "",
        }
      : emptyForm,
  );

  useEffect(() => {
    setLoadingMitras(true);
    apiFetch<MitraOption[]>("/api/v1/mitras?status=Approved")
      .then((list) => setMitras(list || []))
      .catch(() => setMitras([]))
      .finally(() => setLoadingMitras(false));
  }, []);

  useEffect(() => {
    if (!formData.district) {
      setVsOptions([]);
      return;
    }
    setLoadingVs(true);
    const params = new URLSearchParams({
      limit: "200",
      sortBy: "vidhanSabhaName",
      sortOrder: "asc",
      district: formData.district,
    });
    apiFetch<any[]>(`/api/v1/vidhan-sabhas?${params.toString()}`)
      .then((rows) => {
        let items = Array.isArray(rows) ? rows : [];
        if (formData.state) {
          const stateLc = formData.state.toLowerCase();
          const byState = items.filter(
            (v) => !v.state || String(v.state).toLowerCase() === stateLc,
          );
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
      setTreeOptions([
        { label: "No tree (land / VS only)", value: TREE_NONE },
      ]);
      return;
    }
    setLoadingTrees(true);
    apiFetch<TreeRow[]>("/api/v1/trees")
      .then((list) => {
        const items = (Array.isArray(list) ? list : []).filter(
          (t) => String(t.landId || "") === formData.landId,
        );
        setTreeOptions([
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
        ]);
      })
      .catch(() =>
        setTreeOptions([
          { label: "No tree (land / VS only)", value: TREE_NONE },
          { label: "All trees on this land", value: TREE_ALL },
        ]),
      )
      .finally(() => setLoadingTrees(false));
  }, [formData.landId]);

  const mitraSelectOptions = useMemo(() => {
    const opts = mitras.map((m) => ({
      label: [m.name, m.mobile, m.vidhanSabha].filter(Boolean).join(" · "),
      value: m.name,
    }));
    if (
      formData.assignedMitra &&
      !opts.some((o) => o.value === formData.assignedMitra)
    ) {
      opts.unshift({
        label: formData.assignedMitra,
        value: formData.assignedMitra,
      });
    }
    return opts;
  }, [mitras, formData.assignedMitra]);

  const treeAssignmentPayload = useMemo(() => {
    if (!formData.landId || formData.treePick === TREE_NONE) {
      return {
        treeAssignment: "NONE" as const,
        assignedTreeId: undefined as string | undefined,
        assignedTreeName: undefined as string | undefined,
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
      treeOptions.find((o) => o.value === formData.treePick)?.label ||
      formData.treePick;
    return {
      treeAssignment: "SINGLE" as const,
      assignedTreeId: formData.treePick,
      assignedTreeName: label,
    };
  }, [formData.landId, formData.treePick, treeOptions]);

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
      if (name === "assignedMitra") {
        const mitra = mitras.find((m) => m.name === value);
        return {
          ...prev,
          assignedMitra: value,
          state: mitra?.state || prev.state,
          district: mitra?.district || prev.district,
          vidhanSabha: mitra?.vidhanSabha || prev.vidhanSabha,
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.assignedMitra) {
      setError("Please select an Assigned Mitra");
      return;
    }
    if (!formData.state || !formData.district) {
      setError("Please select State and District");
      return;
    }
    if (!formData.vidhanSabha) {
      setError("Please select Vidhan Sabha");
      return;
    }

    setSubmitting(true);

    const payload = {
      taskTitle: formData.taskTitle,
      description: formData.description || undefined,
      taskType: formData.taskType,
      assignedMitra: formData.assignedMitra,
      state: formData.state,
      district: formData.district,
      vidhanSabha: formData.vidhanSabha,
      landId: formData.landId || undefined,
      landName: formData.landId ? formData.landName || undefined : undefined,
      treeAssignment: formData.landId
        ? treeAssignmentPayload.treeAssignment
        : "NONE",
      assignedTreeId: formData.landId
        ? treeAssignmentPayload.assignedTreeId
        : undefined,
      assignedTreeName: formData.landId
        ? treeAssignmentPayload.assignedTreeName
        : undefined,
      dueDate: formData.dueDate,
      priority: formData.priority,
      status: formData.status,
    };

    try {
      if (editTask?._id) {
        await apiFetch(`/api/v1/tasks/${editTask._id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/v1/tasks", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      navigate("/tasks");
    } catch (err: any) {
      setError(err.message || "Failed to save task");
    } finally {
      setSubmitting(false);
    }
  };

  const sections: FormSectionConfig[] = [
    {
      title: "Task Details",
      description: "What needs to be done and what kind of task it is.",
      icon: ClipboardList,
      fields: [
        {
          name: "taskTitle",
          label: "Task Title",
          type: "text",
          icon: Tag,
          required: true,
          span: 2,
        },
        {
          name: "description",
          label: "Description",
          type: "textarea",
          icon: FileText,
          span: 2,
        },
        {
          name: "taskType",
          label: "Task Type",
          type: "select",
          icon: Layers,
          required: true,
          options: [
            { label: "Survey", value: "Survey" },
            { label: "Plantation", value: "Plantation" },
            { label: "Inspection", value: "Inspection" },
          ],
        },
      ],
    },
    {
      title: "Assignment",
      description:
        "Assign a Mitra, then location: State → District → Vidhan Sabha → Land → Tree.",
      icon: MapPin,
      fields: [
        {
          name: "assignedMitra",
          label: "Assigned Mitra",
          type: "select",
          icon: User,
          required: true,
          options: mitraSelectOptions,
          span: 2,
          helpText: "Select from Approved Mitra list (location may auto-fill)",
        },
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
          span: 2,
          helpText: loadingVs
            ? "Loading registered constituencies…"
            : !formData.district
              ? "Choose State and District first"
              : vsOptions.length
                ? "From registered Vidhan Sabha list"
                : "Register a Vidhan Sabha for this district first",
        },
        {
          name: "landId",
          label: "Land",
          type: "select",
          icon: MapPinned,
          options: landOptions,
          span: 2,
          helpText: loadingLands
            ? "Loading lands…"
            : !formData.vidhanSabha
              ? "Select Vidhan Sabha first"
              : landOptions.length
                ? "Optional — lands under this Vidhan Sabha"
                : "No lands found for this Vidhan Sabha",
        },
        {
          name: "treePick",
          label: "Tree",
          type: "select",
          icon: TreePine,
          options: treeOptions,
          span: 2,
          disabled: !formData.landId,
          helpText: loadingTrees
            ? "Loading trees…"
            : !formData.landId
              ? "Select a Land first to choose trees"
              : "None, all trees on land, or a specific tree",
        },
      ],
    },
    {
      title: "Scheduling & Priority",
      icon: Flag,
      fields: [
        {
          name: "dueDate",
          label: "Due Date",
          type: "date",
          icon: Calendar,
          required: true,
        },
        {
          name: "priority",
          label: "Priority",
          type: "select",
          icon: Flag,
          options: [
            { label: "High", value: "High" },
            { label: "Medium", value: "Medium" },
            { label: "Low", value: "Low" },
          ],
        },
        {
          name: "status",
          label: "Status",
          type: "select",
          icon: ShieldCheck,
          options: [
            { label: "Pending", value: "Pending" },
            { label: "In Progress", value: "In Progress" },
            { label: "Completed", value: "Completed" },
          ],
        },
      ],
    },
  ];

  return (
    <div className="dashboard-area">
      <FormPageHeader
        icon={ClipboardList}
        title={editTask ? "Edit Task" : "Add Task"}
        subtitle="Assign Mitra and location (State → District → Vidhan Sabha → Land → Tree)."
        onBack={() => navigate("/tasks")}
      />

      <div className="card">
        <SmartForm
          sections={sections}
          formData={formData}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={error}
          submitLabel={editTask ? "Update Task" : "Save Task"}
          cancelLabel="Cancel"
          onCancel={() => navigate("/tasks")}
        />
      </div>
    </div>
  );
};

export default TaskForm;
