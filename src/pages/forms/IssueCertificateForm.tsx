import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Award, Users, FileText, CalendarDays, Sparkles } from "lucide-react";
import { apiFetch } from "../../utils/apiConfig";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig } from "../../components/form/SmartForm";
import { FormPageHeader } from "../../components/form/FormPageHeader";

export interface MitraOption {
  mitraId: string;
  name: string;
  mobile: string;
}

export interface TemplateOption {
  _id: string;
  templateName: string;
  certificateType: string;
}

export interface IssueCertificateFormData {
  recipientType: "MITRA" | "USER";
  recipientId: string;
  recipientName: string;
  templateId: string;
  title: string;
  description: string;
  eventName: string;
  issueDate: string;
}

const emptyForm: IssueCertificateFormData = {
  recipientType: "MITRA",
  recipientId: "",
  recipientName: "",
  templateId: "",
  title: "Certificate of Appreciation",
  description: "",
  eventName: "",
  issueDate: new Date().toISOString().slice(0, 10),
};

export const IssueCertificateForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const prefill = location.state as
    | { mitra?: { mitraId: string; name: string; mobile: string }; template?: { _id: string } }
    | undefined;

  const [formData, setFormData] = useState<IssueCertificateFormData>({
    ...emptyForm,
    recipientId: prefill?.mitra?.mitraId || "",
    templateId: prefill?.template?._id || "",
  });

  const [mitras, setMitras] = useState<MitraOption[]>([]);
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiFetch<MitraOption[]>("/api/v1/mitras?status=Approved"),
      apiFetch<TemplateOption[]>("/api/v1/certificates/templates"),
    ])
      .then(([mitraList, templateList]) => {
        setMitras(mitraList || []);
        setTemplates((templateList || []).filter((t: any) => t.status !== "Inactive"));
      })
      .catch((err: any) => setError(err.message || "Failed to load certificate data"));
  }, []);

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const payload: Record<string, unknown> = {
        templateId: formData.templateId,
        recipientType: formData.recipientType,
        recipientId: formData.recipientId,
        title: formData.title,
        description: formData.description || undefined,
        eventName: formData.eventName || undefined,
        issueDate: formData.issueDate ? new Date(formData.issueDate).toISOString() : undefined,
      };
      if (formData.recipientType === "USER") {
        payload.recipientName = formData.recipientName;
      }

      await apiFetch("/api/v1/certificates", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      navigate("/certificates/issued");
    } catch (err: any) {
      setError(err.message || "Failed to issue certificate");
    } finally {
      setSubmitting(false);
    }
  };

  const sections: FormSectionConfig[] = [
    {
      title: "Recipient",
      description: "Who is this certificate being issued to?",
      icon: Users,
      fields: [
        {
          name: "recipientType",
          label: "Recipient Type",
          type: "select",
          icon: Users,
          required: true,
          options: [
            { label: "Paryavaran Mitra (Volunteer)", value: "MITRA" },
            { label: "Other User", value: "USER" },
          ],
          span: 2,
        },
        {
          name: "recipientId",
          label: "Select Mitra",
          type: "select",
          icon: Users,
          required: true,
          span: 2,
          visibleWhen: (data) => data.recipientType === "MITRA",
          options: mitras.map((m) => ({
            label: `${m.name} (${m.mitraId}) - ${m.mobile}`,
            value: m.mitraId,
          })),
        },
        {
          name: "recipientId",
          label: "Recipient ID",
          type: "text",
          required: true,
          visibleWhen: (data) => data.recipientType === "USER",
        },
        {
          name: "recipientName",
          label: "Recipient Name",
          type: "text",
          required: true,
          visibleWhen: (data) => data.recipientType === "USER",
        },
      ],
    },
    {
      title: "Certificate Details",
      icon: Award,
      fields: [
        {
          name: "templateId",
          label: "Certificate Template",
          type: "select",
          icon: FileText,
          required: true,
          span: 2,
          options: templates.map((t) => ({
            label: `${t.templateName} (${t.certificateType})`,
            value: t._id,
          })),
        },
        { name: "title", label: "Certificate Title", type: "text", icon: Award, required: true },
        {
          name: "eventName",
          label: "Event / Occasion",
          type: "text",
          icon: Sparkles,
          placeholder: "e.g. World Environment Day 2026",
        },
        {
          name: "description",
          label: "Description / Reason",
          type: "textarea",
          span: 2,
          placeholder: "e.g. In recognition of planting 50 trees under the Paryavaran Prahri initiative",
        },
        { name: "issueDate", label: "Issue Date", type: "date", icon: CalendarDays },
      ],
    },
  ];

  return (
    <div className="dashboard-area">
      <FormPageHeader
        icon={Award}
        title="Issue Certificate"
        subtitle="Issue a certificate to a Paryavaran Mitra (volunteer) or other user."
        onBack={() => navigate("/certificates/issued")}
      />

      <div className="card">
        <SmartForm
          sections={sections}
          formData={formData}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={error}
          submitLabel="Issue Certificate"
          cancelLabel="Cancel"
          onCancel={() => navigate("/certificates/issued")}
        />
      </div>
    </div>
  );
};

export default IssueCertificateForm;
