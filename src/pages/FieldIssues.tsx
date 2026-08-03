import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Loader2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../components/DataTable";
import { apiFetch } from "../utils/apiConfig";

interface FieldIssue {
  _id: string;
  type: string;
  priority: string;
  description: string;
  treeCode?: string;
  mitraId?: string;
  reportedByName?: string;
  status: string;
  createdAt?: string;
  resolutionNotes?: string;
}

const statusClass = (status: string) => {
  if (status === "Resolved" || status === "Closed") return "status-active";
  if (status === "In Progress") return "status-warning";
  return "status-inactive";
};

export const FieldIssuesView = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<FieldIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<FieldIssue[]>("/api/v1/field-issues");
      setItems(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Failed to load field issues");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const columns: ColumnDef<FieldIssue>[] = [
    { accessorKey: "type", header: "Type", enableSorting: true },
    {
      accessorKey: "priority",
      header: "Priority",
      enableSorting: true,
      cell: ({ row }) => (
        <span
          className={`status-badge ${
            row.original.priority === "Critical" ||
            row.original.priority === "High"
              ? "status-warning"
              : "status-active"
          }`}
        >
          {row.original.priority}
        </span>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <span title={row.original.description}>
          {row.original.description?.length > 60
            ? `${row.original.description.slice(0, 60)}…`
            : row.original.description}
        </span>
      ),
    },
    { accessorKey: "treeCode", header: "Tree" },
    { accessorKey: "reportedByName", header: "Reported By" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span className={`status-badge ${statusClass(row.original.status)}`}>
          {row.original.status}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Reported",
      cell: ({ row }) =>
        row.original.createdAt
          ? new Date(row.original.createdAt).toLocaleDateString()
          : "—",
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <button
          className="icon-btn"
          style={{ width: 28, height: 28 }}
          title="Update status"
          onClick={() =>
            navigate("/field-issues/edit", { state: { issue: row.original } })
          }
        >
          <Edit size={14} />
        </button>
      ),
    },
  ];

  return (
    <div className="dashboard-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Field Issues</h1>
          <p>Review issues reported by Mitras and update their status.</p>
        </div>
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
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "40px",
            }}
          >
            <Loader2 size={24} className="spin" />
          </div>
        ) : (
          <DataTable
            data={items}
            columns={columns}
            searchPlaceholder="Search issues..."
          />
        )}
      </div>
    </div>
  );
};
