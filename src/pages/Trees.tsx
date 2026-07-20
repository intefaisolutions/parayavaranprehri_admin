import React, { useState } from 'react';
import { Users, Search, Plus, Filter, Edit, Trash2, Eye } from 'lucide-react';
import DataTable from "../components/DataTable";
import TreesModal from "./modals/TreesModal";

export const TreesView = () => {
  const initialForm = {
  tree_id: "",
  species: "",
  person: "",
  location: "",
  status: "Healthy",
  };

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(initialForm);

  interface Trees {
  tree_id: string;
  species: string;
  person: string;
  location: string;
  status: string;
  }

  const [persons, setTrees] = useState<Trees[]>(
    Array.from({ length: 150 }, (_, i) => ({
    tree_id: `TR-${String(i + 1).padStart(3, "0")}`,
    species: "Neem (Azadirachta indica)",
    person: (i + 1) % 2 === 0 ? `VH-00${i + 1}` : `PR-00${i + 1}`,
    location: `Sector ${i + 1}, Zone A`,
    status: "Healthy",
    }))
  );

  const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editing) {
    setTrees((prev) =>prev.map((person) => person.tree_id === formData.tree_id ? { ...formData } : person));
    } else {
    // Add new record at the top
    setTrees((prev) => [
    {
    tree_id: formData.tree_id,
    species: formData.species,
    person: formData.person,
    location: formData.location,
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

  const openEditModal = (person: typeof initialForm) => {
  setEditing(true);
  setFormData(person);
  setShowModal(true);
  };

  const columns: ColumnDef<Trees>[] = [
    { accessorKey:"tree_id", header:"Tree ID", enableSorting:true },
    { accessorKey:"species", header:"Species", enableSorting:true },
    { accessorKey:"person", header:"Assigned To", enableSorting:true },
    { accessorKey:"location", header:"Location", enableSorting:true },
    {
    accessorKey:"status",
    header:"Status",
    cell: ({ row }) => (
    <span className={`status-badge ${ row.original.status==="Healthy" ? "status-active" : "status-inactive" }`}>
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
          <h1>Tree Management</h1>
          <p>Manage all planted trees, their health status, and assignments.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="icon-btn" title="Filter">
            <Filter size={18} />
          </button>
          <button className="btn-primary" onClick={openAddModal}>
            <Plus size={18} />
            Register Tree
          </button>
        </div>
      </div>
      <div className="card">
        <DataTable data={persons} columns={columns} searchPlaceholder="Search by Tree ID, Species, Assigned Vehicle..." />
      </div>
    </div>
    <TreesModal isOpen={showModal} onClose={()=> setShowModal(false)}
      editing={editing}
      formData={formData}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      />
  </>
  );
}