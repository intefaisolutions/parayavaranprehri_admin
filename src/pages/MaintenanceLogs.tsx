import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Loader2, Plus } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../components/DataTable";
import { apiFetch } from "../utils/apiConfig";

interface MaintenanceLog {
  _id: string;
  treeCode: string;
  activity: string;
  remarks?: string;
  mitraId?: string;
  createdByName?: string;
  loggedAt?: string;
  createdAt?: string;
}

export const MaintenanceLogsView = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<MaintenanceLog[]>("/api/v1/maintenance-logs");
      setItems(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Failed to load maintenance logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const columns: ColumnDef<MaintenanceLog>[] = [
    { accessorKey: "treeCode", header: "Tree", enableSorting: true },
    { accessorKey: "activity", header: "Activity", enableSorting: true },
    {
      accessorKey: "remarks",
      header: "Remarks",
      cell: ({ row }) => row.original.remarks || "—",
    },
    { accessorKey: "createdByName", header: "Logged By" },
    { accessorKey: "mitraId", header: "Mitra ID" },
    {
      accessorKey: "loggedAt",
      header: "Logged At",
      enableSorting: true,
      cell: ({ row }) => {
        const value = row.original.loggedAt || row.original.createdAt;
        return value ? new Date(value).toLocaleString() : "—";
      },
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <button
          className="icon-btn"
          style={{ width: 28, height: 28 }}
          title="View"
          onClick={() =>
            navigate("/maintenance-logs/view", { state: { log: row.original } })
          }
        >
          <Eye size={14} />
        </button>
      ),
    },
  ];

  return (
    <div className="dashboard-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Maintenance Logs</h1>
          <p>Field maintenance activity logged by Mitras from the app.</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => navigate("/maintenance-logs/add")}
        >
          <Plus size={18} />
          Add Log
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
            searchPlaceholder="Search tree, activity..."
          />
        )}
      </div>
    </div>
  );
};
