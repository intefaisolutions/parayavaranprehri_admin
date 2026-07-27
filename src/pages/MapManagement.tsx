import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Filter, Edit, Trash2, Eye, Loader2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../components/DataTable";
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

export const MapView = () => {
  const navigate = useNavigate();
  const [maps, setMaps] = useState<MapRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
            onClick={() => navigate("/map/edit", { state: { mapRecord: row.original } })}
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

            <button className="btn-primary" onClick={() => navigate("/map/add")}>
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
