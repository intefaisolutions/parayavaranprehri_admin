import React, { useEffect, useState } from "react";
import { Plus, Filter, Ban, Trash2, Loader2, ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../components/DataTable";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";
import IssueCertificateModal from "./modals/IssueCertificateModal";
import type {
  IssueCertificateFormData,
  MitraOption,
  TemplateOption,
} from "./modals/IssueCertificateModal";
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
  const location = useLocation();

  const prefill = location.state as
    | { mitra?: { mitraId: string; name: string; mobile: string }; template?: { _id: string } }
    | undefined;

  const [certificates, setCertificates] = useState<IssuedCertificate[]>([]);
  const [mitras, setMitras] = useState<MitraOption[]>([]);
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showIssueModal, setShowIssueModal] = useState(!!prefill);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [certToDelete, setCertToDelete] = useState<IssuedCertificate | null>(null);

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [certs, mitraList, templateList] = await Promise.all([
        apiFetch<IssuedCertificate[]>("/api/v1/certificates"),
        apiFetch<MitraOption[]>("/api/v1/mitras?status=Approved"),
        apiFetch<TemplateOption[]>("/api/v1/certificates/templates"),
      ]);
      setCertificates(certs || []);
      setMitras(mitraList || []);
      setTemplates((templateList || []).filter((t: any) => t.status !== "Inactive"));
    } catch (err: any) {
      setError(err.message || "Failed to load issued certificates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleIssue = async (data: IssueCertificateFormData) => {
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const payload: Record<string, unknown> = {
        templateId: data.templateId,
        recipientType: data.recipientType,
        recipientId: data.recipientId,
        title: data.title,
        description: data.description || undefined,
        eventName: data.eventName || undefined,
        issueDate: data.issueDate ? new Date(data.issueDate).toISOString() : undefined,
      };
      if (data.recipientType === "USER") {
        payload.recipientName = data.recipientName;
      }

      const created = await apiFetch<IssuedCertificate>("/api/v1/certificates", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setShowIssueModal(false);
      setSuccess(
        `Certificate ${created.certificateNumber} issued successfully to ${created.recipientName}.`
      );
      await loadAll();
    } catch (err: any) {
      setError(err.message || "Failed to issue certificate");
    } finally {
      setSubmitting(false);
    }
  };

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
            <button className="btn-primary" onClick={() => setShowIssueModal(true)}>
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

        {success && (
          <div style={{ background: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
            {success}
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

      <IssueCertificateModal
        isOpen={showIssueModal}
        onClose={() => setShowIssueModal(false)}
        mitras={mitras}
        templates={templates}
        submitting={submitting}
        initialData={{
          recipientId: prefill?.mitra?.mitraId,
          templateId: prefill?.template?._id,
        }}
        onSubmit={handleIssue}
      />

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
