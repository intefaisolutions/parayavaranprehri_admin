import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapPin, TreePine, User, ShieldCheck } from "lucide-react";
import { apiFetch } from "../../utils/apiConfig";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig } from "../../components/form/SmartForm";
import { FormPageHeader } from "../../components/form/FormPageHeader";

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

const emptyForm: MapFormData = {
  locationName: "",
  treeCount: "",
  latitude: "",
  longitude: "",
  plantationArea: "",
  addedBy: "",
  status: "Active",
};

export const MapRecordForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const editItem = location.state?.mapRecord;
  const isEditing = !!editItem;

  const [formData, setFormData] = useState<MapFormData>(
    editItem
      ? {
          ...emptyForm,
          ...editItem,
          treeCount: String(editItem.treeCount ?? 0),
          latitude: editItem.latitude !== undefined ? String(editItem.latitude) : "",
          longitude: editItem.longitude !== undefined ? String(editItem.longitude) : "",
        }
      : emptyForm
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const { _id, ...rest } = formData;
    const payload = {
      ...rest,
      treeCount: rest.treeCount === "" ? undefined : Number(rest.treeCount),
      latitude: rest.latitude === "" ? undefined : Number(rest.latitude),
      longitude: rest.longitude === "" ? undefined : Number(rest.longitude),
    };

    try {
      if (isEditing && _id) {
        await apiFetch(`/api/v1/maps/${_id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/v1/maps", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      navigate("/map");
    } catch (err: any) {
      setError(err.message || "Failed to save map record");
    } finally {
      setSubmitting(false);
    }
  };

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
    <div className="dashboard-area">
      <FormPageHeader
        icon={MapPin}
        title={isEditing ? "Edit Map Record" : "Add Map Record"}
        subtitle="Manage plantation locations, tree mapping and geographical records."
        onBack={() => navigate("/map")}
      />

      <div className="card">
        <SmartForm
          sections={sections}
          formData={formData}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={error}
          submitLabel={isEditing ? "Update Map" : "Add Map"}
          cancelLabel="Cancel"
          onCancel={() => navigate("/map")}
        />
      </div>
    </div>
  );
};

export default MapRecordForm;
