import React from "react";
import { X } from "lucide-react";

export interface TreesFormData {
  tree_id: string;
  species: string;
  person: string;
  location: number | string;
  status: string;
}

interface TreesModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing: boolean;
  formData: TreesFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const TreesModal: React.FC<TreesModalProps> = ({
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
          <h2>{editing ? "Edit Trees" : "Add Trees"}</h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Tree ID</label>
            <input type="text" name="tree_id" value={formData.tree_id} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Name</label>
            <input type="text" name="species" value={formData.species} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input type="text" name="person" value={formData.person} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="Healthy">Healthy</option>
              <option value="Weak">Weak</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-danger" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editing ? "Update Trees" : "Add Trees"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TreesModal;