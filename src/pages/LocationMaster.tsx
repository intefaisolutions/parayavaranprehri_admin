import React, { useEffect, useState } from "react";
import { Plus, Filter, Edit, Trash2, Eye, Loader2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../components/DataTable";
import LocationMasterModal from "./modals/LocationMasterModal";
import type { LocationFormData } from "./modals/LocationMasterModal";
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

const initialForm: LocationFormData = {
  locationName: "",
  locationType: "State",
  parentLocation: "",
  latitude: "",
  longitude: "",
  totalLinkedRecords: "",
  status: "Active",
};

export const LocationView = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<LocationFormData>(initialForm);

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
      latitude: rest.latitude === "" ? undefined : Number(rest.latitude),
      longitude: rest.longitude === "" ? undefined : Number(rest.longitude),
      totalLinkedRecords:
        rest.totalLinkedRecords === "" ? undefined : Number(rest.totalLinkedRecords),
    };

    try {
      if (editing && _id) {
        await apiFetch(`/api/v1/locations/${_id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/v1/locations", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      setShowModal(false);
      await loadLocations();
    } catch (err: any) {
      setError(err.message || "Failed to save location");
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

  const openEditModal = (location: Location) => {
    setEditing(true);
    setError("");
    setFormData({
      _id: location._id,
      locationName: location.locationName,
      locationType: location.locationType,
      parentLocation: location.parentLocation || "",
      latitude: location.latitude !== undefined ? String(location.latitude) : "",
      longitude: location.longitude !== undefined ? String(location.longitude) : "",
      totalLinkedRecords: String(location.totalLinkedRecords ?? 0),
      status: location.status,
    });
    setShowModal(true);
  };

  const openDeleteModal = (location: Location) => {
    setLocationToDelete(location);
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
            <h1>Location Master</h1>
            <p>Manage location hierarchy and linked records.</p>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button className="icon-btn">
              <Filter size={18} />
            </button>

            <button className="btn-primary" onClick={openAddModal}>
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

      <LocationMasterModal
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
          setLocationToDelete(null);
        }}
        onConfirm={handleDelete}
        personName={locationToDelete?.locationName}
        title="Delete Location"
      />
    </>
  );
};
