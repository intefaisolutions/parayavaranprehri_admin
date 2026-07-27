import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Filter, Edit, Trash2, Loader2, Send, Bell } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../components/DataTable";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";
import { apiFetch } from "../utils/apiConfig";

interface Notification {
  _id: string;
  notificationTitle: string;
  message: string;
  notificationType: string;
  targetAudience: string;
  locationFilter: string;
  status: string;
  scheduledAt?: string | null;
  sentAt?: string | null;
  sentBy?: string;
  deliveryCount: number;
  failureReason?: string | null;
}

export const NotificationsView = () => {
  const navigate = useNavigate();
  const [notificationList, setNotificationList] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sendingId, setSendingId] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<Notification | null>(null);

  const loadNotifications = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<Notification[]>("/api/v1/notifications");
      setNotificationList(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const openDeleteModal = (notification: Notification) => {
    setNotificationToDelete(notification);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!notificationToDelete) return;
    try {
      await apiFetch(`/api/v1/notifications/${notificationToDelete._id}`, { method: "DELETE" });
      await loadNotifications();
    } catch (err: any) {
      setError(err.message || "Failed to delete notification");
    } finally {
      setNotificationToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const handleSendNow = async (notification: Notification) => {
    setSendingId(notification._id);
    setError("");
    try {
      await apiFetch(`/api/v1/notifications/${notification._id}/send`, { method: "PATCH" });
      await loadNotifications();
    } catch (err: any) {
      setError(err.message || "Failed to send notification");
    } finally {
      setSendingId(null);
    }
  };

  const columns: ColumnDef<Notification>[] = [
    { accessorKey: "notificationTitle", header: "Notification Title", enableSorting: true },
    { accessorKey: "notificationType", header: "Type", enableSorting: true },
    { accessorKey: "targetAudience", header: "Target Audience", enableSorting: true },
    { accessorKey: "locationFilter", header: "Location Filter", enableSorting: true },
    { accessorKey: "sentBy", header: "Sent By", enableSorting: true },
    {
      accessorKey: "sentAt",
      header: "Sent Date",
      enableSorting: true,
      cell: ({ row }) =>
        row.original.sentAt ? new Date(row.original.sentAt).toLocaleDateString() : "-",
    },
    { accessorKey: "deliveryCount", header: "Delivery Count", enableSorting: true },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`status-badge ${
            row.original.status === "Sent"
              ? "status-active"
              : row.original.status === "Failed"
              ? "status-inactive"
              : "status-warning"
          }`}
          title={row.original.status === "Failed" ? row.original.failureReason || undefined : undefined}
        >
          {row.original.status}
        </span>
      ),
    },
    {
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => (
        <div style={{ display: "flex", gap: "8px" }}>
          {(row.original.status === "Draft" || row.original.status === "Scheduled") && (
            <button
              className="icon-btn"
              title="Send Now"
              style={{ width: 28, height: 28 }}
              onClick={() => handleSendNow(row.original)}
              disabled={sendingId === row.original._id}
            >
              {sendingId === row.original._id ? <Loader2 size={14} className="spin" /> : <Send size={14} />}
            </button>
          )}
          <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => navigate("/notifications/edit", { state: { notification: row.original } })}>
            <Edit size={14} />
          </button>
          <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => openDeleteModal(row.original)}>
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
            <p>Compose, schedule and send notifications to your audience.</p>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button className="icon-btn" title="Filter">
              <Filter size={18} />
            </button>
            <button className="btn-primary" onClick={() => navigate("/notifications/add")}>
              <Plus size={18} />
              Add Notification
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
          ) : notificationList.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 20px", textAlign: "center" }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(43, 150, 79, 0.08)",
                  color: "var(--accent-color)",
                  marginBottom: 16,
                }}
              >
                <Bell size={26} />
              </div>
              <h3 style={{ margin: 0, marginBottom: 6 }}>No notifications yet</h3>
              <p style={{ color: "var(--text-secondary)", marginBottom: 20 }}>
                Compose your first notification to reach your audience.
              </p>
              <button className="btn-primary" onClick={() => navigate("/notifications/add")}>
                <Plus size={18} />
                Add First Notification
              </button>
            </div>
          ) : (
            <DataTable
              data={notificationList}
              columns={columns}
              searchPlaceholder="Search by notification title..."
            />
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setNotificationToDelete(null);
        }}
        onConfirm={handleDelete}
        personName={notificationToDelete?.notificationTitle}
        title="Delete Notification"
      />
    </>
  );
};

export default NotificationsView;
