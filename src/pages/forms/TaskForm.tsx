import React, { useState } from "react";
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

  const [formData, setFormData] = useState<TaskFormData>(
    editTask
      ? {
          ...emptyForm,
          ...editTask,
          dueDate: editTask.dueDate ? String(editTask.dueDate).slice(0, 10) : "",
        }
      : emptyForm
  );

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
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
        { name: "assignedMitra", label: "Assigned Mitra", type: "text", icon: User },
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
