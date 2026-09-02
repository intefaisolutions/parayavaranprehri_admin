import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Filter, Edit, Trash2, Eye, Loader2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../components/DataTable";
import { MediaImage } from "../components/media/MediaImage";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";
import { apiFetch } from "../utils/apiConfig";

interface News {
  _id: string;
  title: string;
  content: string;
  category: string;
  image?: string;
  url?: string;
  author: string;
  publishedDate?: string;
  views: number;
  tags?: string[];
  status: string;
}

const toDateInputValue = (value?: string) => (value ? value.slice(0, 10) : "");

export const NewsView = () => {
  const navigate = useNavigate();
  const [newsList, setNewsList] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          <MediaImage
            src={row.original.image}
            alt="News"
            width={60}
            height={40}
            style={{ borderRadius: 6, objectFit: "cover" }}
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
          {row.original.url && (
            <button
              className="icon-btn"
              style={{ width: 28, height: 28 }}
              title="Open Source Link"
              onClick={() => window.open(row.original.url, "_blank")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </button>
          )}

          <button
            className="icon-btn"
            style={{ width: 28, height: 28 }}
            title="View"
            onClick={() => navigate("/news/edit", { state: { news: row.original } })}
          >
            <Eye size={14} />
          </button>

          <button
            className="icon-btn"
            style={{ width: 28, height: 28 }}
            onClick={() => navigate("/news/edit", { state: { news: row.original } })}
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

            <button className="btn-primary" onClick={() => navigate("/news/add")}>
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
