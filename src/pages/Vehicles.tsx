import React, { useEffect, useState } from "react";
import { Plus, Filter, Edit, Trash2, Loader2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../components/DataTable";
import VehicleModal from "./modals/VehicleModal";
import type { VehicleFormData } from "./modals/VehicleModal";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";
import { apiFetch } from "../utils/apiConfig";

interface Vehicle {
  _id: string;
  plate: string;
  name: string;
  vhId: string;
  fuel: string;
  insuranceId?: string;
  userId?: string;
  createdAt?: string;
}

const initialForm: VehicleFormData = {
  plate: "",
  name: "",
  vhId: "",
  fuel: "",
  insuranceId: "",
};

export const VehiclesView = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<VehicleFormData>(initialForm);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

  const loadVehicles = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<Vehicle[]>("/api/v1/vehicles");
      setVehicles(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const { _id, ...payload } = formData;

    try {
      if (editing && _id) {
        await apiFetch(`/api/v1/vehicles/${_id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/v1/vehicles", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      setShowModal(false);
      await loadVehicles();
    } catch (err: any) {
      setError(err.message || "Failed to save vehicle");
    } finally {
      setSubmitting(false);
    }
  };

  const openAddModal = () => {
    setEditing(false);
    setFormData(initialForm);
    setShowModal(true);
  };

  const openEditModal = (vehicle: Vehicle) => {
    setEditing(true);
    setFormData({
      _id: vehicle._id,
      plate: vehicle.plate,
      name: vehicle.name,
      vhId: vehicle.vhId,
      fuel: vehicle.fuel,
      insuranceId: vehicle.insuranceId || "",
    });
    setShowModal(true);
  };

  const openDeleteModal = (vehicle: Vehicle) => {
    setVehicleToDelete(vehicle);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!vehicleToDelete) return;
    try {
      await apiFetch(`/api/v1/vehicles/${vehicleToDelete._id}`, { method: "DELETE" });
      await loadVehicles();
    } catch (err: any) {
      setError(err.message || "Failed to delete vehicle");
    } finally {
      setVehicleToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const columns: ColumnDef<Vehicle>[] = [
    { accessorKey: "plate", header: "Plate Number", enableSorting: true },
    { accessorKey: "name", header: "Vehicle Name", enableSorting: true },
    { accessorKey: "vhId", header: "Vehicle ID", enableSorting: true },
    {
      accessorKey: "fuel",
      header: "Fuel Type",
      cell: ({ row }) => <span className="status-badge status-active">{row.original.fuel}</span>,
      enableSorting: true,
    },
    {
      accessorKey: "insuranceId",
      header: "Insurance ID",
      cell: ({ row }) => <span>{row.original.insuranceId || "-"}</span>,
      enableSorting: false,
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div style={{ display: "flex", gap: "8px" }}>
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
            <h1>Vehicle Management</h1>
            <p>Manage registered vehicles and their fuel & insurance details.</p>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button className="icon-btn">
              <Filter size={18} />
            </button>

            <button className="btn-primary" onClick={openAddModal}>
              <Plus size={18} />
              Add Vehicle
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
              data={vehicles}
              columns={columns}
              searchPlaceholder="Search plate number, vehicle name, ID..."
            />
          )}
        </div>
      </div>

      <VehicleModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        editing={editing}
        formData={formData}
        submitting={submitting}
        onFieldChange={handleFieldChange}
        handleSubmit={handleSubmit}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setVehicleToDelete(null);
        }}
        onConfirm={handleDelete}
        personName={vehicleToDelete?.plate}
        title="Delete Vehicle"
      />
    </>
  );
};
