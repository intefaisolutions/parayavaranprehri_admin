import React, { useEffect, useState } from "react";
import { Users, Plus, Filter, Edit, Trash2, Loader2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../components/DataTable";
import PersonModal from "./modals/PersonModal";
import type { PersonFormData } from "./modals/PersonModal";
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
}

const initialForm: PersonFormData = {
  name: "",
  mobile: "",
  email: "",
  dob: "",
  gender: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  idProofType: "",
  idProofNumber: "",
  photo: "",
  vehiclesLinked: "",
  treesAssigned: "",
  status: "Active",
  registrationDate: "",
};

/** Converts an ISO datetime string coming from the API into a plain
 * yyyy-MM-dd value that native <input type="date"> controls expect. */
const toDateInputValue = (value?: string) => (value ? value.slice(0, 10) : "");

export const PersonsView = () => {
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<PersonFormData>(initialForm);

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

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const { _id, personId: _personId, ...rest } = formData;
    const payload: Record<string, any> = {};
    Object.entries(rest).forEach(([key, value]) => {
      if (value === "" || value === undefined || value === null) return;
      if (key === "vehiclesLinked" || key === "treesAssigned") {
        payload[key] = Number(value);
      } else {
        payload[key] = value;
      }
    });

    try {
      if (editing && _id) {
        await apiFetch(`/api/v1/persons/${_id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/v1/persons", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      setShowModal(false);
      await loadPersons();
    } catch (err: any) {
      setError(err.message || "Failed to save Person");
    } finally {
      setSubmitting(false);
    }
  };

  const openAddModal = () => {
    setEditing(false);
    setFormData(initialForm);
    setShowModal(true);
  };

  const openEditModal = (person: Person) => {
    setEditing(true);
    setFormData({
      _id: person._id,
      personId: person.personId,
      name: person.name,
      mobile: person.mobile,
      email: person.email || "",
      dob: toDateInputValue(person.dob),
      gender: person.gender || "",
      address: person.address || "",
      city: person.city || "",
      state: person.state || "",
      pincode: person.pincode || "",
      idProofType: person.idProofType || "",
      idProofNumber: person.idProofNumber || "",
      photo: person.photo || "",
      vehiclesLinked: person.vehiclesLinked ?? "",
      treesAssigned: person.treesAssigned ?? "",
      status: person.status,
      registrationDate: toDateInputValue(person.registrationDate),
    });
    setShowModal(true);
  };

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
      header: "Actions",
      cell: ({ row }) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => openEditModal(row.original)}>
            <Edit size={14} />
          </button>
          <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => openDeleteModal(row.original)}>
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
            <button className="btn-primary" onClick={openAddModal}>
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
              <button className="btn-primary" onClick={openAddModal}>
                <Plus size={16} />
                Add the first one
              </button>
            </div>
          ) : (
            <DataTable data={persons} columns={columns} searchPlaceholder="Search by name, ID, phone number..." />
          )}
        </div>
      </div>

      <PersonModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        editing={editing}
        formData={formData}
        submitting={submitting}
        onFieldChange={handleFieldChange}
        handleSubmit={handleSubmit}
      />

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
