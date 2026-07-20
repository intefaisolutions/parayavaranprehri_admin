import React, { useState } from "react";
import { Plus, Filter, Edit, Trash2, Eye } from "lucide-react";
import DataTable from "../components/DataTable";
import MediaModal from "./modals/MediaModal";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";

interface Media {
  id: string;
  mediaName: string;
  mediaType: string;
  fileSize: string;
  uploadedBy: string;
  uploadDate: string;
  usedInModule: string;
  status: string;
}

export const MediaView = () => {

  const initialForm = {
    id: "",
    mediaName: "",
    mediaType: "Image",
    fileSize: "",
    uploadedBy: "",
    uploadDate: "",
    usedInModule: "",
    status: "Active",
  };

  const [mediaList, setMediaList] = useState<Media[]>(
    Array.from({ length: 100 }, (_, i) => ({
      id: `MED-${String(i + 1).padStart(3, "0")}`,
      mediaName: `Media_${i + 1}.jpg`,
      mediaType: i % 2 === 0 ? "Image" : "PDF",
      fileSize: `${(i + 1) * 2} MB`,
      uploadedBy: `Admin ${i % 5 + 1}`,
      uploadDate: "2026-02-20",
      usedInModule: i % 2 === 0 ? "News" : "Gallery",
      status: i % 2 === 0 ? "Active" : "Inactive",
    }))
  );

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(initialForm);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<Media | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (editing) {
      setMediaList((prev) =>
        prev.map((item) =>
          item.id === formData.id ? { ...item, ...formData } : item
        )
      );
    } else {
      setMediaList((prev) => [
        {
          ...formData,
          id: formData.id,
        },
        ...prev,
      ]);
    }

    setShowModal(false);
  };

  const openAddModal = () => {
    setEditing(false);
    setFormData(initialForm);
    setShowModal(true);
  };

  const openEditModal = (media: Media) => {
    setEditing(true);
    setFormData(media);
    setShowModal(true);
  };

  const openDeleteModal = (media: Media) => {
    setMediaToDelete(media);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (!mediaToDelete) return;

    setMediaList((prev) =>
      prev.filter((item) => item.id !== mediaToDelete.id)
    );

    setShowDeleteModal(false);
    setMediaToDelete(null);
  };

  const columns: ColumnDef<Media>[] = [
    {
      accessorKey: "mediaName",
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
    },
    {
      accessorKey: "uploadedBy",
      header: "Uploaded By",
      enableSorting: true,
    },
    {
      accessorKey: "uploadDate",
      header: "Upload Date",
      enableSorting: true,
    },
    {
      accessorKey: "usedInModule",
      header: "Used In Module",
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
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className="icon-btn"
            style={{ width: 28, height: 28 }}
          >
            <Eye size={14} />
          </button>

          <button
            className="icon-btn"
            style={{ width: 28, height: 28 }}
            onClick={() => openEditModal(row.original)}
          >
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
            <button className="icon-btn">
              <Filter size={18} />
            </button>

            <button
              className="btn-primary"
              onClick={openAddModal}
            >
              <Plus size={18} />
              Add Media
            </button>
          </div>
        </div>

        <div className="card">
          <DataTable
            data={mediaList}
            columns={columns}
            searchPlaceholder="Search media name, type..."
          />
        </div>
      </div>

      <MediaModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        editing={editing}
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setMediaToDelete(null);
        }}
        onConfirm={handleDelete}
        personName={mediaToDelete?.mediaName}
      />
    </>
  );
};