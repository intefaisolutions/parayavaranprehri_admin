import React, { useState } from "react";
import { Plus, Filter, Edit, Trash2, Eye } from "lucide-react";
import DataTable from "../components/DataTable";
import IdentityModal from "./modals/IdentityModal";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";

interface PersonIdentity {
  id: string;
  personName: string;
  identityId: string;
  photo: string;
  qrCode: string;
  vehicleStickerStatus: string;
  generatedDate: string;
  status: string;
}

export const IdentityView = () => {
  const initialForm = {
    id: "",
    personName: "",
    identityId: "",
    photo: "",
    qrCode: "",
    vehicleStickerStatus: "Not Generated",
    generatedDate: "",
    status: "Active",
  };

  const [identities, setIdentities] = useState<PersonIdentity[]>(
    Array.from({ length: 100 }, (_, i) => ({
      id: `PI-${String(i + 1).padStart(3, "0")}`,
      personName: `Citizen ${i + 1}`,
      identityId: `ID-${10000 + i}`,
      photo: "profile.jpg",
      qrCode: `QR-${10000 + i}`,
      vehicleStickerStatus: i % 2 === 0 ? "Generated" : "Pending",
      generatedDate: "2026-01-15",
      status: "Active",
    }))
  );

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(initialForm);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [identityToDelete, setIdentityToDelete] =
    useState<PersonIdentity | null>(null);

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
      setIdentities((prev) =>
        prev.map((item) =>
          item.id === formData.id
            ? {
                ...item,
                ...formData,
              }
            : item
        )
      );
    } else {
      setIdentities((prev) => [
        {
          id: formData.id,
          personName: formData.personName,
          identityId: formData.identityId,
          photo: formData.photo,
          qrCode: formData.qrCode,
          vehicleStickerStatus: formData.vehicleStickerStatus,
          generatedDate: formData.generatedDate,
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

  const openEditModal = (identity: PersonIdentity) => {
    setEditing(true);
    setFormData(identity);
    setShowModal(true);
  };

  const openDeleteModal = (identity: PersonIdentity) => {
    setIdentityToDelete(identity);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (!identityToDelete) return;

    setIdentities((prev) =>
      prev.filter((item) => item.id !== identityToDelete.id)
    );

    setShowDeleteModal(false);
    setIdentityToDelete(null);
  };

  const columns: ColumnDef<PersonIdentity>[] = [
    {
      accessorKey: "personName",
      header: "Person Name",
      enableSorting: true,
    },
    {
      accessorKey: "identityId",
      header: "Identity ID",
      enableSorting: true,
    },
    {
      accessorKey: "photo",
      header: "Photo",
      cell: () => (
        <img
          src="/profile.png"
          width="35"
          height="35"
          style={{ borderRadius: "50%" }}
        />
      ),
    },
    {
      accessorKey: "qrCode",
      header: "QR Code",
      cell: ({ row }) => (
        <div style={{ fontSize: "12px" }}>
          {row.original.qrCode}
        </div>
      ),
    },
    {
      accessorKey: "vehicleStickerStatus",
      header: "Vehicle Sticker Status",
      cell: ({ row }) => (
        <span
          className={`status-badge ${
            row.original.vehicleStickerStatus === "Generated"
              ? "status-active"
              : "status-inactive"
          }`}
        >
          {row.original.vehicleStickerStatus}
        </span>
      ),
    },
    {
      accessorKey: "generatedDate",
      header: "Generated Date",
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
            <h1>Person Identity Management</h1>
            <p>
              Manage citizen identity cards, QR codes and vehicle sticker status.
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
              Add Identity
            </button>
          </div>
        </div>

        <div className="card">
          <DataTable
            data={identities}
            columns={columns}
            searchPlaceholder="Search person name, identity ID..."
          />
        </div>
      </div>

      <IdentityModal
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
          setIdentityToDelete(null);
        }}
        onConfirm={handleDelete}
        personName={identityToDelete?.personName}
      />
    </>
  );
};