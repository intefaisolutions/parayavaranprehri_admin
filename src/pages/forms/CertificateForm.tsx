import React, { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Award, Image, Tag, ToggleLeft, UserCog } from "lucide-react";
import { apiFetch } from "../../utils/apiConfig";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig } from "../../components/form/SmartForm";
import { FormPageHeader } from "../../components/form/FormPageHeader";
import { CertificateMitraPreview } from "../../components/certificates/CertificateMitraPreview";

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
      certificateType: "Appreciation",
      templateName: "",
      logoUrl: "",
      signatureUrl: "",
      backgroundUrl: "",
      lastUpdatedBy: "",
      status: "Active",
    },
  );

  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const {
      _id: _formId,
      updatedAt: _updatedAt,
      createdAt: _createdAt,
      ...payload
    } = formData;

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

  const previewData = useMemo(
    () => ({
      title: `Certificate of ${formData.certificateType || "Appreciation"}`,
      recipientName: "Sample Mitra",
      description:
        "In recognition of dedicated service as a Paryavaran Mitra under the green cover initiative.",
      eventName: formData.templateName || "Sample plantation drive",
      issueDate: new Date().toISOString(),
      verificationCode: "PP-DEMO-CODE",
      logoUrl: formData.logoUrl,
      signatureUrl: formData.signatureUrl,
      backgroundUrl: formData.backgroundUrl,
      templateName: formData.templateName,
      certificateType: formData.certificateType,
    }),
    [formData],
  );

  const sections: FormSectionConfig[] = [
    {
      title: "Template Identity",
      description:
        "Basic details that describe what this certificate template is used for.",
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
      description:
        "Visual assets used on the certificate. Live Mitra preview updates on the right.",
      icon: Image,
      fields: [
        {
          name: "logoUrl",
          label: "Logo",
          type: "image",
          uploadCategory: "certificates",
          placeholder: "https://...",
        },
        {
          name: "signatureUrl",
          label: "Signature",
          type: "image",
          uploadCategory: "certificates",
          placeholder: "https://...",
        },
        {
          name: "backgroundUrl",
          label: "Background",
          type: "image",
          uploadCategory: "certificates",
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
        title={
          editCertificate ? "Edit Certificate Template" : "Add Certificate Template"
        }
        subtitle="Design a reusable certificate template — preview shows how Mitra will see it."
        onBack={() => navigate("/certificates")}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.2fr) minmax(280px, 0.8fr)",
          gap: 16,
          alignItems: "start",
        }}
        className="cert-form-layout"
      >
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

        <div className="card" style={{ padding: 16, position: "sticky", top: 16 }}>
          <CertificateMitraPreview data={previewData} variant="phone" />
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .cert-form-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CertificateForm;
