import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Wrench, TreePine, AlignLeft, CalendarDays } from "lucide-react";
import { apiFetch } from "../../utils/apiConfig";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig } from "../../components/form/SmartForm";
import { FormPageHeader } from "../../components/form/FormPageHeader";

interface MaintenanceLogFormData {
  _id?: string;
  treeCode: string;
  activity: string;
  remarks?: string;
  loggedAt?: string;
  mitraId?: string;
  createdByName?: string;
  photoUrls?: string[];
}

const emptyForm: MaintenanceLogFormData = {
  treeCode: "",
  activity: "Watering",
  remarks: "",
  loggedAt: "",
};

const toDateTimeLocal = (value?: string) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
};

export const MaintenanceLogForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const viewLog = location.state?.log as MaintenanceLogFormData | undefined;
  const isView = !!viewLog;

  const [formData, setFormData] = useState<MaintenanceLogFormData>(
    viewLog
      ? {
          ...emptyForm,
          ...viewLog,
          loggedAt: toDateTimeLocal(viewLog.loggedAt),
        }
      : emptyForm,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleFieldChange = (name: string, value: any) => {
    if (isView) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isView) {
      navigate("/maintenance-logs");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await apiFetch("/api/v1/maintenance-logs", {
        method: "POST",
        body: JSON.stringify({
          treeCode: formData.treeCode,
          activity: formData.activity,
          remarks: formData.remarks || undefined,
          loggedAt: formData.loggedAt
            ? new Date(formData.loggedAt).toISOString()
            : undefined,
        }),
      });
      navigate("/maintenance-logs");
    } catch (err: any) {
      setError(err.message || "Failed to save maintenance log");
    } finally {
      setSubmitting(false);
    }
  };

  const sections: FormSectionConfig[] = [
    {
      title: isView ? "Log Details" : "Maintenance Log",
      icon: Wrench,
      fields: [
        {
          name: "treeCode",
          label: "Tree Code",
          type: "text",
          icon: TreePine,
          required: !isView,
          disabled: isView,
        },
        {
          name: "activity",
          label: "Activity",
          type: "select",
          icon: Wrench,
          required: !isView,
          disabled: isView,
          options: [
            { label: "Watering", value: "Watering" },
            { label: "Tree Guard", value: "Tree Guard" },
            { label: "Fertilizer", value: "Fertilizer" },
            { label: "Pruning", value: "Pruning" },
            { label: "Replaced", value: "Replaced" },
            { label: "Soil", value: "Soil" },
            { label: "Other", value: "Other" },
          ],
        },
        {
          name: "remarks",
          label: "Remarks",
          type: "textarea",
          icon: AlignLeft,
          span: 2,
          rows: 4,
          disabled: isView,
        },
        ...(isView
          ? [
              {
                name: "createdByName",
                label: "Logged By",
                type: "text" as const,
                icon: AlignLeft,
                disabled: true,
              },
              {
                name: "mitraId",
                label: "Mitra ID",
                type: "text" as const,
                icon: AlignLeft,
                disabled: true,
              },
            ]
          : [
              {
                name: "loggedAt",
                label: "Logged At (optional)",
                type: "date" as const,
                icon: CalendarDays,
              },
            ]),
      ],
    },
  ];

  return (
    <div className="dashboard-area">
      <FormPageHeader
        icon={Wrench}
        title={isView ? "View Maintenance Log" : "Add Maintenance Log"}
        subtitle="Tree care activity from the field"
        onBack={() => navigate("/maintenance-logs")}
      />
      <div className="card">
        <SmartForm
          sections={sections}
          formData={formData}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={error}
          submitLabel={isView ? "Back" : "Save Log"}
          cancelLabel="Cancel"
          onCancel={() => navigate("/maintenance-logs")}
        />
      </div>
    </div>
  );
};

export default MaintenanceLogForm;
