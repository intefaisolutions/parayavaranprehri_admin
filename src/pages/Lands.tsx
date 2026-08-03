import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Loader2,
  MapPinned,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../components/DataTable";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";
import { apiFetch } from "../utils/apiConfig";
import { OWNERSHIP_LABELS, STATUS_LABELS } from "../utils/landCapacity";

export interface LandRow {
  _id: string;
  landId: string;
  landName: string;
  ownershipType: string;
  totalArea: number;
  areaUnit: string;
  totalAreaAcres?: number;
  maxTreeCapacity: number;
  plantedTrees: number;
  availableCapacity: number;
  vidhanSabha?: string;
  district?: string;
  status: string;
  khasraNumber?: string;
}

interface OwnershipCard {
  ownershipType: string;
  totalLand: number;
  totalAreaAcres: number;
  treeCapacity: number;
  treesPlanted: number;
  remainingCapacity: number;
}

export const LandsView = () => {
  const navigate = useNavigate();
  const [lands, setLands] = useState<LandRow[]>([]);
  const [dashboard, setDashboard] = useState<OwnershipCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteItem, setDeleteItem] = useState<LandRow | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [list, cards] = await Promise.all([
        apiFetch<LandRow[]>("/api/v1/lands"),
        apiFetch<OwnershipCard[]>("/api/v1/lands/dashboard/ownership"),
      ]);
      setLands(Array.isArray(list) ? list : []);
      setDashboard(Array.isArray(cards) ? cards : []);
    } catch (err: any) {
      setError(err.message || "Failed to load lands");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await apiFetch(`/api/v1/lands/${deleteItem._id}`, { method: "DELETE" });
      await load();
    } catch (err: any) {
      setError(err.message || "Failed to delete land");
    } finally {
      setDeleteItem(null);
    }
  };

  const columns: ColumnDef<LandRow>[] = [
    { accessorKey: "landId", header: "Land ID", enableSorting: true },
    { accessorKey: "landName", header: "Land Name", enableSorting: true },
    {
      accessorKey: "ownershipType",
      header: "Ownership",
      cell: ({ row }) =>
        OWNERSHIP_LABELS[row.original.ownershipType] ||
        row.original.ownershipType,
      enableSorting: true,
    },
    {
      id: "area",
      header: "Area",
      cell: ({ row }) =>
        `${row.original.totalArea} ${row.original.areaUnit.replace("_", " ")}`,
      enableSorting: false,
    },
    {
      accessorKey: "maxTreeCapacity",
      header: "Capacity",
      enableSorting: true,
    },
    {
      accessorKey: "plantedTrees",
      header: "Planted",
      enableSorting: true,
    },
    {
      accessorKey: "availableCapacity",
      header: "Remaining",
      enableSorting: true,
    },
    {
      accessorKey: "vidhanSabha",
      header: "Vidhan Sabha",
      cell: ({ row }) => row.original.vidhanSabha || "—",
      enableSorting: true,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`status-badge ${
            row.original.status === "AVAILABLE"
              ? "status-active"
              : row.original.status === "FULLY_OCCUPIED"
                ? "status-inactive"
                : "status-warning"
          }`}
        >
          {STATUS_LABELS[row.original.status] || row.original.status}
        </span>
      ),
      enableSorting: false,
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="icon-btn"
            style={{ width: 28, height: 28 }}
            title="View"
            onClick={() =>
              navigate("/lands/view", { state: { land: row.original } })
            }
          >
            <Eye size={14} />
          </button>
          <button
            className="icon-btn"
            style={{ width: 28, height: 28 }}
            title="Edit"
            onClick={() =>
              navigate("/lands/edit", { state: { land: row.original } })
            }
          >
            <Edit size={14} />
          </button>
          <button
            className="icon-btn"
            style={{ width: 28, height: 28 }}
            title="Delete"
            onClick={() => setDeleteItem(row.original)}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
      enableSorting: false,
    },
  ];

  return (
    <>
      <div className="dashboard-area">
        <div className="page-header">
          <div className="page-title">
            <h1>Land Management</h1>
            <p>
              Register plantation land, track capacity, and link trees to each
              parcel.
            </p>
          </div>
          <button
            className="btn-primary"
            onClick={() => navigate("/lands/add")}
          >
            <Plus size={18} />
            Add Land
          </button>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(255, 61, 0, 0.1)",
              color: "#ff3d00",
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        {dashboard.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 12,
              marginBottom: 16,
            }}
          >
            {dashboard.map((card) => (
              <div
                key={card.ownershipType}
                className="card"
                style={{ padding: 16 }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    marginBottom: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <MapPinned size={16} color="var(--accent-color)" />
                  {OWNERSHIP_LABELS[card.ownershipType] || card.ownershipType}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", display: "grid", gap: 4 }}>
                  <div>
                    Total Land:{" "}
                    <strong style={{ color: "var(--text-primary)" }}>
                      {card.totalLand.toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    Total Area:{" "}
                    <strong style={{ color: "var(--text-primary)" }}>
                      {card.totalAreaAcres.toLocaleString()} Acres
                    </strong>
                  </div>
                  <div>
                    Tree Capacity:{" "}
                    <strong style={{ color: "var(--text-primary)" }}>
                      {card.treeCapacity.toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    Trees Planted:{" "}
                    <strong style={{ color: "var(--text-primary)" }}>
                      {card.treesPlanted.toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    Remaining:{" "}
                    <strong style={{ color: "var(--accent-color)" }}>
                      {card.remainingCapacity.toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="card">
          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: 40,
              }}
            >
              <Loader2 size={24} className="spin" />
            </div>
          ) : lands.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: 48,
                color: "var(--text-secondary)",
              }}
            >
              <MapPinned size={28} style={{ marginBottom: 8 }} />
              <p>No land parcels yet. Add government or private land to start planning plantations.</p>
              <button
                className="btn-primary"
                style={{ marginTop: 12 }}
                onClick={() => navigate("/lands/add")}
              >
                <Plus size={16} /> Add Land
              </button>
            </div>
          ) : (
            <DataTable
              data={lands}
              columns={columns}
              searchPlaceholder="Search land name, ID, khasra, address, PIN..."
            />
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        personName={deleteItem?.landName}
        title="Delete Land"
      />
    </>
  );
};

export default LandsView;
