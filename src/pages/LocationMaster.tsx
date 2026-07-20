import React, { useState } from "react";
import { Plus, Filter, Edit, Trash2, Eye } from "lucide-react";
import DataTable from "../components/DataTable";
import LocationMasterModal from "./modals/LocationMasterModal";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";

interface Location {
  id: string;
  locationName: string;
  locationType: string;
  parentLocation: string;
  latitude: string;
  longitude: string;
  totalLinkedRecords: number;
  createdDate: string;
  status: string;
}

export const LocationView = () => {
  const initialForm = {
    id: "",
    locationName: "",
    locationType: "",
    parentLocation: "",
    latitude: "",
    longitude: "",
    totalLinkedRecords: "",
    createdDate: "",
    status: "Active",
  };

  const [locations, setLocations] = useState<Location[]>(
    Array.from({ length: 100 }, (_, i) => ({
      id: `LOC-${String(i + 1).padStart(3, "0")}`,
      locationName: `Location ${i + 1}`,
      locationType: i % 2 === 0 ? "Zone" : "Sector",
      parentLocation: `District ${i % 5 + 1}`,
      latitude: "23.2599",
      longitude: "77.4126",
      totalLinkedRecords: (i + 1) * 50,
      createdDate: "2026-01-10",
      status: i % 2 === 0 ? "Active" : "Inactive",
    }))
  );

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(initialForm);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [locationToDelete, setLocationToDelete] =
    useState<Location | null>(null);

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
      setLocations((prev) =>
        prev.map((location) =>
          location.id === formData.id
            ? {
                ...formData,
                totalLinkedRecords: Number(
                  formData.totalLinkedRecords
                ),
              }
            : location
        )
      );
    } else {
      setLocations((prev) => [
        {
          id: formData.id,
          locationName: formData.locationName,
          locationType: formData.locationType,
          parentLocation: formData.parentLocation,
          latitude: formData.latitude,
          longitude: formData.longitude,
          totalLinkedRecords: Number(formData.totalLinkedRecords),
          createdDate: formData.createdDate,
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

  const openEditModal = (location: Location) => {
    setEditing(true);
    setFormData({
      ...location,
      totalLinkedRecords: String(location.totalLinkedRecords),
    });
    setShowModal(true);
  };

  const openDeleteModal = (location: Location) => {
    setLocationToDelete(location);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (!locationToDelete) return;

    setLocations((prev) =>
      prev.filter(
        (location) => location.id !== locationToDelete.id
      )
    );

    setShowDeleteModal(false);
    setLocationToDelete(null);
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
      accessorKey: "createdDate",
      header: "Created Date",
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
            <h1>Location Master</h1>
            <p>Manage location hierarchy and linked records.</p>
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
              Add Location
            </button>
          </div>
        </div>

        <div className="card">
          <DataTable
            data={locations}
            columns={columns}
            searchPlaceholder="Search location name, type, parent..."
          />
        </div>
      </div>

      <LocationMasterModal
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
          setLocationToDelete(null);
        }}
        onConfirm={handleDelete}
        personName={locationToDelete?.locationName}
      />
    </>
  );
};