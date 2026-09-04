import React, { useEffect, useState } from "react";
import {
  Plus,
  Filter,
  Ban,
  Trash2,
  Loader2,
  ArrowLeft,
  Eye,
  X,
  Download,
  MessageCircle,
} from "lucide-react";
import {
  buildCertificateShareText,
  downloadCertificatePdf,
  openWhatsAppShare,
} from "../components/certificates/certificateShare";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../components/DataTable";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";
import { apiFetch } from "../utils/apiConfig";
import { CertificateMitraPreview } from "../components/certificates/CertificateMitraPreview";

interface IssuedCertificate {
  _id: string;
  certificateNumber: string;
  recipientType: string;
  recipientId: string;
  recipientName: string;
  recipientMobile?: string;
  title: string;
  description?: string;
  eventName?: string;
  issueDate: string;
  verificationCode: string;
  status: string;
  templateId?: {
    templateName?: string;
    certificateType?: string;
    logoUrl?: string;
    signatureUrl?: string;
    backgroundUrl?: string;
  };
}

function issuedToPreviewData(cert: IssuedCertificate) {
  return {
    title: cert.title,
    recipientName: cert.recipientName,
    description: cert.description,
    eventName: cert.eventName,
    issueDate: cert.issueDate,
    verificationCode: cert.verificationCode,
    certificateNumber: cert.certificateNumber,
    logoUrl: cert.templateId?.logoUrl,
    signatureUrl: cert.templateId?.signatureUrl,
    backgroundUrl: cert.templateId?.backgroundUrl,
    templateName: cert.templateId?.templateName,
    certificateType: cert.templateId?.certificateType,
  };
}

export const IssuedCertificatesView = () => {
  const navigate = useNavigate();

  const [certificates, setCertificates] = useState<IssuedCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [certToDelete, setCertToDelete] = useState<IssuedCertificate | null>(null);
  const [previewCert, setPreviewCert] = useState<IssuedCertificate | null>(null);

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
      header: "Recipient Type",
      cell: ({ row }) =>
        row.original.recipientType === "MITRA" ? (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 10px",
              borderRadius: "12px",
              background: "#dcfce7",
              color: "#16a34a",
              fontWeight: 600,
              fontSize: "12px",
            }}
          >
            🌿 Paryavaran Mitra
          </span>
        ) : (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 10px",
              borderRadius: "12px",
              background: "#e0f2fe",
              color: "#0284c7",
              fontWeight: 600,
              fontSize: "12px",
            }}
          >
            👤 Paryavaran Prahri (User)
          </span>
        ),
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
          <button
            className="icon-btn"
            title="Mitra view preview"
            style={{ width: 28, height: 28 }}
            onClick={() => setPreviewCert(row.original)}
          >
            <Eye size={14} />
          </button>
          <button
            className="icon-btn"
            title="Download / PDF"
            style={{ width: 28, height: 28 }}
            onClick={() => {
              void downloadCertificatePdf(issuedToPreviewData(row.original));
            }}
          >
            <Download size={14} />
          </button>
          <button
            className="icon-btn"
            title="Share WhatsApp"
            style={{ width: 28, height: 28 }}
            onClick={async () => {
              const cert = row.original;
              const text = buildCertificateShareText(issuedToPreviewData(cert));
              // Open compose without locking to recipient number
              // (avoids "number isn't on WhatsApp" on Desktop)
              openWhatsAppShare({ text });
              try {
                await apiFetch(
                  `/api/v1/certificates/${cert._id}/share-whatsapp`,
                  { method: "POST" },
                );
              } catch {
                /* compose already opened */
              }
            }}
          >
            <MessageCircle size={14} />
          </button>
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

      {previewCert && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1200,
            background: "rgba(12, 28, 18, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={() => setPreviewCert(null)}
        >
          <div
            className="card"
            style={{
              width: "min(420px, 100%)",
              padding: 16,
              maxHeight: "92vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <strong>Mitra view preview</strong>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setPreviewCert(null)}
              >
                <X size={16} />
              </button>
            </div>
            <CertificateMitraPreview
              variant="phone"
              certificateId={previewCert._id}
              recipientMobile={previewCert.recipientMobile}
              showActions
              data={issuedToPreviewData(previewCert)}
            />
          </div>
        </div>
      )}
    </>
  );
};
