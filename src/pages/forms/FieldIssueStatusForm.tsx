import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertTriangle, ShieldCheck, AlignLeft } from "lucide-react";
import { apiFetch } from "../../utils/apiConfig";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig } from "../../components/form/SmartForm";
import { FormPageHeader } from "../../components/form/FormPageHeader";

interface StatusFormData {
  _id?: string;
  type?: string;
  priority?: string;
  description?: string;
  treeCode?: string;
  reportedByName?: string;
  status: string;
  resolutionNotes?: string;
}

export const FieldIssueStatusForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const issue = location.state?.issue as StatusFormData | undefined;

  const [formData, setFormData] = useState<StatusFormData>({
    ...issue,
    status: issue?.status || "Open",
    resolutionNotes: issue?.resolutionNotes || "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!issue?._id) navigate("/field-issues");
  }, [issue?._id, navigate]);

  if (!issue?._id) return null;

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await apiFetch(`/api/v1/field-issues/${issue._id}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status: formData.status,
          resolutionNotes: formData.resolutionNotes || undefined,
        }),
      });
      navigate("/field-issues");
    } catch (err: any) {
      setError(err.message || "Failed to update status");
    } finally {
      setSubmitting(false);
    }
  };

  const sections: FormSectionConfig[] = [
    {
      title: "Issue Summary",
      icon: AlertTriangle,
      fields: [
        {
          name: "type",
          label: "Type",
          type: "text",
          icon: AlertTriangle,
          disabled: true,
        },
        {
          name: "priority",
          label: "Priority",
          type: "text",
          icon: ShieldCheck,
          disabled: true,
        },
        {
          name: "treeCode",
          label: "Tree Code",
          type: "text",
          icon: AlignLeft,
          disabled: true,
        },
        {
          name: "reportedByName",
          label: "Reported By",
          type: "text",
          icon: AlignLeft,
          disabled: true,
        },
        {
          name: "description",
          label: "Description",
          type: "textarea",
          icon: AlignLeft,
          span: 2,
          rows: 3,
          disabled: true,
        },
      ],
    },
    {
      title: "Update Status",
      icon: ShieldCheck,
      fields: [
        {
          name: "status",
          label: "Status",
          type: "select",
          icon: ShieldCheck,
          required: true,
          options: [
            { label: "Open", value: "Open" },
            { label: "In Progress", value: "In Progress" },
            { label: "Resolved", value: "Resolved" },
            { label: "Closed", value: "Closed" },
          ],
        },
        {
          name: "resolutionNotes",
          label: "Resolution Notes",
          type: "textarea",
          icon: AlignLeft,
          span: 2,
          rows: 4,
        },
      ],
    },
  ];

  return (
    <div className="dashboard-area">
      <FormPageHeader
        icon={AlertTriangle}
        title="Update Field Issue"
        subtitle="Change status and add resolution notes"
        onBack={() => navigate("/field-issues")}
      />
      <div className="card">
        <SmartForm
          sections={sections}
          formData={formData}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={error}
          submitLabel="Update Status"
          cancelLabel="Cancel"
          onCancel={() => navigate("/field-issues")}
        />
      </div>
    </div>
  );
};

export default FieldIssueStatusForm;
