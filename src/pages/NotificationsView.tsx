import React, { useState } from "react";
import { Plus, Filter, Edit, Trash2, Eye } from "lucide-react";
import DataTable from "../components/DataTable";
import NotificationModal from "./modals/NotificationModal";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";

interface Notification {
  id: string;
  notificationTitle: string;
  targetAudience: string;
  locationFilter: string;
  sentBy: string;
  sentDate: string;
  deliveryCount: number;
  status: string;
}

export const NotificationsView = () => {
  const initialForm = {
    id: "",
    notificationTitle: "",
    targetAudience: "All Users",
    locationFilter: "",
    sentBy: "",
    sentDate: "",
    deliveryCount: 0,
    status: "Sent",
  };

  const [notificationList, setNotificationList] = useState<Notification[]>(
    Array.from({ length: 100 }, (_, i) => ({
      id: `NOT-${String(i + 1).padStart(3, "0")}`,
      notificationTitle: `Notification ${i + 1}`,
      targetAudience: i % 2 === 0 ? "All Users" : "Customers",
      locationFilter: i % 2 === 0 ? "All Locations" : "Delhi",
      sentBy: `Admin ${i % 5 + 1}`,
      sentDate: "2026-02-20",
      deliveryCount: (i + 1) * 250,
      status: i % 2 === 0 ? "Sent" : "Draft",
    }))
  );

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notificationToDelete, setNotificationToDelete] =
    useState<Notification | null>(null);

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
      setNotificationList((prev) =>
        prev.map((item) =>
          item.id === formData.id
            ? { ...item, ...formData }
            : item
        )
      );
    } else {
      setNotificationList((prev) => [
        {
          ...formData,
          id: `NOT-${Date.now()}`,
          deliveryCount: Number(formData.deliveryCount),
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
    notification: Notification
  ) => {
    setEditing(true);
    setFormData(notification);
    setShowModal(true);
  };

  const openDeleteModal = (
    notification: Notification
  ) => {
    setNotificationToDelete(notification);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (!notificationToDelete) return;

    setNotificationList((prev) =>
      prev.filter(
        (item) =>
          item.id !== notificationToDelete.id
      )
    );

    setShowDeleteModal(false);
    setNotificationToDelete(null);
  };

  const columns: ColumnDef<Notification>[] = [
    {
      accessorKey: "notificationTitle",
      header: "Notification Title",
      enableSorting: true,
    },
    {
      accessorKey: "targetAudience",
      header: "Target Audience",
      enableSorting: true,
    },
    {
      accessorKey: "locationFilter",
      header: "Location Filter",
      enableSorting: true,
    },
    {
      accessorKey: "sentBy",
      header: "Sent By",
      enableSorting: true,
    },
    {
      accessorKey: "sentDate",
      header: "Sent Date",
      enableSorting: true,
    },
    {
      accessorKey: "deliveryCount",
      header: "Delivery Count",
      enableSorting: true,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`status-badge ${
            row.original.status === "Sent"
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
            <h1>Notifications</h1>
            <p>
              Manage system notifications and delivery records.
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
              Add Notification
            </button>
          </div>
        </div>

        <div className="card">
          <DataTable
            data={notificationList}
            columns={columns}
            searchPlaceholder="Search notification title..."
          />
        </div>
      </div>

      <NotificationModal
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
          setNotificationToDelete(null);
        }}
        onConfirm={handleDelete}
        personName={
          notificationToDelete?.notificationTitle
        }
      />
    </>
  );
};