import React, { useEffect, useState } from "react";
import { Plus, Filter, Edit, Trash2, Loader2, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../components/DataTable";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";
import { apiFetch } from "../utils/apiConfig";

interface Task {
  _id: string;
  taskTitle: string;
  description?: string;
  taskType: string;
  assignedMitra?: string;
  state?: string;
  district?: string;
  vidhanSabha?: string;
  landName?: string;
  assignedTreeName?: string;
  treeAssignment?: string;
  dueDate: string;
  priority: string;
  status: string;
  proofDescription?: string;
  proofMediaUrl?: string;
}

export const TasksView = () => {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const loadTasks = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<Task[]>("/api/v1/tasks");
      setTasks(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const openAddPage = () => navigate("/tasks/add");
  const openEditPage = (task: Task) => navigate("/tasks/edit", { state: { task } });

  const openDeleteModal = (task: Task) => {
    setTaskToDelete(task);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!taskToDelete) return;
    try {
      await apiFetch(`/api/v1/tasks/${taskToDelete._id}`, { method: "DELETE" });
      await loadTasks();
    } catch (err: any) {
      setError(err.message || "Failed to delete task");
    } finally {
      setTaskToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const columns: ColumnDef<Task>[] = [
    { accessorKey: "taskTitle", header: "Task Title", enableSorting: true },
    { accessorKey: "taskType", header: "Task Type", enableSorting: true },
    { accessorKey: "assignedMitra", header: "Assigned Mitra", enableSorting: true },
    { accessorKey: "vidhanSabha", header: "Vidhan Sabha", enableSorting: true },
    { accessorKey: "landName", header: "Land", enableSorting: true },
    {
      id: "tree",
      header: "Tree",
      cell: ({ row }) => {
        if (row.original.treeAssignment === "ALL") return "All trees";
        return row.original.assignedTreeName || "—";
      },
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      enableSorting: true,
      cell: ({ row }) =>
        row.original.dueDate ? new Date(row.original.dueDate).toLocaleDateString() : "-",
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => (
        <span
          className={`status-badge ${
            row.original.priority === "High" ? "status-inactive" : "status-active"
          }`}
        >
          {row.original.priority}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`status-badge ${
            row.original.status === "Completed"
              ? "status-active"
              : row.original.status === "In Progress"
              ? "status-warning"
              : "status-inactive"
          }`}
        >
          {row.original.status}
        </span>
      ),
    },
    {
      id: "proof",
      header: "Proof of Work",
      cell: ({ row }) => (
        row.original.status === "Completed" ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div title={row.original.proofDescription} style={{ fontSize: '0.85em', color: '#666', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {row.original.proofDescription || 'No description'}
            </div>
            {row.original.proofMediaUrl && (
              <a href={row.original.proofMediaUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.85em', color: '#059669', textDecoration: 'underline' }}>
                View Media
              </a>
            )}
          </div>
        ) : "-"
      ),
    },
    {
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => openEditPage(row.original)}>
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
            <h1>Task Management</h1>
            <p>Manage assigned tasks, priorities and completion status.</p>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button className="icon-btn" title="Filter">
              <Filter size={18} />
            </button>
            <button className="btn-primary" onClick={openAddPage}>
              <Plus size={18} />
              Add Task
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
          ) : tasks.length === 0 ? (
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
                <ClipboardList size={26} />
              </div>
              <h3 style={{ margin: 0, marginBottom: 6 }}>No tasks yet</h3>
              <p style={{ color: "var(--text-secondary)", marginBottom: 20 }}>
                Create your first task to start assigning work to Mitras.
              </p>
              <button className="btn-primary" onClick={openAddPage}>
                <Plus size={18} />
                Add First Task
              </button>
            </div>
          ) : (
            <DataTable
              data={tasks}
              columns={columns}
              searchPlaceholder="Search by title, mitra, land, vidhan sabha..."
            />
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setTaskToDelete(null);
        }}
        onConfirm={handleDelete}
        personName={taskToDelete?.taskTitle}
        title="Delete Task"
      />
    </>
  );
};

export default TasksView;
