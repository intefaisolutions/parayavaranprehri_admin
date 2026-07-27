import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Building2,
  Hash,
  CreditCard,
  ShieldCheck,
  Car,
  TreePine,
} from "lucide-react";
import { apiFetch } from "../../utils/apiConfig";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig } from "../../components/form/SmartForm";
import { FormPageHeader } from "../../components/form/FormPageHeader";

export interface PersonFormData {
  _id?: string;
  personId?: string;
  name: string;
  mobile: string;
  email?: string;
  dob?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  idProofType?: string;
  idProofNumber?: string;
  photo?: string;
  vehiclesLinked?: number | string;
  treesAssigned?: number | string;
  status: string;
  registrationDate?: string;
}

const emptyForm: PersonFormData = {
  name: "",
  mobile: "",
  email: "",
  dob: "",
  gender: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  idProofType: "",
  idProofNumber: "",
  photo: "",
  vehiclesLinked: "",
  treesAssigned: "",
  status: "Active",
  registrationDate: "",
};

/** Converts an ISO datetime string coming from the API into a plain
 * yyyy-MM-dd value that native <input type="date"> controls expect. */
const toDateInputValue = (value?: string) => (value ? value.slice(0, 10) : "");

export const PersonForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const editPerson = location.state?.person;
  const isEditing = !!editPerson;

  const [formData, setFormData] = useState<PersonFormData>(
    editPerson
      ? {
          ...emptyForm,
          ...editPerson,
          dob: toDateInputValue(editPerson.dob),
          registrationDate: toDateInputValue(editPerson.registrationDate),
          vehiclesLinked: editPerson.vehiclesLinked ?? "",
          treesAssigned: editPerson.treesAssigned ?? "",
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

    const { _id, personId: _personId, ...rest } = formData;
    const payload: Record<string, any> = {};
    Object.entries(rest).forEach(([key, value]) => {
      if (value === "" || value === undefined || value === null) return;
      if (key === "vehiclesLinked" || key === "treesAssigned") {
        payload[key] = Number(value);
      } else {
        payload[key] = value;
      }
    });

    try {
      if (isEditing && _id) {
        await apiFetch(`/api/v1/persons/${_id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/v1/persons", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      navigate("/persons");
    } catch (err: any) {
      setError(err.message || "Failed to save Person");
    } finally {
      setSubmitting(false);
    }
  };

  const sections: FormSectionConfig[] = [
    {
      title: "Personal Details",
      description: "Core identity and contact information for this citizen.",
      icon: User,
      fields: [
        { name: "name", label: "Full Name", type: "text", icon: User, required: true, span: 2 },
        { name: "mobile", label: "Mobile Number", type: "tel", icon: Phone, required: true },
        { name: "email", label: "Email", type: "email", icon: Mail },
        { name: "dob", label: "Date of Birth", type: "date", icon: Calendar },
        {
          name: "gender",
          label: "Gender",
          type: "select",
          icon: User,
          options: [
            { label: "Male", value: "Male" },
            { label: "Female", value: "Female" },
            { label: "Other", value: "Other" },
          ],
        },
        { name: "photo", label: "Photo", type: "image", icon: User, uploadCategory: "users", span: 2 },
      ],
    },
    {
      title: "Address",
      icon: MapPin,
      fields: [
        { name: "address", label: "Address", type: "text", icon: MapPin, span: 2 },
        { name: "city", label: "City", type: "text", icon: Building2 },
        { name: "state", label: "State", type: "text", icon: Building2 },
        { name: "pincode", label: "Pincode", type: "text", icon: Hash, span: 2 },
      ],
    },
    {
      title: "Identity Proof",
      icon: CreditCard,
      fields: [
        {
          name: "idProofType",
          label: "ID Proof Type",
          type: "select",
          icon: CreditCard,
          options: [
            { label: "Aadhaar", value: "Aadhaar" },
            { label: "PAN", value: "PAN" },
            { label: "Voter ID", value: "Voter ID" },
            { label: "Driving License", value: "Driving License" },
            { label: "Passport", value: "Passport" },
          ],
        },
        { name: "idProofNumber", label: "ID Proof Number", type: "text", icon: Hash },
      ],
    },
    {
      title: "Tracking & Status",
      icon: ShieldCheck,
      fields: [
        { name: "vehiclesLinked", label: "Vehicles Linked", type: "number", icon: Car },
        { name: "treesAssigned", label: "Trees Assigned", type: "number", icon: TreePine },
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
        { name: "registrationDate", label: "Registration Date", type: "date", icon: Calendar },
      ],
    },
  ];

  return (
    <div className="dashboard-area">
      <FormPageHeader
        icon={User}
        title={isEditing ? "Edit Person" : "Add Person"}
        subtitle="Master record of every citizen registered on the platform."
        onBack={() => navigate("/persons")}
      />

      {isEditing && formData.personId && (
        <div
          className="card"
          style={{
            marginBottom: 16,
            fontSize: 13,
            color: "var(--text-secondary)",
            padding: "10px 16px",
          }}
        >
          Person ID: <strong style={{ color: "var(--text-primary)" }}>{formData.personId}</strong>
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
          submitLabel={isEditing ? "Update Person" : "Add Person"}
          cancelLabel="Cancel"
          onCancel={() => navigate("/persons")}
        />
      </div>
    </div>
  );
};

export default PersonForm;
