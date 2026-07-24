import React, { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { apiFetch } from "../../utils/apiConfig";

export interface RoleFormData {
  _id?: string;
  name: string;
  displayName: string;
  description?: string;
  permissionKeys: string[];
  isActive: boolean;
}

interface Permission {
  _id: string;
  key: string;
  resource: string;
  action: string;
  description?: string;
}

// Mirrors backend SystemRole enum (src/common/enums/role.enum.ts)
const SYSTEM_ROLE_OPTIONS = [
  { label: "Super Admin", value: "super_admin" },
  { label: "Admin", value: "admin" },
  { label: "Insurance Company", value: "insurance_company" },
  { label: "Plantation Partner", value: "plantation_partner" },
  { label: "Field Officer", value: "field_officer" },
  { label: "Government Officer", value: "government_officer" },
  { label: "Customer", value: "customer" },
  { label: "Auditor", value: "auditor" },
];

interface RolesModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing: boolean;
  formData: RoleFormData;
  submitting?: boolean;
  onFieldChange: (name: string, value: any) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

const RolesModal: React.FC<RolesModalProps> = ({
  isOpen,
  onClose,
  editing,
  formData,
  submitting,
  onFieldChange,
  handleSubmit,
}) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [permError, setPermError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const loadPermissions = async () => {
      setLoadingPermissions(true);
      setPermError("");
      try {
        const data = await apiFetch<{ items: Permission[] }>("/api/v1/permissions?limit=500");
        setPermissions(data?.items || []);
      } catch (err: any) {
        setPermError(err.message || "Failed to load permissions");
      } finally {
        setLoadingPermissions(false);
      }
    };
    loadPermissions();
  }, [isOpen]);

  if (!isOpen) return null;

  const groupedPermissions = permissions.reduce<Record<string, Permission[]>>((acc, perm) => {
    if (!acc[perm.resource]) acc[perm.resource] = [];
    acc[perm.resource].push(perm);
    return acc;
  }, {});

  const selectedKeys = formData.permissionKeys || [];

  const togglePermission = (key: string) => {
    const next = selectedKeys.includes(key)
      ? selectedKeys.filter((k) => k !== key)
      : [...selectedKeys, key];
    onFieldChange("permissionKeys", next);
  };

  const toggleResourceAll = (keys: string[]) => {
    const allSelected = keys.every((k) => selectedKeys.includes(k));
    const next = allSelected
      ? selectedKeys.filter((k) => !keys.includes(k))
      : Array.from(new Set([...selectedKeys, ...keys]));
    onFieldChange("permissionKeys", next);
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ width: 680, maxHeight: "88vh", overflowY: "auto" }}>
        <div className="modal-header">
          <h2>{editing ? "Edit Role" : "Add Role"}</h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Role Key</label>
            <select
              value={formData.name}
              onChange={(e) => onFieldChange("name", e.target.value)}
              disabled={editing}
              required
            >
              <option value="">Select Role</option>
              {SYSTEM_ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Display Name</label>
            <input
              value={formData.displayName}
              onChange={(e) => onFieldChange("displayName", e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description || ""}
              onChange={(e) => onFieldChange("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => onFieldChange("isActive", e.target.checked)}
              />
              Active
            </label>
          </div>

          <div className="form-group">
            <label>Permissions</label>
            {permError && (
              <div style={{ color: "#ff3d00", fontSize: 13, marginBottom: 8 }}>{permError}</div>
            )}
            {loadingPermissions ? (
              <div style={{ display: "flex", justifyContent: "center", padding: 16 }}>
                <Loader2 size={18} className="spin" />
              </div>
            ) : (
              <div
                style={{
                  maxHeight: 260,
                  overflowY: "auto",
                  border: "1px solid var(--border-color)",
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                {Object.entries(groupedPermissions).map(([resource, perms]) => {
                  const keys = perms.map((p) => p.key);
                  const allSelected = keys.every((k) => selectedKeys.includes(k));
                  return (
                    <div key={resource} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={() => toggleResourceAll(keys)}
                        />
                        <strong style={{ textTransform: "capitalize", fontSize: 13 }}>
                          {resource.replace(/_/g, " ")}
                        </strong>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", paddingLeft: 24 }}>
                        {perms.map((perm) => (
                          <label
                            key={perm._id}
                            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}
                          >
                            <input
                              type="checkbox"
                              checked={selectedKeys.includes(perm.key)}
                              onChange={() => togglePermission(perm.key)}
                            />
                            {perm.action}
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-danger" onClick={onClose}>
              Cancel
            </button>

            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : editing ? "Update Role" : "Add Role"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RolesModal;
