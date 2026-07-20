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

const SystemSettingModal: React.FC<Props> = ({
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
              ? "Edit System Setting"
              : "Add System Setting"}
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
            <label>Setting Name</label>
            <input
              name="settingName"
              value={formData.settingName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option>General</option>
              <option>Security</option>
              <option>Notification</option>
              <option>Email</option>
              <option>Payment</option>
              <option>User Management</option>
            </select>
          </div>

          <div className="form-group">
            <label>Value</label>
            <input
              name="value"
              value={formData.value}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Updated By</label>
            <input
              name="updatedBy"
              value={formData.updatedBy}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Last Updated Date</label>
            <input
              type="date"
              name="lastUpdatedDate"
              value={formData.lastUpdatedDate}
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
                ? "Update Setting"
                : "Add Setting"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SystemSettingModal;