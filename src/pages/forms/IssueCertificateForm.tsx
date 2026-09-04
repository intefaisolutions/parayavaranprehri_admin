import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Award, Users, FileText, CalendarDays, Sparkles } from "lucide-react";
import { apiFetch } from "../../utils/apiConfig";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig } from "../../components/form/SmartForm";
import { FormPageHeader } from "../../components/form/FormPageHeader";
import { CertificateMitraPreview } from "../../components/certificates/CertificateMitraPreview";

export interface MitraOption {
  mitraId: string;
  name: string;
  mobile: string;
}

export interface PersonOption {
  _id: string;
  personId: string;
  name: string;
  mobile: string;
}

export interface TemplateOption {
  _id: string;
  templateName: string;
  certificateType: string;
  logoUrl?: string;
  signatureUrl?: string;
  backgroundUrl?: string;
  status?: string;
}

export interface IssueCertificateFormData {
  recipientType: "MITRA" | "USER";
  recipientId: string;
  recipientName: string;
  recipientMobile: string;
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
  recipientMobile: "",
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
    | {
        mitra?: { mitraId: string; name: string; mobile: string };
        template?: { _id: string };
      }
    | undefined;

  const [formData, setFormData] = useState<IssueCertificateFormData>({
    ...emptyForm,
    recipientId: prefill?.mitra?.mitraId || "",
    recipientName: prefill?.mitra?.name || "",
    recipientMobile: prefill?.mitra?.mobile || "",
    templateId: prefill?.template?._id || "",
  });

