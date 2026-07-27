import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { apiFetch } from "../../utils/apiConfig";

interface MitraOption {
  _id: string;
  mitraId: string;
  name: string;
  mobile: string;
  status: string;
}

interface AssignMitraModalProps {
  isOpen: boolean;
  onClose: () => void;
  treeName?: string;
  currentMitraId?: string;
  onAssign: (mitraId: string) => Promise<void>;
}

const AssignMitraModal: React.FC<AssignMitraModalProps> = ({
  isOpen,
  onClose,
  treeName,
  currentMitraId,
  onAssign,
}) => {
  const [mitras, setMitras] = useState<MitraOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedId, setSelectedId] = useState(currentMitraId || "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setSelectedId(currentMitraId || "");
    setError("");
    setLoading(true);
    apiFetch<MitraOption[]>("/api/v1/mitras?status=Approved")
      .then((data) => setMitras(data || []))
      .catch((err: any) => setError(err.message || "Failed to load Mitras"))
      .finally(() => setLoading(false));
  }, [isOpen, currentMitraId]);

  if (!isOpen) return null;

  const handleAssign = async () => {
    if (!selectedId) {
      setError("Select a Mitra to assign as caretaker.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onAssign(selectedId);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to assign Mitra");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Assign Mitra</h2>
        <p>
          Choose the Approved Mitra (volunteer) who will take care of{" "}
          <strong>{treeName || "this tree"}</strong>.
        </p>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
            <Loader2 size={20} className="spin" />
          </div>
        ) : mitras.length === 0 ? (
          <p style={{ color: "var(--text-secondary)" }}>
            No Approved Mitras available yet. Approve a Mitra first.
          </p>
        ) : (
          <div className="form-group">
            <label>Mitra (volunteer)</label>
            <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
              <option value="">-- Select --</option>
              {mitras.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.mitraId} · {m.mobile})
                </option>
              ))}
            </select>
          </div>
        )}

        {error && (
          <div style={{ color: "#ff3d00", marginTop: 8, fontSize: 13 }}>{error}</div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
          <button className="btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleAssign} disabled={submitting || mitras.length === 0}>
            {submitting ? "Assigning..." : "Assign"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignMitraModal;
