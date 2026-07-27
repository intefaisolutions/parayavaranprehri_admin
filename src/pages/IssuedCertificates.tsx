import React, { useEffect, useState } from "react";
import { Plus, Filter, Ban, Trash2, Loader2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../components/DataTable";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";
import { apiFetch } from "../utils/apiConfig";

interface IssuedCertificate {
  _id: string;
  certificateNumber: string;
  recipientType: string;
  recipientId: string;
  recipientName: string;
  recipientMobile?: string;
  title: string;
  eventName?: string;
  issueDate: string;
  verificationCode: string;
  status: string;
  templateId?: { templateName?: string; certificateType?: string };
}

export const IssuedCertificatesView = () => {
  const navigate = useNavigate();

  const [certificates, setCertificates] = useState<IssuedCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [certToDelete, setCertToDelete] = useState<IssuedCertificate | null>(null);

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const certs = await apiFetch<IssuedCertificate[]>("/api/v1/certificates");
      setCertificates(certs || []);
    } catch (err: any) {
      setError(err.message || "Failed to load issued certificates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleRevoke = async (cert: IssuedCertificate) => {
    try {
      await apiFetch(`/api/v1/certificates/${cert._id}/revoke`, { method: "PATCH" });
      await loadAll();
    } catch (err: any) {
      setError(err.message || "Failed to revoke certificate");
    }
  };

  const openDeleteModal = (cert: IssuedCertificate) => {
    setCertToDelete(cert);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!certToDelete) return;
    try {
      await apiFetch(`/api/v1/certificates/${certToDelete._id}`, { method: "DELETE" });
      await loadAll();
    } catch (err: any) {
      setError(err.message || "Failed to delete certificate");
    } finally {
      setCertToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const columns: ColumnDef<IssuedCertificate>[] = [
    { accessorKey: "certificateNumber", header: "Certificate No.", enableSorting: true },
    { accessorKey: "recipientName", header: "Recipient", enableSorting: true },
    {
      header: "Type",
      cell: ({ row }) => (row.original.recipientType === "MITRA" ? "Mitra" : "User"),
    },
    { accessorKey: "title", header: "Title", enableSorting: true },
    {
      header: "Template",
      cell: ({ row }) => row.original.templateId?.templateName || "-",
    },
    {
      accessorKey: "issueDate",
      header: "Issue Date",
      enableSorting: true,
      cell: ({ row }) => new Date(row.original.issueDate).toLocaleDateString(),
    },
    { accessorKey: "verificationCode", header: "Verification Code" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`status-badge ${
            row.original.status === "ISSUED" ? "status-active" : "status-inactive"
          }`}
        >
          {row.original.status}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div style={{ display: "flex", gap: "8px" }}>
          {row.original.status === "ISSUED" && (
            <button
              className="icon-btn"
              title="Revoke"
              style={{ width: 28, height: 28 }}
              onClick={() => handleRevoke(row.original)}
            >
              <Ban size={14} />
            </button>
          )}
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
            <h1>Issued Certificates</h1>
            <p>Certificates issued to Paryavaran Mitras (volunteers) and other users.</p>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button className="icon-btn" title="Back to Templates" onClick={() => navigate("/certificates")}>
              <ArrowLeft size={18} />
            </button>
            <button className="icon-btn" title="Filter">
              <Filter size={18} />
            </button>
            <button className="btn-primary" onClick={() => navigate("/certificates/issue")}>
              <Plus size={18} />
              Issue Certificate
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
              data={certificates}
              columns={columns}
              searchPlaceholder="Search by certificate number, recipient..."
            />
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCertToDelete(null);
        }}
        onConfirm={handleDelete}
        personName={certToDelete?.certificateNumber}
        title="Delete Certificate"
      />
    </>
  );
};
