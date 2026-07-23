import React, { useEffect, useState } from "react";
import { Plus, Filter, Edit, Trash2, Award, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../components/DataTable";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";
import { apiFetch } from "../utils/apiConfig";

interface Certificate {
  _id: string;
  certificateType: string;
  templateName: string;
  logoUrl?: string;
  signatureUrl?: string;
  backgroundUrl?: string;
  lastUpdatedBy?: string;
  updatedAt?: string;
  status: string;
}

export const CertificatesView = () => {
  const navigate = useNavigate();

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [certificateToDelete, setCertificateToDelete] =
    useState<Certificate | null>(null);

  const loadTemplates = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<Certificate[]>("/api/v1/certificates/templates");
      setCertificates(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load certificate templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const openDeleteModal = (certificate: Certificate) => {
    setCertificateToDelete(certificate);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!certificateToDelete) return;

    try {
      await apiFetch(`/api/v1/certificates/templates/${certificateToDelete._id}`, {
        method: "DELETE",
      });
      await loadTemplates();
    } catch (err: any) {
      setError(err.message || "Failed to delete certificate template");
    } finally {
      setCertificateToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const columns: ColumnDef<Certificate>[] = [
    {
      accessorKey: "certificateType",
      header: "Certificate Type",
      enableSorting: true,
    },
    {
      accessorKey: "templateName",
      header: "Template Name",
      enableSorting: true,
    },
    {
      accessorKey: "lastUpdatedBy",
      header: "Last Updated By",
      enableSorting: true,
    },
    {
      accessorKey: "updatedAt",
      header: "Updated Date",
      enableSorting: true,
      cell: ({ row }) =>
        row.original.updatedAt
          ? new Date(row.original.updatedAt).toLocaleDateString()
          : "-",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`status-badge ${
            row.original.status === "Active"
              ? "status-active"
              : "status-inactive"
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
            title="Issue this certificate to a Mitra"
            style={{ width: 28, height: 28 }}
            onClick={() =>
              navigate("/certificates/issued", {
                state: { template: row.original },
              })
            }
          >
            <Award size={14} />
          </button>

          <button
            className="icon-btn"
            style={{ width: 28, height: 28 }}
            onClick={() =>
              navigate("/certificates/edit", {
                state: { certificate: row.original },
              })
            }
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
            <h1>Certificate Templates</h1>
            <p>Manage certificate templates, branding and status.</p>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button className="icon-btn" title="Filter">
              <Filter size={18} />
            </button>

            <button
              className="btn-primary"
              onClick={() => navigate("/certificates/issued")}
            >
              <Award size={18} />
              Issued Certificates
            </button>

            <button
              className="btn-primary"
              onClick={() => navigate("/certificates/add")}
            >
              <Plus size={18} />
              Add Template
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
              searchPlaceholder="Search certificate type, template..."
            />
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCertificateToDelete(null);
        }}
        onConfirm={handleDelete}
        personName={certificateToDelete?.templateName}
        title="Delete Certificate Template"
      />
    </>
  );
};
