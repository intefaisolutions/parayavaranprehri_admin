import React, { useEffect, useState } from 'react';
import { Plus, Filter, Edit, Trash2, Award, Loader2, Check, X as XIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import DataTable from "../components/DataTable";
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
  landName?: string;
  treeAssignment?: string;
  assignedTreeName?: string;
  membership: string;
  status: string;
  source?: string;
  treesPlanted: number;
}

export const MitrasView = () => {
  const navigate = useNavigate();

  const [mitras, setMitras] = useState<Mitra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    {
      id: "assignment",
      header: "Land / Tree",
      cell: ({ row }) => {
        const land = row.original.landName || "—";
        const mode = row.original.treeAssignment || "NONE";
        const tree =
          mode === "ALL"
            ? "All trees"
            : mode === "SINGLE"
              ? row.original.assignedTreeName || "1 tree"
              : "VS only";
        return (
          <div style={{ fontSize: 13 }}>
            <div>{land}</div>
            <div style={{ color: "var(--text-secondary)", fontSize: 12 }}>
              {tree}
            </div>
          </div>
        );
      },
      enableSorting: false,
    },
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
              navigate("/certificates/issue", { state: { mitra: row.original } })
            }
          >
            <Award size={14} />
          </button>
          <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => navigate("/mitras/edit", { state: { mitra: row.original } })}>
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
            <button className="btn-primary" onClick={() => navigate("/mitras/add")}>
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
