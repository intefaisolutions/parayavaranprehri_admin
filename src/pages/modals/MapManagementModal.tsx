import React from "react";
import { X, MapPin, TreePine, User, ShieldCheck } from "lucide-react";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig } from "../../components/form/SmartForm";

export interface MapFormData {
  _id?: string;
  locationName: string;
  treeCount?: string;
  latitude?: string;
  longitude?: string;
  plantationArea?: string;
  addedBy?: string;
  status: string;
}

interface MapManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing: boolean;
  formData: MapFormData;
  submitting?: boolean;
  error?: string;
  onFieldChange: (name: string, value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

const MapManagementModal: React.FC<MapManagementModalProps> = ({
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
      title: "Plantation Location",
      description: "Where this plantation record is mapped.",
      icon: MapPin,
      fields: [
        { name: "locationName", label: "Location Name", type: "text", icon: MapPin, required: true, span: 2 },
        { name: "treeCount", label: "Tree Count", type: "number", icon: TreePine },
        { name: "plantationArea", label: "Plantation Area", type: "text", icon: TreePine },
      ],
    },
    {
      title: "Geo Coordinates",
      icon: MapPin,
      fields: [
        { name: "latitude", label: "Latitude", type: "text", icon: MapPin },
        { name: "longitude", label: "Longitude", type: "text", icon: MapPin },
      ],
    },
    {
      title: "Ownership & Status",
      icon: ShieldCheck,
      fields: [
        { name: "addedBy", label: "Added By", type: "text", icon: User },
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
          <h2>{editing ? "Edit Map Record" : "Add Map Record"}</h2>
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
          submitLabel={editing ? "Update Map" : "Add Map"}
          cancelLabel="Cancel"
          onCancel={onClose}
        />
      </div>
    </div>
  );
};

export default MapManagementModal;
