import React from "react";
import { X, Phone, Clock, UserCog, ShieldCheck, Tag } from "lucide-react";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig } from "../../components/form/SmartForm";

export interface CallCenterFormData {
  _id?: string;
  contactType: string;
  contactValue: string;
  availableHours?: string;
  assignedPerson?: string;
  status: string;
}

interface CallCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing: boolean;
  formData: CallCenterFormData;
  submitting?: boolean;
  error?: string;
  onFieldChange: (name: string, value: any) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

const CallCenterModal: React.FC<CallCenterModalProps> = ({
  isOpen,
  onClose,
  editing,
  formData,
  submitting,
  error,
  onFieldChange,
  handleSubmit,
}) => {
  if (!isOpen) return null;

  const sections: FormSectionConfig[] = [
    {
      title: "Contact Channel",
      description: "How users can reach out through this contact channel.",
      icon: Phone,
      fields: [
        {
          name: "contactType",
          label: "Contact Type",
          type: "select",
          icon: Tag,
          required: true,
          options: [
            { label: "Phone", value: "Phone" },
            { label: "Email", value: "Email" },
            { label: "WhatsApp", value: "WhatsApp" },
            { label: "Chat", value: "Chat" },
          ],
        },
        {
          name: "contactValue",
          label: "Contact Value",
          type: "text",
          icon: Phone,
          required: true,
          placeholder: "e.g. +91 9876543210 or support@company.com",
          span: 2,
        },
        {
          name: "availableHours",
          label: "Available Hours",
          type: "text",
          icon: Clock,
          placeholder: "e.g. 09:00 AM - 06:00 PM or 24x7",
        },
      ],
    },
    {
      title: "Ownership & Status",
      icon: ShieldCheck,
      fields: [
        { name: "assignedPerson", label: "Assigned Person", type: "text", icon: UserCog },
        {
          name: "status",
          label: "Status",
          type: "select",
          icon: ShieldCheck,
          required: true,
          options: [
            { label: "Active", value: "Active" },
            { label: "Inactive", value: "Inactive" },
          ],
        },
      ],
    },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ width: 560 }}>
        <div className="modal-header">
          <h2>{editing ? "Edit Contact" : "Add Contact"}</h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <SmartForm
          sections={sections}
          formData={formData}
          onFieldChange={onFieldChange}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={error}
          submitLabel={editing ? "Update Contact" : "Add Contact"}
          cancelLabel="Cancel"
          onCancel={onClose}
        />
      </div>
    </div>
  );
};

export default CallCenterModal;
