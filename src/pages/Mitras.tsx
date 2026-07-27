import React, { useEffect, useState } from 'react';
import { Plus, Filter, Edit, Trash2, Award, Loader2, Check, X as XIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import DataTable from "../components/DataTable";
import MitrasModal from "./modals/MitrasModal";
import type { MitrasFormData } from "./modals/MitrasModal";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";
import { apiFetch } from "../utils/apiConfig";

interface Mitra {
  _id: string;
  mitraId: string;
  name: string;
  mobile: string;
  email?: string;
  profession?: string;
  vidhanSabha?: string;
  assignedZone?: string;
  district?: string;
  state?: string;
  membership: string;
  status: string;
  source?: string;
  treesPlanted: number;
}

// Admin-created via this panel defaults to Approved; app self-registrations
// (via the mobile app's own endpoint) always start Pending regardless.
const initialForm: MitrasFormData = {
  name: "",
  mobile: "",
  email: "",
  profession: "",
  vidhanSabha: "",
  assignedZone: "",
  district: "",
  state: "",
  membership: "free",
  status: "Approved",
};

export const MitrasView = () => {
  const navigate = useNavigate();

  const [mitras, setMitras] = useState<Mitra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<MitrasFormData>(initialForm);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [mitraToDelete, setMitraToDelete] = useState<Mitra | null>(null);
  const [decidingId, setDecidingId] = useState<string | null>(null);

  const loadMitras = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<Mitra[]>("/api/v1/mitras");
      setMitras(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load Mitras");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMitras();
  }, []);

  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const { _id, mitraId: _mitraId, ...payload } = formData;

    try {
      if (editing && _id) {
        await apiFetch(`/api/v1/mitras/${_id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/v1/mitras", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      setShowModal(false);
      await loadMitras();
    } catch (err: any) {
      setError(err.message || "Failed to save Mitra");
    } finally {
      setSubmitting(false);
    }
  };

  const openAddModal = () => {
    setEditing(false);
    setFormData(initialForm);
    setShowModal(true);
  };

  const openEditModal = (mitra: Mitra) => {
    setEditing(true);
    setFormData({
      _id: mitra._id,
      mitraId: mitra.mitraId,
      name: mitra.name,
      mobile: mitra.mobile,
      email: mitra.email || "",
      profession: mitra.profession || "",
      vidhanSabha: mitra.vidhanSabha || "",
      assignedZone: mitra.assignedZone || "",
      district: mitra.district || "",
      state: mitra.state || "",
      membership: mitra.membership,
      status: mitra.status,
    });
    setShowModal(true);
  };

  const openDeleteModal = (mitra: Mitra) => {
    setMitraToDelete(mitra);
    setShowDeleteModal(true);
  };

  const handleApprove = async (mitra: Mitra) => {
    setDecidingId(mitra._id);
    setError("");
    try {
      await apiFetch(`/api/v1/mitras/${mitra._id}/approve`, { method: "PATCH" });
      await loadMitras();
    } catch (err: any) {
      setError(err.message || "Failed to approve Mitra");
    } finally {
      setDecidingId(null);
    }
  };

  const handleReject = async (mitra: Mitra) => {
    setDecidingId(mitra._id);
    setError("");
    try {
      await apiFetch(`/api/v1/mitras/${mitra._id}/reject`, { method: "PATCH" });
      await loadMitras();
    } catch (err: any) {
      setError(err.message || "Failed to reject Mitra");
    } finally {
      setDecidingId(null);
    }
  };

  const handleDelete = async () => {
    if (!mitraToDelete) return;
    try {
      await apiFetch(`/api/v1/mitras/${mitraToDelete._id}`, { method: "DELETE" });
      await loadMitras();
    } catch (err: any) {
      setError(err.message || "Failed to delete Mitra");
    } finally {
      setMitraToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const columns: ColumnDef<Mitra>[] = [
    { accessorKey: "mitraId", header: "Mitra ID", enableSorting: true },
    { accessorKey: "name", header: "Name", enableSorting: true },
    { accessorKey: "mobile", header: "Mobile", enableSorting: true },
    { accessorKey: "vidhanSabha", header: "Vidhan Sabha", enableSorting: true },
    { accessorKey: "assignedZone", header: "Assigned Zone", enableSorting: true },
    { accessorKey: "treesPlanted", header: "Trees Planted", enableSorting: true },
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
        <span
          className={`status-badge ${
            row.original.status === "Approved"
              ? "status-active"
              : row.original.status === "Pending"
              ? "status-warning"
              : row.original.status === "Cancelled"
              ? "status-inactive"
              : ""
          }`}
        >
          {row.original.status}
        </span>
      ),
      enableSorting: false,
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          {row.original.status === "Pending" && (
            <>
              <button
                className="icon-btn"
                title="Approve"
                style={{ width: 28, height: 28 }}
                onClick={() => handleApprove(row.original)}
                disabled={decidingId === row.original._id}
              >
                {decidingId === row.original._id ? <Loader2 size={14} className="spin" /> : <Check size={14} />}
              </button>
              <button
                className="icon-btn"
                title="Reject"
                style={{ width: 28, height: 28 }}
                onClick={() => handleReject(row.original)}
                disabled={decidingId === row.original._id}
              >
                <XIcon size={14} />
              </button>
            </>
          )}
          <button
            className="icon-btn"
            title="Issue Certificate"
            style={{ width: 28, height: 28 }}
            onClick={() =>
              navigate("/certificates/issued", { state: { mitra: row.original } })
            }
          >
            <Award size={14} />
          </button>
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
            <h1>Paryavaran Mitra Management</h1>
            <p>Master record of every volunteer (Mitra) registered on the platform.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="icon-btn" title="Filter">
              <Filter size={18} />
            </button>
            <button className="btn-primary" onClick={openAddModal}>
              <Plus size={18} />
              Assign Mitra
            </button>
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(255, 61, 0, 0.1)', color: '#ff3d00', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <div className="card">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <Loader2 size={24} className="spin" />
            </div>
          ) : (
            <DataTable
              data={mitras}
              columns={columns}
              searchPlaceholder="Search by Mitra ID, Name, Mobile, Zone..."
            />
          )}
        </div>
      </div>

      <MitrasModal
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
          setMitraToDelete(null);
        }}
        onConfirm={handleDelete}
        personName={mitraToDelete?.name}
        title="Delete Mitra"
      />
    </>
  );
};
