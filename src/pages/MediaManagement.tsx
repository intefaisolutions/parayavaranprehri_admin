import React, { useEffect, useState } from "react";
import { Plus, Filter, Edit, Trash2, Eye, Loader2, ExternalLink } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../components/DataTable";
import MediaModal from "./modals/MediaModal";
import type { MediaFormData } from "./modals/MediaModal";
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

const initialForm: MediaFormData = {
  name: "",
  mediaType: "Image",
  url: "",
  fileSize: "",
  uploadedBy: "",
  usedInModule: "",
  status: "Active",
};

export const MediaView = () => {
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<MediaFormData>(initialForm);

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

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const { _id, ...payload } = formData;

    try {
      if (editing && _id) {
        await apiFetch(`/api/v1/media/${_id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/v1/media", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      setShowModal(false);
      await loadMedia();
    } catch (err: any) {
      setError(err.message || "Failed to save Media");
    } finally {
      setSubmitting(false);
    }
  };

  const openAddModal = () => {
    setEditing(false);
    setError("");
    setFormData(initialForm);
    setShowModal(true);
  };

  const openEditModal = (media: Media) => {
    setEditing(true);
    setError("");
    setFormData({
      _id: media._id,
      name: media.name,
      mediaType: media.mediaType,
      url: media.url,
      fileSize: media.fileSize || "",
      uploadedBy: media.uploadedBy || "",
      usedInModule: media.usedInModule || "",
      status: media.status,
    });
    setShowModal(true);
  };

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

          <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => openEditModal(row.original)}>
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

            <button className="btn-primary" onClick={openAddModal}>
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

      <MediaModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        editing={editing}
        formData={formData}
        submitting={submitting}
        error={error}
        onFieldChange={handleFieldChange}
        handleSubmit={handleSubmit}
      />

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
