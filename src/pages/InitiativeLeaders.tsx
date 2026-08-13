import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Filter, Edit, Trash2, Loader2, Users } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../components/DataTable";
import { MediaImage } from "../components/media/MediaImage";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";
import { apiFetch } from "../utils/apiConfig";

interface Leader {
  _id: string;
  leaderName: string;
  designation: string;
  organization?: string;
  photo?: string;
  displayOrder: number;
  isActive: boolean;
  updatedAt?: string;
}

export const LeadersView = () => {
  const navigate = useNavigate();
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [leaderToDelete, setLeaderToDelete] = useState<Leader | null>(null);

  const loadLeaders = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<Leader[]>(
        "/api/v1/leaders?limit=100&sortBy=displayOrder&sortOrder=asc"
      );
      setLeaders(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load Initiative Leaders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaders();
  }, []);

  const openDeleteModal = (leader: Leader) => {
    setLeaderToDelete(leader);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!leaderToDelete) return;
    try {
      await apiFetch(`/api/v1/leaders/${leaderToDelete._id}`, { method: "DELETE" });
      await loadLeaders();
    } catch (err: any) {
      setError(err.message || "Failed to delete Initiative Leader");
    } finally {
      setLeaderToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const columns: ColumnDef<Leader>[] = [
    {
      accessorKey: "photo",
      header: "Photo",
      cell: ({ row }) =>
        row.original.photo ? (
          <MediaImage
            src={row.original.photo}
            alt={row.original.leaderName}
            width={40}
            height={40}
            style={{ borderRadius: "50%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(43, 150, 79, 0.08)",
              color: "var(--accent-color)",
            }}
          >
            <Users size={18} />
          </div>
        ),
      enableSorting: false,
    },
    { accessorKey: "leaderName", header: "Leader Name", enableSorting: true },
    { accessorKey: "designation", header: "Designation", enableSorting: true },
    { accessorKey: "organization", header: "Organization", enableSorting: true },
    { accessorKey: "displayOrder", header: "Display Order", enableSorting: true },
    {
      accessorKey: "isActive",
      header: "Visibility Status",
      cell: ({ row }) => (
        <span
          className={`status-badge ${row.original.isActive ? "status-active" : "status-inactive"}`}
        >
          {row.original.isActive ? "Visible" : "Hidden"}
        </span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "updatedAt",
      header: "Updated Date",
      enableSorting: true,
      cell: ({ row }) =>
        row.original.updatedAt ? new Date(row.original.updatedAt).toLocaleDateString() : "-",
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => navigate("/leaders/edit", { state: { leader: row.original } })}>
            <Edit size={14} />
          </button>
          <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => openDeleteModal(row.original)}>
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
            <h1>Initiative Leaders</h1>
            <p>Manage the leaders showcased for this environmental initiative.</p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button className="icon-btn" title="Filter">
              <Filter size={18} />
            </button>
            <button className="btn-primary" onClick={() => navigate("/leaders/add")}>
              <Plus size={18} />
              Add Leader
            </button>
          </div>
        </div>

        {error && (
          <div style={{ background: "rgba(255, 61, 0, 0.1)", color: "#ff3d00", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        <div className="card">
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
              <Loader2 size={24} className="spin" />
            </div>
          ) : leaders.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
                padding: "60px 20px",
                textAlign: "center",
              }}
            >
              <Users size={40} color="var(--text-secondary)" />
              <div>
                <h3 style={{ margin: 0 }}>No initiative leaders yet</h3>
                <p style={{ color: "var(--text-secondary)", marginTop: 4 }}>
                  Add the first leader to showcase them on the platform.
                </p>
              </div>
              <button className="btn-primary" onClick={() => navigate("/leaders/add")}>
                <Plus size={18} />
                Add First Leader
              </button>
            </div>
          ) : (
            <DataTable
              data={leaders}
              columns={columns}
              searchPlaceholder="Search leader, designation, organization..."
            />
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setLeaderToDelete(null);
        }}
        onConfirm={handleDelete}
        personName={leaderToDelete?.leaderName}
        title="Delete Initiative Leader"
      />
    </>
  );
};
