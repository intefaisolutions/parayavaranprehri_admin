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

const RolesModal: React.FC<Props> = ({
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
              ? "Edit Role Permission"
              : "Add Role Permission"}
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
            <label>Role Name</label>

            <input
              name="roleName"
              value={formData.roleName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Access Level</label>

            <select
              name="accessLevel"
              value={formData.accessLevel}
              onChange={handleChange}
            >
              <option>Full Access</option>
              <option>Limited Access</option>
              <option>Read Only</option>
              <option>Custom Access</option>
            </select>
          </div>

          <div className="form-group">
            <label>Assigned Location</label>

            <select
              name="assignedLocation"
              value={formData.assignedLocation}
              onChange={handleChange}
            >
              <option>All Locations</option>
              <option>State Wise</option>
              <option>City Wise</option>
              <option>Branch Wise</option>
            </select>
          </div>

          <div className="form-group">
            <label>Modules Access</label>

            <input
              name="modulesAccess"
              value={formData.modulesAccess}
              onChange={handleChange}
              placeholder="Users, Reports, Settings"
            />
          </div>

          <div className="form-group">
            <label>Users Count</label>

            <input
              type="number"
              name="usersCount"
              value={formData.usersCount}
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

            <button
              type="submit"
              className="btn-primary"
            >
              {editing
                ? "Update Role"
                : "Add Role"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RolesModal;