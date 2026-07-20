import React, { useState } from "react";
import { Plus, Filter, Edit, Trash2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DataTable from "../components/DataTable";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";

interface Certificate {
  id: string;
  certificateType: string;
  templateName: string;
  logo: string;
  signature: string;
  background: string;
  lastUpdatedBy: string;
  updatedDate: string;
  status: string;
}

export const CertificatesView = () => {
  const navigate = useNavigate();

  const [certificates, setCertificates] = useState<Certificate[]>(
    Array.from({ length: 50 }, (_, i) => ({
      id: `CERT-${String(i + 1).padStart(3, "0")}`,
      certificateType: i % 2 === 0 ? "Participation" : "Achievement",
      templateName: `Template ${i + 1}`,
      logo: "Default Logo",
      signature: "Authorized Sign",
      background: "Blue Background",
      lastUpdatedBy: `Admin ${i + 1}`,
      updatedDate: "2026-02-15",
      status: i % 3 === 0 ? "Inactive" : "Active",
    }))
  );

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [certificateToDelete, setCertificateToDelete] =
    useState<Certificate | null>(null);

  const openDeleteModal = (certificate: Certificate) => {
    setCertificateToDelete(certificate);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (!certificateToDelete) return;

    setCertificates((prev) =>
      prev.filter(
        (certificate) => certificate.id !== certificateToDelete.id
      )
    );

    setCertificateToDelete(null);
    setShowDeleteModal(false);
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
      accessorKey: "logo",
      header: "Logo",
      enableSorting: true,
    },
    {
      accessorKey: "signature",
      header: "Signature",
      enableSorting: true,
    },
    {
      accessorKey: "background",
      header: "Background",
      enableSorting: true,
    },
    {
      accessorKey: "lastUpdatedBy",
      header: "Last Updated By",
      enableSorting: true,
    },
    {
      accessorKey: "updatedDate",
      header: "Updated Date",
      enableSorting: true,
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
            style={{ width: 28, height: 28 }}
          >
            <Eye size={14} />
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
            <h1>Certificate Management</h1>
            <p>Manage certificate templates, branding and status.</p>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button className="icon-btn">
              <Filter size={18} />
            </button>

            <button
              className="btn-primary"
              onClick={() => navigate("/certificates/add")}
            >
              <Plus size={18} />
              Add Certificate
            </button>
          </div>
        </div>

        <div className="card">
          <DataTable
            data={certificates}
            columns={columns}
            searchPlaceholder="Search certificate type, template..."
          />
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
      />
    </>
  );
};