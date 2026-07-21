import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, Filter, Edit, Trash2, Eye } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import DataTable from "../components/DataTable";
import type { ColumnDef } from '@tanstack/react-table';
import { type TreesFormData } from "./forms/TreeForm";

export const TreesView = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [trees, setTrees] = useState<TreesFormData[]>(
    Array.from({ length: 15 }, (_, i) => ({
      treeId: `TR-${String(i + 1).padStart(4, "0")}`,
      treeName: "Neem",
      species: "Azadirachta indica",
      category: "Medicinal",
      phone: "9876543210",
      vehicleNumber: (i + 1) % 2 === 0 ? `MP09ZK${5863 + i}` : `MP04AB${1234 + i}`,
      plantedDate: "2026-07-20",
      state: "Madhya Pradesh",
      district: "Indore",
      zone: "Zone A",
      address: `Sector ${i + 1}`,
      latitude: 22.7196,
      longitude: 75.8577,
      status: "HEALTHY",
      remarks: "",
    }))
  );

  useEffect(() => {
    if (location.state?.savedTree) {
      const savedTree = location.state.savedTree as TreesFormData;
      const isEditing = location.state.isEditing;
      if (isEditing) {
        setTrees(prev => prev.map(t => t.treeId === savedTree.treeId ? savedTree : t));
      } else {
        const newTreeId = `TR-${String(trees.length + 1).padStart(4, "0")}`;
        setTrees(prev => [{ ...savedTree, treeId: newTreeId }, ...prev]);
      }
      // clear the state so it doesn't re-trigger on reload
      window.history.replaceState({}, document.title);
    }
  }, [location, trees.length]);

  const openAddPage = () => {
    navigate('/trees/add');
  };

  const openEditPage = (tree: TreesFormData) => {
    navigate('/trees/edit', { state: { tree } });
  };

  const columns: ColumnDef<TreesFormData>[] = [
    { accessorKey: "treeId", header: "Tree ID", enableSorting: true },
    { accessorKey: "treeName", header: "Name", enableSorting: true },
    { accessorKey: "species", header: "Species", enableSorting: true },
    { accessorKey: "vehicleNumber", header: "Assigned Vehicle", enableSorting: true },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => <span>{row.original.address}, {row.original.zone}</span>,
      enableSorting: true
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        let badgeClass = "status-inactive";
        if (["HEALTHY", "GROWING"].includes(row.original.status)) badgeClass = "status-active";
        return <span className={`status-badge ${badgeClass}`}>{row.original.status}</span>;
      },
      enableSorting: false
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="icon-btn" style={{ width: 28, height: 28 }}><Eye size={14} /></button>
          <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => openEditPage(row.original as TreesFormData)}>
            <Edit size={14} />
          </button>
          <button className="icon-btn" style={{ width: 28, height: 28 }}>
            <Trash2 size={14} />
          </button>
        </div>
      ),
      enableSorting: false
    }
  ];

  return (
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
          <button className="btn-primary" onClick={openAddPage}>
            <Plus size={18} />
            Register Tree
          </button>
        </div>
      </div>
      <div className="card">
        <DataTable data={trees} columns={columns} searchPlaceholder="Search by Tree ID, Species, Assigned Vehicle..." />
      </div>
    </div>
  );
}