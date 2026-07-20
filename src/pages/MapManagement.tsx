import React, { useState } from "react";
import { Plus, Filter, Edit, Trash2, Eye } from "lucide-react";
import DataTable from "../components/DataTable";
import MapManagementModal from "./modals/MapManagementModal";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";

interface MapRecord {
  id: string;
  locationName: string;
  treeCount: number;
  latitude: string;
  longitude: string;
  plantationArea: string;
  addedBy: string;
  lastUpdated: string;
  status: string;
}

export const MapView = () => {
  const initialForm = {
    id: "",
    locationName: "",
    treeCount: "",
    latitude: "",
    longitude: "",
    plantationArea: "",
    addedBy: "",
    lastUpdated: "",
    status: "Active",
  };

  const [maps, setMaps] = useState<MapRecord[]>(
    Array.from({ length: 100 }, (_, i) => ({
      id: `MAP-${String(i + 1).padStart(3, "0")}`,
      locationName: `Plantation Area ${i + 1}`,
      treeCount: (i + 1) * 250,
      latitude: "23.2599",
      longitude: "77.4126",
      plantationArea: `${(i + 1) * 2} Acres`,
      addedBy: `Admin ${i + 1}`,
      lastUpdated: "2026-02-10",
      status: i % 2 === 0 ? "Active" : "Inactive",
    }))
  );

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(initialForm);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [mapToDelete, setMapToDelete] = useState<MapRecord | null>(null);

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
      setMaps((prev) =>
        prev.map((item) =>
          item.id === formData.id
            ? {
                ...formData,
                treeCount: Number(formData.treeCount),
              }
            : item
        )
      );
    } else {
      setMaps((prev) => [
        {
          id: formData.id,
          locationName: formData.locationName,
          treeCount: Number(formData.treeCount),
          latitude: formData.latitude,
          longitude: formData.longitude,
          plantationArea: formData.plantationArea,
          addedBy: formData.addedBy,
          lastUpdated: formData.lastUpdated,
          status: formData.status,
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

  const openEditModal = (item: MapRecord) => {
    setEditing(true);
    setFormData({
      ...item,
      treeCount: String(item.treeCount),
    });
    setShowModal(true);
  };

  const openDeleteModal = (item: MapRecord) => {
    setMapToDelete(item);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (!mapToDelete) return;

    setMaps((prev) =>
      prev.filter((item) => item.id !== mapToDelete.id)
    );

    setShowDeleteModal(false);
    setMapToDelete(null);
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
      accessorKey: "lastUpdated",
      header: "Last Updated",
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
            <h1>Map Management</h1>
            <p>
              Manage plantation locations, tree mapping and geographical records.
            </p>
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
              Add Map Record
            </button>
          </div>
        </div>

        <div className="card">
          <DataTable
            data={maps}
            columns={columns}
            searchPlaceholder="Search location, added by..."
          />
        </div>
      </div>

      <MapManagementModal
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
          setMapToDelete(null);
        }}
        onConfirm={handleDelete}
        personName={mapToDelete?.locationName}
      />
    </>
  );
};