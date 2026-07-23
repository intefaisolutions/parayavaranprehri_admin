import React, { useEffect, useState } from "react";
import { X, Users, Award, FileText, CalendarDays, Sparkles } from "lucide-react";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig } from "../../components/form/SmartForm";

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

interface IssueCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  mitras: MitraOption[];
  templates: TemplateOption[];
  submitting?: boolean;
  initialData?: Partial<IssueCertificateFormData>;
  onSubmit: (data: IssueCertificateFormData) => void;
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

const IssueCertificateModal: React.FC<IssueCertificateModalProps> = ({
  isOpen,
  onClose,
  mitras,
  templates,
  submitting,
  initialData,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<IssueCertificateFormData>({
    ...emptyForm,
    ...initialData,
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({ ...emptyForm, ...initialData });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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
    <div className="modal-overlay">
      <div className="modal" style={{ width: 640 }}>
        <div className="modal-header">
          <h2>Issue Certificate</h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <SmartForm
          sections={sections}
          formData={formData}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitLabel="Issue Certificate"
          cancelLabel="Cancel"
          onCancel={onClose}
        />
      </div>
    </div>
  );
};

export default IssueCertificateModal;
