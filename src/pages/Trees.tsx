import React, { useState } from 'react';
import { Users, Search, Plus, Filter, Edit, Trash2, Eye } from 'lucide-react';
import DataTable from "../components/DataTable";
import TreesModal from "./modals/TreesModal";

export const TreesView = () => {
  const initialForm = {
    id: "",
    name: "",
    phone: "",
    vehicles: "",
    trees: "",
    status: "Active",
  };

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(initialForm);

  interface Trees {
  id: string;
  name: string;
  phone: string;
  vehicles: number;
  trees: number;
  status: string;
}

const [persons, setTreess] = useState<Trees[]>(
  Array.from({ length: 150 }, (_, i) => ({
    id: `PR-${String(i + 1).padStart(3, "0")}`,
    name: `Citizen ${i + 1}`,
    phone: `+91-987650000${i + 1}`,
    vehicles: (i + 1) % 3,
    trees: (i + 1) * 2,
    status: "Active",
  }))
);

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
    setTreess((prev) =>
      prev.map((person) =>
        person.id === formData.id ? { ...formData } : person
      )
    );
  } else {
    // Add new record at the top
    setTreess((prev) => [
      {
        id: formData.id,
        name: formData.name,
        phone: formData.phone,
        vehicles: Number(formData.vehicles),
        trees: Number(formData.trees),
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
{
 accessorKey:"id",
 header:"ID",
 enableSorting:true
},
{
 accessorKey:"name",
 header:"Name",
 enableSorting:true
},
{
 accessorKey:"phone",
 header:"Phone",
 enableSorting:true
},
{
 accessorKey:"vehicles",
 header:"Vehicles Linked",
 enableSorting:true
},
{
 accessorKey:"trees",
 header:"Trees Assigned",
 enableSorting:true
},
{
 accessorKey:"status",
 header:"Status",
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
 enableSorting:false
},
{
 header:"Actions",
 cell:({row})=>(
   <div>
     <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={()=>openEditModal(row.original)}>
       <Edit size={14}/>
     </button>

     <button className="icon-btn" style={{ width: 28, height: 28 }}>
       <Trash2 size={14}/>
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
        <h1>Trees Management</h1>
        <p>Master record of every citizen registered on the platform.</p>
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button className="icon-btn" title="Filter"><Filter size={18} /></button>
        <button className="btn-primary" onClick={openAddModal}>
  <Plus size={18} />
  Add Trees
</button>
      </div>
    </div>
    
    <div className="card">
      <DataTable
 data={persons}
 columns={columns}
 searchPlaceholder="Search by name, ID, phone number..."
 />
    </div>
  </div>
  <TreesModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  editing={editing}
  formData={formData}
  handleChange={handleChange}
  handleSubmit={handleSubmit}
/>
</>
);
}