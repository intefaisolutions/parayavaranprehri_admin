import React, { useEffect, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Filter,
  Loader2,
  Building,
  Eye,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../components/DataTable";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";
import { apiFetch } from "../utils/apiConfig";

interface VidhanSabha {
  _id: string;
  vidhanSabhaName: string;
  district?: string;
  state?: string;
  hasBoundary?: boolean;
  areaKm2?: number | null;
  greenCoverPercent?: number | null;
  totalLands?: number;
  pendingPlantationRequests?: number;
  assignedAdmin?: string;
  status: "Active" | "Inactive";
  boundary?: unknown;
}

export const VidhanSabhaView = () => {
  const navigate = useNavigate();

  const [data, setData] = useState<VidhanSabha[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deleteItem, setDeleteItem] = useState<VidhanSabha | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const openDetails = (entry: VidhanSabha) => {
    navigate("/vidhansabha/view", { state: { vidhanSabha: entry } });
  };

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await apiFetch<VidhanSabha[]>(
        "/api/v1/vidhan-sabhas?limit=200&sortBy=vidhanSabhaName&sortOrder=asc",
      );
      setData(result || []);
    } catch (err: any) {
      setError(err.message || "Failed to load Vidhan Sabhas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openDeleteModal = (entry: VidhanSabha) => {
    setDeleteItem(entry);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await apiFetch(`/api/v1/vidhan-sabhas/${deleteItem._id}`, {
        method: "DELETE",
      });
      await loadData();
    } catch (err: any) {
      setError(err.message || "Failed to delete Vidhan Sabha");
    } finally {
      setDeleteItem(null);
      setShowDeleteModal(false);
    }
  };

  const columns: ColumnDef<VidhanSabha>[] = [
    {
      accessorKey: "vidhanSabhaName",
      header: "Vidhan Sabha Name",
      enableSorting: true,
    },
    {
      accessorKey: "district",
      header: "District",
      enableSorting: true,
    },
    {
      accessorKey: "state",
      header: "State",
      enableSorting: true,
    },
    {
      accessorKey: "areaKm2",
      header: "Area",
      cell: ({ row }) => {
        const area = row.original.areaKm2;
        if (area == null || !row.original.hasBoundary) {
          return <span style={{ color: "var(--text-secondary)" }}>—</span>;
        }
        return `${Number(area).toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })} km²`;
      },
      enableSorting: true,
    },
    {
      id: "boundary",
      accessorKey: "hasBoundary",
      header: "Boundary",
      cell: ({ row }) => {
        const ok = !!row.original.hasBoundary;
        return (
          <button
            type="button"
            className={`status-badge ${ok ? "status-boundary-yes" : "status-boundary-no"}`}
            title={ok ? "View on Map" : "No boundary — open details"}
            onClick={() => openDetails(row.original)}
            style={{
              cursor: "pointer",
              border: "none",
              font: "inherit",
            }}
          >
            {ok ? "Boundary Added" : "No Boundary"}
          </button>
        );
      },
      enableSorting: true,
    },
    {
      accessorKey: "greenCoverPercent",
      header: "Green Cover %",
      cell: ({ row }) => {
        const v = row.original.greenCoverPercent;
        if (v == null) {
          return <span style={{ color: "var(--text-secondary)" }}>—</span>;
        }
        return `${Number(v).toLocaleString(undefined, {
          maximumFractionDigits: 1,
        })}%`;
      },
      enableSorting: true,
    },
    {
      accessorKey: "totalLands",
      header: "Total Lands",
      cell: ({ row }) =>
        Number(row.original.totalLands || 0).toLocaleString(),
      enableSorting: true,
    },
    {
      accessorKey: "pendingPlantationRequests",
      header: "Plantation Requests",
      cell: ({ row }) => {
        const n = Number(row.original.pendingPlantationRequests || 0);
        if (n <= 0) {
          return <span style={{ color: "var(--text-secondary)" }}>0</span>;
        }
        return (
          <span className="status-badge status-pending-soft">
            {n.toLocaleString()} Pending
          </span>
        );
      },
      enableSorting: true,
    },
    {
      accessorKey: "assignedAdmin",
      header: "Assigned Admin",
      enableSorting: true,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`status-badge ${
            row.original.status === "Active"
              ? "status-active"
              : "status-inactive"
          }`}
        >
          {row.original.status}
        </span>
      ),
      enableSorting: false,
    },
    {
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className="icon-btn"
            style={{ width: 28, height: 28 }}
            title="View details"
            onClick={() => openDetails(row.original)}
          >
            <Eye size={14} />
          </button>
          <button
            className="icon-btn"
            style={{ width: 28, height: 28 }}
            title="View on Map"
            onClick={() => openDetails(row.original)}
          >
            <MapPin size={14} />
          </button>
          <button
            className="icon-btn"
            style={{ width: 28, height: 28 }}
            title="Edit"
            onClick={() =>
              navigate("/vidhansabha/edit", {
                state: { vidhanSabha: row.original },
              })
            }
          >
            <Edit size={14} />
          </button>
          <button
            className="icon-btn"
            style={{ width: 28, height: 28 }}
            title="Delete"
            onClick={() => openDeleteModal(row.original)}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="dashboard-area">
        <div className="page-header">
          <div className="page-title">
            <h1>Vidhan Sabha Management</h1>
            <p>
              Constituency overview — open View/Map for full stats and boundary.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button className="icon-btn" title="Filter">
              <Filter size={18} />
            </button>

            <button
              className="btn-primary"
              onClick={() => navigate("/vidhansabha/add")}
            >
              <Plus size={18} />
              Add Vidhan Sabha
            </button>
          </div>
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
          ) : data.length === 0 ? (
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
              <Building size={28} />
              <p>No Vidhan Sabhas added yet.</p>
              <button
                className="btn-primary"
                onClick={() => navigate("/vidhansabha/add")}
              >
                <Plus size={16} />
                Add the first one
              </button>
            </div>
          ) : (
            <DataTable
              data={data}
              columns={columns}
              searchPlaceholder="Search Vidhan Sabha, district, admin..."
            />
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteItem(null);
        }}
        onConfirm={handleDelete}
        personName={deleteItem?.vidhanSabhaName}
        title="Delete Vidhan Sabha"
      />
    </>
  );
};

export default VidhanSabhaView;
