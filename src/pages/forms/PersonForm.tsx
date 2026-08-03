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
  Pencil,
} from "lucide-react";
import { apiFetch } from "../../utils/apiConfig";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig } from "../../components/form/SmartForm";
import { FormPageHeader } from "../../components/form/FormPageHeader";
import { DetailView } from "../../components/view/DetailView";

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

const formatDateTime = (value?: string | null) => {
  if (!value || value === "Never") return "Never";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
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
      : emptyForm,
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [vehicles, setVehicles] = useState<InsuredVehicle[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(isView);
  const [insuranceSummary, setInsuranceSummary] = useState<{
    hasActiveInsurance: boolean;
    insuredVehicles: number;
    uninsuredVehicles: number;
    message?: string;
  } | null>(null);

  useEffect(() => {
    if (!isView || !editPerson?._id) {
      setDetailLoading(false);
      return;
    }

    let cancelled = false;
    const load = async () => {
      setDetailLoading(true);
      setVehiclesLoading(true);
      setError("");
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

        setFormData({
          ...emptyForm,
          ...detail,
          dob: toDateInputValue(detail.dob),
          registrationDate: toDateInputValue(detail.registrationDate),
          vehiclesLinked:
            vehicleData.vehiclesLinked ?? detail.vehiclesLinked ?? 0,
          treesAssigned: detail.treesAssigned ?? 0,
          insuranceVerified: hasActive,
          lastLoginAt: detail.lastLoginAt || null,
        });
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
        if (!cancelled) {
          setDetailLoading(false);
          setVehiclesLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [isView, editPerson?._id]);

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (formData.dob && formData.dob > todayDateInput()) {
      setError("Date of Birth cannot be a future date");
      setSubmitting(false);
      return;
    }

    const {
      _id,
      personId: _personId,
      source: _source,
      insuranceVerified: _iv,
      createdBy: _cb,
      updatedBy: _ub,
      lastLoginAt: _ll,
      ...rest
    } = formData;
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

  if (isView) {
    if (!editPerson?._id) {
      return (
        <div className="dashboard-area">
          <DetailView
            title="View Person"
            subtitle="Customer profile"
            onBack={() => navigate("/persons")}
            headline="Person not found"
            subheadline="Open this page from the Persons list View action."
            sections={[]}
            error="No person selected."
          />
        </div>
      );
    }

    const addressLine = [formData.address, formData.city, formData.state, formData.pincode]
      .filter(Boolean)
      .join(", ");

    return (
      <div className="dashboard-area">
        <DetailView
          title="Customer Profile"
          subtitle="Full person details and linked insurance"
          onBack={() => navigate("/persons")}
          avatarUrl={formData.photo || undefined}
          headline={formData.name || "—"}
          subheadline={
            [formData.personId, formData.mobile, formData.email]
              .filter(Boolean)
              .join(" · ") || undefined
          }
          badges={[
            {
              label: formData.status || "Active",
              tone: formData.status === "Active" ? "success" : "neutral",
            },
            {
              label: formData.source === "app" ? "App" : "Admin",
              tone: formData.source === "app" ? "warning" : "info",
            },
            {
              label: insuranceSummary?.hasActiveInsurance
                ? "Insurance Available"
                : "No Insurance Found",
              tone: insuranceSummary?.hasActiveInsurance ? "success" : "danger",
            },
          ]}
          meta={[
            {
              label: "Vehicles Linked",
              value: formData.vehiclesLinked ?? 0,
              icon: Car,
            },
            {
              label: "Trees Assigned",
              value: formData.treesAssigned ?? 0,
              icon: TreePine,
            },
            {
              label: "Last Login",
              value: formatDateTime(formData.lastLoginAt),
              icon: Calendar,
            },
            {
              label: "Registered",
              value: formatDate(formData.registrationDate),
              icon: ShieldCheck,
            },
          ]}
          sections={[
            {
              title: "Personal Details",
              description: "Identity and contact information",
              icon: User,
              fields: [
                { label: "Full Name", value: formData.name, icon: User },
                { label: "Mobile", value: formData.mobile, icon: Phone },
                { label: "Email", value: formData.email, icon: Mail },
                {
                  label: "Date of Birth",
                  value: formatDate(formData.dob),
                  icon: Calendar,
                },
                { label: "Gender", value: formData.gender, icon: User },
                {
                  label: "Person ID",
                  value: formData.personId,
                  icon: Hash,
                },
              ],
            },
            {
              title: "Address",
              icon: MapPin,
              fields: [
                {
                  label: "Full Address",
                  value: addressLine || formData.address,
                  icon: MapPin,
                  span: 2,
                },
                { label: "City", value: formData.city, icon: Building2 },
                { label: "State", value: formData.state, icon: Building2 },
                { label: "Pincode", value: formData.pincode, icon: Hash },
              ],
            },
            {
              title: "Identity Proof",
              icon: CreditCard,
              fields: [
                {
                  label: "ID Type",
                  value: formData.idProofType,
                  icon: CreditCard,
                },
                {
                  label: "ID Number",
                  value: formData.idProofNumber,
                  icon: Hash,
                },
              ],
            },
            {
              title: "Record Info",
              icon: ShieldCheck,
              fields: [
                { label: "Created By", value: formData.createdBy, icon: User },
                { label: "Updated By", value: formData.updatedBy, icon: User },
              ],
            },
          ]}
          actions={
            <button
              type="button"
              className="btn-primary"
              onClick={() =>
                navigate("/persons/edit", { state: { person: formData } })
              }
            >
              <Pencil size={16} />
              Edit Person
            </button>
          }
          loading={detailLoading}
          error={error}
        >
          <div className="detail-panel">
            <div className="detail-panel__head">
              <Car size={18} />
              <h3 className="detail-panel__title">Linked Vehicles & Insurance</h3>
              {insuranceSummary && (
                <span
                  className={`status-badge ${
                    insuranceSummary.hasActiveInsurance
                      ? "status-active"
                      : "status-inactive"
                  }`}
                >
                  {insuranceSummary.hasActiveInsurance
                    ? "Insurance Available"
                    : "No Insurance Found"}
                </span>
              )}
            </div>
            {insuranceSummary?.message && (
              <p className="detail-panel__hint">
                {insuranceSummary.message}
                {` · Insured: ${insuranceSummary.insuredVehicles} · Uninsured: ${insuranceSummary.uninsuredVehicles}`}
              </p>
            )}

            {vehiclesLoading ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: 24,
                }}
              >
                <Loader2 size={22} className="spin" />
              </div>
            ) : vehicles.length === 0 ? (
              <p className="detail-empty">
                No vehicles found in the insurance system for this mobile
                number.
              </p>
            ) : (
              <div className="detail-table-wrap">
                <table className="detail-table">
                  <thead>
                    <tr>
                      <th>Registration</th>
                      <th>Type / Model</th>
                      <th>Insured</th>
                      <th>Policy No.</th>
                      <th>Status</th>
                      <th>Start</th>
                      <th>End</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map((v, idx) => {
                      const insured =
                        v.isInsured ||
                        v.policyStatus === "ACTIVE" ||
                        v.policyStatus === "EXPIRED";
                      return (
                        <tr key={`${v.registrationNumber || "v"}-${idx}`}>
                          <td>{v.registrationNumber || "—"}</td>
                          <td>
                            {[v.vehicleType, v.vehicleModel]
                              .filter(Boolean)
                              .join(" · ") || "—"}
                          </td>
                          <td>
                            <span
                              className={`status-badge ${
                                insured ? "status-active" : "status-inactive"
                              }`}
                            >
                              {insured ? "Yes" : "No"}
                            </span>
                          </td>
                          <td>{v.policyNumber || "—"}</td>
                          <td>
                            <span
                              className={`status-badge ${policyBadgeClass(
                                v.policyStatus,
                              )}`}
                            >
                              {v.policyStatus || "NOT_INSURED"}
                            </span>
                          </td>
                          <td>{formatDate(v.policyStartDate)}</td>
                          <td>{formatDate(v.policyEndDate)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </DetailView>
      </div>
    );
  }

  const sections: FormSectionConfig[] = [
    {
      title: "Personal Details",
      description: "Core identity and contact information for this citizen.",
      icon: User,
      fields: [
        {
          name: "name",
          label: "Full Name",
          type: "text",
          icon: User,
          required: true,
          span: 2,
        },
        {
          name: "mobile",
          label: "Mobile Number",
          type: "tel",
          icon: Phone,
          required: true,
        },
        {
          name: "email",
          label: "Email",
          type: "email",
          icon: Mail,
          required: true,
        },
        {
          name: "dob",
          label: "Date of Birth",
          type: "date",
          icon: Calendar,
          max: todayDateInput(),
          helpText: "Future dates are not allowed",
        },
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
        {
          name: "photo",
          label: "Photo",
          type: "image",
          icon: User,
          uploadCategory: "users",
          span: 2,
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
        },
        { name: "city", label: "City", type: "text", icon: Building2 },
        { name: "state", label: "State", type: "text", icon: Building2 },
        {
          name: "pincode",
          label: "Pincode",
          type: "text",
          icon: Hash,
          span: 2,
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
        },
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
          Person ID:{" "}
          <strong style={{ color: "var(--text-primary)" }}>
            {formData.personId}
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
          submitLabel={isEditing ? "Update Person" : "Add Person"}
          cancelLabel="Cancel"
          onCancel={() => navigate("/persons")}
        />
      </div>
    </div>
  );
};

export default PersonForm;
