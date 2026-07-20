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

const MediaModal: React.FC<Props> = ({
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
          <h2>{editing ? "Edit Media" : "Add Media"}</h2>

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
            <label>Media Name</label>
            <input
              name="mediaName"
              value={formData.mediaName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Media Type</label>

            <select
              name="mediaType"
              value={formData.mediaType}
              onChange={handleChange}
            >
              <option>Image</option>
              <option>Video</option>
              <option>PDF</option>
              <option>Document</option>
            </select>
          </div>

          <div className="form-group">
            <label>File Size</label>
            <input
              name="fileSize"
              value={formData.fileSize}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Uploaded By</label>
            <input
              name="uploadedBy"
              value={formData.uploadedBy}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Upload Date</label>
            <input
              type="date"
              name="uploadDate"
              value={formData.uploadDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Used In Module</label>

            <select
              name="usedInModule"
              value={formData.usedInModule}
              onChange={handleChange}
            >
              <option>News</option>
              <option>Gallery</option>
              <option>Person</option>
              <option>Vehicle</option>
              <option>Map</option>
            </select>
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
              {editing ? "Update Media" : "Add Media"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default MediaModal;