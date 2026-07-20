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

const LanguageModal: React.FC<Props> = ({
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
            {editing ? "Edit Language" : "Add Language"}
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
            <label>Language Name</label>
            <input
              name="languageName"
              value={formData.languageName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Language Code</label>
            <input
              name="languageCode"
              value={formData.languageCode}
              onChange={handleChange}
              placeholder="EN, HI, FR"
            />
          </div>

          <div className="form-group">
            <label>Translation Progress</label>
            <input
              name="translationProgress"
              value={formData.translationProgress}
              onChange={handleChange}
              placeholder="0%"
            />
          </div>

          <div className="form-group">
            <label>Added Date</label>
            <input
              type="date"
              name="addedDate"
              value={formData.addedDate}
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
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn-primary"
            >
              {editing
                ? "Update Language"
                : "Add Language"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LanguageModal;