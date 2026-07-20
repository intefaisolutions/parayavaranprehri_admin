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

const MapManagementModal: React.FC<Props> = ({
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
          <h2>{editing ? "Edit Map Record" : "Add Map Record"}</h2>

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
            <label>Tree Count</label>
            <input
              type="number"
              name="treeCount"
              value={formData.treeCount}
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
            <label>Plantation Area</label>
            <input
              name="plantationArea"
              value={formData.plantationArea}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Added By</label>
            <input
              name="addedBy"
              value={formData.addedBy}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Last Updated</label>
            <input
              type="date"
              name="lastUpdated"
              value={formData.lastUpdated}
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
              {editing ? "Update Map" : "Add Map"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MapManagementModal;