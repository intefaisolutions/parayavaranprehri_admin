import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  Eye,
  Leaf,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../components/DataTable";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";
import { apiFetch } from "../utils/apiConfig";

interface Plantation {
  _id: string;
  plantationId: string;
  treeMasterName?: string;
  landName?: string;
  userName?: string;
  mobile?: string;
  count: number;
  plantationDate: string;
  status: string;
  district?: string;
  oxygenRateKgPerYear?: number;
  co2RateKgPerYear?: number;
}

interface DashboardRow {
  treeMasterId: string;
  name: string;
  totalTrees: number;
  estimatedOxygenKg: number;
  estimatedCo2Kg: number;
  availability?: string;
}

const statusStyle: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: "rgba(245,158,11,0.12)", color: "#b45309" },
  APPROVED: { bg: "rgba(43,150,79,0.12)", color: "#126E35" },
  PLANTED: { bg: "rgba(37,99,235,0.12)", color: "#1d4ed8" },
  REJECTED: { bg: "rgba(220,53,69,0.12)", color: "#b02a37" },
};

export const PlantationsView = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<Plantation[]>([]);
  const [dashboard, setDashboard] = useState<DashboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<Plantation | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [list, stats] = await Promise.all([
        apiFetch<Plantation[]>("/api/v1/plantations"),
        apiFetch<DashboardRow[]>("/api/v1/plantations/dashboard/by-tree-master"),
      ]);
      setEntries(Array.isArray(list) ? list : []);
      setDashboard(Array.isArray(stats) ? stats : []);
    } catch (err: any) {
      setError(err.message || "Failed to load plantations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const review = async (id: string, status: "APPROVED" | "REJECTED" | "PLANTED") => {
    let rejectionReason: string | undefined;
    if (status === "REJECTED") {
      rejectionReason =
        window.prompt("Rejection reason (required):") || undefined;
      if (!rejectionReason?.trim()) return;
    }
    setReviewingId(id);
    try {
      await apiFetch(`/api/v1/plantations/${id}/review`, {
        method: "PATCH",
        body: JSON.stringify({ status, rejectionReason }),
      });
      await load();
    } catch (err: any) {
      setError(err.message || "Review failed");
    } finally {
      setReviewingId(null);
    }
  };

  const handleDelete = async () => {
    if (!entryToDelete) return;
    try {
      await apiFetch(`/api/v1/plantations/${entryToDelete._id}`, {
        method: "DELETE",
      });
      await load();
    } catch (err: any) {
      setError(err.message || "Delete failed");
    } finally {
      setEntryToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const columns: ColumnDef<Plantation>[] = [
    { accessorKey: "plantationId", header: "ID" },
    { accessorKey: "treeMasterName", header: "Tree", enableSorting: true },
    { accessorKey: "landName", header: "Land" },
    { accessorKey: "count", header: "Count" },
    {
      accessorKey: "plantationDate",
      header: "Date",
      cell: ({ row }) =>
        row.original.plantationDate
          ? new Date(row.original.plantationDate).toLocaleDateString()
          : "—",
    },
    {
      accessorKey: "userName",
      header: "User",
      cell: ({ row }) =>
        row.original.userName || row.original.mobile || "—",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const s = statusStyle[row.original.status] || statusStyle.PENDING;
        return (
          <span
            className="status-badge"
            style={{ background: s.bg, color: s.color }}
          >
            {row.original.status}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const p = row.original;
        const busy = reviewingId === p._id;
        return (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {p.status === "PENDING" && (
              <>
                <button
                  type="button"
                  className="icon-btn"
                  title="Approve"
                  disabled={busy}
                  onClick={() => review(p._id, "APPROVED")}
                >
                  <Check size={16} color="#126E35" />
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  title="Reject"
                  disabled={busy}
                  onClick={() => review(p._id, "REJECTED")}
                >
                  <X size={16} color="#b02a37" />
                </button>
              </>
            )}
            {p.status === "APPROVED" && (
              <button
                type="button"
                className="icon-btn"
                title="Mark Planted"
                disabled={busy}
                onClick={() => review(p._id, "PLANTED")}
              >
                <Leaf size={16} color="#1d4ed8" />
              </button>
            )}
            <button
              type="button"
              className="icon-btn"
              title="View / Edit"
              onClick={() =>
                navigate("/plantations/edit", { state: { plantation: p } })
              }
            >
              <Eye size={16} />
            </button>
            <button
              type="button"
              className="icon-btn"
              title="Delete"
              onClick={() => {
                setEntryToDelete(p);
                setShowDeleteModal(true);
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="dashboard-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Plantation Requests</h1>
          <p>
            User/admin requests → approve → planted. Linked to Tree Master +
            Land.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => navigate("/plantations/add")}
        >
          <Plus size={18} /> New Plantation
        </button>
      </div>

      {error && (
        <div className="card" style={{ marginBottom: 16, color: "crimson" }}>
          {error}
        </div>
      )}

      <div
        className="stats-grid"
        style={{ marginBottom: 20 }}
      >
        {dashboard.slice(0, 4).map((row) => (
          <div className="stat-card" key={row.treeMasterId}>
            <div className="stat-header">
              <span className="stat-title">{row.name}</span>
              <Leaf size={18} color="#2B964F" />
            </div>
            <div className="stat-value">{row.totalTrees.toLocaleString()}</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              O₂ {row.estimatedOxygenKg.toLocaleString()} kg · CO₂{" "}
              {row.estimatedCo2Kg.toLocaleString()} kg
            </div>
          </div>
        ))}
        {!loading && dashboard.length === 0 && (
          <div className="stat-card">
            <div className="stat-title">No approved plantations yet</div>
            <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              Approve requests to see species totals here.
            </p>
          </div>
        )}
      </div>

      <div className="card">
        {loading ? (
          <p>Loading…</p>
        ) : (
          <DataTable
            data={entries}
            columns={columns}
            searchPlaceholder="Search plantation ID, tree, land, user…"
          />
        )}
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        personName={entryToDelete?.plantationId}
        title="Delete Plantation"
      />
    </div>
  );
};

export default PlantationsView;
