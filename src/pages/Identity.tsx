import React, { useEffect, useState } from "react";
import { IdCard, Plus, Filter, Edit, Trash2, Loader2, ToggleLeft, ToggleRight } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../components/DataTable";
import IdentityModal from "./modals/IdentityModal";
import type { IdentityFormData } from "./modals/IdentityModal";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";
import { apiFetch } from "../utils/apiConfig";
import type { SelectOption } from "../components/form/SmartForm";

interface PersonIdentity {
  _id: string;
  identityId: string;
  person?: string;
  personName: string;
  personMobile?: string;
  photo?: string;
  qrCode?: string;
  vehicleStickerStatus: string;
  generatedDate?: string;
  status: string;
}

interface PersonOption {
  _id: string;
  name: string;
  mobile: string;
}

const initialForm: IdentityFormData = {
  person: "",
  personName: "",
  personMobile: "",
  photo: "",
  qrCode: "",
  vehicleStickerStatus: "Pending",
  generatedDate: "",
  status: "Active",
};

const toDateInputValue = (value?: string) => (value ? value.slice(0, 10) : "");

export const IdentityView = () => {
  const [identities, setIdentities] = useState<PersonIdentity[]>([]);
  const [personOptions, setPersonOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<IdentityFormData>(initialForm);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [identityToDelete, setIdentityToDelete] = useState<PersonIdentity | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadIdentities = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<PersonIdentity[]>("/api/v1/person-identity");
      setIdentities(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load Person Identities");
    } finally {
      setLoading(false);
    }
  };

  const loadPersonOptions = async () => {
    try {
      const data = await apiFetch<PersonOption[]>("/api/v1/persons?limit=500");
      setPersonOptions(
        (data || []).map((p) => ({ label: `${p.name} (${p.mobile})`, value: p._id }))
      );
    } catch {
      // Non-critical: the identity list still works without the person picker.
    }
  };

  useEffect(() => {
    loadIdentities();
    loadPersonOptions();
  }, []);

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const { _id, identityId: _identityId, ...rest } = formData;
    const payload: Record<string, any> = {};
    Object.entries(rest).forEach(([key, value]) => {
      if (value === "" || value === undefined || value === null) return;
      payload[key] = value;
    });

    try {
      if (editing && _id) {
        await apiFetch(`/api/v1/person-identity/${_id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/v1/person-identity", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      setShowModal(false);
      await loadIdentities();
    } catch (err: any) {
      setError(err.message || "Failed to save Identity");
    } finally {
      setSubmitting(false);
    }
  };

  const openAddModal = () => {
    setEditing(false);
    setFormData(initialForm);
    setShowModal(true);
  };

  const openEditModal = (identity: PersonIdentity) => {
    setEditing(true);
    setFormData({
      _id: identity._id,
      identityId: identity.identityId,
      person: identity.person || "",
      personName: identity.personName,
      personMobile: identity.personMobile || "",
      photo: identity.photo || "",
      qrCode: identity.qrCode || "",
      vehicleStickerStatus: identity.vehicleStickerStatus,
      generatedDate: toDateInputValue(identity.generatedDate),
      status: identity.status,
    });
    setShowModal(true);
  };

  const openDeleteModal = (identity: PersonIdentity) => {
    setIdentityToDelete(identity);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!identityToDelete) return;
    try {
      await apiFetch(`/api/v1/person-identity/${identityToDelete._id}`, { method: "DELETE" });
      await loadIdentities();
    } catch (err: any) {
      setError(err.message || "Failed to delete Identity");
    } finally {
      setIdentityToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const toggleVehicleSticker = async (identity: PersonIdentity) => {
    setTogglingId(identity._id);
    try {
      const next = identity.vehicleStickerStatus === "Generated" ? "Pending" : "Generated";
      await apiFetch(`/api/v1/person-identity/${identity._id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ vehicleStickerStatus: next }),
      });
      await loadIdentities();
    } catch (err: any) {
      setError(err.message || "Failed to update vehicle sticker status");
    } finally {
      setTogglingId(null);
    }
  };

  const columns: ColumnDef<PersonIdentity>[] = [
    { accessorKey: "identityId", header: "Identity ID", enableSorting: true },
    { accessorKey: "personName", header: "Person Name", enableSorting: true },
    { accessorKey: "personMobile", header: "Mobile", enableSorting: true },
    {
      accessorKey: "qrCode",
      header: "QR Code",
      cell: ({ row }) => <div style={{ fontSize: "12px" }}>{row.original.qrCode || "-"}</div>,
      enableSorting: true,
    },
    {
      accessorKey: "vehicleStickerStatus",
      header: "Vehicle Sticker Status",
      enableSorting: false,
      cell: ({ row }) => (
        <button
          className={`status-badge ${row.original.vehicleStickerStatus === "Generated" ? "status-active" : "status-warning"}`}
          style={{ border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
          onClick={() => toggleVehicleSticker(row.original)}
          disabled={togglingId === row.original._id}
          title="Click to toggle"
        >
          {togglingId === row.original._id ? (
            <Loader2 size={12} className="spin" />
          ) : row.original.vehicleStickerStatus === "Generated" ? (
            <ToggleRight size={14} />
          ) : (
            <ToggleLeft size={14} />
          )}
          {row.original.vehicleStickerStatus}
        </button>
      ),
    },
    {
      accessorKey: "generatedDate",
      header: "Generated Date",
      enableSorting: true,
      cell: ({ row }) => <span>{toDateInputValue(row.original.generatedDate) || "-"}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span className={`status-badge ${row.original.status === "Active" ? "status-active" : "status-inactive"}`}>
          {row.original.status}
        </span>
      ),
      enableSorting: false,
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => openEditModal(row.original)}>
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
            <h1>Person Identity Management</h1>
            <p>Manage citizen identity cards, QR codes and vehicle sticker status.</p>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button className="icon-btn" title="Filter">
              <Filter size={18} />
            </button>
            <button className="btn-primary" onClick={openAddModal}>
              <Plus size={18} />
              Add Identity
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
          ) : identities.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                padding: "48px 20px",
                color: "var(--text-secondary)",
              }}
            >
              <IdCard size={28} />
              <p>No identity records created yet.</p>
              <button className="btn-primary" onClick={openAddModal}>
                <Plus size={16} />
                Add the first one
              </button>
            </div>
          ) : (
            <DataTable data={identities} columns={columns} searchPlaceholder="Search person name, identity ID..." />
          )}
        </div>
      </div>

      <IdentityModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        editing={editing}
        formData={formData}
        submitting={submitting}
        personOptions={personOptions}
        onFieldChange={handleFieldChange}
        handleSubmit={handleSubmit}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setIdentityToDelete(null);
        }}
        onConfirm={handleDelete}
        personName={identityToDelete?.personName}
        title="Delete Identity"
      />
    </>
  );
};

export default IdentityView;
