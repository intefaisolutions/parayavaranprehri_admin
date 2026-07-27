import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Building2,
  Handshake,
  Image as ImageIcon,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import { apiFetch } from "../../utils/apiConfig";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig } from "../../components/form/SmartForm";
import { FormPageHeader } from "../../components/form/FormPageHeader";

interface PartnerFormData {
  _id?: string;
  partnerName: string;
  partnerType: string;
  contactPerson: string;
  phone: string;
  email: string;
  location: string;
  logo: string;
  status: string;
}

const emptyForm: PartnerFormData = {
  partnerName: "",
  partnerType: "",
  contactPerson: "",
  phone: "",
  email: "",
  location: "",
  logo: "",
  status: "Active",
};

export const PartnerForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const editPartner = location.state?.partner;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<PartnerFormData>(
    editPartner ? { ...emptyForm, ...editPartner } : emptyForm
  );

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const { _id, createdAt: _createdAt, updatedAt: _updatedAt, ...payload } = formData as any;

    try {
      if (editPartner?._id) {
        await apiFetch(`/api/v1/partners/${editPartner._id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/v1/partners", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      navigate("/partners");
    } catch (err: any) {
      setError(err.message || "Failed to save Channel Partner");
    } finally {
      setSubmitting(false);
    }
  };

  const sections: FormSectionConfig[] = [
    {
      title: "Partner Details",
      description: "Core identity and type of this channel partner.",
      icon: Handshake,
      fields: [
        { name: "partnerName", label: "Partner Name", type: "text", icon: Building2, required: true, span: 2 },
        {
          name: "partnerType",
          label: "Partner Type",
          type: "select",
          icon: Handshake,
          required: true,
          options: [
            { label: "NGO", value: "NGO" },
            { label: "Corporate", value: "Corporate" },
            { label: "Government", value: "Government" },
            { label: "Individual", value: "Individual" },
          ],
        },
        {
          name: "status",
          label: "Status",
          type: "select",
          icon: ShieldCheck,
          options: [
            { label: "Active", value: "Active" },
            { label: "Inactive", value: "Inactive" },
          ],
        },
      ],
    },
    {
      title: "Contact Information",
      description: "How to reach this partner.",
      icon: User,
      fields: [
        { name: "contactPerson", label: "Contact Person", type: "text", icon: User, required: true },
        { name: "phone", label: "Phone", type: "tel", icon: Phone, required: true },
        { name: "email", label: "Email", type: "email", icon: Mail },
        { name: "location", label: "Location", type: "text", icon: MapPin },
      ],
    },
    {
      title: "Logo",
      icon: ImageIcon,
      fields: [
        { name: "logo", label: "Partner Logo", type: "image", icon: ImageIcon, uploadCategory: "general", span: 2 },
      ],
    },
  ];

  return (
    <div className="dashboard-area">
      <FormPageHeader
        icon={Handshake}
        title={editPartner ? "Edit Partner" : "Add Partner"}
        subtitle="Manage channel partners and their collaboration details."
        onBack={() => navigate("/partners")}
      />

      <div className="card">
        <SmartForm
          sections={sections}
          formData={formData}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={error}
          submitLabel={editPartner ? "Update Partner" : "Save Partner"}
          cancelLabel="Cancel"
          onCancel={() => navigate("/partners")}
        />
      </div>
    </div>
  );
};

export default PartnerForm;
