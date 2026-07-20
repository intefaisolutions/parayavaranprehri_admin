import React, { useState } from "react";
import { Plus, Edit, Trash2, Eye, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DataTable from "../components/DataTable";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";

interface VidhanSabha {
  id: string;
  vidhanSabhaName: string;
  district: string;
  state: string;
  totalPersons: number;
  totalVehicles: number;
  totalTrees: number;
  totalMitras: number;
  assignedAdmin: string;
  status: string;
}

export const VidhanSabhaView = () => {
  const navigate = useNavigate();

  const [data, setData] = useState<VidhanSabha[]>(
    Array.from({ length: 50 }, (_, i) => ({
      id: `VS-${String(i + 1).padStart(3, "0")}`,
      vidhanSabhaName: `Vidhan Sabha ${i + 1}`,
      district: `District ${i + 1}`,
      state: "Madhya Pradesh",
      totalPersons: 5000 + i * 100,
      totalVehicles: 200 + i,
      totalTrees: 1000 + i * 20,
      totalMitras: 50 + i,
      assignedAdmin: `Admin ${i + 1}`,
      status: i % 2 === 0 ? "Active" : "Inactive",
    }))
  );

  const [deleteItem, setDeleteItem] = useState<VidhanSabha | null>(null);

  const handleDelete = () => {
    if (!deleteItem) return;

    setData((prev) => prev.filter((item) => item.id !== deleteItem.id));
    setDeleteItem(null);
  };

  const columns = [
    {
      accessorKey: "vidhanSabhaName",
      header: "Vidhan Sabha Name",
      enableSorting: true,
    },
    {
      accessorKey: "district",
      header: "District",
      enableSorting: true,
    },
    {
      accessorKey: "state",
      header: "State",
      enableSorting: true,
    },
    {
      accessorKey: "totalPersons",
      header: "Total Persons",
      enableSorting: true,
    },
    {
      accessorKey: "totalVehicles",
      header: "Total Vehicles",
      enableSorting: true,
    },
    {
      accessorKey: "totalTrees",
      header: "Total Trees",
      enableSorting: true,
    },
    {
      accessorKey: "totalMitras",
      header: "Total Mitras",
      enableSorting: true,
    },
    {
      accessorKey: "assignedAdmin",
      header: "Assigned Admin",
      enableSorting: true,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => (
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
      cell: ({ row }: any) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="icon-btn" style={{ width: 28, height: 28 }}>
            <Eye size={14} />
          </button>

          <button
            className="icon-btn"
            style={{ width: 28, height: 28 }}
            onClick={() =>
              navigate("/vidhansabha/edit", {
                state: { vidhanSabha: row.original },
              })
            }
          >
            <Edit size={14} />
          </button>

          <button
            className="icon-btn"
            style={{ width: 28, height: 28 }}
            onClick={() => setDeleteItem(row.original)}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="dashboard-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Vidhan Sabha Management</h1>
          <p>Manage Vidhan Sabha details and assigned resources.</p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button className="icon-btn">
            <Filter size={18} />
          </button>

          <button
            className="btn-primary"
            onClick={() => navigate("/vidhansabha/add")}
          >
            <Plus size={18} />
            Add Vidhan Sabha
          </button>
        </div>
      </div>

      <div className="card">
        <DataTable
          data={data}
          columns={columns}
          searchPlaceholder="Search Vidhan Sabha, district, admin..."
        />
      </div>

      <DeleteConfirmModal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        personName={deleteItem?.vidhanSabhaName}
      />
    </div>
  );
};