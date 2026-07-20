import React, { useState } from "react";
import { Plus, Filter, Edit, Trash2, Eye } from "lucide-react";
import DataTable from "../components/DataTable";
import CallCenterModal from "./modals/CallCenterModal";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";

interface CallCenter {
  id: string;
  contactType: string;
  contactValue: string;
  availableHours: string;
  assignedPerson: string;
  lastUpdated: string;
  status: string;
}

export const CallCenterView = () => {
  const initialForm = {
    id: "",
    contactType: "Phone",
    contactValue: "",
    availableHours: "",
    assignedPerson: "",
    lastUpdated: "",
    status: "Active",
  };

  const [callCenterList, setCallCenterList] = useState<CallCenter[]>(
    Array.from({ length: 100 }, (_, i) => ({
      id: `CALL-${String(i + 1).padStart(3, "0")}`,
      contactType: i % 2 === 0 ? "Phone" : "Email",
      contactValue:
        i % 2 === 0
          ? `+91 987654${String(i).padStart(4, "0")}`
          : `support${i + 1}@company.com`,
      availableHours:
        i % 2 === 0
          ? "09:00 AM - 06:00 PM"
          : "24x7",
      assignedPerson:
        `Agent ${i % 5 + 1}`,
      lastUpdated:
        "2026-02-20",
      status:
        i % 2 === 0
          ? "Active"
          : "Inactive",
    }))
  );

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [callToDelete, setCallToDelete] = useState<CallCenter | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (editing) {
      setCallCenterList((prev) =>
        prev.map((item) =>
          item.id === formData.id
            ? { ...item, ...formData }
            : item
        )
      );
    } else {
      setCallCenterList((prev) => [
        {
          ...formData,
          id: `CALL-${Date.now()}`,
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

  const openEditModal = (
    call: CallCenter
  ) => {
    setEditing(true);
    setFormData(call);
    setShowModal(true);
  };

  const openDeleteModal = (
    call: CallCenter
  ) => {
    setCallToDelete(call);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (!callToDelete) return;

    setCallCenterList((prev) =>
      prev.filter(
        (item) =>
          item.id !== callToDelete.id
      )
    );

    setShowDeleteModal(false);
    setCallToDelete(null);
  };

  const columns: ColumnDef<CallCenter>[] = [
    {
      accessorKey: "contactType",
      header: "Contact Type",
      enableSorting: true,
    },
    {
      accessorKey: "contactValue",
      header: "Contact Value",
      enableSorting: true,
    },
    {
      accessorKey: "availableHours",
      header: "Available Hours",
      enableSorting: true,
    },
    {
      accessorKey: "assignedPerson",
      header: "Assigned Person",
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
          <button className="icon-btn">
            <Eye size={14} />
          </button>

          <button
            className="icon-btn"
            onClick={() =>
              openEditModal(row.original)
            }
          >
            <Edit size={14} />
          </button>

          <button
            className="icon-btn"
            onClick={() =>
              openDeleteModal(row.original)
            }
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
            <h1>Call Center</h1>
            <p>
              Manage call center contacts and availability.
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
              Add Contact
            </button>
          </div>
        </div>

        <div className="card">
          <DataTable
            data={callCenterList}
            columns={columns}
            searchPlaceholder="Search contact type, value..."
          />
        </div>
      </div>

      <CallCenterModal
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
          setCallToDelete(null);
        }}
        onConfirm={handleDelete}
        personName={callToDelete?.contactValue}
      />
    </>
  );
};