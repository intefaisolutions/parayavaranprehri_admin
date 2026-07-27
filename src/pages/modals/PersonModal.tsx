import React from "react";
import {
  X,
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Building2,
  Hash,
  CreditCard,
  ShieldCheck,
  Car,
  TreePine,
} from "lucide-react";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig } from "../../components/form/SmartForm";

export interface PersonFormData {
  _id?: string;
  personId?: string;
  name: string;
  mobile: string;
  email?: string;
  dob?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  idProofType?: string;
  idProofNumber?: string;
  photo?: string;
  vehiclesLinked?: number | string;
  treesAssigned?: number | string;
  status: string;
  registrationDate?: string;
}

interface PersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing: boolean;
  formData: PersonFormData;
  submitting?: boolean;
  onFieldChange: (name: string, value: any) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

const PersonModal: React.FC<PersonModalProps> = ({
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
      title: "Personal Details",
      description: "Core identity and contact information for this citizen.",
      icon: User,
      fields: [
        { name: "name", label: "Full Name", type: "text", icon: User, required: true, span: 2 },
        { name: "mobile", label: "Mobile Number", type: "tel", icon: Phone, required: true },
        { name: "email", label: "Email", type: "email", icon: Mail },
        { name: "dob", label: "Date of Birth", type: "date", icon: Calendar },
        {
          name: "gender",
          label: "Gender",
          type: "select",
          icon: User,
          options: [
            { label: "Male", value: "Male" },
            { label: "Female", value: "Female" },
            { label: "Other", value: "Other" },
          ],
        },
        { name: "photo", label: "Photo", type: "image", icon: User, uploadCategory: "users", span: 2 },
      ],
    },
    {
      title: "Address",
      icon: MapPin,
      fields: [
        { name: "address", label: "Address", type: "text", icon: MapPin, span: 2 },
        { name: "city", label: "City", type: "text", icon: Building2 },
        { name: "state", label: "State", type: "text", icon: Building2 },
        { name: "pincode", label: "Pincode", type: "text", icon: Hash },
      ],
    },
    {
      title: "Identity Proof",
      icon: CreditCard,
      fields: [
        {
          name: "idProofType",
          label: "ID Proof Type",
          type: "select",
          icon: CreditCard,
          options: [
            { label: "Aadhaar", value: "Aadhaar" },
            { label: "PAN", value: "PAN" },
            { label: "Voter ID", value: "Voter ID" },
            { label: "Driving License", value: "Driving License" },
            { label: "Passport", value: "Passport" },
          ],
        },
        { name: "idProofNumber", label: "ID Proof Number", type: "text", icon: Hash },
      ],
    },
    {
      title: "Tracking & Status",
      icon: ShieldCheck,
      fields: [
        { name: "vehiclesLinked", label: "Vehicles Linked", type: "number", icon: Car },
        { name: "treesAssigned", label: "Trees Assigned", type: "number", icon: TreePine },
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
        { name: "registrationDate", label: "Registration Date", type: "date", icon: Calendar },
      ],
    },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ width: 640 }}>
        <div className="modal-header">
          <h2>{editing ? "Edit Person" : "Add Person"}</h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {editing && formData.personId && (
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
            Person ID: <strong style={{ color: "var(--text-primary)" }}>{formData.personId}</strong>
          </div>
        )}

        <SmartForm
          sections={sections}
          formData={formData}
          onFieldChange={onFieldChange}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitLabel={editing ? "Update Person" : "Add Person"}
          cancelLabel="Cancel"
          onCancel={onClose}
        />
      </div>
    </div>
  );
};

export default PersonModal;
