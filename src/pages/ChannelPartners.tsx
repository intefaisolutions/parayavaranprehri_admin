import React, { useState } from "react";
import { Plus, Filter, Edit, Trash2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DataTable from "../components/DataTable";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";

interface Partner {
  id: string;
  partnerName: string;
  partnerType: string;
  contactPerson: string;
  phone: string;
  email: string;
  location: string;
  logo: string;
  status: string;
}

export const PartnersView = () => {
  const navigate = useNavigate();

  const [partners, setPartners] = useState<Partner[]>(
    Array.from({ length: 50 }, (_, i) => ({
      id: `PART-${String(i + 1).padStart(3, "0")}`,
      partnerName: `Partner Company ${i + 1}`,
      partnerType: i % 2 === 0 ? "NGO" : "Corporate",
      contactPerson: `Person ${i + 1}`,
      phone: `98765432${i}`,
      email: `partner${i + 1}@gmail.com`,
      location: `City ${i + 1}`,
      logo: "Default Logo",
      status: i % 3 === 0 ? "Inactive" : "Active",
    }))
  );

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [partnerToDelete, setPartnerToDelete] =
    useState<Partner | null>(null);

  const openDeleteModal = (partner: Partner) => {
    setPartnerToDelete(partner);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (!partnerToDelete) return;

    setPartners((prev) =>
      prev.filter((partner) => partner.id !== partnerToDelete.id)
    );

    setPartnerToDelete(null);
    setShowDeleteModal(false);
  };

  const columns: ColumnDef<Partner>[] = [
    {
      accessorKey: "partnerName",
      header: "Partner Name",
      enableSorting: true,
    },
    {
      accessorKey: "partnerType",
      header: "Partner Type",
      enableSorting: true,
    },
    {
      accessorKey: "contactPerson",
      header: "Contact Person",
      enableSorting: true,
    },
    {
      accessorKey: "phone",
      header: "Phone",
      enableSorting: true,
    },
    {
      accessorKey: "email",
      header: "Email",
      enableSorting: true,
    },
    {
      accessorKey: "location",
      header: "Location",
      enableSorting: true,
    },
    {
      accessorKey: "logo",
      header: "Logo",
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
              navigate("/partners/edit", {
                state: { partner: row.original },
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
            <h1>Channel Partners</h1>
            <p>Manage channel partners and their details.</p>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button className="icon-btn">
              <Filter size={18} />
            </button>

            <button
              className="btn-primary"
              onClick={() => navigate("/partners/add")}
            >
              <Plus size={18} />
              Add Partner
            </button>
          </div>
        </div>

        <div className="card">
          <DataTable
            data={partners}
            columns={columns}
            searchPlaceholder="Search partner name, type, contact..."
          />
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
      />
    </>
  );
};