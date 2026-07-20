import React from "react";
import { X } from "lucide-react";

export interface MitrasFormData {
  id: string;
  name: string;
  vidhan_sabha: string;
  assigned_zone: number | string;
  status: string;
}

interface MitrasModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing: boolean;
  formData: MitrasFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const MitrasModal: React.FC<MitrasModalProps> = ({
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
          <h2>{editing ? "Edit Mitras" : "Add Mitras"}</h2>
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
            <label>Vidhan Sabha</label>
            <input name="vidhan_sabha" value={formData.vidhan_sabha} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Assigned Zone</label>
            <input name="assigned_zone" value={formData.assigned_zone} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-danger" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editing ? "Update Mitras" : "Add Mitras"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MitrasModal;