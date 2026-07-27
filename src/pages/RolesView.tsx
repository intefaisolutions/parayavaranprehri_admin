import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Filter, Edit, Trash2, Loader2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../components/DataTable";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";
import { apiFetch } from "../utils/apiConfig";

interface Role {
  _id: string;
  name: string;
  displayName: string;
  description?: string;
  permissionKeys: string[];
  isActive: boolean;
  isSystem: boolean;
  createdAt?: string;
}

export const RolesView = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  const loadRoles = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<{ items: Role[] }>("/api/v1/roles?limit=100");
      setRoles(data?.items || []);
    } catch (err: any) {
      setError(err.message || "Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const openDeleteModal = (role: Role) => {
    setRoleToDelete(role);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!roleToDelete) return;
    try {
      await apiFetch(`/api/v1/roles/${roleToDelete._id}`, { method: "DELETE" });
      await loadRoles();
    } catch (err: any) {
      setError(err.message || "Failed to delete role");
    } finally {
      setRoleToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const columns: ColumnDef<Role>[] = [
    { accessorKey: "displayName", header: "Role Name", enableSorting: true },
    { accessorKey: "name", header: "Role Key", enableSorting: true },
    {
      accessorKey: "permissionKeys",
      header: "Permissions",
      cell: ({ row }) => <span>{row.original.permissionKeys?.length || 0} assigned</span>,
      enableSorting: false,
    },
    {
      accessorKey: "isSystem",
      header: "Type",
      cell: ({ row }) => (
        <span className={`status-badge ${row.original.isSystem ? "status-warning" : "status-active"}`}>
          {row.original.isSystem ? "System" : "Custom"}
        </span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <span className={`status-badge ${row.original.isActive ? "status-active" : "status-inactive"}`}>
          {row.original.isActive ? "Active" : "Inactive"}
        </span>
      ),
      enableSorting: false,
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className="icon-btn"
            style={{ width: 28, height: 28 }}
            onClick={() => navigate("/roles/edit", { state: { role: row.original } })}
          >
            <Edit size={14} />
          </button>
          <button
            className="icon-btn"
            style={{ width: 28, height: 28 }}
            onClick={() => openDeleteModal(row.original)}
            disabled={row.original.isSystem}
            title={row.original.isSystem ? "System roles cannot be deleted" : "Delete"}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
      enableSorting: false,
    },
  ];

  return (
    <>
      <div className="dashboard-area">
        <div className="page-header">
          <div className="page-title">
            <h1>Role & Permissions</h1>
            <p>Manage user roles and module permissions.</p>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button className="icon-btn">
              <Filter size={18} />
            </button>

            <button className="btn-primary" onClick={() => navigate("/roles/add")}>
              <Plus size={18} />
              Add Role
            </button>
          </div>
        </div>

        {error && (
          <div style={{ background: "rgba(255, 61, 0, 0.1)", color: "#ff3d00", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        <div className="card">
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
              <Loader2 size={24} className="spin" />
            </div>
          ) : (
            <DataTable
              data={roles}
              columns={columns}
              searchPlaceholder="Search role name, key..."
            />
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setRoleToDelete(null);
        }}
        onConfirm={handleDelete}
        personName={roleToDelete?.displayName}
        title="Delete Role"
      />
    </>
  );
};
