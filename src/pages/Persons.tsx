import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Plus, Filter, Edit, Trash2, Loader2, Eye } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../components/DataTable";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";
import { apiFetch } from "../utils/apiConfig";

interface Person {
  _id: string;
  personId: string;
  name: string;
  mobile: string;
  email?: string;
  dob?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  idProofType?: string;
  idProofNumber?: string;
  photo?: string;
  vehiclesLinked: number;
  treesAssigned: number;
  status: string;
  source?: string;
  insuranceVerified?: boolean;
  registrationDate?: string;
  lastLoginAt?: string | null;
  createdBy?: string;
  updatedBy?: string;
}

export const PersonsView = () => {
  const navigate = useNavigate();
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [personToDelete, setPersonToDelete] = useState<Person | null>(null);

  const loadPersons = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<Person[]>("/api/v1/persons");
      setPersons(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load Persons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPersons();
  }, []);

  const openDeleteModal = (person: Person) => {
    setPersonToDelete(person);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!personToDelete) return;
    try {
      await apiFetch(`/api/v1/persons/${personToDelete._id}`, { method: "DELETE" });
      await loadPersons();
    } catch (err: any) {
      setError(err.message || "Failed to delete Person");
    } finally {
      setPersonToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const columns: ColumnDef<Person>[] = [
    { accessorKey: "personId", header: "Person ID", enableSorting: true },
    { accessorKey: "name", header: "Name", enableSorting: true },
    { accessorKey: "mobile", header: "Mobile", enableSorting: true },
    { accessorKey: "city", header: "City", enableSorting: true },
    {
      accessorKey: "vehiclesLinked",
      header: "Vehicles Linked",
      enableSorting: true,
      cell: ({ row }) => (
        <span
          className={`status-badge ${row.original.insuranceVerified ? "status-active" : "status-inactive"}`}
          title={row.original.insuranceVerified ? "Insurance verified with insurance system" : "No matching vehicle insurance found"}
        >
          {row.original.vehiclesLinked}
        </span>
      ),
    },
    { accessorKey: "treesAssigned", header: "Trees Assigned", enableSorting: true },
    {
      accessorKey: "source",
      header: "Source",
      cell: ({ row }) => (
        <span className={`status-badge ${row.original.source === "app" ? "status-warning" : "status-active"}`}>
          {row.original.source === "app" ? "App" : "Admin"}
        </span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span className={`status-badge ${row.original.status === "Active" ? "status-active" : "status-inactive"}`}>
          {row.original.status}
        </span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "lastLoginAt",
      header: "Last Login",
      cell: ({ row }) =>
        row.original.lastLoginAt
          ? new Date(row.original.lastLoginAt).toLocaleString()
          : "—",
      enableSorting: true,
    },
    {
      accessorKey: "createdBy",
      header: "Created By",
      cell: ({ row }) => row.original.createdBy || "—",
      enableSorting: true,
    },
    {
      accessorKey: "updatedBy",
      header: "Updated By",
      cell: ({ row }) => row.original.updatedBy || "—",
      enableSorting: true,
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className="icon-btn"
            style={{ width: 28, height: 28 }}
            title="View"
            onClick={() =>
              navigate("/persons/view", { state: { person: row.original } })
            }
          >
            <Eye size={14} />
          </button>
          <button
            className="icon-btn"
            style={{ width: 28, height: 28 }}
            title="Edit"
            onClick={() =>
              navigate("/persons/edit", { state: { person: row.original } })
            }
          >
            <Edit size={14} />
          </button>
          <button
            className="icon-btn"
            style={{ width: 28, height: 28 }}
            title="Delete"
            onClick={() => openDeleteModal(row.original)}
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
            <h1>Person Management</h1>
            <p>Master record of every citizen registered on the platform.</p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button className="icon-btn" title="Filter">
              <Filter size={18} />
            </button>
            <button className="btn-primary" onClick={() => navigate("/persons/add")}>
              <Plus size={18} />
              Add Person
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
          ) : persons.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                padding: "48px 20px",
                color: "var(--text-secondary)",
              }}
            >
              <Users size={28} />
              <p>No persons registered yet.</p>
              <button className="btn-primary" onClick={() => navigate("/persons/add")}>
                <Plus size={16} />
                Add the first one
              </button>
            </div>
          ) : (
            <DataTable data={persons} columns={columns} searchPlaceholder="Search by name, ID, phone number..." />
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setPersonToDelete(null);
        }}
        onConfirm={handleDelete}
        personName={personToDelete?.name}
        title="Delete Person"
      />
    </>
  );
};

export default PersonsView;
