import React, { useState, useEffect } from 'react';
import { Plus, Filter, Edit, Trash2, Loader2, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import DataTable from "../components/DataTable";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";
import AssignMitraModal from "./modals/AssignMitraModal";
import { apiFetch } from "../utils/apiConfig";
import { type TreesFormData } from "./forms/TreeForm";

interface Tree extends TreesFormData {
  _id: string;
  treeId: string;
  assignedMitraId?: string;
  assignedMitraName?: string;
}

export const TreesView = () => {
  const navigate = useNavigate();

  const [trees, setTrees] = useState<Tree[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [treeToDelete, setTreeToDelete] = useState<Tree | null>(null);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [treeToAssign, setTreeToAssign] = useState<Tree | null>(null);

  const loadTrees = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<Tree[]>("/api/v1/trees");
      setTrees(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load trees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrees();
  }, []);

  const openAddPage = () => {
    navigate('/trees/add');
  };

  const openEditPage = (tree: Tree) => {
    navigate('/trees/edit', { state: { tree } });
  };

  const openDeleteModal = (tree: Tree) => {
    setTreeToDelete(tree);
    setShowDeleteModal(true);
  };

  const openAssignModal = (tree: Tree) => {
    setTreeToAssign(tree);
    setShowAssignModal(true);
  };

  const handleAssignMitra = async (mitraId: string) => {
    if (!treeToAssign) return;
    await apiFetch(`/api/v1/trees/${treeToAssign._id}/assign-mitra`, {
      method: "PATCH",
      body: JSON.stringify({ mitraId }),
    });
    await loadTrees();
  };

  const handleDelete = async () => {
    if (!treeToDelete) return;
    try {
      await apiFetch(`/api/v1/trees/${treeToDelete._id}`, { method: "DELETE" });
      await loadTrees();
    } catch (err: any) {
      setError(err.message || "Failed to delete tree");
    } finally {
      setTreeToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const columns: ColumnDef<Tree>[] = [
    { accessorKey: "treeId", header: "Tree ID", enableSorting: true },
    { accessorKey: "treeName", header: "Name", enableSorting: true },
    { accessorKey: "species", header: "Species", enableSorting: true },
    { accessorKey: "userName", header: "Owner", enableSorting: true },
    { accessorKey: "vehicleNumber", header: "Assigned Vehicle", enableSorting: true },
    {
      accessorKey: "assignedMitraName",
      header: "Caretaker Mitra",
      cell: ({ row }) => row.original.assignedMitraName || <span style={{ color: "var(--text-secondary)" }}>Unassigned</span>,
      enableSorting: false,
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => (
        <span>
          {[row.original.location, row.original.district, row.original.state].filter(Boolean).join(", ") || "-"}
        </span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        let badgeClass = "status-inactive";
        if (["HEALTHY", "GROWING"].includes(row.original.status)) badgeClass = "status-active";
        else if (row.original.status === "PLANTED") badgeClass = "status-warning";
        return <span className={`status-badge ${badgeClass}`}>{row.original.status}</span>;
      },
      enableSorting: false
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="icon-btn" title="Assign Mitra" style={{ width: 28, height: 28 }} onClick={() => openAssignModal(row.original)}>
            <UserPlus size={14} />
          </button>
          <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => openEditPage(row.original)}>
            <Edit size={14} />
          </button>
          <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => openDeleteModal(row.original)}>
            <Trash2 size={14} />
          </button>
        </div>
      ),
      enableSorting: false
    }
  ];

  return (
    <>
      <div className="dashboard-area">
        <div className="page-header">
          <div className="page-title">
            <h1>Tree Management</h1>
            <p>Manage all planted trees, their health status, and assignments.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="icon-btn" title="Filter">
              <Filter size={18} />
            </button>
            <button className="btn-primary" onClick={openAddPage}>
              <Plus size={18} />
              Register Tree
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
            <DataTable data={trees} columns={columns} searchPlaceholder="Search by Tree ID, Species, Owner, Vehicle..." />
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setTreeToDelete(null);
        }}
        onConfirm={handleDelete}
        personName={treeToDelete?.treeName}
        title="Delete Tree"
      />

      <AssignMitraModal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setTreeToAssign(null);
        }}
        treeName={treeToAssign?.treeName}
        currentMitraId={treeToAssign?.assignedMitraId}
        onAssign={handleAssignMitra}
      />
    </>
  );
}
