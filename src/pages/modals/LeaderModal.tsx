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
  handleSubmit: (
    e: React.FormEvent<HTMLFormElement>
  ) => void;
}

const InitiativeLeaderModal: React.FC<Props> = ({
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
          <h2>
            {editing
              ? "Edit Initiative Leader"
              : "Add Initiative Leader"}
          </h2>

          <button
            className="icon-btn"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <form
          className="modal-form"
          onSubmit={handleSubmit}
        >
          <div className="form-group">
            <label>Leader Name</label>
            <input
              name="leaderName"
              value={formData.leaderName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Photo</label>
            <input
              type="file"
              name="photo"
            />
          </div>

          <div className="form-group">
            <label>Designation</label>
            <input
              name="designation"
              value={formData.designation}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Organization</label>
            <input
              name="organization"
              value={formData.organization}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Display Order</label>
            <input
              type="number"
              name="displayOrder"
              value={formData.displayOrder}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Visibility Status</label>

            <select
              name="visibilityStatus"
              value={formData.visibilityStatus}
              onChange={handleChange}
            >
              <option>Visible</option>
              <option>Hidden</option>
            </select>
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

          <div className="modal-actions">
            <button
              type="button"
              className="btn-danger"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn-primary"
            >
              {editing
                ? "Update Leader"
                : "Add Leader"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InitiativeLeaderModal;