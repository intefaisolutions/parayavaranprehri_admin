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

const IdentityModal: React.FC<Props> = ({
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
          <h2>{editing ? "Edit Identity" : "Add Identity"}</h2>

          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Person Name</label>
            <input
              name="personName"
              value={formData.personName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Identity ID</label>
            <input
              name="identityId"
              value={formData.identityId}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Photo</label>
            <input
              name="photo"
              value={formData.photo}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>QR Code</label>
            <input
              name="qrCode"
              value={formData.qrCode}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Vehicle Sticker Status</label>
            <select
              name="vehicleStickerStatus"
              value={formData.vehicleStickerStatus}
              onChange={handleChange}
            >
              <option>Generated</option>
              <option>Pending</option>
            </select>
          </div>

          <div className="form-group">
            <label>Generated Date</label>
            <input
              type="date"
              name="generatedDate"
              value={formData.generatedDate}
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
              {editing ? "Update Identity" : "Add Identity"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IdentityModal;