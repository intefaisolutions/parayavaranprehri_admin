import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export const PartnerForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const editPartner = location.state?.partner;

  const [formData, setFormData] = useState(
    editPartner || {
      id: "",
      partnerName: "",
      partnerType: "",
      contactPerson: "",
      phone: "",
      email: "",
      location: "",
      logo: "",
      status: "Active",
    }
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    navigate("/partners");
  };

  return (
    <div className="dashboard-area">
      <div className="page-header">
        <h1>{editPartner ? "Edit Partner" : "Add Partner"}</h1>
      </div>

      <div className="card">
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Partner Name</label>
            <input
              name="partnerName"
              value={formData.partnerName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Partner Type</label>
            <select
              name="partnerType"
              value={formData.partnerType}
              onChange={handleChange}
            >
              <option>NGO</option>
              <option>Corporate</option>
              <option>Government</option>
              <option>Individual</option>
            </select>
          </div>

          <div className="form-group">
            <label>Contact Person</label>
            <input
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Logo</label>
            <input
              name="logo"
              value={formData.logo}
              onChange={handleChange}
            />
          </div>

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
              onClick={() => navigate("/partners")}
            >
              Cancel
            </button>

            <button type="submit" className="btn-primary">
              Save Partner
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};