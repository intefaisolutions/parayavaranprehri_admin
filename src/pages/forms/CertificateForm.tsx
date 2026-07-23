import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Award, Image, Tag, ToggleLeft, UserCog } from "lucide-react";
import { apiFetch } from "../../utils/apiConfig";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig } from "../../components/form/SmartForm";
import { FormPageHeader } from "../../components/form/FormPageHeader";

const CERTIFICATE_TYPE_OPTIONS = [
  { label: "Participation", value: "Participation" },
  { label: "Achievement", value: "Achievement" },
  { label: "Appreciation", value: "Appreciation" },
  { label: "Excellence", value: "Excellence" },
];

export const CertificateForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const editCertificate = location.state?.certificate;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<Record<string, any>>(
    editCertificate || {
      certificateType: "",
      templateName: "",
      logoUrl: "",
      signatureUrl: "",
      backgroundUrl: "",
      lastUpdatedBy: "",
      status: "Active",
    }
  );

  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const { _id: _formId, updatedAt: _updatedAt, createdAt: _createdAt, ...payload } = formData;

    try {
      if (editCertificate?._id) {
        await apiFetch(`/api/v1/certificates/templates/${editCertificate._id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/v1/certificates/templates", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      navigate("/certificates");
    } catch (err: any) {
      setError(err.message || "Failed to save certificate template");
    } finally {
      setSubmitting(false);
    }
  };

  const sections: FormSectionConfig[] = [
    {
      title: "Template Identity",
      description: "Basic details that describe what this certificate template is used for.",
      icon: Tag,
      fields: [
        {
          name: "certificateType",
          label: "Certificate Type",
          type: "select",
          icon: Tag,
          required: true,
          options: CERTIFICATE_TYPE_OPTIONS,
          helpText: "The category of achievement this template represents.",
        },
        {
          name: "templateName",
          label: "Template Name",
          type: "text",
          icon: Award,
          required: true,
          placeholder: "e.g. Green Champion 2026",
        },
        {
          name: "status",
          label: "Status",
          type: "select",
          icon: ToggleLeft,
          required: true,
          options: [
            { label: "Active", value: "Active" },
            { label: "Inactive", value: "Inactive" },
          ],
          helpText: "Only Active templates can be used to issue new certificates.",
        },
      ],
    },
    {
      title: "Branding & Assets",
      description: "Add the visual assets used to render the certificate (shown as a live preview).",
      icon: Image,
      fields: [
        {
          name: "logoUrl",
          label: "Logo URL",
          type: "image",
          placeholder: "https://...",
        },
        {
          name: "signatureUrl",
          label: "Signature URL",
          type: "image",
          placeholder: "https://...",
        },
        {
          name: "backgroundUrl",
          label: "Background URL",
          type: "image",
          placeholder: "https://...",
          span: 2,
        },
      ],
    },
    {
      title: "Ownership",
      icon: UserCog,
      fields: [
        {
          name: "lastUpdatedBy",
          label: "Last Updated By",
          type: "text",
          icon: UserCog,
          placeholder: "Admin name",
        },
      ],
    },
  ];

  return (
    <div className="dashboard-area">
      <FormPageHeader
        icon={Award}
        title={editCertificate ? "Edit Certificate Template" : "Add Certificate Template"}
        subtitle="Design a reusable certificate template you can issue to Paryavaran Mitras and other volunteers."
        onBack={() => navigate("/certificates")}
      />

      <div className="card">
        <SmartForm
          sections={sections}
          formData={formData}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={error}
          submitLabel={editCertificate ? "Update Template" : "Save Template"}
          cancelLabel="Cancel"
          onCancel={() => navigate("/certificates")}
        />
      </div>
    </div>
  );
};
