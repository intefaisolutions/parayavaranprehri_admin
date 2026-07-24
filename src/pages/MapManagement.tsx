import React, { useEffect, useState } from "react";
import { Plus, Filter, Edit, Trash2, Eye, Loader2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../components/DataTable";
import MapManagementModal from "./modals/MapManagementModal";
import type { MapFormData } from "./modals/MapManagementModal";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";
import { apiFetch } from "../utils/apiConfig";

interface MapRecord {
  _id: string;
  locationName: string;
  treeCount: number;
  latitude?: number;
  longitude?: number;
  plantationArea?: string;
  addedBy?: string;
  status: string;
  updatedAt?: string;
}

const initialForm: MapFormData = {
  locationName: "",
  treeCount: "",
  latitude: "",
  longitude: "",
  plantationArea: "",
  addedBy: "",
  status: "Active",
};

export const MapView = () => {
  const [maps, setMaps] = useState<MapRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<MapFormData>(initialForm);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [mapToDelete, setMapToDelete] = useState<MapRecord | null>(null);

  const loadMaps = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<MapRecord[]>("/api/v1/maps");
      setMaps(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load map records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaps();
  }, []);

  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const { _id, ...rest } = formData;
    const payload = {
      ...rest,
      treeCount: rest.treeCount === "" ? undefined : Number(rest.treeCount),
      latitude: rest.latitude === "" ? undefined : Number(rest.latitude),
      longitude: rest.longitude === "" ? undefined : Number(rest.longitude),
    };

    try {
      if (editing && _id) {
        await apiFetch(`/api/v1/maps/${_id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/v1/maps", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      setShowModal(false);
      await loadMaps();
    } catch (err: any) {
      setError(err.message || "Failed to save map record");
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

  const openEditModal = (item: MapRecord) => {
    setEditing(true);
    setError("");
    setFormData({
      _id: item._id,
      locationName: item.locationName,
      treeCount: String(item.treeCount ?? 0),
      latitude: item.latitude !== undefined ? String(item.latitude) : "",
      longitude: item.longitude !== undefined ? String(item.longitude) : "",
      plantationArea: item.plantationArea || "",
      addedBy: item.addedBy || "",
      status: item.status,
    });
    setShowModal(true);
  };

  const openDeleteModal = (item: MapRecord) => {
    setMapToDelete(item);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!mapToDelete) return;
    try {
      await apiFetch(`/api/v1/maps/${mapToDelete._id}`, { method: "DELETE" });
      await loadMaps();
    } catch (err: any) {
      setError(err.message || "Failed to delete map record");
    } finally {
      setShowDeleteModal(false);
      setMapToDelete(null);
    }
  };

  const columns: ColumnDef<MapRecord>[] = [
    {
      accessorKey: "locationName",
      header: "Location Name",
      enableSorting: true,
    },
    {
      accessorKey: "treeCount",
      header: "Tree Count",
      enableSorting: true,
    },
    {
      accessorKey: "latitude",
      header: "Latitude",
      enableSorting: true,
    },
    {
      accessorKey: "longitude",
      header: "Longitude",
      enableSorting: true,
    },
    {
      accessorKey: "plantationArea",
      header: "Plantation Area",
      enableSorting: true,
    },
    {
      accessorKey: "addedBy",
      header: "Added By",
      enableSorting: true,
    },
    {
      accessorKey: "updatedAt",
      header: "Last Updated",
      enableSorting: true,
      cell: ({ row }) =>
        row.original.updatedAt ? new Date(row.original.updatedAt).toLocaleDateString() : "-",
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
      enableSorting: false,
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="icon-btn" style={{ width: 28, height: 28 }}>
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
      enableSorting: false,
    },
  ];

  return (
    <>
      <div className="dashboard-area">
        <div className="page-header">
          <div className="page-title">
            <h1>Map Management</h1>
            <p>Manage plantation locations, tree mapping and geographical records.</p>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button className="icon-btn">
              <Filter size={18} />
            </button>

            <button className="btn-primary" onClick={openAddModal}>
              <Plus size={18} />
              Add Map Record
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
            <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
              <Loader2 size={24} className="spin" />
            </div>
          ) : (
            <DataTable
              data={maps}
              columns={columns}
              searchPlaceholder="Search location, added by..."
            />
          )}
        </div>
      </div>

      <MapManagementModal
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
          setMapToDelete(null);
        }}
        onConfirm={handleDelete}
        personName={mapToDelete?.locationName}
        title="Delete Map Record"
      />
    </>
  );
};
