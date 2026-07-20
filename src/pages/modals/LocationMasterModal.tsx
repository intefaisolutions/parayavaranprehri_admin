import React from "react";
import { X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editing: boolean;
  formData: any;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const LocationMasterModal: React.FC<Props> = ({
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
          <h2>{editing ? "Edit Location" : "Add Location"}</h2>

          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Location Name</label>
            <input
              name="locationName"
              value={formData.locationName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Location Type</label>
            <select
              name="locationType"
              value={formData.locationType}
              onChange={handleChange}
            >
              <option>State</option>
              <option>District</option>
              <option>Vidhan Sabha</option>
              <option>Zone</option>
              <option>Sector</option>
            </select>
          </div>

          <div className="form-group">
            <label>Parent Location</label>
            <input
              name="parentLocation"
              value={formData.parentLocation}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Latitude</label>
            <input
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Longitude</label>
            <input
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Total Linked Records</label>
            <input
              type="number"
              name="totalLinkedRecords"
              value={formData.totalLinkedRecords}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Created Date</label>
            <input
              type="date"
              name="createdDate"
              value={formData.createdDate}
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
              onClick={onClose}
            >
              Cancel
            </button>

            <button type="submit" className="btn-primary">
              {editing ? "Update Location" : "Add Location"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LocationMasterModal;