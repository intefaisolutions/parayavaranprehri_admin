import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Filter, Edit, Trash2, Eye, Loader2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../components/DataTable";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";
import { apiFetch } from "../utils/apiConfig";

interface Location {
  _id: string;
  locationName: string;
  locationType: string;
  parentLocation?: string;
  latitude?: number;
  longitude?: number;
  totalLinkedRecords: number;
  status: string;
  createdAt?: string;
}

export const LocationView = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(null);

  const loadLocations = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<Location[]>("/api/v1/locations");
      setLocations(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load locations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  const openDeleteModal = (loc: Location) => {
    setLocationToDelete(loc);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!locationToDelete) return;
    try {
      await apiFetch(`/api/v1/locations/${locationToDelete._id}`, { method: "DELETE" });
      await loadLocations();
    } catch (err: any) {
      setError(err.message || "Failed to delete location");
    } finally {
      setShowDeleteModal(false);
      setLocationToDelete(null);
    }
  };

  const columns: ColumnDef<Location>[] = [
    {
      accessorKey: "locationName",
      header: "Location Name",
      enableSorting: true,
    },
    {
      accessorKey: "locationType",
      header: "Location Type",
      enableSorting: true,
    },
    {
      accessorKey: "parentLocation",
      header: "Parent Location",
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
      accessorKey: "totalLinkedRecords",
      header: "Total Linked Records",
      enableSorting: true,
    },
    {
      accessorKey: "createdAt",
      header: "Created Date",
      enableSorting: true,
      cell: ({ row }) =>
        row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : "-",
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
            onClick={() => navigate("/location/edit", { state: { location: row.original } })}
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
            <h1>Location Master</h1>
            <p>Manage location hierarchy and linked records.</p>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button className="icon-btn">
              <Filter size={18} />
            </button>

            <button className="btn-primary" onClick={() => navigate("/location/add")}>
              <Plus size={18} />
              Add Location
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
              data={locations}
              columns={columns}
              searchPlaceholder="Search location name, type, parent..."
            />
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setLocationToDelete(null);
        }}
        onConfirm={handleDelete}
        personName={locationToDelete?.locationName}
        title="Delete Location"
      />
    </>
  );
};
