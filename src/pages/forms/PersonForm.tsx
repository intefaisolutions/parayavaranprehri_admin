import React, { useEffect, useState } from "react";
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
  Loader2,
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
  source?: string;
  insuranceVerified?: boolean;
  lastLoginAt?: string | null;
  createdBy?: string;
  updatedBy?: string;
  registrationDate?: string;
}

interface InsuredVehicle {
  registrationNumber?: string;
  vehicleType?: string;
  vehicleModel?: string;
  isInsured?: boolean;
  policyStatus?: string;
  policyNumber?: string | null;
  policyStartDate?: string | null;
  policyEndDate?: string | null;
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

const todayDateInput = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
};

const policyBadgeClass = (status?: string) => {
  const s = (status || "").toUpperCase();
  if (s === "ACTIVE") return "status-active";
  if (s === "EXPIRED") return "status-warning";
  return "status-inactive";
};

export const PersonForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const editPerson = location.state?.person as PersonFormData | undefined;
  const isView = location.pathname.includes("/persons/view");
  const isEditing = !!editPerson && !isView;

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
  const [vehicles, setVehicles] = useState<InsuredVehicle[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [insuranceSummary, setInsuranceSummary] = useState<{
    hasActiveInsurance: boolean;
    insuredVehicles: number;
    uninsuredVehicles: number;
    message?: string;
  } | null>(null);

  useEffect(() => {
    if (!isView || !editPerson?._id) return;

    let cancelled = false;
    const load = async () => {
      setVehiclesLoading(true);
      try {
        const detail = await apiFetch<PersonFormData>(
          `/api/v1/persons/${editPerson._id}`,
        );
        const vehicleData = await apiFetch<{
          vehicles: InsuredVehicle[];
          vehiclesLinked: number;
          insuranceVerified: boolean;
          hasActiveInsurance?: boolean;
          insuredVehicles?: number;
          uninsuredVehicles?: number;
          message?: string;
        }>(`/api/v1/persons/${editPerson._id}/vehicles`);

        if (cancelled) return;

        const hasActive =
          vehicleData.hasActiveInsurance ?? vehicleData.insuranceVerified;

        setFormData((prev) => ({
          ...prev,
          ...detail,
          dob: toDateInputValue(detail.dob),
          registrationDate: toDateInputValue(detail.registrationDate),
          vehiclesLinked: vehicleData.vehiclesLinked ?? detail.vehiclesLinked ?? 0,
          insuranceVerified: hasActive,
          lastLoginAt: detail.lastLoginAt
            ? new Date(detail.lastLoginAt).toLocaleString()
            : "Never",
        }));
        setInsuranceSummary({
          hasActiveInsurance: Boolean(hasActive),
          insuredVehicles: vehicleData.insuredVehicles ?? 0,
          uninsuredVehicles: vehicleData.uninsuredVehicles ?? 0,
          message: vehicleData.message,
        });
        setVehicles(vehicleData.vehicles || []);
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || "Failed to load person details");
        }
      } finally {
        if (!cancelled) setVehiclesLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [isView, editPerson?._id]);

  const handleFieldChange = (name: string, value: any) => {
    if (isView) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isView) {
      navigate("/persons");
      return;
    }

    setSubmitting(true);
    setError("");

    if (formData.dob && formData.dob > todayDateInput()) {
      setError("Date of Birth cannot be a future date");
      setSubmitting(false);
      return;
    }

    const { _id, personId: _personId, source: _source, insuranceVerified: _iv, createdBy: _cb, updatedBy: _ub, ...rest } =
      formData;
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
      description: isView
        ? "Full customer profile."
        : "Core identity and contact information for this citizen.",
      icon: User,
      fields: [
        {
          name: "name",
          label: "Full Name",
          type: "text",
          icon: User,
          required: !isView,
          span: 2,
          disabled: isView,
        },
        {
          name: "mobile",
          label: "Mobile Number",
          type: "tel",
          icon: Phone,
          required: !isView,
          disabled: isView,
        },
        {
          name: "email",
          label: "Email",
          type: "email",
          icon: Mail,
          required: !isView,
          disabled: isView,
        },
        {
          name: "dob",
          label: "Date of Birth",
          type: "date",
          icon: Calendar,
          max: todayDateInput(),
          helpText: isView ? undefined : "Future dates are not allowed",
          disabled: isView,
        },
        {
          name: "gender",
          label: "Gender",
          type: "select",
          icon: User,
          disabled: isView,
          options: [
            { label: "Male", value: "Male" },
            { label: "Female", value: "Female" },
            { label: "Other", value: "Other" },
          ],
        },
        {
          name: "photo",
          label: "Photo",
          type: "image",
          icon: User,
          uploadCategory: "users",
          span: 2,
          disabled: isView,
        },
      ],
    },
    {
      title: "Address",
      icon: MapPin,
      fields: [
        {
          name: "address",
          label: "Address",
          type: "text",
          icon: MapPin,
          span: 2,
          disabled: isView,
        },
        {
          name: "city",
          label: "City",
          type: "text",
          icon: Building2,
          disabled: isView,
        },
        {
          name: "state",
          label: "State",
          type: "text",
          icon: Building2,
          disabled: isView,
        },
        {
          name: "pincode",
          label: "Pincode",
          type: "text",
          icon: Hash,
          span: 2,
          disabled: isView,
        },
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
          disabled: isView,
          options: [
            { label: "Aadhaar", value: "Aadhaar" },
            { label: "PAN", value: "PAN" },
            { label: "Voter ID", value: "Voter ID" },
            { label: "Driving License", value: "Driving License" },
            { label: "Passport", value: "Passport" },
          ],
        },
        {
          name: "idProofNumber",
          label: "ID Proof Number",
          type: "text",
          icon: Hash,
          disabled: isView,
        },
      ],
    },
    ...(isView
      ? [
          {
            title: "Account Summary",
            icon: ShieldCheck,
            fields: [
              {
                name: "personId",
                label: "Person ID",
                type: "text" as const,
                icon: Hash,
                disabled: true,
              },
              {
                name: "status",
                label: "Status",
                type: "text" as const,
                icon: ShieldCheck,
                disabled: true,
              },
              {
                name: "source",
                label: "Source",
                type: "text" as const,
                icon: User,
                disabled: true,
              },
              {
                name: "vehiclesLinked",
                label: "Vehicles Linked",
                type: "text" as const,
                icon: Car,
                disabled: true,
              },
              {
                name: "treesAssigned",
                label: "Trees Assigned",
                type: "text" as const,
                icon: TreePine,
                disabled: true,
              },
              {
                name: "lastLoginAt",
                label: "Last Login",
                type: "text" as const,
                icon: Calendar,
                disabled: true,
              },
              {
                name: "createdBy",
                label: "Created By",
                type: "text" as const,
                icon: User,
                disabled: true,
              },
              {
                name: "updatedBy",
                label: "Updated By",
                type: "text" as const,
                icon: User,
                disabled: true,
              },
            ],
          },
        ]
      : []),
  ];

  return (
    <div className="dashboard-area">
      <FormPageHeader
        icon={User}
        title={isView ? "View Person" : isEditing ? "Edit Person" : "Add Person"}
        subtitle="Master record of every citizen registered on the platform."
        onBack={() => navigate("/persons")}
      />

      {(isEditing || isView) && formData.personId && (
        <div
          className="card"
          style={{
            marginBottom: 16,
            fontSize: 13,
            color: "var(--text-secondary)",
            padding: "10px 16px",
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <span>
            Person ID:{" "}
            <strong style={{ color: "var(--text-primary)" }}>{formData.personId}</strong>
          </span>
          {isView && (
            <span
              className={`status-badge ${formData.insuranceVerified ? "status-active" : "status-inactive"}`}
            >
              {formData.insuranceVerified ? "Insurance Available" : "No Insurance Found"}
            </span>
          )}
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
          submitLabel={isView ? "Back" : isEditing ? "Update Person" : "Add Person"}
          cancelLabel="Cancel"
          onCancel={() => navigate("/persons")}
        />
      </div>

      {isView && (
        <div className="card" style={{ marginTop: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
              flexWrap: "wrap",
            }}
          >
            <Car size={18} />
            <h3 style={{ margin: 0, fontSize: 16 }}>Linked Vehicles & Insurance</h3>
            {insuranceSummary && (
              <span
                className={`status-badge ${insuranceSummary.hasActiveInsurance ? "status-active" : "status-inactive"}`}
              >
                {insuranceSummary.hasActiveInsurance
                  ? "Insurance Available"
                  : "No Insurance Found"}
              </span>
            )}
          </div>
          {insuranceSummary?.message && (
            <p style={{ color: "var(--text-secondary)", margin: "0 0 16px", fontSize: 13 }}>
              {insuranceSummary.message}
              {` · Insured: ${insuranceSummary.insuredVehicles} · Uninsured: ${insuranceSummary.uninsuredVehicles}`}
            </p>
          )}

          {vehiclesLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
              <Loader2 size={22} className="spin" />
            </div>
          ) : vehicles.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", margin: 0 }}>
              No vehicles found in the insurance system for this mobile number.
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="data-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "8px 10px" }}>Registration</th>
                    <th style={{ textAlign: "left", padding: "8px 10px" }}>Type / Model</th>
                    <th style={{ textAlign: "left", padding: "8px 10px" }}>Insured</th>
                    <th style={{ textAlign: "left", padding: "8px 10px" }}>Policy No.</th>
                    <th style={{ textAlign: "left", padding: "8px 10px" }}>Status</th>
                    <th style={{ textAlign: "left", padding: "8px 10px" }}>Start</th>
                    <th style={{ textAlign: "left", padding: "8px 10px" }}>End</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((v, idx) => (
                    <tr key={`${v.registrationNumber || "v"}-${idx}`}>
                      <td style={{ padding: "8px 10px" }}>{v.registrationNumber || "—"}</td>
                      <td style={{ padding: "8px 10px" }}>
                        {[v.vehicleType, v.vehicleModel].filter(Boolean).join(" · ") || "—"}
                      </td>
                      <td style={{ padding: "8px 10px" }}>
                        <span
                          className={`status-badge ${
                            v.isInsured || v.policyStatus === "ACTIVE" || v.policyStatus === "EXPIRED"
                              ? "status-active"
                              : "status-inactive"
                          }`}
                        >
                          {v.isInsured ||
                          v.policyStatus === "ACTIVE" ||
                          v.policyStatus === "EXPIRED"
                            ? "Yes"
                            : "No"}
                        </span>
                      </td>
                      <td style={{ padding: "8px 10px" }}>{v.policyNumber || "—"}</td>
                      <td style={{ padding: "8px 10px" }}>
                        <span className={`status-badge ${policyBadgeClass(v.policyStatus)}`}>
                          {v.policyStatus || "NOT_INSURED"}
                        </span>
                      </td>
                      <td style={{ padding: "8px 10px" }}>{formatDate(v.policyStartDate)}</td>
                      <td style={{ padding: "8px 10px" }}>{formatDate(v.policyEndDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PersonForm;
