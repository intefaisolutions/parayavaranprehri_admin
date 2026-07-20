import React, { useState } from "react";
import { Filter, Edit, Trash2, Eye } from "lucide-react";
import DataTable from "../components/DataTable";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";
import { useNavigate } from "react-router-dom";

interface AuditLog {
id:string;
userName:string;
role:string;
moduleName:string;
actionType:string;
recordId:string;
description:string;
ipAddress:string;
dateTime:string;
}

export const AuditView =()=>{

const navigate = useNavigate();
const [logs,setLogs]=useState<AuditLog[]>(
Array.from({length:50},(_,i)=>({
id:`LOG-${String(i+1).padStart(3,"0")}`,
userName:`Admin ${i+1}`,
role:i%2===0?"Super Admin":"Operator",
moduleName:i%2===0?"Users":"Tasks",
actionType:i%3===0?"Create":"Update",
recordId:`REC-${1000+i}`,
description:`Updated record details for module ${i+1}`,
ipAddress:`192.168.1.${i+10}`,
dateTime:"2026-02-15 10:30 AM"
})));

const [showDeleteModal,setShowDeleteModal]=useState(false);
const [logToDelete,setLogToDelete]=useState<AuditLog|null>(null);

const openDeleteModal=(log:AuditLog)=>{
setLogToDelete(log);
setShowDeleteModal(true);
};

const handleDelete=()=>{
if(!logToDelete)
return;
setLogs(prev=> prev.filter(log=>log.id!==logToDelete.id));
setLogToDelete(null);
setShowDeleteModal(false);
};

const columns:ColumnDef<AuditLog>[]=[
{accessorKey:"userName",header:"User Name",enableSorting:true},
{accessorKey:"role",header:"Role",enableSorting:true},
{accessorKey:"moduleName",header:"Module Name",enableSorting:true},
{accessorKey:"actionType",header:"Action Type",enableSorting:true},
{accessorKey:"recordId",header:"Record ID",enableSorting:true},
{accessorKey:"description",header:"Description",enableSorting:true},
{accessorKey:"ipAddress",header:"IP Address",enableSorting:true},
{accessorKey:"dateTime",header:"Date & Time",enableSorting:true},
{
header:"Actions",
cell:({row})=>(
<div style={{display:"flex",gap:"8px"}}>
<button className="icon-btn" style={{width:28,height:28}}>
<Eye size={14}/>
</button>
<button className="icon-btn" style={{width:28,height:28}}
onClick={()=>navigate("/audit/edit",{state:{audit:row.original}})}>
<Edit size={14}/>
</button>
<button className="icon-btn" style={{width:28,height:28}}
onClick={()=>openDeleteModal(row.original)}>
<Trash2 size={14}/>
</button>
</div>
)}];

return (
<>
  <div className="dashboard-area">
    <div className="page-header">
      <div className="page-title">
        <h1>Audit Logs</h1>
        <p>Track user activities and system changes.</p>
      </div>
      <div>
        <button className="icon-btn">
          <Filter size={18} />
        </button>
      </div>
    </div>
    <div className="card">
      <DataTable data={logs} columns={columns} searchPlaceholder="Search user, module, record..." />
    </div>
  </div>
  <DeleteConfirmModal isOpen={showDeleteModal} onClose={()=>{setShowDeleteModal(false);setLogToDelete(null);}}
    onConfirm={handleDelete}
    personName={logToDelete?.userName}
    />
</>
);
};