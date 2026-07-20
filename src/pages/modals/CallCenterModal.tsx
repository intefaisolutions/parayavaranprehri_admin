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

const CallCenterModal: React.FC<Props> = ({
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
            {editing ? "Edit Call Center" : "Add Call Center"}
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
            <label>Contact Type</label>

            <select
              name="contactType"
              value={formData.contactType}
              onChange={handleChange}
            >
              <option>Phone</option>
              <option>Email</option>
              <option>WhatsApp</option>
              <option>Chat</option>
            </select>
          </div>

          <div className="form-group">
            <label>Contact Value</label>

            <input
              name="contactValue"
              value={formData.contactValue}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Available Hours</label>

            <input
              name="availableHours"
              value={formData.availableHours}
              onChange={handleChange}
              placeholder="09:00 AM - 06:00 PM"
            />
          </div>

          <div className="form-group">
            <label>Assigned Person</label>

            <input
              name="assignedPerson"
              value={formData.assignedPerson}
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

            <button
              type="submit"
              className="btn-primary"
            >
              {editing
                ? "Update Contact"
                : "Add Contact"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CallCenterModal;