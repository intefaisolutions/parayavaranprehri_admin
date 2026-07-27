import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Filter, Edit, Trash2, Loader2, Settings as SettingsIcon, ToggleLeft, ToggleRight } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../components/DataTable";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";
import { apiFetch } from "../utils/apiConfig";

interface SystemSetting {
  _id: string;
  settingName: string;
  category: string;
  value: string;
  updatedBy?: string;
  lastUpdatedDate: string;
  isActive: boolean;
}

export const SettingsView = () => {
  const navigate = useNavigate();
  const [settingList, setSettingList] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [settingToDelete, setSettingToDelete] = useState<SystemSetting | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadSettings = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<SystemSetting[]>("/api/v1/settings?limit=100");
      setSettingList(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load system settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const openDeleteModal = (setting: SystemSetting) => {
    setSettingToDelete(setting);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!settingToDelete) return;
    try {
      await apiFetch(`/api/v1/settings/${settingToDelete._id}`, { method: "DELETE" });
      await loadSettings();
    } catch (err: any) {
      setError(err.message || "Failed to delete setting");
    } finally {
      setSettingToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const toggleActive = async (setting: SystemSetting) => {
    setTogglingId(setting._id);
    try {
      await apiFetch(`/api/v1/settings/${setting._id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !setting.isActive }),
      });
      await loadSettings();
    } catch (err: any) {
      setError(err.message || "Failed to update status");
    } finally {
      setTogglingId(null);
    }
  };

  const columns: ColumnDef<SystemSetting>[] = [
    { accessorKey: "settingName", header: "Setting Name", enableSorting: true },
    { accessorKey: "category", header: "Category", enableSorting: true },
    { accessorKey: "value", header: "Value", enableSorting: true },
    {
      accessorKey: "updatedBy",
      header: "Updated By",
      enableSorting: true,
      cell: ({ row }) => row.original.updatedBy || "—",
    },
    {
      accessorKey: "lastUpdatedDate",
      header: "Last Updated Date",
      enableSorting: true,
      cell: ({ row }) =>
        row.original.lastUpdatedDate ? new Date(row.original.lastUpdatedDate).toLocaleString() : "—",
    },
    {
      accessorKey: "isActive",
      header: "Status",
      enableSorting: false,
      cell: ({ row }) => (
        <button
          className={`status-badge ${row.original.isActive ? "status-active" : "status-inactive"}`}
          style={{ border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
          onClick={() => toggleActive(row.original)}
          disabled={togglingId === row.original._id}
          title="Click to toggle"
        >
          {togglingId === row.original._id ? (
            <Loader2 size={12} className="spin" />
          ) : row.original.isActive ? (
            <ToggleRight size={14} />
          ) : (
            <ToggleLeft size={14} />
          )}
          {row.original.isActive ? "Active" : "Inactive"}
        </button>
      ),
    },
    {
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => navigate("/settings/edit", { state: { setting: row.original } })}>
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
            <h1>System Settings</h1>
            <p>Manage application configuration settings.</p>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button className="icon-btn" title="Filter">
              <Filter size={18} />
            </button>

            <button className="btn-primary" onClick={() => navigate("/settings/add")}>
              <Plus size={18} />
              Add Setting
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
          ) : settingList.length === 0 ? (
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
              <SettingsIcon size={40} style={{ marginBottom: 16, opacity: 0.5 }} />
              <p style={{ marginBottom: 16 }}>No system settings configured yet.</p>
              <button className="btn-primary" onClick={() => navigate("/settings/add")}>
                <Plus size={18} />
                Add your first setting
              </button>
            </div>
          ) : (
            <DataTable
              data={settingList}
              columns={columns}
              searchPlaceholder="Search setting name, category..."
            />
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSettingToDelete(null);
        }}
        onConfirm={handleDelete}
        personName={settingToDelete?.settingName}
        title="Delete Setting"
      />
    </>
  );
};

export default SettingsView;
