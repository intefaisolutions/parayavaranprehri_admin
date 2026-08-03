import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  User,
  Phone,
  Mail,
  Car,
  Hash,
  ShieldCheck,
  Calendar,
  Building2,
} from "lucide-react";
import { DetailView } from "../../components/view/DetailView";
import { apiFetch } from "../../utils/apiConfig";
import type { LinkedVehicleRow } from "../Vehicles";

interface PersonDetail {
  _id?: string;
  personId?: string;
  name?: string;
  mobile?: string;
  email?: string;
  dob?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  photo?: string;
  status?: string;
  source?: string;
  lastLoginAt?: string | null;
  createdBy?: string;
  treesAssigned?: number;
  vehiclesLinked?: number;
}

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "Never";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
};

export const VehicleView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const vehicle = location.state?.vehicle as LinkedVehicleRow | undefined;

  const [person, setPerson] = useState<PersonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!vehicle?.personMongoId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const detail = await apiFetch<PersonDetail>(
          `/api/v1/persons/${vehicle.personMongoId}`,
        );
        if (!cancelled) setPerson(detail);
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || "Failed to load person details");
          setPerson({
            personId: vehicle.personId,
            name: vehicle.personName,
            mobile: vehicle.mobile,
            email: vehicle.email,
            photo: vehicle.photo,
            status: vehicle.personStatus,
            source: vehicle.personSource,
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [vehicle?.personMongoId]);

  if (!vehicle) {
    return (
      <div className="dashboard-area">
        <DetailView
          title="Vehicle Details"
          onBack={() => navigate("/vehicles")}
          headline="Vehicle not found"
          subheadline="Open this page from Vehicle Management → View."
          sections={[]}
          error="No vehicle selected."
        />
      </div>
    );
  }

  const owner = person || {
    personId: vehicle.personId,
    name: vehicle.personName,
    mobile: vehicle.mobile,
    email: vehicle.email,
    photo: vehicle.photo,
    status: vehicle.personStatus,
    source: vehicle.personSource,
  };

  const addressLine = [owner.address, owner.city, owner.state, owner.pincode]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="dashboard-area">
      <DetailView
        title="Vehicle & Owner"
        subtitle="Insurance vehicle linked to a registered person"
        onBack={() => navigate("/vehicles")}
        avatarUrl={owner.photo || undefined}
        headline={vehicle.registrationNumber}
        subheadline={
          [vehicle.vehicleType, vehicle.vehicleModel, owner.name]
            .filter(Boolean)
            .join(" · ") || undefined
        }
        badges={[
          {
            label: vehicle.policyStatus || "NOT_INSURED",
            tone:
              vehicle.policyStatus === "ACTIVE"
                ? "success"
                : vehicle.policyStatus === "EXPIRED"
                  ? "warning"
                  : "danger",
          },
          {
            label: vehicle.isInsured ? "Insured" : "Not Insured",
            tone: vehicle.isInsured ? "success" : "neutral",
          },
          {
            label: owner.status || "Active",
            tone: owner.status === "Active" ? "info" : "neutral",
          },
        ]}
        meta={[
          {
            label: "Owner",
            value: owner.name || "—",
            icon: User,
          },
          {
            label: "Mobile",
            value: owner.mobile || vehicle.mobile,
            icon: Phone,
          },
          {
            label: "Policy No.",
            value: vehicle.policyNumber || "—",
            icon: ShieldCheck,
          },
          {
            label: "Person ID",
            value: owner.personId || vehicle.personId,
            icon: Hash,
          },
        ]}
        sections={[
          {
            title: "Vehicle Details",
            icon: Car,
            fields: [
              {
                label: "Registration / Plate",
                value: vehicle.registrationNumber,
                icon: Car,
              },
              {
                label: "Vehicle Type",
                value: vehicle.vehicleType,
                icon: Car,
              },
              {
                label: "Model",
                value: vehicle.vehicleModel,
                icon: Car,
                span: 2,
              },
              {
                label: "Insurance Status",
                value: vehicle.policyStatus,
                icon: ShieldCheck,
              },
              {
                label: "Insured",
                value: vehicle.isInsured ? "Yes" : "No",
                icon: ShieldCheck,
              },
              {
                label: "Policy Number",
                value: vehicle.policyNumber || "—",
                icon: Hash,
              },
              {
                label: "Policy Start",
                value: formatDate(vehicle.policyStartDate),
                icon: Calendar,
              },
              {
                label: "Policy End",
                value: formatDate(vehicle.policyEndDate),
                icon: Calendar,
              },
            ],
          },
          {
            title: "Owner (Person) Details",
            description: "Citizen linked to this vehicle via mobile number",
            icon: User,
            fields: [
              { label: "Full Name", value: owner.name, icon: User },
              {
                label: "Person ID",
                value: owner.personId,
                icon: Hash,
              },
              {
                label: "Mobile",
                value: owner.mobile || vehicle.mobile,
                icon: Phone,
              },
              { label: "Email", value: owner.email, icon: Mail },
              {
                label: "Gender",
                value: owner.gender,
                icon: User,
              },
              {
                label: "Date of Birth",
                value: formatDate(owner.dob),
                icon: Calendar,
              },
              {
                label: "Address",
                value: addressLine || owner.address,
                icon: Building2,
                span: 2,
              },
              {
                label: "Source",
                value: owner.source === "app" ? "App" : "Admin",
                icon: User,
              },
              {
                label: "Last Login",
                value: formatDateTime(owner.lastLoginAt),
                icon: Calendar,
              },
              {
                label: "Created By",
                value: owner.createdBy,
                icon: User,
              },
            ],
          },
        ]}
        actions={
          <button
            type="button"
            className="btn-primary"
            onClick={() =>
              navigate("/persons/view", {
                state: {
                  person: {
                    _id: vehicle.personMongoId,
                    ...owner,
                  },
                },
              })
            }
          >
            Open Full Person Profile
          </button>
        }
        loading={loading}
        error={error}
      />
    </div>
  );
};

export default VehicleView;
