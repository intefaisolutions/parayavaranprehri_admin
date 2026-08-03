import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Users } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../components/DataTable";
import { apiFetch } from "../utils/apiConfig";

interface AttendanceRow {
  _id: string;
  mitraId: string;
  mitraName?: string;
  status: string;
  attendedAt?: string;
  notes?: string;
}

export const MitraEventAttendanceView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const event = location.state?.event as
    | { _id: string; title?: string; date?: string }
    | undefined;

  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!event?._id) {
      navigate("/mitra-events");
      return;
    }
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await apiFetch<AttendanceRow[]>(
          `/api/v1/mitra-events/${event._id}/attendance`,
        );
        if (mounted) setRows(Array.isArray(data) ? data : []);
      } catch (err: any) {
        if (mounted) setError(err.message || "Failed to load attendance");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [event?._id, navigate]);

  const columns: ColumnDef<AttendanceRow>[] = [
    { accessorKey: "mitraId", header: "Mitra ID", enableSorting: true },
    { accessorKey: "mitraName", header: "Name", enableSorting: true },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span className="status-badge status-active">{row.original.status}</span>
      ),
    },
    {
      accessorKey: "attendedAt",
      header: "Marked At",
      cell: ({ row }) =>
        row.original.attendedAt
          ? new Date(row.original.attendedAt).toLocaleString()
          : "—",
    },
    { accessorKey: "notes", header: "Notes" },
  ];

  return (
    <div className="dashboard-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Event Attendance</h1>
          <p>
            {event?.title || "Mitra Event"}
            {event?.date ? ` · ${String(event.date).slice(0, 10)}` : ""}
          </p>
        </div>
        <button className="btn-secondary" onClick={() => navigate("/mitra-events")}>
          <ArrowLeft size={18} />
          Back
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
        ) : rows.length === 0 ? (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: "var(--text-secondary)",
            }}
          >
            <Users size={28} style={{ marginBottom: 8 }} />
            <p>No attendance marked yet for this event.</p>
          </div>
        ) : (
          <DataTable
            data={rows}
            columns={columns}
            searchPlaceholder="Search mitra..."
          />
        )}
      </div>
    </div>
  );
};
