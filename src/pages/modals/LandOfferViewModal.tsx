import React from "react";
import { X, CheckCircle, Clock, XCircle, User, Phone, MapPin, Layers, Calendar, FileText } from "lucide-react";

export interface LandOfferItem {
  _id: string;
  fullName: string;
  mobile: string;
  address: string;
  landmark?: string;
  availableArea: string;
  landSize: string;
  description?: string;
  status: "Pending" | "Selected" | "Rejected" | string;
  createdAt: string;
  userId?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    mobile?: string;
  };
}

interface LandOfferViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: LandOfferItem | null;
  onStatusChange: (id: string, status: string) => Promise<void>;
  updating: boolean;
}

const LandOfferViewModal: React.FC<LandOfferViewModalProps> = ({
  isOpen,
  onClose,
  offer,
  onStatusChange,
  updating,
}) => {
  if (!isOpen || !offer) return null;

  const normStatus = (offer.status || "Pending").toLowerCase();
  const isSelected = normStatus === "selected";
  const isRejected = normStatus === "rejected";

  const getStatusBadge = () => {
    if (isSelected) {
      return (
        <span className="status-badge status-active" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <CheckCircle size={14} /> Selected
        </span>
      );
    }
    if (isRejected) {
      return (
        <span className="status-badge status-inactive" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <XCircle size={14} /> Rejected
        </span>
      );
    }
    return (
      <span className="status-badge status-warning" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        <Clock size={14} /> Pending
      </span>
    );
  };

  const formattedDate = offer.createdAt
    ? new Date(offer.createdAt).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 640, width: "100%", padding: 24, borderRadius: 16 }}>
        {/* MODAL HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border-color, #e5e7eb)" }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
              Land Offer Inquiry Details
            </h2>
            <div style={{ marginTop: 6 }}>{getStatusBadge()}</div>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: 16 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div style={{ display: "grid", gap: 16, fontSize: 14 }}>
          {/* USER & CONTACT DETAILS */}
          <div className="card" style={{ padding: 16, background: "var(--bg-secondary, #f9fafb)", borderRadius: 12 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 10px 0", color: "var(--accent-color, #10b981)", display: "flex", alignItems: "center", gap: 6 }}>
              <User size={16} /> User & Contact Details
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>Full Name:</span>
                <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{offer.fullName || "—"}</div>
              </div>
              <div>
                <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>Mobile Number:</span>
                <div style={{ fontWeight: 600, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 4 }}>
                  <Phone size={13} /> {offer.mobile || "—"}
                </div>
              </div>
              {offer.userId && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>Linked User ID:</span>
                  <div style={{ fontFamily: "monospace", fontSize: 13, color: "var(--text-primary)" }}>
                    {typeof offer.userId === "object" ? offer.userId._id : offer.userId}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* LOCATION DETAILS */}
          <div className="card" style={{ padding: 16, background: "var(--bg-secondary, #f9fafb)", borderRadius: 12 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 10px 0", color: "var(--accent-color, #10b981)", display: "flex", alignItems: "center", gap: 6 }}>
              <MapPin size={16} /> Land Location & Address
            </h4>
            <div style={{ display: "grid", gap: 8 }}>
              <div>
                <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>Address:</span>
                <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{offer.address || "—"}</div>
              </div>
              {offer.landmark && (
                <div>
                  <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>Landmark / Nearby:</span>
                  <div style={{ fontWeight: 500, color: "var(--text-primary)" }}>📍 {offer.landmark}</div>
                </div>
              )}
            </div>
          </div>

          {/* LAND CAPACITY & SIZE */}
          <div className="card" style={{ padding: 16, background: "var(--bg-secondary, #f9fafb)", borderRadius: 12 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 10px 0", color: "var(--accent-color, #10b981)", display: "flex", alignItems: "center", gap: 6 }}>
              <Layers size={16} /> Land Area & Specifications
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>Available Area / Space:</span>
                <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{offer.availableArea || "—"}</div>
              </div>
              <div>
                <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>Approximate Land Size:</span>
                <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{offer.landSize || "—"}</div>
              </div>
              {offer.description && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>Description / Notes:</span>
                  <div style={{ fontWeight: 500, color: "var(--text-primary)", display: "flex", alignItems: "flex-start", gap: 4 }}>
                    <FileText size={14} style={{ marginTop: 2 }} /> {offer.description}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SUBMISSION INFO & PLANTATION BANNER */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "var(--text-secondary)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Calendar size={14} /> Submitted on: <strong>{formattedDate}</strong>
            </span>
          </div>

          {isSelected && (
            <div style={{ padding: 12, borderRadius: 10, background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#047857", fontWeight: 600, fontSize: 13, textAlign: "center" }}>
              🌱 Plantations will be carried out here soon (Reflected on User APK).
            </div>
          )}
        </div>

        {/* MODAL ACTIONS */}
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--border-color, #e5e7eb)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className="btn-primary"
              disabled={updating || isSelected}
              onClick={() => onStatusChange(offer._id, "Selected")}
              style={{ background: isSelected ? "#9ca3af" : "#10b981", borderColor: isSelected ? "#9ca3af" : "#10b981", display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <CheckCircle size={15} /> Select Land
            </button>
            <button
              type="button"
              className="btn-secondary"
              disabled={updating || offer.status === "Pending"}
              onClick={() => onStatusChange(offer._id, "Pending")}
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <Clock size={15} /> Mark Pending
            </button>
            <button
              type="button"
              className="btn-danger"
              disabled={updating || isRejected}
              onClick={() => onStatusChange(offer._id, "Rejected")}
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <XCircle size={15} /> Reject
            </button>
          </div>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandOfferViewModal;
