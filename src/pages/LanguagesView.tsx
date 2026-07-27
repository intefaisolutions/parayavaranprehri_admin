import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Filter, Edit, Trash2, Loader2, Languages as LanguagesIcon, ToggleLeft, ToggleRight } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../components/DataTable";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";
import { apiFetch } from "../utils/apiConfig";

interface Language {
  _id: string;
  languageName: string;
  languageCode: string;
  translationProgress: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
};

export const LanguagesView = () => {
  const navigate = useNavigate();
  const [languageList, setLanguageList] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [languageToDelete, setLanguageToDelete] = useState<Language | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadLanguages = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<Language[]>("/api/v1/languages?limit=100");
      setLanguageList(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load Languages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLanguages();
  }, []);

  const openDeleteModal = (language: Language) => {
    setLanguageToDelete(language);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!languageToDelete) return;
    try {
      await apiFetch(`/api/v1/languages/${languageToDelete._id}`, { method: "DELETE" });
      await loadLanguages();
    } catch (err: any) {
      setError(err.message || "Failed to delete Language");
    } finally {
      setLanguageToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const toggleStatus = async (language: Language) => {
    setTogglingId(language._id);
    try {
      const nextStatus = language.status === "Active" ? "Inactive" : "Active";
      await apiFetch(`/api/v1/languages/${language._id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      await loadLanguages();
    } catch (err: any) {
      setError(err.message || "Failed to update status");
    } finally {
      setTogglingId(null);
    }
  };

  const columns: ColumnDef<Language>[] = [
    {
      accessorKey: "languageName",
      header: "Language Name",
      enableSorting: true,
    },
    {
      accessorKey: "languageCode",
      header: "Language Code",
      enableSorting: true,
    },
    {
      accessorKey: "translationProgress",
      header: "Translation Progress",
      enableSorting: true,
      cell: ({ row }) => <span>{row.original.translationProgress}%</span>,
    },
    {
      accessorKey: "createdAt",
      header: "Added Date",
      enableSorting: true,
      cell: ({ row }) => <span>{formatDate(row.original.createdAt)}</span>,
    },
    {
      accessorKey: "updatedAt",
      header: "Updated Date",
      enableSorting: true,
      cell: ({ row }) => <span>{formatDate(row.original.updatedAt)}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: false,
      cell: ({ row }) => (
        <button
          className={`status-badge ${
            row.original.status === "Active" ? "status-active" : "status-inactive"
          }`}
          style={{ border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
          onClick={() => toggleStatus(row.original)}
          disabled={togglingId === row.original._id}
          title="Click to toggle"
        >
          {togglingId === row.original._id ? (
            <Loader2 size={12} className="spin" />
          ) : row.original.status === "Active" ? (
            <ToggleRight size={14} />
          ) : (
            <ToggleLeft size={14} />
          )}
          {row.original.status}
        </button>
      ),
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="icon-btn" onClick={() => navigate("/languages/edit", { state: { language: row.original } })}>
            <Edit size={14} />
          </button>

          <button className="icon-btn" onClick={() => openDeleteModal(row.original)}>
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
            <h1>Languages</h1>
            <p>Manage application languages and translations.</p>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button className="icon-btn">
              <Filter size={18} />
            </button>

            <button className="btn-primary" onClick={() => navigate("/languages/add")}>
              <Plus size={18} />
              Add Language
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
            <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
              <Loader2 size={24} className="spin" />
            </div>
          ) : languageList.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "60px 20px", textAlign: "center" }}>
              <LanguagesIcon size={40} color="var(--text-secondary)" />
              <h3 style={{ margin: 0 }}>No languages yet</h3>
              <p style={{ margin: 0, color: "var(--text-secondary)" }}>
                Add your first language to start managing translations.
              </p>
              <button className="btn-primary" onClick={() => navigate("/languages/add")}>
                <Plus size={16} />
                Add first language
              </button>
            </div>
          ) : (
            <DataTable
              data={languageList}
              columns={columns}
              searchPlaceholder="Search language name, code..."
            />
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setLanguageToDelete(null);
        }}
        onConfirm={handleDelete}
        personName={languageToDelete?.languageName}
        title="Delete Language"
      />
    </>
  );
};
