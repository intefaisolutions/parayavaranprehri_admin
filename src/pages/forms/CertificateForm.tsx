import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export const CertificateForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const editCertificate = location.state?.certificate;

  const [formData, setFormData] = useState(
    editCertificate || {
      id: "",
      certificateType: "",
      templateName: "",
      logo: "",
      signature: "",
      background: "",
      lastUpdatedBy: "",
      updatedDate: "",
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

    navigate("/certificates");
  };

  return (
    <div className="dashboard-area">
      <div className="page-header">
        <h1>{editCertificate ? "Edit Certificate" : "Add Certificate"}</h1>
      </div>

      <div className="card">
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Certificate Type</label>
            <input
              name="certificateType"
              value={formData.certificateType}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Template Name</label>
            <input
              name="templateName"
              value={formData.templateName}
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
            <label>Signature</label>
            <input
              name="signature"
              value={formData.signature}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Background</label>
            <input
              name="background"
              value={formData.background}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Last Updated By</label>
            <input
              name="lastUpdatedBy"
              value={formData.lastUpdatedBy}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Updated Date</label>
            <input
              type="date"
              name="updatedDate"
              value={formData.updatedDate}
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
              onClick={() => navigate("/certificates")}
            >
              Cancel
            </button>

            <button type="submit" className="btn-primary">
              Save Certificate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};