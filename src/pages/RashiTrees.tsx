import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Leaf, Loader2, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../components/DataTable";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";
import { apiFetch } from "../utils/apiConfig";

interface RashiTree {
  _id: string;
  rashiName: string;
  rashiNameHindi: string;
  zodiacNumber: number;
  recommendedTree: string;
  scientificName?: string;
  localName?: string;
  image?: string;
  isActive: boolean;
  displayOrder: number;
}

export const RashiTreesView = () => {
  const navigate = useNavigate();

  const [entries, setEntries] = useState<RashiTree[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<RashiTree | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadEntries = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<RashiTree[]>(
        "/api/v1/rashi-trees?limit=100&sortBy=displayOrder&sortOrder=asc"
      );
      setEntries(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load Rashi tree recommendations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const openAdd = () => navigate("/rashi-trees/add");
  const openEdit = (entry: RashiTree) => navigate("/rashi-trees/edit", { state: { rashiTree: entry } });

  const openDeleteModal = (entry: RashiTree) => {
    setEntryToDelete(entry);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!entryToDelete) return;
    try {
      await apiFetch(`/api/v1/rashi-trees/${entryToDelete._id}`, { method: "DELETE" });
      await loadEntries();
    } catch (err: any) {
      setError(err.message || "Failed to delete recommendation");
    } finally {
      setEntryToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const toggleActive = async (entry: RashiTree) => {
    setTogglingId(entry._id);
    try {
      await apiFetch(`/api/v1/rashi-trees/${entry._id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !entry.isActive }),
      });
      await loadEntries();
    } catch (err: any) {
      setError(err.message || "Failed to update status");
    } finally {
      setTogglingId(null);
    }
  };

  const columns: ColumnDef<RashiTree>[] = [
    {
      header: "Image",
      cell: ({ row }) =>
        row.original.image ? (
          <img
            src={row.original.image}
            alt={row.original.rashiName}
            style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(43, 150, 79, 0.08)",
              color: "var(--accent-color)",
            }}
          >
            <Leaf size={16} />
          </div>
        ),
      enableSorting: false,
    },
    { accessorKey: "zodiacNumber", header: "#", enableSorting: true },
    {
      accessorKey: "rashiName",
      header: "Rashi",
      enableSorting: true,
      cell: ({ row }) => (
        <span>
          {row.original.rashiName}{" "}
          <span style={{ color: "var(--text-secondary)" }}>({row.original.rashiNameHindi})</span>
        </span>
      ),
    },
    { accessorKey: "recommendedTree", header: "Recommended Tree", enableSorting: true },
    { accessorKey: "scientificName", header: "Scientific Name", enableSorting: true },
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
          <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => openEdit(row.original)}>
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
            <h1>Rashi Wise Tree Recommendations</h1>
            <p>Assign multiple recommended trees per Rashi (zodiac sign).</p>
          </div>
          <button className="btn-primary" onClick={openAdd}>
            <Plus size={18} />
            Add Recommendation
          </button>
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
          ) : (
            <DataTable
              data={entries}
              columns={columns}
              searchPlaceholder="Search by Rashi or Tree Name..."
            />
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setEntryToDelete(null);
        }}
        onConfirm={handleDelete}
        personName={entryToDelete?.rashiName}
        title="Delete Rashi Tree Recommendation"
      />
    </>
  );
};

export default RashiTreesView;
