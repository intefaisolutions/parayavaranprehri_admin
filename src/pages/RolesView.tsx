import React, { useState } from "react";
import { Plus, Filter, Edit, Trash2, Eye } from "lucide-react";
import DataTable from "../components/DataTable";
import RolesModal from "./modals/RolesModal";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";

interface RolePermission {
  id: string;
  roleName: string;
  accessLevel: string;
  assignedLocation: string;
  modulesAccess: string;
  usersCount: number;
  createdDate: string;
  status: string;
}

export const RolesView = () => {
  const initialForm = {
    id: "",
    roleName: "",
    accessLevel: "Full Access",
    assignedLocation: "",
    modulesAccess: "",
    usersCount: 0,
    createdDate: "",
    status: "Active",
  };

  const [roleList, setRoleList] = useState<RolePermission[]>(
    Array.from({ length: 100 }, (_, i) => ({
      id: `ROLE-${String(i + 1).padStart(3, "0")}`,
      roleName:
        i % 3 === 0
          ? "Administrator"
          : i % 3 === 1
          ? "Manager"
          : "Operator",
      accessLevel:
        i % 2 === 0
          ? "Full Access"
          : "Limited Access",
      assignedLocation:
        i % 2 === 0
          ? "All Locations"
          : "Delhi",
      modulesAccess:
        i % 2 === 0
          ? "All Modules"
          : "Users, Reports",
      usersCount:
        (i + 1) * 5,
      createdDate:
        "2026-01-10",
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
  const [roleToDelete, setRoleToDelete] =
    useState<RolePermission | null>(null);

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
      setRoleList((prev) =>
        prev.map((item) =>
          item.id === formData.id
            ? { ...item, ...formData }
            : item
        )
      );
    } else {
      setRoleList((prev) => [
        {
          ...formData,
          id: `ROLE-${Date.now()}`,
          usersCount: Number(formData.usersCount),
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
    role: RolePermission
  ) => {
    setEditing(true);
    setFormData(role);
    setShowModal(true);
  };

  const openDeleteModal = (
    role: RolePermission
  ) => {
    setRoleToDelete(role);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (!roleToDelete) return;

    setRoleList((prev) =>
      prev.filter(
        (item) =>
          item.id !== roleToDelete.id
      )
    );

    setShowDeleteModal(false);
    setRoleToDelete(null);
  };

  const columns: ColumnDef<RolePermission>[] = [
    {
      accessorKey: "roleName",
      header: "Role Name",
      enableSorting: true,
    },
    {
      accessorKey: "accessLevel",
      header: "Access Level",
      enableSorting: true,
    },
    {
      accessorKey: "assignedLocation",
      header: "Assigned Location",
      enableSorting: true,
    },
    {
      accessorKey: "modulesAccess",
      header: "Modules Access",
      enableSorting: true,
    },
    {
      accessorKey: "usersCount",
      header: "Users Count",
      enableSorting: true,
    },
    {
      accessorKey: "createdDate",
      header: "Created Date",
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
            <h1>Role & Permissions</h1>
            <p>
              Manage user roles and module permissions.
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
              Add Role
            </button>
          </div>
        </div>

        <div className="card">
          <DataTable
            data={roleList}
            columns={columns}
            searchPlaceholder="Search role name, access..."
          />
        </div>
      </div>

      <RolesModal
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
          setRoleToDelete(null);
        }}
        onConfirm={handleDelete}
        personName={roleToDelete?.roleName}
      />
    </>
  );
};