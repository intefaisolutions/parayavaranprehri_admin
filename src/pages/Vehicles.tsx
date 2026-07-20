import React, { useState } from "react";
import { Plus, Filter, Edit, Trash2, Eye } from "lucide-react";
import DataTable from "../components/DataTable";
import VehicleModal from "./modals/VehicleModal";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";

interface Vehicle {
  id: string;
  vehicleNumber: string;
  vehicleType: string;
  ownerName: string;
  ownerPhone: string;
  treesAssigned: number;
  approvalStatus: string;
  registrationDate: string;
}

export const VehiclesView = () => {

  const initialForm = {
    id: "",
    vehicleNumber: "",
    vehicleType: "",
    ownerName: "",
    ownerPhone: "",
    treesAssigned: "",
    approvalStatus: "Pending",
    registrationDate: "",
  };


  const [vehicles, setVehicles] = useState<Vehicle[]>(
    Array.from({ length: 100 }, (_, i) => ({
      id: `VH-${String(i + 1).padStart(3, "0")}`,
      vehicleNumber: `MP09AB${1000 + i}`,
      vehicleType: i % 2 === 0 ? "Car" : "Bike",
      ownerName: `Citizen ${i + 1}`,
      ownerPhone: `+91-98765000${i}`,
      treesAssigned: (i + 1) * 3,
      approvalStatus: i % 2 === 0 ? "Approved" : "Pending",
      registrationDate: "2026-01-15",
    }))
  );


  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(initialForm);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);



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

    if(editing){

      setVehicles(prev =>
        prev.map(vehicle =>
          vehicle.id === formData.id
          ? {
              ...vehicle,
              ...formData,
              treesAssigned:Number(formData.treesAssigned)
            }
          : vehicle
        )
      );

    }else{

      setVehicles(prev => [
        {
          id:formData.id,
          vehicleNumber:formData.vehicleNumber,
          vehicleType:formData.vehicleType,
          ownerName:formData.ownerName,
          ownerPhone:formData.ownerPhone,
          treesAssigned:Number(formData.treesAssigned),
          approvalStatus:formData.approvalStatus,
          registrationDate:formData.registrationDate
        },
        ...prev
      ]);

    }


    setShowModal(false);
  };



  const openAddModal = () => {
    setEditing(false);
    setFormData(initialForm);
    setShowModal(true);
  };


  const openEditModal = (vehicle: Vehicle) => {
    setEditing(true);
    setFormData({
      ...vehicle,
      treesAssigned:String(vehicle.treesAssigned)
    });
    setShowModal(true);
  };


  const openDeleteModal = (vehicle:Vehicle)=>{
    setVehicleToDelete(vehicle);
    setShowDeleteModal(true);
  };


  const handleDelete = ()=>{

    if(!vehicleToDelete) return;

    setVehicles(prev =>
      prev.filter(
        vehicle => vehicle.id !== vehicleToDelete.id
      )
    );

    setShowDeleteModal(false);
    setVehicleToDelete(null);
  };




  const columns:ColumnDef<Vehicle>[]=[

    {
      accessorKey:"vehicleNumber",
      header:"Vehicle Number",
      enableSorting:true
    },

    {
      accessorKey:"vehicleType",
      header:"Vehicle Type",
      enableSorting:true
    },

    {
      accessorKey:"ownerName",
      header:"Owner Name",
      enableSorting:true
    },


    {
      accessorKey:"ownerPhone",
      header:"Owner Phone",
      enableSorting:true
    },


    {
      accessorKey:"treesAssigned",
      header:"Trees Assigned",
      enableSorting:true
    },


    {
      accessorKey:"approvalStatus",
      header:"Approval Status",
      cell:({row})=>(
        <span
        className={`status-badge ${
          row.original.approvalStatus==="Approved"
          ?"status-active"
          :"status-inactive"
        }`}
        >
          {row.original.approvalStatus}
        </span>
      )
    },


    {
      accessorKey:"registrationDate",
      header:"Registration Date",
      enableSorting:true
    },


    {
      header:"Actions",

      cell:({row})=>(
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
      )
    }

  ];



return (
<>
  <div className="dashboard-area">
    <div className="page-header">
      <div className="page-title">
        <h1>Vehicle Management</h1>
        <p>Manage registered vehicles and assigned plantation records.</p>
      </div>

      <div style={{ display: "flex", gap: "12px" }}>
        <button className="icon-btn">
          <Filter size={18} />
        </button>

        <button className="btn-primary" onClick={openAddModal}>
          <Plus size={18} />
          Add Vehicle
        </button>
      </div>
    </div>

    <div className="card">
      <DataTable
        data={vehicles}
        columns={columns}
        searchPlaceholder="Search vehicle number, owner name, phone..."
      />
    </div>
  </div>

  <VehicleModal
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
      setVehicleToDelete(null);
    }}
    onConfirm={handleDelete}
    personName={vehicleToDelete?.vehicleNumber}
  />
</>
);

};