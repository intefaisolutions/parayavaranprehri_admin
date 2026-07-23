import React from "react";
import { X, User, Phone, Mail, Briefcase, MapPin, Building2, Landmark, Star, ShieldCheck } from "lucide-react";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig } from "../../components/form/SmartForm";

export interface MitrasFormData {
  _id?: string;
  mitraId?: string;
  name: string;
  mobile: string;
  email?: string;
  profession?: string;
  vidhanSabha: string;
  assignedZone: string;
  district?: string;
  state?: string;
  membership: string;
  status: string;
}

interface MitrasModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing: boolean;
  formData: MitrasFormData;
  submitting?: boolean;
  onFieldChange: (name: string, value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

const MitrasModal: React.FC<MitrasModalProps> = ({
  isOpen,
  onClose,
  editing,
  formData,
  submitting,
  onFieldChange,
  handleSubmit,
}) => {
  if (!isOpen) return null;

  const sections: FormSectionConfig[] = [
    {
      title: "Volunteer Details",
      description: "Core identity and contact information for this Mitra.",
      icon: User,
      fields: [
        { name: "name", label: "Full Name", type: "text", icon: User, required: true, span: 2 },
        { name: "mobile", label: "Mobile Number", type: "tel", icon: Phone, required: true },
        { name: "email", label: "Email", type: "email", icon: Mail },
        { name: "profession", label: "Profession", type: "text", icon: Briefcase, span: 2 },
      ],
    },
    {
      title: "Assignment",
      description: "Where this Mitra operates and is accountable to.",
      icon: MapPin,
      fields: [
        { name: "vidhanSabha", label: "Vidhan Sabha", type: "text", icon: Landmark },
        { name: "assignedZone", label: "Assigned Zone", type: "text", icon: MapPin },
        { name: "district", label: "District", type: "text", icon: Building2 },
        { name: "state", label: "State", type: "text", icon: Building2 },
      ],
    },
    {
      title: "Membership & Status",
      icon: ShieldCheck,
      fields: [
        {
          name: "membership",
          label: "Membership",
          type: "select",
          icon: Star,
          required: true,
          options: [
            { label: "Free", value: "free" },
            { label: "Premium", value: "premium" },
          ],
        },
        {
          name: "status",
          label: "Status",
          type: "select",
          icon: ShieldCheck,
          required: true,
          options: [
            { label: "Approved", value: "Approved" },
            { label: "Pending", value: "Pending" },
            { label: "Cancelled", value: "Cancelled" },
          ],
        },
      ],
    },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ width: 640 }}>
        <div className="modal-header">
          <h2>{editing ? "Edit Mitra" : "Assign New Mitra"}</h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {editing && formData.mitraId && (
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
            Mitra ID: <strong style={{ color: "var(--text-primary)" }}>{formData.mitraId}</strong>
          </div>
        )}

        <SmartForm
          sections={sections}
          formData={formData}
          onFieldChange={onFieldChange}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitLabel={editing ? "Update Mitra" : "Add Mitra"}
          cancelLabel="Cancel"
          onCancel={onClose}
        />
      </div>
    </div>
  );
};

export default MitrasModal;
