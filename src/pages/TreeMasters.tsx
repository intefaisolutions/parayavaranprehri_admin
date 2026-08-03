import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Leaf, Plus, Trash2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../components/DataTable";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";
import { apiFetch } from "../utils/apiConfig";

export interface TreeMaster {
  _id: string;
  treeMasterId: string;
  name: string;
  scientificName?: string;
  category?: string;
  expectedLifespanYears?: number;
  oxygenRateKgPerYear?: number;
  co2RateKgPerYear?: number;
  availability: string;
  isActive: boolean;
  image?: string;
}

const availabilityLabel: Record<string, string> = {
  AVAILABLE: "✅ Available",
  OUT_OF_STOCK: "❌ Out of Stock",
  AVAILABLE_ON_REQUEST: "🔔 On Request",
};

export const TreeMastersView = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<TreeMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<TreeMaster | null>(null);

  const loadEntries = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<TreeMaster[]>("/api/v1/tree-masters");
      setEntries(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Failed to load Tree Master catalog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const handleDelete = async () => {
    if (!entryToDelete) return;
    try {
      await apiFetch(`/api/v1/tree-masters/${entryToDelete._id}`, {
        method: "DELETE",
      });
      await loadEntries();
    } catch (err: any) {
      setError(err.message || "Failed to delete");
    } finally {
      setEntryToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const columns: ColumnDef<TreeMaster>[] = [
    {
      header: "Image",
      cell: ({ row }) =>
        row.original.image ? (
          <img
            src={row.original.image}
            alt={row.original.name}
            style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: "rgba(43,150,79,0.12)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <Leaf size={18} color="#2B964F" />
          </div>
        ),
    },
    { accessorKey: "treeMasterId", header: "ID" },
    { accessorKey: "name", header: "Tree Name", enableSorting: true },
    { accessorKey: "scientificName", header: "Scientific Name" },
    { accessorKey: "category", header: "Category" },
    {
      accessorKey: "oxygenRateKgPerYear",
      header: "O₂ Kg/Year",
      cell: ({ row }) => row.original.oxygenRateKgPerYear?.toLocaleString() ?? "—",
    },
    {
      accessorKey: "co2RateKgPerYear",
      header: "CO₂ Kg/Year",
      cell: ({ row }) => row.original.co2RateKgPerYear?.toLocaleString() ?? "—",
    },
    {
      accessorKey: "availability",
      header: "Availability",
      cell: ({ row }) =>
        availabilityLabel[row.original.availability] || row.original.availability,
    },
    {
      accessorKey: "isActive",
      header: "Active",
      cell: ({ row }) => (row.original.isActive ? "Yes" : "No"),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            className="icon-btn"
            title="Edit"
            onClick={() =>
              navigate("/tree-masters/edit", {
                state: { treeMaster: row.original },
              })
            }
          >
            <Edit size={16} />
          </button>
          <button
            type="button"
            className="icon-btn"
            title="Delete"
            onClick={() => {
              setEntryToDelete(row.original);
              setShowDeleteModal(true);
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="dashboard-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Tree Master Catalog</h1>
          <p>
            Species catalog (Neem, Peepal…). Create once — plantations reference
            these.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => navigate("/tree-masters/add")}
        >
          <Plus size={18} /> Add Tree Master
        </button>
      </div>

      {error && (
        <div className="card" style={{ marginBottom: 16, color: "crimson" }}>
          {error}
        </div>
      )}

      <div className="card">
        {loading ? (
          <p>Loading catalog…</p>
        ) : (
          <DataTable
            data={entries}
            columns={columns}
            searchPlaceholder="Search tree name, scientific name…"
          />
        )}
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        personName={entryToDelete?.name}
        title="Delete Tree Master"
      />
    </div>
  );
};

export default TreeMastersView;
