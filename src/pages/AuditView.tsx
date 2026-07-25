import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Filter, Edit, Trash2, Loader2, ClipboardList } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../components/DataTable";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";
import { apiFetch } from "../utils/apiConfig";

interface AuditLog {
  _id: string;
  userName: string;
  role?: string;
  moduleName: string;
  actionType: string;
  recordId?: string;
  description?: string;
  ipAddress?: string;
  dateTime: string;
}

export const AuditView = () => {
  const navigate = useNavigate();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [logToDelete, setLogToDelete] = useState<AuditLog | null>(null);

  const loadLogs = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<AuditLog[]>(
        "/api/v1/audit-logs?limit=100&sortBy=dateTime&sortOrder=desc"
      );
      setLogs(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const openAdd = () => navigate("/audit/add");
  const openEdit = (log: AuditLog) => navigate("/audit/edit", { state: { audit: log } });

  const openDeleteModal = (log: AuditLog) => {
    setLogToDelete(log);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!logToDelete) return;
    try {
      await apiFetch(`/api/v1/audit-logs/${logToDelete._id}`, { method: "DELETE" });
      await loadLogs();
    } catch (err: any) {
      setError(err.message || "Failed to delete audit log");
    } finally {
      setLogToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const columns: ColumnDef<AuditLog>[] = [
    { accessorKey: "userName", header: "User Name", enableSorting: true },
    { accessorKey: "role", header: "Role", enableSorting: true, cell: ({ row }) => row.original.role || "—" },
    { accessorKey: "moduleName", header: "Module Name", enableSorting: true },
    {
      accessorKey: "actionType",
      header: "Action Type",
      enableSorting: true,
      cell: ({ row }) => (
        <span
          className={`status-badge ${
            row.original.actionType === "Delete"
              ? "status-inactive"
              : row.original.actionType === "Create"
              ? "status-active"
              : "status-warning"
          }`}
        >
          {row.original.actionType}
        </span>
      ),
    },
    { accessorKey: "recordId", header: "Record ID", enableSorting: true, cell: ({ row }) => row.original.recordId || "—" },
    { accessorKey: "description", header: "Description", enableSorting: true, cell: ({ row }) => row.original.description || "—" },
    { accessorKey: "ipAddress", header: "IP Address", enableSorting: true, cell: ({ row }) => row.original.ipAddress || "—" },
    {
      accessorKey: "dateTime",
      header: "Date & Time",
      enableSorting: true,
      cell: ({ row }) => (row.original.dateTime ? new Date(row.original.dateTime).toLocaleString() : "—"),
    },
    {
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => openEdit(row.original)}>
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
            <h1>Audit Logs</h1>
            <p>Track user activities and system changes.</p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button className="icon-btn" title="Filter">
              <Filter size={18} />
            </button>
            <button className="btn-primary" onClick={openAdd}>
              <Plus size={18} />
              Add Log Entry
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
          ) : logs.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "60px 20px",
                textAlign: "center",
                color: "var(--text-secondary)",
              }}
            >
              <ClipboardList size={40} style={{ marginBottom: 16, opacity: 0.5 }} />
              <p style={{ marginBottom: 16 }}>No audit log entries recorded yet.</p>
              <button className="btn-primary" onClick={openAdd}>
                <Plus size={18} />
                Add your first log entry
              </button>
            </div>
          ) : (
            <DataTable data={logs} columns={columns} searchPlaceholder="Search user, module, record..." />
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setLogToDelete(null);
        }}
        onConfirm={handleDelete}
        personName={logToDelete?.userName}
        title="Delete Audit Log"
      />
    </>
  );
};

export default AuditView;
