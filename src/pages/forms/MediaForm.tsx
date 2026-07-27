import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FileText, User, Layers, ShieldCheck, UploadCloud, Loader2 } from "lucide-react";
import { apiFetch, apiUpload } from "../../utils/apiConfig";
import { FormPageHeader } from "../../components/form/FormPageHeader";

export interface MediaFormData {
  _id?: string;
  name: string;
  mediaType: string;
  url: string;
  fileSize?: string;
  uploadedBy?: string;
  usedInModule?: string;
  status: string;
}

const emptyForm: MediaFormData = {
  name: "",
  mediaType: "Image",
  url: "",
  fileSize: "",
  uploadedBy: "",
  usedInModule: "",
  status: "Active",
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const guessMediaType = (file: File): string => {
  if (file.type.startsWith("image/")) return "Image";
  if (file.type.startsWith("video/")) return "Video";
  if (file.type === "application/pdf") return "PDF";
  return "Document";
};

export const MediaForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const editMedia = location.state?.media;
  const isEditing = !!editMedia;

  const [formData, setFormData] = useState<MediaFormData>(
    editMedia ? { ...emptyForm, ...editMedia } : emptyForm
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    handleFieldChange(e.target.name, e.target.value);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    setUploadError("");
    try {
      const result = await apiUpload(file, "general");
      handleFieldChange("url", result.url);
      handleFieldChange("fileSize", formatFileSize(file.size));
      if (!formData.name) {
        handleFieldChange("name", file.name);
      }
      handleFieldChange("mediaType", guessMediaType(file));
    } catch (err: any) {
      setUploadError(err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const { _id, ...payload } = formData;

    try {
      if (isEditing && _id) {
        await apiFetch(`/api/v1/media/${_id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/v1/media", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      navigate("/media");
    } catch (err: any) {
      setError(err.message || "Failed to save Media");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-area">
      <FormPageHeader
        icon={FileText}
        title={isEditing ? "Edit Media" : "Upload Media"}
        subtitle="Manage uploaded media files across the application."
        onBack={() => navigate("/media")}
      />

      <div className="card">
        {error && (
          <div style={{ background: "rgba(255, 61, 0, 0.1)", color: "#ff3d00", padding: "10px 12px", borderRadius: "8px", marginBottom: "12px", fontSize: 13 }}>
            {error}
          </div>
        )}

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>File</label>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <label
                className={`ff-upload-btn ${uploading ? "is-uploading" : ""}`}
                style={{ cursor: "pointer" }}
                title="Upload file"
              >
                {uploading ? <Loader2 size={16} className="spin" /> : <UploadCloud size={16} />}
                <input type="file" hidden onChange={handleFileChange} disabled={uploading} />
              </label>
              <span style={{ fontSize: 13, color: "var(--text-secondary)", wordBreak: "break-all" }}>
                {formData.url ? formData.url : "No file uploaded yet"}
              </span>
            </div>
            {uploadError && (
              <span style={{ color: "var(--danger-color)", fontSize: 12 }}>{uploadError}</span>
            )}
          </div>

          <div className="form-group">
            <label>
              <FileText size={14} style={{ verticalAlign: "text-bottom", marginRight: 4 }} />
              Media Name
            </label>
            <input name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>
              <Layers size={14} style={{ verticalAlign: "text-bottom", marginRight: 4 }} />
              Media Type
            </label>
            <select name="mediaType" value={formData.mediaType} onChange={handleChange}>
              <option value="Image">Image</option>
              <option value="Video">Video</option>
              <option value="PDF">PDF</option>
              <option value="Document">Document</option>
            </select>
          </div>

          <div className="form-group">
            <label>File Size</label>
            <input name="fileSize" value={formData.fileSize || ""} onChange={handleChange} placeholder="Auto-filled on upload" readOnly />
          </div>

          <div className="form-group">
            <label>
              <User size={14} style={{ verticalAlign: "text-bottom", marginRight: 4 }} />
              Uploaded By
            </label>
            <input name="uploadedBy" value={formData.uploadedBy || ""} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Used In Module</label>
            <select name="usedInModule" value={formData.usedInModule || ""} onChange={handleChange}>
              <option value="">-- Select --</option>
              <option value="News">News</option>
              <option value="Gallery">Gallery</option>
              <option value="Person">Person</option>
              <option value="Vehicle">Vehicle</option>
              <option value="Map">Map</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              <ShieldCheck size={14} style={{ verticalAlign: "text-bottom", marginRight: 4 }} />
              Status
            </label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-danger" onClick={() => navigate("/media")}>
              Cancel
            </button>

            <button type="submit" className="btn-primary" disabled={submitting || uploading || !formData.url}>
              {submitting ? "Saving..." : isEditing ? "Update Media" : "Add Media"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MediaForm;
