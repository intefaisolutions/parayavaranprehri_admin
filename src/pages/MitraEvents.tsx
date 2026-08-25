import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Loader2, Users } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../components/DataTable";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";
import { apiFetch } from "../utils/apiConfig";

interface MitraEvent {
  _id: string;
  title: string;
  date: string;
  time?: string;
  location: string;
  organizer?: string;
  description?: string;
  eventType?: string;
  isActive?: boolean;
  offlineDetails?: {
    venue?: string;
    city?: string;
  };
  onlineDetails?: {
    platform?: string;
  };
}

const toDate = (value?: string) => (value ? value.slice(0, 10) : "—");

export const MitraEventsView = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<MitraEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toDelete, setToDelete] = useState<MitraEvent | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<MitraEvent[]>(
        "/api/v1/mitra-events?includeInactive=true",
      );
      setItems(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Failed to load Mitra events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await apiFetch(`/api/v1/mitra-events/${toDelete._id}`, {
        method: "DELETE",
      });
      await load();
    } catch (err: any) {
      setError(err.message || "Failed to delete event");
    } finally {
      setShowDeleteModal(false);
      setToDelete(null);
    }
  };

  const columns: ColumnDef<MitraEvent>[] = [
    { accessorKey: "title", header: "Title", enableSorting: true },
    {
      accessorKey: "date",
      header: "Date",
      enableSorting: true,
      cell: ({ row }) => toDate(row.original.date),
    },
    { accessorKey: "time", header: "Time" },
    {
      accessorKey: "eventType",
      header: "Type",
      cell: ({ row }) => {
        const type = row.original.eventType || "Offline";
        return (
          <span className={`status-badge ${type === "Online" ? "status-info" : type === "Hybrid" ? "status-warning" : "status-active"}`}>
            {type}
          </span>
        );
      },
    },
    {
      accessorKey: "location",
      header: "Location",
      enableSorting: true,
      cell: ({ row }) => {
        const ev = row.original;
        if (ev.eventType === "Online") {
          return ev.onlineDetails?.platform || "Online";
        }
        if (ev.eventType === "Hybrid") {
          const loc = ev.offlineDetails?.city || ev.offlineDetails?.venue || ev.location;
          return loc ? `${loc} + Online` : "Hybrid (Online + Offline)";
        }
        return ev.offlineDetails?.city || ev.offlineDetails?.venue || ev.location || "—";
      },
    },
    { accessorKey: "organizer", header: "Organizer" },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`status-badge ${
            row.original.isActive !== false ? "status-active" : "status-inactive"
          }`}
        >
          {row.original.isActive !== false ? "Active" : "Inactive"}
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
            title="Attendance"
            onClick={() =>
              navigate("/mitra-events/attendance", {
                state: { event: row.original },
              })
            }
          >
            <Users size={14} />
          </button>
          <button
            className="icon-btn"
            style={{ width: 28, height: 28 }}
            onClick={() =>
              navigate("/mitra-events/edit", { state: { event: row.original } })
            }
          >
            <Edit size={14} />
          </button>
          <button
            className="icon-btn"
            style={{ width: 28, height: 28 }}
            onClick={() => {
              setToDelete(row.original);
              setShowDeleteModal(true);
            }}
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
            <h1>Mitra Events</h1>
            <p>Create events and review Mitra attendance from the field app.</p>
          </div>
          <button
            className="btn-primary"
            onClick={() => navigate("/mitra-events/add")}
          >
            <Plus size={18} />
            Add Event
          </button>
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
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "40px",
              }}
            >
              <Loader2 size={24} className="spin" />
            </div>
          ) : (
            <DataTable
              data={items}
              columns={columns}
              searchPlaceholder="Search events..."
            />
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setToDelete(null);
        }}
        onConfirm={handleDelete}
        personName={toDelete?.title}
        title="Delete Event"
      />
    </>
  );
};
