import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck, Loader2 } from "lucide-react";
import { apiFetch } from "../../utils/apiConfig";
import { FormPageHeader } from "../../components/form/FormPageHeader";

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

const emptyForm: RoleFormData = {
  name: "",
  displayName: "",
  description: "",
  permissionKeys: [],
  isActive: true,
};

export const RoleForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const editRole = location.state?.role;
  const isEditing = !!editRole;

  const [formData, setFormData] = useState<RoleFormData>(
    editRole ? { ...emptyForm, ...editRole } : emptyForm
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [permError, setPermError] = useState("");

  useEffect(() => {
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
  }, []);

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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
    handleFieldChange("permissionKeys", next);
  };

  const toggleResourceAll = (keys: string[]) => {
    const allSelected = keys.every((k) => selectedKeys.includes(k));
    const next = allSelected
      ? selectedKeys.filter((k) => !keys.includes(k))
      : Array.from(new Set([...selectedKeys, ...keys]));
    handleFieldChange("permissionKeys", next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const { _id, ...payload } = formData;

    try {
      if (isEditing && _id) {
        await apiFetch(`/api/v1/roles/${_id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/v1/roles", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      navigate("/roles");
    } catch (err: any) {
      setError(err.message || "Failed to save role");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-area">
      <FormPageHeader
        icon={ShieldCheck}
        title={isEditing ? "Edit Role" : "Add Role"}
        subtitle="Manage user roles and module permissions."
        onBack={() => navigate("/roles")}
      />

      <div className="card">
        {error && (
          <div style={{ background: "rgba(255, 61, 0, 0.1)", color: "#ff3d00", padding: "10px 12px", borderRadius: "8px", marginBottom: "12px", fontSize: 13 }}>
            {error}
          </div>
        )}

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Role Key</label>
            <select
              value={formData.name}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              disabled={isEditing}
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
              onChange={(e) => handleFieldChange("displayName", e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description || ""}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => handleFieldChange("isActive", e.target.checked)}
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
                  maxHeight: 320,
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
            <button type="button" className="btn-danger" onClick={() => navigate("/roles")}>
              Cancel
            </button>

            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : isEditing ? "Update Role" : "Add Role"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleForm;
