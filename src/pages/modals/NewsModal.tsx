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

const NewsModal: React.FC<Props> = ({
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
          <h2>{editing ? "Edit News" : "Add News"}</h2>

          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>News Title</label>
            <input
              name="newsTitle"
              value={formData.newsTitle}
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
              <option>Environment</option>
              <option>Events</option>
              <option>Government</option>
              <option>Awareness</option>
            </select>
          </div>

          <div className="form-group">
            <label>Image</label>
            <input
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="Image URL"
            />
          </div>

          <div className="form-group">
            <label>Published Date</label>
            <input
              type="date"
              name="publishedDate"
              value={formData.publishedDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Created By</label>
            <input
              name="createdBy"
              value={formData.createdBy}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Views</label>
            <input
              type="number"
              name="views"
              value={formData.views}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Publish Status</label>

            <select
              name="publishStatus"
              value={formData.publishStatus}
              onChange={handleChange}
            >
              <option>Published</option>
              <option>Draft</option>
              <option>Archived</option>
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
              {editing ? "Update News" : "Add News"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewsModal;