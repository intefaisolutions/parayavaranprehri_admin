import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Edit, Loader2, X } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../components/DataTable";
import { apiFetch } from "../utils/apiConfig";

interface RashiPlantRequest {
  _id: string;
  requestId: string;
  userName?: string;
  mobile?: string;
  email?: string;
  district?: string;
  state?: string;
  rashiName: string;
  rashiNameHindi?: string;
  recommendedTree: string;
  scientificName?: string;
  localName?: string;
  treeDescription?: string;
  status: string;
  createdAt?: string;
  rejectionReason?: string;
}

const statusStyle: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: "rgba(245,158,11,0.12)", color: "#b45309" },
  APPROVED: { bg: "rgba(43,150,79,0.12)", color: "#126E35" },
  COMPLETED: { bg: "rgba(37,99,235,0.12)", color: "#1d4ed8" },
  REJECTED: { bg: "rgba(220,53,69,0.12)", color: "#b02a37" },
};

export const RashiPlantRequestsView = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<RashiPlantRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<RashiPlantRequest[]>(
        "/api/v1/rashi-plant-requests"
      );
      setEntries(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Failed to load sacred tree plant requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const review = async (
    id: string,
    status: "APPROVED" | "REJECTED" | "COMPLETED"
  ) => {
    let rejectionReason: string | undefined;
    if (status === "REJECTED") {
      rejectionReason =
        window.prompt("Rejection reason (required):") || undefined;
      if (!rejectionReason?.trim()) return;
    }
    setReviewingId(id);
    try {
      await apiFetch(`/api/v1/rashi-plant-requests/${id}/review`, {
        method: "PATCH",
        body: JSON.stringify({ status, rejectionReason }),
      });
      await load();
    } catch (err: any) {
      setError(err.message || "Review failed");
    } finally {
      setReviewingId(null);
    }
  };

  const columns: ColumnDef<RashiPlantRequest>[] = [
    { accessorKey: "requestId", header: "ID" },
    {
      accessorKey: "userName",
      header: "User",
      cell: ({ row }) => (
        <div>
          <div>{row.original.userName || "—"}</div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            {row.original.mobile || row.original.email || ""}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "rashiName",
      header: "Rashi",
      enableSorting: true,
      cell: ({ row }) => (
        <span>
          {row.original.rashiName}
          {row.original.rashiNameHindi
            ? ` (${row.original.rashiNameHindi})`
            : ""}
        </span>
      ),
    },
    {
      accessorKey: "recommendedTree",
      header: "Sacred Tree",
      enableSorting: true,
      cell: ({ row }) => (
        <div>
          <div>{row.original.recommendedTree}</div>
          {row.original.scientificName ? (
            <div
              style={{
                fontSize: 12,
                fontStyle: "italic",
                color: "var(--text-secondary)",
              }}
            >
              {row.original.scientificName}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const s = statusStyle[row.original.status] || statusStyle.PENDING;
        return (
          <span
            style={{
              display: "inline-block",
              padding: "4px 10px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
              background: s.bg,
              color: s.color,
            }}
          >
            {row.original.status}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Requested",
      cell: ({ row }) =>
        row.original.createdAt
          ? new Date(row.original.createdAt).toLocaleString()
          : "—",
    },
    {
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => {
        const p = row.original;
        const busy = reviewingId === p._id;
        return (
          <div style={{ display: "flex", gap: 6 }}>
            <button
              type="button"
              className="icon-btn"
              style={{ width: 28, height: 28 }}
              title="View / update"
              onClick={() =>
                navigate("/rashi-plant-requests/review", {
                  state: { request: p },
                })
              }
            >
              <Edit size={14} />
            </button>
            {p.status === "PENDING" && (
              <>
                <button
                  type="button"
                  className="icon-btn"
                  style={{ width: 28, height: 28 }}
                  title="Approve"
                  disabled={busy}
                  onClick={() => void review(p._id, "APPROVED")}
                >
                  <Check size={14} color="#126E35" />
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  style={{ width: 28, height: 28 }}
                  title="Reject"
                  disabled={busy}
                  onClick={() => void review(p._id, "REJECTED")}
                >
                  <X size={14} color="#b02a37" />
                </button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="dashboard-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Sacred Tree Plant Requests</h1>
          <p>
            Requests from the app Rashi Van — review user details, selected
            Rashi and sacred tree.
          </p>
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
            data={entries}
            columns={columns}
            searchPlaceholder="Search by user, Rashi, tree, mobile…"
          />
        )}
      </div>
    </div>
  );
};

export default RashiPlantRequestsView;
