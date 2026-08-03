import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Car, Eye, Loader2, RefreshCw } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../components/DataTable";
import { apiFetch } from "../utils/apiConfig";

export interface LinkedVehicleRow {
  id: string;
  personMongoId: string;
  personId: string;
  personName: string;
  mobile: string;
  email?: string;
  photo?: string;
  personStatus?: string;
  personSource?: string;
  registrationNumber: string;
  vehicleType?: string;
  vehicleModel?: string;
  isInsured: boolean;
  policyStatus: string;
  policyNumber?: string | null;
  policyStartDate?: string | null;
  policyEndDate?: string | null;
  hasActiveInsurance: boolean;
}

const policyBadgeClass = (status?: string) => {
  const s = (status || "").toUpperCase();
  if (s === "ACTIVE") return "status-active";
  if (s === "EXPIRED") return "status-warning";
  return "status-inactive";
};

export const VehiclesView = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<LinkedVehicleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadVehicles = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<LinkedVehicleRow[]>(
        "/api/v1/persons/linked-vehicles",
      );
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const columns: ColumnDef<LinkedVehicleRow>[] = [
    {
      accessorKey: "registrationNumber",
      header: "Plate Number",
      enableSorting: true,
    },
    {
      id: "vehicle",
      header: "Vehicle",
      cell: ({ row }) =>
        [row.original.vehicleType, row.original.vehicleModel]
          .filter(Boolean)
          .join(" · ") || "—",
      enableSorting: false,
    },
    {
      accessorKey: "personName",
      header: "Owner (Person)",
      cell: ({ row }) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.original.personName}</div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            {row.original.personId}
          </div>
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "mobile",
      header: "Mobile",
      enableSorting: true,
    },
    {
      accessorKey: "policyStatus",
      header: "Insurance",
      cell: ({ row }) => (
        <span
          className={`status-badge ${policyBadgeClass(row.original.policyStatus)}`}
        >
          {row.original.policyStatus || "NOT_INSURED"}
        </span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "policyNumber",
      header: "Policy No.",
      cell: ({ row }) => row.original.policyNumber || "—",
      enableSorting: false,
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <button
          className="icon-btn"
          style={{ width: 28, height: 28 }}
          title="View person & vehicle"
          onClick={() =>
            navigate("/vehicles/view", { state: { vehicle: row.original } })
          }
        >
          <Eye size={14} />
        </button>
      ),
      enableSorting: false,
    },
  ];

  return (
    <div className="dashboard-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Vehicle Management</h1>
          <p>
            Vehicles linked to persons from the insurance system. Add a person
            first — their insured vehicles appear here automatically.
          </p>
        </div>

        <button
          className="btn-secondary"
          onClick={loadVehicles}
          disabled={loading}
          title="Refresh from insurance"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div
          style={{
            background: "rgba(255, 61, 0, 0.1)",
            color: "#ff3d00",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "16px",
          }}
        >
          {error}
        </div>
      )}

      <div className="card">
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "40px",
            }}
          >
            <Loader2 size={24} className="spin" />
          </div>
        ) : vehicles.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              padding: "48px 20px",
              color: "var(--text-secondary)",
            }}
          >
            <Car size={28} />
            <p style={{ margin: 0, fontWeight: 600, color: "var(--text-primary)" }}>
              No linked vehicles yet
            </p>
            <p style={{ margin: 0, textAlign: "center", maxWidth: 420 }}>
              When you add a Person whose mobile has a motor policy in the
              insurance system, that vehicle will show up here.
            </p>
            <button
              className="btn-primary"
              onClick={() => navigate("/persons/add")}
            >
              Add Person
            </button>
          </div>
        ) : (
          <DataTable
            data={vehicles}
            columns={columns}
            searchPlaceholder="Search plate, owner, mobile, policy..."
          />
        )}
      </div>
    </div>
  );
};

export default VehiclesView;
