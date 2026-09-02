import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Loader2, Trees } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../components/DataTable";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";
import { apiFetch } from "../utils/apiConfig";

interface VehicleTreeRule {
  _id: string;
  vehicleType: string;
  treesRequired: number;
  isActive: boolean;
}

export const VehicleTreeRulesView = () => {
  const navigate = useNavigate();
  const [rules, setRules] = useState<VehicleTreeRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<VehicleTreeRule | null>(null);

  const loadRules = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<VehicleTreeRule[]>("/api/v1/vehicle-tree-rules");
      setRules(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load vehicle tree rules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const openDeleteModal = (rule: VehicleTreeRule) => {
    setRuleToDelete(rule);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!ruleToDelete) return;
    try {
      await apiFetch(`/api/v1/vehicle-tree-rules/${ruleToDelete._id}`, { method: "DELETE" });
      await loadRules();
    } catch (err: any) {
      setError(err.message || "Failed to delete rule");
    } finally {
      setShowDeleteModal(false);
      setRuleToDelete(null);
    }
  };

  const columns: ColumnDef<VehicleTreeRule>[] = [
    {
      accessorKey: "vehicleType",
      header: "Vehicle Type",
      enableSorting: true,
    },
    {
      accessorKey: "treesRequired",
      header: "Trees per Vehicle",
      enableSorting: true,
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`status-badge ${
            row.original.isActive ? "status-active" : "status-inactive"
          }`}
        >
          {row.original.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className="icon-btn"
            style={{ width: 28, height: 28 }}
            onClick={() => navigate("/vehicle-tree-rules/edit", { state: { rule: row.original } })}
          >
            <Edit size={14} />
          </button>
          <button
            className="icon-btn"
            style={{ width: 28, height: 28 }}
            onClick={() => openDeleteModal(row.original)}
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
            <h1>Vehicle Tree Rules</h1>
            <p>Configure how many trees are required for each vehicle type.</p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button className="btn-primary" onClick={() => navigate("/vehicle-tree-rules/add")}>
              <Plus size={18} />
              Add Rule
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
              data={rules}
              columns={columns}
              searchPlaceholder="Search vehicle type..."
            />
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setRuleToDelete(null);
        }}
        onConfirm={handleDelete}
        personName={ruleToDelete?.vehicleType}
        title="Delete Rule"
      />
    </>
  );
};
