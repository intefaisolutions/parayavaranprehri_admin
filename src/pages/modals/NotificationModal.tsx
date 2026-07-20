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

const NotificationModal: React.FC<Props> = ({
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
              ? "Edit Notification"
              : "Add Notification"}
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
            <label>Notification Title</label>
            <input
              name="notificationTitle"
              value={formData.notificationTitle}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Target Audience</label>
            <select
              name="targetAudience"
              value={formData.targetAudience}
              onChange={handleChange}
            >
              <option>All Users</option>
              <option>Customers</option>
              <option>Employees</option>
              <option>Partners</option>
              <option>Specific Group</option>
            </select>
          </div>

          <div className="form-group">
            <label>Location Filter</label>
            <select
              name="locationFilter"
              value={formData.locationFilter}
              onChange={handleChange}
            >
              <option>All Locations</option>
              <option>State Wise</option>
              <option>City Wise</option>
              <option>Zone Wise</option>
            </select>
          </div>

          <div className="form-group">
            <label>Sent By</label>
            <input
              name="sentBy"
              value={formData.sentBy}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Sent Date</label>
            <input
              type="date"
              name="sentDate"
              value={formData.sentDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Delivery Count</label>
            <input
              type="number"
              name="deliveryCount"
              value={formData.deliveryCount}
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
              <option>Sent</option>
              <option>Draft</option>
              <option>Scheduled</option>
              <option>Failed</option>
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
                ? "Update Notification"
                : "Add Notification"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotificationModal;