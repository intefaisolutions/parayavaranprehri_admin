import React from "react";
import { X, Hash, Car, Fuel, ShieldCheck } from "lucide-react";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig } from "../../components/form/SmartForm";

export interface VehicleFormData {
  _id?: string;
  plate: string;
  name: string;
  vhId: string;
  fuel: string;
  insuranceId?: string;
}

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing: boolean;
  formData: VehicleFormData;
  submitting?: boolean;
  onFieldChange: (name: string, value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

const VehicleModal: React.FC<VehicleModalProps> = ({
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
      title: "Vehicle Details",
      description: "Core identity details for this vehicle.",
      icon: Car,
      fields: [
        { name: "plate", label: "Plate Number", type: "text", icon: Hash, required: true, span: 2 },
        { name: "name", label: "Vehicle Name", type: "text", icon: Car, required: true },
        { name: "vhId", label: "Vehicle ID", type: "text", icon: Hash, required: true },
      ],
    },
    {
      title: "Fuel & Insurance",
      icon: Fuel,
      fields: [
        {
          name: "fuel",
          label: "Fuel Type",
          type: "select",
          icon: Fuel,
          required: true,
          options: [
            { label: "Petrol", value: "Petrol" },
            { label: "Diesel", value: "Diesel" },
            { label: "CNG", value: "CNG" },
            { label: "Electric", value: "Electric" },
            { label: "Other", value: "Other" },
          ],
        },
        { name: "insuranceId", label: "Insurance ID", type: "text", icon: ShieldCheck },
      ],
    },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ width: 640 }}>
        <div className="modal-header">
          <h2>{editing ? "Edit Vehicle" : "Add Vehicle"}</h2>
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
          submitLabel={editing ? "Update Vehicle" : "Add Vehicle"}
          cancelLabel="Cancel"
          onCancel={onClose}
        />
      </div>
    </div>
  );
};

export default VehicleModal;
