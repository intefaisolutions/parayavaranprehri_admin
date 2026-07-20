import React, { useState } from "react";
import { Plus, Filter, Edit, Trash2, Eye } from "lucide-react";
import DataTable from "../components/DataTable";
import LeaderModal from "./modals/LeaderModal";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";

interface Leader {
  id: string;
  leaderName: string;
  photo: string;
  designation: string;
  organization: string;
  displayOrder: number;
  visibilityStatus: string;
  updatedDate: string;
}

export const LeadersView = () => {

  const initialForm = {
    id: "",
    leaderName: "",
    photo: "",
    designation: "",
    organization: "",
    displayOrder: "",
    visibilityStatus: "Visible",
    updatedDate: "",
  };

  const [leaders, setLeaders] = useState<Leader[]>(
    Array.from({ length: 50 }, (_, i) => ({
      id: `LDR-${String(i + 1).padStart(3, "0")}`,
      leaderName: `Leader ${i + 1}`,
      photo: "leader.jpg",
      designation: "State Coordinator",
      organization: "Mission Green",
      displayOrder: i + 1,
      visibilityStatus: i % 2 === 0 ? "Visible" : "Hidden",
      updatedDate: "2026-02-20",
    }))
  );

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(initialForm);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [leaderToDelete, setLeaderToDelete] = useState<Leader | null>(null);

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
      setLeaders((prev) =>
        prev.map((item) =>
          item.id === formData.id
            ? {
                ...item,
                ...formData,
                displayOrder: Number(formData.displayOrder),
              }
            : item
        )
      );
    } else {
      setLeaders((prev) => [
        {
          id: formData.id,
          leaderName: formData.leaderName,
          photo: formData.photo,
          designation: formData.designation,
          organization: formData.organization,
          displayOrder: Number(formData.displayOrder),
          visibilityStatus: formData.visibilityStatus,
          updatedDate: formData.updatedDate,
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

  const openEditModal = (leader: Leader) => {
    setEditing(true);
    setFormData({
      ...leader,
      displayOrder: String(leader.displayOrder),
    });
    setShowModal(true);
  };

  const openDeleteModal = (leader: Leader) => {
    setLeaderToDelete(leader);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (!leaderToDelete) return;

    setLeaders((prev) =>
      prev.filter((item) => item.id !== leaderToDelete.id)
    );

    setShowDeleteModal(false);
    setLeaderToDelete(null);
  };

  const columns: ColumnDef<Leader>[] = [
    {
      accessorKey: "leaderName",
      header: "Leader Name",
      enableSorting: true,
    },
    {
      accessorKey: "photo",
      header: "Photo",
      cell: () => (
        <img
          src="/leader.jpg"
          alt="Leader"
          width={40}
          height={40}
          style={{
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      ),
    },
    {
      accessorKey: "designation",
      header: "Designation",
      enableSorting: true,
    },
    {
      accessorKey: "organization",
      header: "Organization",
      enableSorting: true,
    },
    {
      accessorKey: "displayOrder",
      header: "Display Order",
      enableSorting: true,
    },
    {
      accessorKey: "visibilityStatus",
      header: "Visibility Status",
      cell: ({ row }) => (
        <span
          className={`status-badge ${
            row.original.visibilityStatus === "Visible"
              ? "status-active"
              : "status-inactive"
          }`}
        >
          {row.original.visibilityStatus}
        </span>
      ),
    },
    {
      accessorKey: "updatedDate",
      header: "Updated Date",
      enableSorting: true,
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
      {/* Same page layout as your other management views */}

      <DataTable
        data={leaders}
        columns={columns}
        searchPlaceholder="Search leader, designation, organization..."
      />

      <LeaderModal
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
          setLeaderToDelete(null);
        }}
        onConfirm={handleDelete}
        personName={leaderToDelete?.leaderName}
      />
    </>
  );
};