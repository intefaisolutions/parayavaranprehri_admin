import React, { useState } from "react";
import { Plus, Filter, Edit, Trash2, Eye } from "lucide-react";
import DataTable from "../components/DataTable";
import NewsModal from "./modals/NewsModal";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";

interface News {
  id: string;
  newsTitle: string;
  category: string;
  image: string;
  publishedDate: string;
  createdBy: string;
  views: number;
  publishStatus: string;
}

export const NewsView = () => {

  const initialForm = {
    id: "",
    newsTitle: "",
    category: "",
    image: "",
    publishedDate: "",
    createdBy: "",
    views: "",
    publishStatus: "Draft",
  };

  const [newsList, setNewsList] = useState<News[]>(
    Array.from({ length: 100 }, (_, i) => ({
      id: `NEWS-${String(i + 1).padStart(3, "0")}`,
      newsTitle: `Tree Plantation Drive ${i + 1}`,
      category: i % 2 === 0 ? "Environment" : "Events",
      image: "news.jpg",
      publishedDate: "2026-02-15",
      createdBy: `Admin ${i % 5 + 1}`,
      views: (i + 1) * 150,
      publishStatus: i % 2 === 0 ? "Published" : "Draft",
    }))
  );

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(initialForm);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState<News | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (editing) {
      setNewsList((prev) =>
        prev.map((item) =>
          item.id === formData.id
            ? {
                ...item,
                ...formData,
                views: Number(formData.views),
              }
            : item
        )
      );
    } else {
      setNewsList((prev) => [
        {
          id: formData.id,
          newsTitle: formData.newsTitle,
          category: formData.category,
          image: formData.image,
          publishedDate: formData.publishedDate,
          createdBy: formData.createdBy,
          views: Number(formData.views),
          publishStatus: formData.publishStatus,
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

  const openEditModal = (news: News) => {
    setEditing(true);
    setFormData({
      ...news,
      views: String(news.views),
    });
    setShowModal(true);
  };

  const openDeleteModal = (news: News) => {
    setNewsToDelete(news);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (!newsToDelete) return;

    setNewsList((prev) =>
      prev.filter((item) => item.id !== newsToDelete.id)
    );

    setShowDeleteModal(false);
    setNewsToDelete(null);
  };

  const columns: ColumnDef<News>[] = [
    {
      accessorKey: "newsTitle",
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
      cell: () => (
        <img
          src="/news.jpg"
          alt="News"
          width={60}
          height={40}
          style={{ borderRadius: 6, objectFit: "cover" }}
        />
      ),
    },
    {
      accessorKey: "publishedDate",
      header: "Published Date",
      enableSorting: true,
    },
    {
      accessorKey: "createdBy",
      header: "Created By",
      enableSorting: true,
    },
    {
      accessorKey: "views",
      header: "Views",
      enableSorting: true,
    },
    {
      accessorKey: "publishStatus",
      header: "Publish Status",
      cell: ({ row }) => (
        <span
          className={`status-badge ${
            row.original.publishStatus === "Published"
              ? "status-active"
              : "status-inactive"
          }`}
        >
          {row.original.publishStatus}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="icon-btn" style={{ width: 28, height: 28 }}>
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
            <button className="icon-btn">
              <Filter size={18} />
            </button>

            <button className="btn-primary" onClick={openAddModal}>
              <Plus size={18} />
              Add News
            </button>
          </div>
        </div>

        <div className="card">
          <DataTable
            data={newsList}
            columns={columns}
            searchPlaceholder="Search news title, category..."
          />
        </div>
      </div>

      <NewsModal
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
          setNewsToDelete(null);
        }}
        onConfirm={handleDelete}
        personName={newsToDelete?.newsTitle}
      />
    </>
  );
};