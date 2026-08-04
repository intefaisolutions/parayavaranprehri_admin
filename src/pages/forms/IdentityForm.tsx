import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { User, Phone, QrCode, Calendar, ShieldCheck, Car, IdCard } from "lucide-react";
import { apiFetch } from "../../utils/apiConfig";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig, SelectOption } from "../../components/form/SmartForm";
import { FormPageHeader } from "../../components/form/FormPageHeader";

export interface IdentityFormData {
  _id?: string;
  identityId?: string;
  person?: string;
  personName: string;
  personMobile?: string;
  photo?: string;
  qrCode?: string;
  vehicleStickerStatus?: string;
  generatedDate?: string;
  status: string;
}

interface PersonOption {
  _id: string;
  name: string;
  mobile: string;
  photo?: string;
  status?: string;
}

const emptyForm: IdentityFormData = {
  person: "",
  personName: "",
  personMobile: "",
  photo: "",
  qrCode: "",
  vehicleStickerStatus: "Pending",
  generatedDate: "",
  status: "Active",
};

const toDateInputValue = (value?: string) => (value ? value.slice(0, 10) : "");

export const IdentityForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const editIdentity = location.state?.identity;
  const isEditing = !!editIdentity;

  const [formData, setFormData] = useState<IdentityFormData>(
    editIdentity
      ? {
          ...emptyForm,
          ...editIdentity,
          person:
            typeof editIdentity.person === "object"
              ? editIdentity.person?._id || ""
              : editIdentity.person || "",
          generatedDate: toDateInputValue(editIdentity.generatedDate),
        }
      : emptyForm,
  );

  const [persons, setPersons] = useState<PersonOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams({
      limit: "500",
      sortBy: "name",
      sortOrder: "asc",
      status: "Active",
    });
    apiFetch<PersonOption[]>(`/api/v1/persons?${params.toString()}`)
      .then((data) => setPersons(Array.isArray(data) ? data : []))
      .catch(() => setPersons([]));
  }, []);

  const personOptions: SelectOption[] = useMemo(() => {
    const opts = persons.map((p) => ({
      label: `${p.name} (${p.mobile})`,
      value: p._id,
    }));
    if (
      formData.person &&
      !opts.some((o) => o.value === formData.person)
    ) {
      opts.unshift({
        label: formData.personName
          ? `${formData.personName}${
              formData.personMobile ? ` (${formData.personMobile})` : ""
            }`
          : formData.person,
        value: formData.person,
      });
    }
    return opts;
  }, [persons, formData.person, formData.personName, formData.personMobile]);

  const handleFieldChange = (name: string, value: any) => {
    if (name === "person") {
      if (!value) {
        setFormData((prev) => ({
          ...prev,
          person: "",
          personName: "",
          personMobile: "",
          photo: "",
        }));
        return;
      }
      const person = persons.find((p) => p._id === value);
      setFormData((prev) => ({
        ...prev,
        person: value,
        personName: person?.name || prev.personName,
        personMobile: person?.mobile || "",
        photo: person?.photo || "",
      }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const { _id, identityId: _identityId, ...rest } = formData;
    const payload: Record<string, any> = {};
    Object.entries(rest).forEach(([key, value]) => {
      if (value === "" || value === undefined || value === null) return;
      payload[key] = value;
    });

    try {
      if (isEditing && _id) {
        await apiFetch(`/api/v1/person-identity/${_id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/v1/person-identity", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      navigate("/identity");
    } catch (err: any) {
      setError(err.message || "Failed to save Identity");
    } finally {
      setSubmitting(false);
    }
  };

  const linked = !!formData.person;

  const sections: FormSectionConfig[] = [
    {
      title: "Person Link",
      description:
        "Select a registered person — name, mobile and photo fill automatically.",
      icon: User,
      fields: [
        {
          name: "person",
          label: "Registered Person",
          type: "select",
          icon: User,
          options: personOptions,
          span: 2,
          helpText: persons.length
            ? "From Person Management"
            : "No active persons found — add one under Person Management first",
        },
        {
          name: "personName",
          label: "Person Name",
          type: "text",
          icon: User,
          required: true,
          disabled: linked,
          helpText: linked ? "Auto from registered person" : undefined,
        },
        {
          name: "personMobile",
          label: "Person Mobile",
          type: "tel",
          icon: Phone,
          disabled: linked,
          helpText: linked ? "Auto from registered person" : undefined,
        },
        {
          name: "photo",
          label: "Photo",
          type: "image",
          icon: User,
          uploadCategory: "users",
          span: 2,
          helpText: linked
            ? "Auto from person profile photo — you can replace if needed"
            : "Upload or paste a photo URL",
        },
      ],
    },
    {
      title: "Identity Card",
      icon: IdCard,
      fields: [
        { name: "qrCode", label: "QR Code", type: "text", icon: QrCode },
        {
          name: "vehicleStickerStatus",
          label: "Vehicle Sticker Status",
          type: "select",
          icon: Car,
          options: [
            { label: "Generated", value: "Generated" },
            { label: "Pending", value: "Pending" },
          ],
        },
        {
          name: "generatedDate",
          label: "Generated Date",
          type: "date",
          icon: Calendar,
        },
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
        icon={IdCard}
        title={isEditing ? "Edit Identity" : "Add Identity"}
        subtitle="Manage citizen identity cards, QR codes and vehicle sticker status."
        onBack={() => navigate("/identity")}
      />

      {isEditing && formData.identityId && (
        <div
          className="card"
          style={{
            marginBottom: 16,
            fontSize: 13,
            color: "var(--text-secondary)",
            padding: "10px 16px",
          }}
        >
          Identity ID:{" "}
          <strong style={{ color: "var(--text-primary)" }}>
            {formData.identityId}
          </strong>
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
          submitLabel={isEditing ? "Update Identity" : "Add Identity"}
          cancelLabel="Cancel"
          onCancel={() => navigate("/identity")}
        />
      </div>
    </div>
  );
};

export default IdentityForm;
