import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Loader2,
  Camera,
  Trash2,
  Save,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { apiFetch, apiUpload } from "../utils/apiConfig";

interface MeUser {
  _id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  district?: string;
  state?: string;
  avatar?: string;
  isActive?: boolean;
}

const fallbackAvatar = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=166534&color=fff&size=256`;

async function resolvePreviewUrl(url?: string): Promise<string> {
  if (!url) return "";
  if (!/amazonaws\.com|\.s3[.-]/i.test(url) || /[?&]X-Amz-/i.test(url)) {
    return url;
  }
  try {
    const data = await apiFetch<{ signedUrl: string }>(
      `/api/v1/uploads/signed?url=${encodeURIComponent(url)}`,
    );
    return data?.signedUrl || url;
  } catch {
    return url;
  }
}

export const ProfileView = () => {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    district: "",
    state: "",
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const me = await apiFetch<MeUser>("/api/v1/users/me");
        setUser(me);
        setForm({
          firstName: me.firstName || "",
          lastName: me.lastName || "",
          phone: me.phone || "",
          district: me.district || "",
          state: me.state || "",
        });
        setAvatarUrl(me.avatar || "");
        const preview = await resolvePreviewUrl(me.avatar);
        setAvatarPreview(preview);
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const displayName =
    [form.firstName, form.lastName].filter(Boolean).join(" ").trim() ||
    user?.email ||
    "Admin";

  const roleLabel = (user?.role || "").replace(/_/g, " ");

  const syncLocalUser = (patch: Record<string, unknown>) => {
    try {
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...stored, ...patch }));
      window.dispatchEvent(new Event("user-updated"));
    } catch {
      /* ignore */
    }
  };

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (JPG, PNG, or WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be 5 MB or smaller.");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");
    try {
      const uploaded = await apiUpload(file, "users");
      const permanent = uploaded.url;
      const preview = uploaded.signedUrl || permanent;

      const updated = await apiFetch<MeUser>("/api/v1/users/me", {
        method: "PATCH",
        body: JSON.stringify({ avatar: permanent }),
      });

      setUser(updated);
      setAvatarUrl(updated.avatar || permanent);
      setAvatarPreview(preview);
      syncLocalUser({
        avatar: updated.avatar || permanent,
        avatarPreview: preview,
      });
      setSuccess("Profile photo updated.");
    } catch (err: any) {
      setError(err.message || "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!avatarUrl) return;
    setUploading(true);
    setError("");
    setSuccess("");
    try {
      const updated = await apiFetch<MeUser>("/api/v1/users/me", {
        method: "PATCH",
        body: JSON.stringify({ avatar: "" }),
      });
      setUser(updated);
      setAvatarUrl("");
      setAvatarPreview("");
      syncLocalUser({ avatar: "", avatarPreview: "" });
      setSuccess("Profile photo removed.");
    } catch (err: any) {
      setError(err.message || "Failed to remove photo");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const updated = await apiFetch<MeUser>("/api/v1/users/me", {
        method: "PATCH",
        body: JSON.stringify({
          firstName: form.firstName.trim() || undefined,
          lastName: form.lastName.trim() || undefined,
          phone: form.phone.trim() || undefined,
          district: form.district.trim() || undefined,
          state: form.state.trim() || undefined,
          avatar: avatarUrl || "",
        }),
      });
      setUser(updated);
      syncLocalUser({
        firstName: updated.firstName ?? form.firstName,
        lastName: updated.lastName ?? form.lastName,
        phone: updated.phone ?? form.phone,
        district: updated.district ?? form.district,
        state: updated.state ?? form.state,
        avatar: updated.avatar ?? avatarUrl,
      });
      setSuccess("Profile saved successfully.");
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const imgSrc = avatarPreview || fallbackAvatar(displayName);

  return (
    <div className="dashboard-area">
      <div className="profile-page">
        <div className="profile-page-top">
          <button
            type="button"
            className="profile-back-btn"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <div>
            <h1>My Profile</h1>
            <p>Manage your photo and account details</p>
          </div>
        </div>

        {loading ? (
          <div className="profile-loading">
            <Loader2 size={28} className="spin" />
          </div>
        ) : (
          <form className="profile-layout" onSubmit={handleSave}>
            {(error || success) && (
              <div
                className={`profile-alert ${error ? "is-error" : "is-success"}`}
              >
                {error ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                <span>{error || success}</span>
              </div>
            )}

            <aside className="profile-hero-card">
              <div className="profile-hero-bg" aria-hidden="true" />
              <div className="profile-avatar-wrap">
                <div className="profile-avatar">
                  <img src={imgSrc} alt={displayName} />
                  {uploading && (
                    <div className="profile-avatar-overlay">
                      <Loader2 size={22} className="spin" />
                    </div>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  hidden
                  onChange={handleAvatarPick}
                />
                <div className="profile-avatar-actions">
                  <button
                    type="button"
                    className="profile-avatar-btn"
                    disabled={uploading}
                    onClick={() => fileRef.current?.click()}
                  >
                    <Camera size={15} />
                    {avatarUrl ? "Change photo" : "Upload photo"}
                  </button>
                  {avatarUrl ? (
                    <button
                      type="button"
                      className="profile-avatar-btn is-muted"
                      disabled={uploading}
                      onClick={handleRemoveAvatar}
                    >
                      <Trash2 size={15} />
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="profile-hero-meta">
                <h2>{displayName}</h2>
                <span className="profile-role-pill">{roleLabel || "Admin"}</span>
                <p className="profile-hero-email">{user?.email}</p>
              </div>

              <ul className="profile-hero-facts">
                <li>
                  <Phone size={14} />
                  <span>{form.phone || "No phone added"}</span>
                </li>
                <li>
                  <MapPin size={14} />
                  <span>
                    {[form.district, form.state].filter(Boolean).join(", ") ||
                      "Location not set"}
                  </span>
                </li>
                <li>
                  <ShieldCheck size={14} />
                  <span>
                    {user?.isActive === false ? "Inactive account" : "Active account"}
                  </span>
                </li>
              </ul>
            </aside>

            <section className="profile-form-card">
              <div className="profile-section">
                <div className="profile-section-head">
                  <User size={18} />
                  <div>
                    <h3>Personal information</h3>
                    <p>Your name as shown across the admin panel</p>
                  </div>
                </div>
                <div className="profile-grid">
                  <label className="profile-field">
                    <span>First name</span>
                    <input
                      value={form.firstName}
                      onChange={(e) => handleChange("firstName", e.target.value)}
                      required
                      minLength={2}
                      placeholder="First name"
                    />
                  </label>
                  <label className="profile-field">
                    <span>Last name</span>
                    <input
                      value={form.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      required
                      minLength={2}
                      placeholder="Last name"
                    />
                  </label>
                </div>
              </div>

              <div className="profile-section">
                <div className="profile-section-head">
                  <Mail size={18} />
                  <div>
                    <h3>Contact & location</h3>
                    <p>Email is read-only. Update phone and region below.</p>
                  </div>
                </div>
                <div className="profile-grid">
                  <label className="profile-field">
                    <span>Email</span>
                    <input value={user?.email || ""} readOnly disabled />
                  </label>
                  <label className="profile-field">
                    <span>Phone</span>
                    <input
                      value={form.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="10–15 digit mobile"
                    />
                  </label>
                  <label className="profile-field">
                    <span>State</span>
                    <input
                      value={form.state}
                      onChange={(e) => handleChange("state", e.target.value)}
                      placeholder="e.g. Madhya Pradesh"
                    />
                  </label>
                  <label className="profile-field">
                    <span>District</span>
                    <input
                      value={form.district}
                      onChange={(e) => handleChange("district", e.target.value)}
                      placeholder="e.g. Indore"
                    />
                  </label>
                </div>
              </div>

              <div className="profile-section">
                <div className="profile-section-head">
                  <ShieldCheck size={18} />
                  <div>
                    <h3>Access</h3>
                    <p>Role is assigned by system administrators</p>
                  </div>
                </div>
                <div className="profile-grid">
                  <label className="profile-field">
                    <span>Role</span>
                    <input
                      value={roleLabel}
                      readOnly
                      disabled
                      style={{ textTransform: "capitalize" }}
                    />
                  </label>
                </div>
              </div>

              <div className="profile-form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => navigate("/dashboard")}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary profile-save-btn"
                  disabled={saving || uploading}
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Profile
                    </>
                  )}
                </button>
              </div>
            </section>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfileView;
