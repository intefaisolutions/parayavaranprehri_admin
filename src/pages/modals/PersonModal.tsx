import React from "react";
import { X } from "lucide-react";

export interface PersonFormData {
  id: string;
  name: string;
  phone: string;
  vehicles: number | string;
  trees: number | string;
  status: string;
}

interface PersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing: boolean;
  formData: PersonFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const PersonModal: React.FC<PersonModalProps> = ({
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
          <h2>{editing ? "Edit Person" : "Add Person"}</h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>ID</label>
            <input name="id" value={formData.id} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Name</label>
            <input name="name" value={formData.name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input name="phone" value={formData.phone} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Vehicles</label>
            <input type="number" name="vehicles" value={formData.vehicles} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Trees</label>
            <input type="number" name="trees" value={formData.trees} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-danger" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editing ? "Update Person" : "Add Person"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonModal;