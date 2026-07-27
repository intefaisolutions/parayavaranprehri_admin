import React from "react";
import { X, User, Award, Building2, Image as ImageIcon, ListOrdered, ToggleLeft } from "lucide-react";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig } from "../../components/form/SmartForm";

export interface LeaderFormData {
  _id?: string;
  leaderName: string;
  designation: string;
  organization: string;
  photo: string;
  displayOrder: number | "";
  isActive: boolean;
}

interface LeaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing: boolean;
  formData: LeaderFormData;
  submitting?: boolean;
  onFieldChange: (name: string, value: any) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

const LeaderModal: React.FC<LeaderModalProps> = ({
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
      title: "Leader Details",
      description: "Core identity and role of this initiative leader.",
      icon: User,
      fields: [
        { name: "leaderName", label: "Leader Name", type: "text", icon: User, required: true, span: 2 },
        { name: "designation", label: "Designation", type: "text", icon: Award, required: true },
        { name: "organization", label: "Organization", type: "text", icon: Building2 },
      ],
    },
    {
      title: "Photo",
      icon: ImageIcon,
      fields: [
        { name: "photo", label: "Photo", type: "image", icon: ImageIcon, uploadCategory: "general", span: 2 },
      ],
    },
    {
      title: "Display Settings",
      icon: ListOrdered,
      fields: [
        {
          name: "displayOrder",
          label: "Display Order",
          type: "number",
          icon: ListOrdered,
          placeholder: "0",
          helpText: "Lower numbers are shown first in lists.",
        },
        {
          name: "isActive",
          label: "Visible",
          type: "boolean",
          icon: ToggleLeft,
          helpText: "Only visible leaders are shown to end users.",
        },
      ],
    },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ width: 640 }}>
        <div className="modal-header">
          <h2>{editing ? "Edit Initiative Leader" : "Add Initiative Leader"}</h2>
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
          submitLabel={editing ? "Update Leader" : "Add Leader"}
          cancelLabel="Cancel"
          onCancel={onClose}
        />
      </div>
    </div>
  );
};

export default LeaderModal;
