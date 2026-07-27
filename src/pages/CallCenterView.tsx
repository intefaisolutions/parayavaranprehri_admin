import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Filter, Edit, Trash2, Loader2, Phone } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../components/DataTable";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";
import { apiFetch } from "../utils/apiConfig";

interface CallCenterContact {
  _id: string;
  contactType: string;
  contactValue: string;
  availableHours?: string;
  assignedPerson?: string;
  lastUpdated?: string;
  status: string;
}

export const CallCenterView = () => {
  const navigate = useNavigate();
  const [callCenterList, setCallCenterList] = useState<CallCenterContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [callToDelete, setCallToDelete] = useState<CallCenterContact | null>(null);

  const loadContacts = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<CallCenterContact[]>("/api/v1/call-center");
      setCallCenterList(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load call center contacts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const openDeleteModal = (contact: CallCenterContact) => {
    setCallToDelete(contact);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!callToDelete) return;
    try {
      await apiFetch(`/api/v1/call-center/${callToDelete._id}`, { method: "DELETE" });
      await loadContacts();
    } catch (err: any) {
      setError(err.message || "Failed to delete contact");
    } finally {
      setCallToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const columns: ColumnDef<CallCenterContact>[] = [
    { accessorKey: "contactType", header: "Contact Type", enableSorting: true },
    { accessorKey: "contactValue", header: "Contact Value", enableSorting: true },
    { accessorKey: "availableHours", header: "Available Hours", enableSorting: true },
    { accessorKey: "assignedPerson", header: "Assigned Person", enableSorting: true },
    {
      accessorKey: "lastUpdated",
      header: "Last Updated",
      enableSorting: true,
      cell: ({ row }) =>
        row.original.lastUpdated ? new Date(row.original.lastUpdated).toLocaleDateString() : "-",
    },
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
    },
    {
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => navigate("/callcenter/edit", { state: { contact: row.original } })}>
            <Edit size={14} />
          </button>
          <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => openDeleteModal(row.original)}>
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
            <h1>Call Center</h1>
            <p>Manage the contact directory (helpline, WhatsApp, email) shown to users.</p>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button className="icon-btn" title="Filter">
              <Filter size={18} />
            </button>
            <button className="btn-primary" onClick={() => navigate("/callcenter/add")}>
              <Plus size={18} />
              Add Contact
            </button>
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
            <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
              <Loader2 size={24} className="spin" />
            </div>
          ) : callCenterList.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 20px", textAlign: "center" }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(43, 150, 79, 0.08)",
                  color: "var(--accent-color)",
                  marginBottom: 16,
                }}
              >
                <Phone size={26} />
              </div>
              <h3 style={{ margin: 0, marginBottom: 6 }}>No contact channels yet</h3>
              <p style={{ color: "var(--text-secondary)", marginBottom: 20 }}>
                Add your first helpline, WhatsApp or email contact channel.
              </p>
              <button className="btn-primary" onClick={() => navigate("/callcenter/add")}>
                <Plus size={18} />
                Add First Contact
              </button>
            </div>
          ) : (
            <DataTable
              data={callCenterList}
              columns={columns}
              searchPlaceholder="Search by contact value, assigned person..."
            />
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCallToDelete(null);
        }}
        onConfirm={handleDelete}
        personName={callToDelete?.contactValue}
        title="Delete Contact"
      />
    </>
  );
};

export default CallCenterView;
