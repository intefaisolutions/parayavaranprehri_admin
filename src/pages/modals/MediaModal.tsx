import React, { useState } from "react";
import { X, FileText, User, Layers, ShieldCheck, UploadCloud, Loader2 } from "lucide-react";
import { apiUpload } from "../../utils/apiConfig";

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

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing: boolean;
  formData: MediaFormData;
  submitting?: boolean;
  error?: string;
  onFieldChange: (name: string, value: any) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

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

const MediaModal: React.FC<MediaModalProps> = ({
  isOpen,
  onClose,
  editing,
  formData,
  submitting,
  error,
  onFieldChange,
  handleSubmit,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    onFieldChange(e.target.name, e.target.value);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    setUploadError("");
    try {
      const result = await apiUpload(file, "general");
      onFieldChange("url", result.url);
      onFieldChange("fileSize", formatFileSize(file.size));
      if (!formData.name) {
        onFieldChange("name", file.name);
      }
      onFieldChange("mediaType", guessMediaType(file));
    } catch (err: any) {
      setUploadError(err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{editing ? "Edit Media" : "Add Media"}</h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

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
            <button type="button" className="btn-danger" onClick={onClose}>
              Cancel
            </button>

            <button type="submit" className="btn-primary" disabled={submitting || uploading || !formData.url}>
              {submitting ? "Saving..." : editing ? "Update Media" : "Add Media"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MediaModal;
