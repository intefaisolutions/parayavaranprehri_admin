import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapPin, Building2, Landmark, Hash, ShieldCheck } from "lucide-react";
import { apiFetch } from "../../utils/apiConfig";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig } from "../../components/form/SmartForm";
import { FormPageHeader } from "../../components/form/FormPageHeader";

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

const emptyForm: LocationFormData = {
  locationName: "",
  locationType: "State",
  parentLocation: "",
  latitude: "",
  longitude: "",
  totalLinkedRecords: "",
  status: "Active",
};

export const LocationForm = () => {
  const navigate = useNavigate();
  const routerLocation = useLocation();

  const editItem = routerLocation.state?.location;
  const isEditing = !!editItem;

  const [formData, setFormData] = useState<LocationFormData>(
    editItem
      ? {
          ...emptyForm,
          ...editItem,
          latitude: editItem.latitude !== undefined ? String(editItem.latitude) : "",
          longitude: editItem.longitude !== undefined ? String(editItem.longitude) : "",
          totalLinkedRecords: String(editItem.totalLinkedRecords ?? 0),
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
      latitude: rest.latitude === "" ? undefined : Number(rest.latitude),
      longitude: rest.longitude === "" ? undefined : Number(rest.longitude),
      totalLinkedRecords:
        rest.totalLinkedRecords === "" ? undefined : Number(rest.totalLinkedRecords),
    };

    try {
      if (isEditing && _id) {
        await apiFetch(`/api/v1/locations/${_id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/v1/locations", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      navigate("/location");
    } catch (err: any) {
      setError(err.message || "Failed to save location");
    } finally {
      setSubmitting(false);
    }
  };

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
    <div className="dashboard-area">
      <FormPageHeader
        icon={MapPin}
        title={isEditing ? "Edit Location" : "Add Location"}
        subtitle="Manage location hierarchy and linked records."
        onBack={() => navigate("/location")}
      />

      <div className="card">
        <SmartForm
          sections={sections}
          formData={formData}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={error}
          submitLabel={isEditing ? "Update Location" : "Add Location"}
          cancelLabel="Cancel"
          onCancel={() => navigate("/location")}
        />
      </div>
    </div>
  );
};

export default LocationForm;
