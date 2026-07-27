import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { User, Phone, Mail, Briefcase, MapPin, Building2, Landmark, Star, ShieldCheck } from "lucide-react";
import { apiFetch } from "../../utils/apiConfig";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig } from "../../components/form/SmartForm";
import { FormPageHeader } from "../../components/form/FormPageHeader";

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

// Admin-created via this panel defaults to Approved; app self-registrations
// (via the mobile app's own endpoint) always start Pending regardless.
const emptyForm: MitrasFormData = {
  name: "",
  mobile: "",
  email: "",
  profession: "",
  vidhanSabha: "",
  assignedZone: "",
  district: "",
  state: "",
  membership: "free",
  status: "Approved",
};

export const MitraForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const editMitra = location.state?.mitra;
  const isEditing = !!editMitra;

  const [formData, setFormData] = useState<MitrasFormData>(
    editMitra ? { ...emptyForm, ...editMitra } : emptyForm
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

    const { _id, mitraId: _mitraId, ...payload } = formData;

    try {
      if (isEditing && _id) {
        await apiFetch(`/api/v1/mitras/${_id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/v1/mitras", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      navigate("/mitras");
    } catch (err: any) {
      setError(err.message || "Failed to save Mitra");
    } finally {
      setSubmitting(false);
    }
  };

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
    <div className="dashboard-area">
      <FormPageHeader
        icon={User}
        title={isEditing ? "Edit Mitra" : "Assign New Mitra"}
        subtitle="Master record of every volunteer (Mitra) registered on the platform."
        onBack={() => navigate("/mitras")}
      />

      {isEditing && formData.mitraId && (
        <div
          className="card"
          style={{ marginBottom: 16, fontSize: 13, color: "var(--text-secondary)", padding: "10px 16px" }}
        >
          Mitra ID: <strong style={{ color: "var(--text-primary)" }}>{formData.mitraId}</strong>
        </div>
      )}

      <div className="card">
        <SmartForm
          sections={sections}
          formData={formData}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={error}
          submitLabel={isEditing ? "Update Mitra" : "Add Mitra"}
          cancelLabel="Cancel"
          onCancel={() => navigate("/mitras")}
        />
      </div>
    </div>
  );
};

export default MitraForm;
