import React from "react";
import { X } from "lucide-react";

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing: boolean;
  formData: any;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const VehicleModal: React.FC<VehicleModalProps> = ({
  isOpen,
  onClose,
  editing,
  formData,
  handleChange,
  handleSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{editing ? "Edit Vehicle" : "Add Vehicle"}</h2>

          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Vehicle Number</label>
            <input
              name="vehicleNumber"
              value={formData.vehicleNumber}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Vehicle Type</label>
            <select
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleChange}
            >
              <option value="">Select Type</option>
              <option>Car</option>
              <option>Bike</option>
              <option>Truck</option>
            </select>
          </div>

          <div className="form-group">
            <label>Owner Name</label>
            <input
              name="ownerName"
              value={formData.ownerName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Owner Phone</label>
            <input
              name="ownerPhone"
              value={formData.ownerPhone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Trees Assigned</label>
            <input
              type="number"
              name="treesAssigned"
              value={formData.treesAssigned}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Approval Status</label>
            <select
              name="approvalStatus"
              value={formData.approvalStatus}
              onChange={handleChange}
            >
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
            </select>
          </div>

          <div className="form-group">
            <label>Registration Date</label>
            <input
              type="date"
              name="registrationDate"
              value={formData.registrationDate}
              onChange={handleChange}
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-danger"
              onClick={onClose}
            >
              Cancel
            </button>

            <button type="submit" className="btn-primary">
              {editing ? "Update Vehicle" : "Add Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
    );
};

export default VehicleModal;