import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Phone, Clock, UserCog, ShieldCheck, Tag } from "lucide-react";
import { apiFetch } from "../../utils/apiConfig";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig } from "../../components/form/SmartForm";
import { FormPageHeader } from "../../components/form/FormPageHeader";

export interface CallCenterFormData {
  _id?: string;
  contactType: string;
  contactValue: string;
  availableHours?: string;
  assignedPerson?: string;
  status: string;
}

const emptyForm: CallCenterFormData = {
  contactType: "Phone",
  contactValue: "",
  availableHours: "",
  assignedPerson: "",
  status: "Active",
};

export const CallCenterForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const editContact = location.state?.contact;
  const isEditing = !!editContact;

  const [formData, setFormData] = useState<CallCenterFormData>(
    editContact ? { ...emptyForm, ...editContact } : emptyForm
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
        await apiFetch(`/api/v1/call-center/${_id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/v1/call-center", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      navigate("/callcenter");
    } catch (err: any) {
      setError(err.message || "Failed to save contact");
    } finally {
      setSubmitting(false);
    }
  };

  const sections: FormSectionConfig[] = [
    {
      title: "Contact Channel",
      description: "How users can reach out through this contact channel.",
      icon: Phone,
      fields: [
        {
          name: "contactType",
          label: "Contact Type",
          type: "select",
          icon: Tag,
          required: true,
          options: [
            { label: "Phone", value: "Phone" },
            { label: "Email", value: "Email" },
            { label: "WhatsApp", value: "WhatsApp" },
            { label: "Chat", value: "Chat" },
          ],
        },
        {
          name: "contactValue",
          label: "Contact Value",
          type: "text",
          icon: Phone,
          required: true,
          placeholder: "e.g. +91 9876543210 or support@company.com",
          span: 2,
        },
        {
          name: "availableHours",
          label: "Available Hours",
          type: "text",
          icon: Clock,
          placeholder: "e.g. 09:00 AM - 06:00 PM or 24x7",
        },
      ],
    },
    {
      title: "Ownership & Status",
      icon: ShieldCheck,
      fields: [
        { name: "assignedPerson", label: "Assigned Person", type: "text", icon: UserCog },
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
        icon={Phone}
        title={isEditing ? "Edit Contact" : "Add Contact"}
        subtitle="Manage the contact directory (helpline, WhatsApp, email) shown to users."
        onBack={() => navigate("/callcenter")}
      />

      <div className="card">
        <SmartForm
          sections={sections}
          formData={formData}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={error}
          submitLabel={isEditing ? "Update Contact" : "Add Contact"}
          cancelLabel="Cancel"
          onCancel={() => navigate("/callcenter")}
        />
      </div>
    </div>
  );
};

export default CallCenterForm;