  const [mitras, setMitras] = useState<MitraOption[]>([]);
  const [persons, setPersons] = useState<PersonOption[]>([]);
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiFetch<any>("/api/v1/mitras?status=Approved&limit=1000"),
      apiFetch<any>("/api/v1/persons?limit=1000"),
      apiFetch<any>("/api/v1/users?limit=1000").catch(() => []),
      apiFetch<TemplateOption[]>("/api/v1/certificates/templates"),
    ])
      .then(([mitraRes, personRes, userRes, templateList]) => {
        const mitraList = Array.isArray(mitraRes) ? mitraRes : mitraRes?.data || [];
        const personList = Array.isArray(personRes) ? personRes : personRes?.data || [];
        const userList = Array.isArray(userRes) ? userRes : userRes?.data || [];

        const byKey = new Map<string, PersonOption>();
        personList.forEach((p: any) => {
          const key = p.mobile || p._id;
          if (key) {
            byKey.set(key, {
              _id: p._id,
              personId: p.personId || p._id,
              name: p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Citizen',
              mobile: p.mobile || '',
            });
          }
        });
        userList.forEach((u: any) => {
          const phone = u.phone || u.mobile;
          const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.name;
          if (phone && !byKey.has(phone)) {
            byKey.set(phone, {
              _id: u._id,
              personId: u._id,
              name: name || 'Citizen',
              mobile: phone,
            });
          }
        });

        setMitras(mitraList);
        setPersons(Array.from(byKey.values()));
        setTemplates(
          (templateList || []).filter((t) => t.status !== "Inactive"),
        );
      })
      .catch((err: any) =>
        setError(err.message || "Failed to load certificate data"),
      );
  }, []);

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => {
      if (name === "recipientId") {
        if (prev.recipientType === "MITRA") {
          const mitra = mitras.find((m) => m.mitraId === value);
          return {
            ...prev,
            recipientId: value,
            recipientName: mitra?.name || prev.recipientName,
            recipientMobile: mitra?.mobile || prev.recipientMobile,
          };
        }
        if (prev.recipientType === "USER") {
          const person = persons.find((p) => p._id === value || p.personId === value);
          return {
            ...prev,
            recipientId: value,
            recipientName: person?.name || prev.recipientName,
            recipientMobile: person?.mobile || prev.recipientMobile,
          };
        }
      }
      if (name === "recipientType") {
        return {
          ...prev,
          recipientType: value,
          recipientId: "",
          recipientName: "",
          recipientMobile: "",
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const selectedTemplate = useMemo(
    () => templates.find((t) => t._id === formData.templateId),
    [templates, formData.templateId],
  );

  const selectedMitra = useMemo(
    () => mitras.find((m) => m.mitraId === formData.recipientId),
    [mitras, formData.recipientId],
  );

  const selectedPerson = useMemo(
    () => persons.find((p) => p._id === formData.recipientId || p.personId === formData.recipientId),
    [persons, formData.recipientId],
  );

  const previewData = useMemo(() => {
    const name =
      formData.recipientType === "MITRA"
        ? selectedMitra?.name || formData.recipientName || "Mitra Name"
        : selectedPerson?.name || formData.recipientName || "Paryavaran Prahri Name";

    return {
      title: formData.title || "Certificate of Appreciation",
      recipientName: name,
      description: formData.description,
      eventName: formData.eventName,
      issueDate: formData.issueDate,
      verificationCode: "PP-PREVIEW",
      logoUrl: selectedTemplate?.logoUrl,
      signatureUrl: selectedTemplate?.signatureUrl,
      backgroundUrl: selectedTemplate?.backgroundUrl,
      templateName: selectedTemplate?.templateName,
      certificateType: selectedTemplate?.certificateType || (formData.recipientType === "MITRA" ? "Mitra" : "Paryavaran Prahri"),
    };
  }, [formData, selectedMitra, selectedPerson, selectedTemplate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const payload: Record<string, unknown> = {
        templateId: formData.templateId,
        recipientType: formData.recipientType,
        recipientId: formData.recipientId,
        recipientName: formData.recipientName,
        recipientMobile: formData.recipientMobile || undefined,
        title: formData.title,
        description: formData.description || undefined,
        eventName: formData.eventName || undefined,
        issueDate: formData.issueDate
          ? new Date(formData.issueDate).toISOString()
          : undefined,
      };

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
            { label: "🌿 Paryavaran Mitra (Volunteer)", value: "MITRA" },
            { label: "👤 Paryavaran Prahri (User / Citizen)", value: "USER" },
          ],
          span: 2,
        },
        {
          name: "recipientId",
          label: "Select Paryavaran Mitra",
          type: "select",
          icon: Users,
          required: true,
          span: 2,
          visibleWhen: (data) => data.recipientType === "MITRA",
          options: mitras.map((m) => ({
            label: `🌿 ${m.name} (${m.mitraId}) - Phone: ${m.mobile}`,
            value: m.mitraId,
          })),
        },
        {
          name: "recipientId",
          label: "Select Paryavaran Prahri (User)",
          type: "select",
          icon: Users,
          required: true,
          span: 2,
          visibleWhen: (data) => data.recipientType === "USER",
          options: persons.map((p) => ({
            label: `👤 ${p.name} (${p.personId || "ID: " + p._id.slice(-6)}) - Phone: ${p.mobile}`,
            value: p._id,
          })),
        },
        {
          name: "recipientName",
          label: "Recipient Name",
          type: "text",
          required: true,
        },
        {
          name: "recipientMobile",
          label: "Mobile Number",
          type: "text",
          placeholder: "e.g. +919876543210",
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
        {
          name: "title",
          label: "Certificate Title",
          type: "text",
          icon: Award,
          required: true,
        },
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
          placeholder:
            "e.g. In recognition of planting 50 trees under the Paryavaran Prahri initiative",
        },
        {
          name: "issueDate",
          label: "Issue Date",
          type: "date",
          icon: CalendarDays,
        },
      ],
    },
  ];

  return (
    <div className="dashboard-area">
      <FormPageHeader
        icon={Award}
        title="Issue Certificate"
        subtitle="Issue a certificate to a Paryavaran Mitra — live Mitra preview on the right."
        onBack={() => navigate("/certificates/issued")}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.15fr) minmax(280px, 0.85fr)",
          gap: 16,
          alignItems: "start",
        }}
        className="cert-issue-layout"
      >
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

        <div className="card" style={{ padding: 16, position: "sticky", top: 16 }}>
          <CertificateMitraPreview
            data={previewData}
            variant="phone"
            recipientMobile={selectedMitra?.mobile}
            showActions
          />
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .cert-issue-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default IssueCertificateForm;
