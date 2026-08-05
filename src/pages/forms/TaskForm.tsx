import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Calendar,
  ClipboardList,
  Flag,
  Layers,
  MapPin,
  Landmark,
  ShieldCheck,
  Tag,
  User,
  FileText,
  Grid3x3,
} from "lucide-react";
import { apiFetch } from "../../utils/apiConfig";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig } from "../../components/form/SmartForm";
import { FormPageHeader } from "../../components/form/FormPageHeader";

type MitraOption = {
  _id: string;
  mitraId?: string;
  name: string;
  mobile?: string;
  status?: string;
  vidhanSabha?: string;
};

interface TaskFormData {
  _id?: string;
  taskTitle: string;
  description: string;
  taskType: string;
  assignedMitra: string;
  vidhanSabha: string;
  zone: string;
  sector: string;
  dueDate: string;
  priority: string;
  status: string;
}

const emptyForm: TaskFormData = {
  taskTitle: "",
  description: "",
  taskType: "Survey",
  assignedMitra: "",
  vidhanSabha: "",
  zone: "",
  sector: "",
  dueDate: "",
  priority: "Medium",
  status: "Pending",
};

export const TaskForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const editTask = location.state?.task;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [mitras, setMitras] = useState<MitraOption[]>([]);
  const [loadingMitras, setLoadingMitras] = useState(true);

  const [formData, setFormData] = useState<TaskFormData>(
    editTask
      ? {
          ...emptyForm,
          ...editTask,
          dueDate: editTask.dueDate ? String(editTask.dueDate).slice(0, 10) : "",
        }
      : emptyForm
  );

  useEffect(() => {
    setLoadingMitras(true);
    apiFetch<MitraOption[]>("/api/v1/mitras?status=Approved")
      .then((list) => setMitras(list || []))
      .catch(() => setMitras([]))
      .finally(() => setLoadingMitras(false));
  }, []);

  const mitraSelectOptions = useMemo(() => {
    const opts = mitras.map((m) => ({
      label: [m.name, m.mobile, m.vidhanSabha].filter(Boolean).join(" · "),
      value: m.name,
    }));
    // Keep current edit value selectable even if Mitra is no longer Approved
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

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => {
      if (name === "assignedMitra") {
        const mitra = mitras.find((m) => m.name === value);
        return {
          ...prev,
          assignedMitra: value,
          // Prefill location from Mitra when empty
          vidhanSabha: prev.vidhanSabha || mitra?.vidhanSabha || "",
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const { _id, createdAt: _createdAt, updatedAt: _updatedAt, ...payload } = formData as any;

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
        { name: "taskTitle", label: "Task Title", type: "text", icon: Tag, required: true, span: 2 },
        { name: "description", label: "Description", type: "textarea", icon: FileText, span: 2 },
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
      description: "Who is responsible and where this task applies.",
      icon: MapPin,
      fields: [
        {
          name: "assignedMitra",
          label: "Assigned Mitra",
          type: "select",
          icon: User,
          required: true,
          options: mitraSelectOptions,
          placeholder: loadingMitras
            ? "Loading Mitras…"
            : mitraSelectOptions.length
              ? "Select Mitra"
              : "No Approved Mitras found",
          helpText: loadingMitras
            ? "Fetching Approved Mitras…"
            : mitraSelectOptions.length
              ? "Select from Approved Mitra list"
              : "Add/approve a Mitra under Paryavaran Mitra first",
        },
        { name: "vidhanSabha", label: "Vidhan Sabha", type: "text", icon: Landmark },
        { name: "zone", label: "Zone", type: "text", icon: MapPin },
        { name: "sector", label: "Sector", type: "text", icon: Grid3x3 },
      ],
    },
    {
      title: "Scheduling & Priority",
      icon: Flag,
      fields: [
        { name: "dueDate", label: "Due Date", type: "date", icon: Calendar, required: true },
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
        subtitle="Create or update a task and assign it to a Mitra, zone or sector."
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
