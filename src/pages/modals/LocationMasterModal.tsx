import React from "react";
import { X, MapPin, Building2, Landmark, Hash, ShieldCheck } from "lucide-react";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig } from "../../components/form/SmartForm";

export interface LocationFormData {
  _id?: string;
  locationName: string;
  locationType: string;
  parentLocation?: string;
  latitude?: string;
  longitude?: string;
  totalLinkedRecords?: string;
  status: string;
}

interface LocationMasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing: boolean;
  formData: LocationFormData;
  submitting?: boolean;
  error?: string;
  onFieldChange: (name: string, value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

const LocationMasterModal: React.FC<LocationMasterModalProps> = ({
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
      title: "Location Details",
      description: "Core identity of this location within the hierarchy.",
      icon: MapPin,
      fields: [
        { name: "locationName", label: "Location Name", type: "text", icon: MapPin, required: true, span: 2 },
        {
          name: "locationType",
          label: "Location Type",
          type: "select",
          icon: Landmark,
          required: true,
          options: [
            { label: "State", value: "State" },
            { label: "District", value: "District" },
            { label: "Vidhan Sabha", value: "Vidhan Sabha" },
            { label: "Zone", value: "Zone" },
            { label: "Sector", value: "Sector" },
          ],
        },
        { name: "parentLocation", label: "Parent Location", type: "text", icon: Building2 },
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
      title: "Records & Status",
      icon: ShieldCheck,
      fields: [
        { name: "totalLinkedRecords", label: "Total Linked Records", type: "number", icon: Hash },
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
          <h2>{editing ? "Edit Location" : "Add Location"}</h2>
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
          submitLabel={editing ? "Update Location" : "Add Location"}
          cancelLabel="Cancel"
          onCancel={onClose}
        />
      </div>
    </div>
  );
};

export default LocationMasterModal;
