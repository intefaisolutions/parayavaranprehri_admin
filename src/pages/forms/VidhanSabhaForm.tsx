import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export const VidhanSabhaForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state?.vidhanSabha;

  const [formData, setFormData] = useState(
    editData || {
      vidhanSabhaName: "",
      district: "",
      state: "",
      totalPersons: "",
      totalVehicles: "",
      totalTrees: "",
      totalMitras: "",
      assignedAdmin: "",
      status: "Active",
    }
  );

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // API save/update here

    navigate("/vidhansabha");
  };

  return (
    <div className="dashboard-area">
      <div className="page-header">
        <h1>{editData ? "Edit Vidhan Sabha" : "Add Vidhan Sabha"}</h1>
      </div>

      <div className="card">
        <form className="modal-form" onSubmit={handleSubmit}>
          {[
            ["vidhanSabhaName", "Vidhan Sabha Name"],
            ["district", "District"],
            ["state", "State"],
            ["totalPersons", "Total Persons"],
            ["totalVehicles", "Total Vehicles"],
            ["totalTrees", "Total Trees"],
            ["totalMitras", "Total Mitras"],
            ["assignedAdmin", "Assigned Admin"],
          ].map(([name, label]) => (
            <div className="form-group" key={name}>
              <label>{label}</label>
              <input
                name={name}
                value={formData[name]}
                onChange={handleChange}
              />
            </div>
          ))}

          <div className="form-group">
            <label>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-danger"
              onClick={() => navigate("/vidhansabha")}
            >
              Cancel
            </button>

            <button type="submit" className="btn-primary">
              Save Vidhan Sabha
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};