import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Filter, Edit, Trash2, Loader2, ExternalLink } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../components/DataTable";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";
import { apiFetch } from "../utils/apiConfig";

interface Media {
  _id: string;
  name: string;
  mediaType: string;
  url: string;
  fileSize?: string;
  uploadedBy?: string;
  usedInModule?: string;
  status: string;
  createdAt?: string;
}

export const MediaView = () => {
  const navigate = useNavigate();
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<Media | null>(null);

  const loadMedia = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<Media[]>("/api/v1/media");
      setMediaList(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load Media");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const openDeleteModal = (media: Media) => {
    setMediaToDelete(media);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!mediaToDelete) return;
    try {
      await apiFetch(`/api/v1/media/${mediaToDelete._id}`, { method: "DELETE" });
      await loadMedia();
    } catch (err: any) {
      setError(err.message || "Failed to delete Media");
    } finally {
      setShowDeleteModal(false);
      setMediaToDelete(null);
    }
  };

  const columns: ColumnDef<Media>[] = [
    {
      accessorKey: "name",
      header: "Media Name",
      enableSorting: true,
    },
    {
      accessorKey: "mediaType",
      header: "Media Type",
      enableSorting: true,
    },
    {
      accessorKey: "fileSize",
      header: "File Size",
      enableSorting: true,
      cell: ({ row }) => row.original.fileSize || "—",
    },
    {
      accessorKey: "uploadedBy",
      header: "Uploaded By",
      enableSorting: true,
      cell: ({ row }) => row.original.uploadedBy || "—",
    },
    {
      accessorKey: "createdAt",
      header: "Upload Date",
      enableSorting: true,
      cell: ({ row }) => (row.original.createdAt ? row.original.createdAt.slice(0, 10) : "—"),
    },
    {
      accessorKey: "usedInModule",
      header: "Used In Module",
      enableSorting: true,
      cell: ({ row }) => row.original.usedInModule || "—",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`status-badge ${
            row.original.status === "Active" ? "status-active" : "status-inactive"
          }`}
        >
          {row.original.status}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <a
            className="icon-btn"
            style={{ width: 28, height: 28, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
            href={row.original.url}
            target="_blank"
            rel="noreferrer"
            title="Open file"
          >
            <ExternalLink size={14} />
          </a>

          <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => navigate("/media/edit", { state: { media: row.original } })}>
            <Edit size={14} />
          </button>

          <button
            className="icon-btn"
            style={{ width: 28, height: 28 }}
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
            <h1>Media Management</h1>
            <p>Manage uploaded media files across the application.</p>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button className="icon-btn" title="Filter">
              <Filter size={18} />
            </button>

            <button className="btn-primary" onClick={() => navigate("/media/add")}>
              <Plus size={18} />
              Upload Media
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
          ) : (
            <DataTable
              data={mediaList}
              columns={columns}
              searchPlaceholder="Search media name, type..."
            />
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setMediaToDelete(null);
        }}
        onConfirm={handleDelete}
        personName={mediaToDelete?.name}
        title="Delete Media"
      />
    </>
  );
};
