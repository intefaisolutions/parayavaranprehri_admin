import React, { useState } from "react";
import { Plus, Filter, Edit, Trash2, Eye } from "lucide-react";
import DataTable from "../components/DataTable";
import LanguageModal from "./modals/LanguageModal";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";

interface Language {
  id: string;
  languageName: string;
  languageCode: string;
  translationProgress: string;
  addedDate: string;
  updatedDate: string;
  status: string;
}

export const LanguagesView = () => {
  const initialForm = {
    id: "",
    languageName: "",
    languageCode: "",
    translationProgress: "0%",
    addedDate: "",
    updatedDate: "",
    status: "Active",
  };

  const [languageList, setLanguageList] = useState<Language[]>(
    Array.from({ length: 100 }, (_, i) => ({
      id: `LANG-${String(i + 1).padStart(3, "0")}`,
      languageName:
        i % 3 === 0
          ? "English"
          : i % 3 === 1
          ? "Hindi"
          : "Spanish",
      languageCode:
        i % 3 === 0
          ? "EN"
          : i % 3 === 1
          ? "HI"
          : "ES",
      translationProgress:
        `${(i * 5) % 101}%`,
      addedDate:
        "2026-01-10",
      updatedDate:
        "2026-02-20",
      status:
        i % 2 === 0
          ? "Active"
          : "Inactive",
    }))
  );

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [languageToDelete, setLanguageToDelete] =
    useState<Language | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (editing) {
      setLanguageList((prev) =>
        prev.map((item) =>
          item.id === formData.id
            ? { ...item, ...formData }
            : item
        )
      );
    } else {
      setLanguageList((prev) => [
        {
          ...formData,
          id: `LANG-${Date.now()}`,
        },
        ...prev,
      ]);
    }

    setShowModal(false);
  };

  const openAddModal = () => {
    setEditing(false);
    setFormData(initialForm);
    setShowModal(true);
  };

  const openEditModal = (
    language: Language
  ) => {
    setEditing(true);
    setFormData(language);
    setShowModal(true);
  };

  const openDeleteModal = (
    language: Language
  ) => {
    setLanguageToDelete(language);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (!languageToDelete) return;

    setLanguageList((prev) =>
      prev.filter(
        (item) =>
          item.id !== languageToDelete.id
      )
    );

    setShowDeleteModal(false);
    setLanguageToDelete(null);
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
      cell: ({ row }) => (
        <div>
          <span>
            {row.original.translationProgress}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "addedDate",
      header: "Added Date",
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
          <button className="icon-btn">
            <Eye size={14} />
          </button>

          <button
            className="icon-btn"
            onClick={() =>
              openEditModal(row.original)
            }
          >
            <Edit size={14} />
          </button>

          <button
            className="icon-btn"
            onClick={() =>
              openDeleteModal(row.original)
            }
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
            <h1>Languages</h1>
            <p>
              Manage application languages and translations.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button className="icon-btn">
              <Filter size={18} />
            </button>

            <button
              className="btn-primary"
              onClick={openAddModal}
            >
              <Plus size={18} />
              Add Language
            </button>
          </div>
        </div>

        <div className="card">
          <DataTable
            data={languageList}
            columns={columns}
            searchPlaceholder="Search language name, code..."
          />
        </div>
      </div>

      <LanguageModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        editing={editing}
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setLanguageToDelete(null);
        }}
        onConfirm={handleDelete}
        personName={languageToDelete?.languageName}
      />
    </>
  );
};