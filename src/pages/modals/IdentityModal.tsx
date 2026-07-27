import React from "react";
import { X, User, Phone, QrCode, Calendar, ShieldCheck, Car, IdCard } from "lucide-react";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig, SelectOption } from "../../components/form/SmartForm";

export interface IdentityFormData {
  _id?: string;
  identityId?: string;
  person?: string;
  personName: string;
  personMobile?: string;
  photo?: string;
  qrCode?: string;
  vehicleStickerStatus?: string;
  generatedDate?: string;
  status: string;
}

interface IdentityModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing: boolean;
  formData: IdentityFormData;
  submitting?: boolean;
  personOptions?: SelectOption[];
  onFieldChange: (name: string, value: any) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

const IdentityModal: React.FC<IdentityModalProps> = ({
  isOpen,
  onClose,
  editing,
  formData,
  submitting,
  personOptions = [],
  onFieldChange,
  handleSubmit,
}) => {
  if (!isOpen) return null;

  const sections: FormSectionConfig[] = [
    {
      title: "Person Link",
      description: "Link this identity card to a registered person (optional).",
      icon: User,
      fields: [
        { name: "person", label: "Registered Person", type: "select", icon: User, options: personOptions, span: 2 },
        { name: "personName", label: "Person Name", type: "text", icon: User, required: true },
        { name: "personMobile", label: "Person Mobile", type: "tel", icon: Phone },
        { name: "photo", label: "Photo", type: "image", icon: User, uploadCategory: "users", span: 2 },
      ],
    },
    {
      title: "Identity Card",
      icon: IdCard,
      fields: [
        { name: "qrCode", label: "QR Code", type: "text", icon: QrCode },
        {
          name: "vehicleStickerStatus",
          label: "Vehicle Sticker Status",
          type: "select",
          icon: Car,
          options: [
            { label: "Generated", value: "Generated" },
            { label: "Pending", value: "Pending" },
          ],
        },
        { name: "generatedDate", label: "Generated Date", type: "date", icon: Calendar },
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
      <div className="modal" style={{ width: 640 }}>
        <div className="modal-header">
          <h2>{editing ? "Edit Identity" : "Add Identity"}</h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {editing && formData.identityId && (
          <div
            style={{
              marginBottom: 16,
              fontSize: 13,
              color: "var(--text-secondary)",
              background: "rgba(43, 150, 79, 0.06)",
              border: "1px solid var(--border-color)",
              padding: "8px 12px",
              borderRadius: 8,
            }}
          >
            Identity ID: <strong style={{ color: "var(--text-primary)" }}>{formData.identityId}</strong>
          </div>
        )}

        <SmartForm
          sections={sections}
          formData={formData}
          onFieldChange={onFieldChange}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitLabel={editing ? "Update Identity" : "Add Identity"}
          cancelLabel="Cancel"
          onCancel={onClose}
        />
      </div>
    </div>
  );
};

export default IdentityModal;
