import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Loader2, UserRound } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../components/DataTable";
import { MediaImage } from "../components/media/MediaImage";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";
import { apiFetch } from "../utils/apiConfig";

interface JourneyAchievement {
  _id: string;
  year: string;
  type: string;
  title: string;
  subtitle: string;
  imageUrl?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export const JourneyView = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<JourneyAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toDelete, setToDelete] = useState<JourneyAchievement | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<JourneyAchievement[]>(
        "/api/v1/journey/achievements?includeInactive=true",
      );
      setItems(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Failed to load journey achievements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await apiFetch(`/api/v1/journey/achievements/${toDelete._id}`, {
        method: "DELETE",
      });
      await load();
    } catch (err: any) {
      setError(err.message || "Failed to delete achievement");
    } finally {
      setShowDeleteModal(false);
      setToDelete(null);
    }
  };

  const columns: ColumnDef<JourneyAchievement>[] = [
    { accessorKey: "year", header: "Year", enableSorting: true },
    {
      accessorKey: "type",
      header: "Type",
      enableSorting: true,
      cell: ({ row }) => (
        <span className="status-badge status-active">{row.original.type}</span>
      ),
    },
    { accessorKey: "title", header: "Title", enableSorting: true },
    { accessorKey: "subtitle", header: "Subtitle" },
    {
      accessorKey: "imageUrl",
      header: "Image",
      cell: ({ row }) =>
        row.original.imageUrl ? (
          <MediaImage
            src={row.original.imageUrl}
            alt=""
            width={60}
            height={40}
            style={{ borderRadius: 6, objectFit: "cover" }}
          />
        ) : (
          <span style={{ color: "var(--text-secondary)" }}>—</span>
        ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`status-badge ${
            row.original.isActive !== false ? "status-active" : "status-inactive"
          }`}
        >
          {row.original.isActive !== false ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className="icon-btn"
            style={{ width: 28, height: 28 }}
            onClick={() =>
              navigate("/journey/edit", { state: { achievement: row.original } })
            }
          >
            <Edit size={14} />
          </button>
          <button
            className="icon-btn"
            style={{ width: 28, height: 28 }}
            onClick={() => {
              setToDelete(row.original);
              setShowDeleteModal(true);
            }}
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
            <h1>Journey & Achievements</h1>
            <p>Manage Dr. Ram Patidar timeline content shown in the app.</p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              className="btn-secondary"
              onClick={() => navigate("/journey/profile")}
            >
              <UserRound size={18} />
              Edit Profile
            </button>
            <button
              className="btn-primary"
              onClick={() => navigate("/journey/add")}
            >
              <Plus size={18} />
              Add Achievement
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
          ) : (
            <DataTable
              data={items}
              columns={columns}
              searchPlaceholder="Search year, title, type..."
            />
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setToDelete(null);
        }}
        onConfirm={handleDelete}
        personName={toDelete?.title}
        title="Delete Achievement"
      />
    </>
  );
};
