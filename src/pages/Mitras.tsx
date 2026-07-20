import React, { useState } from 'react';
import { Users, Search, Plus, Filter, Edit, Trash2, Eye } from 'lucide-react';
import DataTable from "../components/DataTable";
import MitrasModal from "./modals/MitrasModal";

export const MitrasView = () => {
  const initialForm = {
  id: "",
  name: "",
  vidhan_sabha: "",
  assigned_zone: "",
  status: "Approved",
  };

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(initialForm);

  interface Mitras {
  id: string;
  name: string;
  vidhan_sabha: string;
  assigned_zone: number;
  status: string;
  }

  const [mitras, setMitras] = useState<Mitras[]>(
    Array.from({ length: 150 }, (_, i) => ({
    id: `PM-${String(i + 1).padStart(3, "0")}`,
    name: `Volunteer ${i + 1}`,
    vidhan_sabha: "Rau",
    assigned_zone: `Zone ${i + 1}`,
    status: "Approved",
    }))
  );

  const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editing) {
    setMitras((prev) =>prev.map((mitra) => mitra.id === formData.id ? { ...formData } : mitra));
    } else {
    // Add new record at the top
    setMitras((prev) => [
    {
    id: formData.id,
    name: formData.name,
    vidhan_sabha: formData.vidhan_sabha,
    assigned_zone: Number(formData.assigned_zone),
    status: formData.status,
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

  const openEditModal = (mitra: typeof initialForm) => {
  setEditing(true);
  setFormData(mitra);
  setShowModal(true);
  };

  const columns: ColumnDef<Mitras>[] = [
    { accessorKey:"id", header:"Mitra ID", enableSorting:true },
    { accessorKey:"name", header:"Name", enableSorting:true },
    { accessorKey:"vidhan_sabha", header:"Vidhan Sabha", enableSorting:true },
    { accessorKey:"assigned_zone", header:"Assigned Zone", enableSorting:true },
    {
    accessorKey:"status",
    header:"Status",
    cell: ({ row }) => (
    <span className={`status-badge ${row.original.status === "Approved" ? "status-active"
    : row.original.status === "Pending" ? "status-warning"
    : row.original.status === "Cancelled" ? "status-inactive" : ""}`}>
      {row.original.status}
    </span>
    ),
    enableSorting:false
    },
    {
    header:"Actions",
    cell:({row})=>(
    <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="icon-btn" style={{ width: 28, height: 28 }}><Eye size={14}/></button>
      <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={()=>openEditModal(row.original)}>
        <Edit size={14} />
      </button>
      <button className="icon-btn" style={{ width: 28, height: 28 }}>
        <Trash2 size={14} />
      </button>
    </div>
    ),
    enableSorting:false
    }
  ];

  return (
  <>
    <div className="dashboard-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Paryavaran Mitra Management</h1>
          <p>Master record of every citizen registered on the platform.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="icon-btn" title="Filter">
            <Filter size={18} />
          </button>
          <button className="btn-primary" onClick={openAddModal}>
            <Plus size={18} />
            Assign Mitra
          </button>
        </div>
      </div>
      <div className="card">
        <DataTable data={mitras} columns={columns} searchPlaceholder="Search by Mitra ID, Name, Zone, Vidhan Sabha..." />
      </div>
    </div>
    <MitrasModal isOpen={showModal} onClose={()=> setShowModal(false)}
      editing={editing}
      formData={formData}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      />
  </>
  );
}