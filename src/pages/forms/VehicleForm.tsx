import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Hash, Car, Fuel, ShieldCheck } from "lucide-react";
import { apiFetch } from "../../utils/apiConfig";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig } from "../../components/form/SmartForm";
import { FormPageHeader } from "../../components/form/FormPageHeader";

export interface VehicleFormData {
  _id?: string;
  plate: string;
  name: string;
  vhId: string;
  fuel: string;
  insuranceId?: string;
}

const emptyForm: VehicleFormData = {
  plate: "",
  name: "",
  vhId: "",
  fuel: "",
  insuranceId: "",
};

export const VehicleForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const editVehicle = location.state?.vehicle;
  const isEditing = !!editVehicle;

  const [formData, setFormData] = useState<VehicleFormData>(
    editVehicle ? { ...emptyForm, ...editVehicle } : emptyForm
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

    const { _id, ...payload } = formData;

    try {
      if (isEditing && _id) {
        await apiFetch(`/api/v1/vehicles/${_id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/v1/vehicles", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      navigate("/vehicles");
    } catch (err: any) {
      setError(err.message || "Failed to save vehicle");
    } finally {
      setSubmitting(false);
    }
  };

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
    <div className="dashboard-area">
      <FormPageHeader
        icon={Car}
        title={isEditing ? "Edit Vehicle" : "Add Vehicle"}
        subtitle="Manage registered vehicles and their fuel & insurance details."
        onBack={() => navigate("/vehicles")}
      />

      <div className="card">
        <SmartForm
          sections={sections}
          formData={formData}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={error}
          submitLabel={isEditing ? "Update Vehicle" : "Add Vehicle"}
          cancelLabel="Cancel"
          onCancel={() => navigate("/vehicles")}
        />
      </div>
    </div>
  );
};

export default VehicleForm;
