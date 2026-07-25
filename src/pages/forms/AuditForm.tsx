import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Calendar,
  ClipboardList,
  FileText,
  Fingerprint,
  Globe,
  Layers,
  ShieldCheck,
  User,
} from "lucide-react";
import { apiFetch } from "../../utils/apiConfig";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig } from "../../components/form/SmartForm";
import { FormPageHeader } from "../../components/form/FormPageHeader";

const ACTION_TYPE_OPTIONS = [
  { label: "Create", value: "Create" },
  { label: "Update", value: "Update" },
  { label: "Delete", value: "Delete" },
  { label: "Login", value: "Login" },
];

interface AuditFormData {
  _id?: string;
  userName: string;
  role: string;
  moduleName: string;
  actionType: string;
  recordId: string;
  description: string;
  ipAddress: string;
  dateTime: string;
}

const emptyForm: AuditFormData = {
  userName: "",
  role: "",
  moduleName: "",
  actionType: "Create",
  recordId: "",
  description: "",
  ipAddress: "",
  dateTime: "",
};

const toDateInputValue = (value?: string) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

export const AuditForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editAudit = location.state?.audit;

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<AuditFormData>(
    editAudit
      ? {
          ...emptyForm,
          ...editAudit,
          dateTime: toDateInputValue(editAudit.dateTime),
        }
      : emptyForm
  );

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.moduleName.trim() || !formData.actionType.trim()) {
      setError("Module Name and Action Type are required");
      return;
    }

    setSubmitting(true);

    const { _id, ...rest } = formData;
    const payload: Record<string, any> = { ...rest };
    Object.keys(payload).forEach((key) => {
      if (payload[key] === "") delete payload[key];
    });

    try {
      if (editAudit?._id) {
        await apiFetch(`/api/v1/audit-logs/${editAudit._id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/v1/audit-logs", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      navigate("/audit");
    } catch (err: any) {
      setError(err.message || "Failed to save audit log");
    } finally {
      setSubmitting(false);
    }
  };

  const sections: FormSectionConfig[] = [
    {
      title: "Action Details",
      description: "What happened, in which module, and how it should be classified.",
      icon: ClipboardList,
      fields: [
        {
          name: "moduleName",
          label: "Module Name",
          type: "text",
          icon: Layers,
          required: true,
          placeholder: "e.g. Mitras",
        },
        {
          name: "actionType",
          label: "Action Type",
          type: "select",
          icon: ShieldCheck,
          required: true,
          options: ACTION_TYPE_OPTIONS,
        },
        {
          name: "recordId",
          label: "Record ID",
          type: "text",
          icon: Fingerprint,
          placeholder: "ID of the affected record",
        },
        {
          name: "dateTime",
          label: "Date",
          type: "date",
          icon: Calendar,
          helpText: "Leave blank to use the current date & time.",
        },
        {
          name: "description",
          label: "Description",
          type: "textarea",
          icon: FileText,
          placeholder: "Describe what changed...",
          span: 2,
        },
      ],
    },
    {
      title: "Actor Details",
      description: "Who performed the action. Leave blank to auto-fill from your account.",
      icon: User,
      fields: [
        {
          name: "userName",
          label: "User Name",
          type: "text",
          icon: User,
          placeholder: "Defaults to your account email",
        },
        {
          name: "role",
          label: "Role",
          type: "text",
          icon: ShieldCheck,
          placeholder: "Defaults to your account role",
        },
        {
          name: "ipAddress",
          label: "IP Address",
          type: "text",
          icon: Globe,
          placeholder: "Defaults to request IP",
          span: 2,
        },
      ],
    },
  ];

  return (
    <div className="dashboard-area">
      <FormPageHeader
        icon={ClipboardList}
        title={editAudit ? "Edit Audit Log" : "Add Audit Log"}
        subtitle="Manually record or amend an entry in the system audit trail."
        onBack={() => navigate("/audit")}
      />

      <div className="card">
        <SmartForm
          sections={sections}
          formData={formData}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={error}
          submitLabel={editAudit ? "Update Log Entry" : "Save Log Entry"}
          cancelLabel="Cancel"
          onCancel={() => navigate("/audit")}
        />
      </div>
    </div>
  );
};

export default AuditForm;
