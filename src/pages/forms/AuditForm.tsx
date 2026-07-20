import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export const AuditForm=()=>{

const navigate = useNavigate();
const location = useLocation();
const editAudit = location.state?.audit;

const [formData,setFormData]=useState(
editAudit || {
id:"",
userName:"",
role:"",
moduleName:"",
actionType:"",
recordId:"",
description:"",
ipAddress:"",
dateTime:""
});

const handleChange=(e:React.ChangeEvent<HTMLInputElement | HTMLSelectElement>)=>{
setFormData({...formData,[e.target.name]:e.target.value});
};

const handleSubmit=(e:React.FormEvent)=>{e.preventDefault();navigate("/audit");};

return (
<div className="dashboard-area">
  <div className="page-header">
    <h1>{editAudit ? "Edit Audit Log":"Add Audit Log"}</h1>
  </div>
  <div className="card">
    <form className="modal-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>User Name</label>
        <input name="userName" value={formData.userName} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label>Role</label>
        <input name="role" value={formData.role} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label>Module Name</label>
        <input name="moduleName" value={formData.moduleName} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label>Action Type</label>
        <select name="actionType" value={formData.actionType} onChange={handleChange}>
          <option>Create</option>
          <option>Update</option>
          <option>Delete</option>
          <option>Login</option>
        </select>
      </div>
      <div className="form-group">
        <label>Record ID</label>
        <input name="recordId" value={formData.recordId} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label>Description</label>
        <input name="description" value={formData.description} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label>IP Address</label>
        <input name="ipAddress" value={formData.ipAddress} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label>Date & Time</label>
        <input name="dateTime" value={formData.dateTime} onChange={handleChange} />
      </div>
      <div className="modal-actions">
        <button type="button" className="btn-danger" onClick={()=>navigate("/audit")}>Cancel</button>
        <button type="submit" className="btn-primary">Save Audit Log</button>
      </div>
    </form>
  </div>
</div>
);
};