import React, { useState } from "react";
import { Plus, Filter, Edit, Trash2, Eye } from "lucide-react";
import DataTable from "../components/DataTable";
import SystemSettingModal from "./modals/SystemSettingModal";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";

interface SystemSetting {
  id: string;
  settingName: string;
  category: string;
  value: string;
  updatedBy: string;
  lastUpdatedDate: string;
  status: string;
}

export const SettingsView = () => {
  const initialForm = {
    id: "",
    settingName: "",
    category: "General",
    value: "",
    updatedBy: "",
    lastUpdatedDate: "",
    status: "Active",
  };

  const [settingList, setSettingList] = useState<SystemSetting[]>(
    Array.from({ length: 100 }, (_, i) => ({
      id: `SET-${String(i + 1).padStart(3, "0")}`,
      settingName:
        i % 3 === 0
          ? "Email Configuration"
          : i % 3 === 1
          ? "Notification Settings"
          : "User Access Control",
      category:
        i % 2 === 0
          ? "General"
          : "Security",
      value:
        i % 2 === 0
          ? "Enabled"
          : "Disabled",
      updatedBy:
        `Admin ${i % 5 + 1}`,
      lastUpdatedDate:
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
  const [settingToDelete, setSettingToDelete] =
    useState<SystemSetting | null>(null);

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
      setSettingList((prev) =>
        prev.map((item) =>
          item.id === formData.id
            ? { ...item, ...formData }
            : item
        )
      );
    } else {
      setSettingList((prev) => [
        {
          ...formData,
          id: `SET-${Date.now()}`,
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
    setting: SystemSetting
  ) => {
    setEditing(true);
    setFormData(setting);
    setShowModal(true);
  };

  const openDeleteModal = (
    setting: SystemSetting
  ) => {
    setSettingToDelete(setting);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (!settingToDelete) return;

    setSettingList((prev) =>
      prev.filter(
        (item) =>
          item.id !== settingToDelete.id
      )
    );

    setShowDeleteModal(false);
    setSettingToDelete(null);
  };

  const columns: ColumnDef<SystemSetting>[] = [
    {
      accessorKey: "settingName",
      header: "Setting Name",
      enableSorting: true,
    },
    {
      accessorKey: "category",
      header: "Category",
      enableSorting: true,
    },
    {
      accessorKey: "value",
      header: "Value",
      enableSorting: true,
    },
    {
      accessorKey: "updatedBy",
      header: "Updated By",
      enableSorting: true,
    },
    {
      accessorKey: "lastUpdatedDate",
      header: "Last Updated Date",
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
            <h1>System Settings</h1>
            <p>
              Manage application configuration settings.
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
              Add Setting
            </button>
          </div>
        </div>

        <div className="card">
          <DataTable
            data={settingList}
            columns={columns}
            searchPlaceholder="Search setting name, category..."
          />
        </div>
      </div>

      <SystemSettingModal
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
          setSettingToDelete(null);
        }}
        onConfirm={handleDelete}
        personName={settingToDelete?.settingName}
      />
    </>
  );
};