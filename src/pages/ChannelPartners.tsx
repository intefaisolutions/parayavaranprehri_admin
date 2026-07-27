import React, { useEffect, useState } from "react";
import { Plus, Filter, Edit, Trash2, Loader2, Handshake } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../components/DataTable";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";
import { apiFetch } from "../utils/apiConfig";

interface Partner {
  _id: string;
  partnerName: string;
  partnerType: string;
  contactPerson: string;
  phone: string;
  email?: string;
  location?: string;
  logo?: string;
  status: string;
}

export const PartnersView = () => {
  const navigate = useNavigate();

  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState<Partner | null>(null);

  const loadPartners = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<Partner[]>("/api/v1/partners?limit=100");
      setPartners(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load Channel Partners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartners();
  }, []);

  const openDeleteModal = (partner: Partner) => {
    setPartnerToDelete(partner);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!partnerToDelete) return;
    try {
      await apiFetch(`/api/v1/partners/${partnerToDelete._id}`, { method: "DELETE" });
      await loadPartners();
    } catch (err: any) {
      setError(err.message || "Failed to delete Channel Partner");
    } finally {
      setPartnerToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const columns: ColumnDef<Partner>[] = [
    {
      header: "Logo",
      cell: ({ row }) =>
        row.original.logo ? (
          <img
            src={row.original.logo}
            alt={row.original.partnerName}
            style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(43, 150, 79, 0.08)",
              color: "var(--accent-color)",
            }}
          >
            <Handshake size={16} />
          </div>
        ),
      enableSorting: false,
    },
    { accessorKey: "partnerName", header: "Partner Name", enableSorting: true },
    { accessorKey: "partnerType", header: "Partner Type", enableSorting: true },
    { accessorKey: "contactPerson", header: "Contact Person", enableSorting: true },
    { accessorKey: "phone", header: "Phone", enableSorting: true },
    { accessorKey: "email", header: "Email", enableSorting: true },
    { accessorKey: "location", header: "Location", enableSorting: true },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`status-badge ${row.original.status === "Active" ? "status-active" : "status-inactive"}`}
        >
          {row.original.status}
        </span>
      ),
      enableSorting: false,
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className="icon-btn"
            style={{ width: 28, height: 28 }}
            onClick={() => navigate("/partners/edit", { state: { partner: row.original } })}
          >
            <Edit size={14} />
          </button>

          <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => openDeleteModal(row.original)}>
            <Trash2 size={14} />
          </button>
        </div>
      ),
      enableSorting: false,
    },
  ];

  return (
    <>
      <div className="dashboard-area">
        <div className="page-header">
          <div className="page-title">
            <h1>Channel Partners</h1>
            <p>Manage channel partners and their details.</p>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button className="icon-btn" title="Filter">
              <Filter size={18} />
            </button>

            <button className="btn-primary" onClick={() => navigate("/partners/add")}>
              <Plus size={18} />
              Add Partner
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
          ) : partners.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
                padding: "60px 20px",
                textAlign: "center",
              }}
            >
              <Handshake size={40} color="var(--text-secondary)" />
              <div>
                <h3 style={{ margin: 0 }}>No channel partners yet</h3>
                <p style={{ color: "var(--text-secondary)", marginTop: 4 }}>
                  Add your first partner to start tracking collaborations.
                </p>
              </div>
              <button className="btn-primary" onClick={() => navigate("/partners/add")}>
                <Plus size={18} />
                Add First Partner
              </button>
            </div>
          ) : (
            <DataTable
              data={partners}
              columns={columns}
              searchPlaceholder="Search partner name, type, contact..."
            />
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setPartnerToDelete(null);
        }}
        onConfirm={handleDelete}
        personName={partnerToDelete?.partnerName}
        title="Delete Channel Partner"
      />
    </>
  );
};
