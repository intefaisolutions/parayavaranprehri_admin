import React, { useState } from "react";
import { Plus, Filter, Edit, Trash2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../components/DataTable";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";

interface Task {
  id: string;
  taskTitle: string;
  taskType: string;
  assignedMitra: string;
  vidhanSabha: string;
  zone: string;
  sector: string;
  dueDate: string;
  priority: string;
  status: string;
}

export const TasksView = () => {
  const initialForm = {
    id: "",
    taskTitle: "",
    taskType: "",
    assignedMitra: "",
    vidhanSabha: "",
    zone: "",
    sector: "",
    dueDate: "",
    priority: "Medium",
    status: "Pending",
  };

  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>(
    Array.from({ length: 100 }, (_, i) => ({
      id: `TSK-${String(i + 1).padStart(3, "0")}`,
      taskTitle: `Plantation Survey ${i + 1}`,
      taskType: i % 2 === 0 ? "Survey" : "Plantation",
      assignedMitra: `Mitra ${i + 1}`,
      vidhanSabha: `Vidhan Sabha ${i + 1}`,
      zone: `Zone ${i % 5 + 1}`,
      sector: `Sector ${i % 10 + 1}`,
      dueDate: "2026-02-15",
      priority: i % 3 === 0 ? "High" : "Medium",
      status: i % 2 === 0 ? "Pending" : "Completed",
    }))
  );

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(initialForm);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

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
      setTasks((prev) =>
        prev.map((task) =>
          task.id === formData.id ? { ...formData } : task
        )
      );
    } else {
      setTasks((prev) => [
        {
          id: formData.id,
          taskTitle: formData.taskTitle,
          taskType: formData.taskType,
          assignedMitra: formData.assignedMitra,
          vidhanSabha: formData.vidhanSabha,
          zone: formData.zone,
          sector: formData.sector,
          dueDate: formData.dueDate,
          priority: formData.priority,
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

  const openEditModal = (task: Task) => {
    setEditing(true);
    setFormData(task);
    setShowModal(true);
  };

  const openDeleteModal = (task: Task) => {
    setTaskToDelete(task);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (!taskToDelete) return;

    setTasks((prev) =>
      prev.filter((task) => task.id !== taskToDelete.id)
    );

    setShowDeleteModal(false);
    setTaskToDelete(null);
  };

  const columns: ColumnDef<Task>[] = [
    {
      accessorKey: "id",
      header: "Task ID",
      enableSorting: true,
    },
    {
      accessorKey: "taskTitle",
      header: "Task Title",
      enableSorting: true,
    },
    {
      accessorKey: "taskType",
      header: "Task Type",
      enableSorting: true,
    },
    {
      accessorKey: "assignedMitra",
      header: "Assigned Mitra",
      enableSorting: true,
    },
    {
      accessorKey: "vidhanSabha",
      header: "Vidhan Sabha",
      enableSorting: true,
    },
    {
      accessorKey: "zone",
      header: "Zone",
      enableSorting: true,
    },
    {
      accessorKey: "sector",
      header: "Sector",
      enableSorting: true,
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      enableSorting: true,
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => (
        <span
          className={`status-badge ${
            row.original.priority === "High"
              ? "status-inactive"
              : "status-active"
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
            onClick={() =>
              navigate("/tasks/edit", {
                state: { task: row.original },
              })
            }
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
            <h1>Task Management</h1>
            <p>Manage assigned tasks, priorities and completion status.</p>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button className="icon-btn">
              <Filter size={18} />
            </button>

            <button
              className="btn-primary"
              onClick={() => navigate("/tasks/add")}
            >
              <Plus size={18} />
              Add Task
            </button>
          </div>
        </div>

        <div className="card">
          <DataTable
            data={tasks}
            columns={columns}
            searchPlaceholder="Search task ID, title, mitra..."
          />
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
      />
    </>
  );
};