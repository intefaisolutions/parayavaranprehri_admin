import React, { useEffect, useState } from "react";
import { Plus, Filter, Edit, Trash2, Eye, Loader2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../components/DataTable";
import NewsModal from "./modals/NewsModal";
import type { NewsFormData } from "./modals/NewsModal";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";
import { apiFetch } from "../utils/apiConfig";

interface News {
  _id: string;
  title: string;
  content: string;
  category: string;
  image?: string;
  author: string;
  publishedDate?: string;
  views: number;
  tags?: string[];
  status: string;
}

const initialForm: NewsFormData = {
  title: "",
  content: "",
  category: "Environment",
  image: "",
  author: "",
  publishedDate: "",
  views: "",
  tags: [],
  status: "Draft",
};

const toDateInputValue = (value?: string) => (value ? value.slice(0, 10) : "");

export const NewsView = () => {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<NewsFormData>(initialForm);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState<News | null>(null);

  const loadNews = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<News[]>("/api/v1/news");
      setNewsList(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load News");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const { _id, ...rest } = formData;
    const payload = {
      ...rest,
      views: rest.views === "" || rest.views === undefined ? undefined : Number(rest.views),
      publishedDate: rest.publishedDate || undefined,
    };

    try {
      if (editing && _id) {
        await apiFetch(`/api/v1/news/${_id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/v1/news", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      setShowModal(false);
      await loadNews();
    } catch (err: any) {
      setError(err.message || "Failed to save News");
    } finally {
      setSubmitting(false);
    }
  };

  const openAddModal = () => {
    setEditing(false);
    setError("");
    setFormData(initialForm);
    setShowModal(true);
  };

  const openEditModal = (news: News) => {
    setEditing(true);
    setError("");
    setFormData({
      _id: news._id,
      title: news.title,
      content: news.content,
      category: news.category,
      image: news.image || "",
      author: news.author,
      publishedDate: toDateInputValue(news.publishedDate),
      views: news.views ?? 0,
      tags: news.tags || [],
      status: news.status,
    });
    setShowModal(true);
  };

  const openDeleteModal = (news: News) => {
    setNewsToDelete(news);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!newsToDelete) return;
    try {
      await apiFetch(`/api/v1/news/${newsToDelete._id}`, { method: "DELETE" });
      await loadNews();
    } catch (err: any) {
      setError(err.message || "Failed to delete News");
    } finally {
      setShowDeleteModal(false);
      setNewsToDelete(null);
    }
  };

  const columns: ColumnDef<News>[] = [
    {
      accessorKey: "title",
      header: "News Title",
      enableSorting: true,
    },
    {
      accessorKey: "category",
      header: "Category",
      enableSorting: true,
    },
    {
      accessorKey: "image",
      header: "Image",
      cell: ({ row }) =>
        row.original.image ? (
          <img
            src={row.original.image}
            alt="News"
            width={60}
            height={40}
            style={{ borderRadius: 6, objectFit: "cover" }}
            onError={(e) => ((e.target as HTMLImageElement).style.visibility = "hidden")}
          />
        ) : (
          <span style={{ color: "var(--text-secondary)" }}>—</span>
        ),
    },
    {
      accessorKey: "publishedDate",
      header: "Published Date",
      enableSorting: true,
      cell: ({ row }) => toDateInputValue(row.original.publishedDate) || "—",
    },
    {
      accessorKey: "author",
      header: "Author",
      enableSorting: true,
    },
    {
      accessorKey: "views",
      header: "Views",
      enableSorting: true,
    },
    {
      accessorKey: "status",
      header: "Publish Status",
      cell: ({ row }) => (
        <span
          className={`status-badge ${
            row.original.status === "Published"
              ? "status-active"
              : row.original.status === "Draft"
              ? "status-warning"
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
            title="View"
            onClick={() => openEditModal(row.original)}
          >
            <Eye size={14} />
          </button>

          <button
            className="icon-btn"
            style={{ width: 28, height: 28 }}
            onClick={() => openEditModal(row.original)}
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
            <h1>News Management</h1>
            <p>Manage news articles and publication status.</p>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button className="icon-btn" title="Filter">
              <Filter size={18} />
            </button>

            <button className="btn-primary" onClick={openAddModal}>
              <Plus size={18} />
              Add News
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
          ) : (
            <DataTable
              data={newsList}
              columns={columns}
              searchPlaceholder="Search news title, category..."
            />
          )}
        </div>
      </div>

      <NewsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        editing={editing}
        formData={formData}
        submitting={submitting}
        error={error}
        onFieldChange={handleFieldChange}
        handleSubmit={handleSubmit}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setNewsToDelete(null);
        }}
        onConfirm={handleDelete}
        personName={newsToDelete?.title}
        title="Delete News"
      />
    </>
  );
};
