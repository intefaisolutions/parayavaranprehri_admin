import React, { useState } from "react";
import { AlertCircle, CheckCircle2, ImageOff, Loader2, UploadCloud, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { apiUpload } from "../../utils/apiConfig";

export type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "email"
  | "tel"
  | "number"
  | "date"
  | "url"
  | "image"
  | "gallery"
  | "tags"
  | "boolean";

export type UploadCategory = "users" | "certificates" | "trees" | "documents" | "general";

export interface SelectOption {
  label: string;
  value: string;
}

export interface FieldConfig {
  name: string;
  label: string;
  type?: FieldType;
  icon?: LucideIcon;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  helpText?: string;
  options?: SelectOption[];
  /** For "select" fields whose choices depend on another field's current value
   * (e.g. District options depending on the selected State) - takes priority
   * over the static `options` list when provided. */
  optionsFor?: (formData: Record<string, any>) => SelectOption[];
  rows?: number;
  span?: 1 | 2;
  /** S3 folder category used when this field uploads a file (image/gallery types). */
  uploadCategory?: UploadCategory;
  /** Only rendered when this returns true (or is omitted). Useful for conditional fields. */
  visibleWhen?: (formData: Record<string, any>) => boolean;
}

export interface FormSectionConfig {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  fields: FieldConfig[];
  /** Only renders the whole section when this returns true (or is omitted). */
  visibleWhen?: (formData: Record<string, any>) => boolean;
}

interface SmartFieldProps {
  field: FieldConfig;
  value: any;
  onChange: (name: string, value: any) => void;
}

const SmartField: React.FC<SmartFieldProps> = ({ field, value, onChange }) => {
  const {
    name,
    label,
    type = "text",
    icon: Icon,
    placeholder,
    required,
    disabled,
    helpText,
    options,
    rows = 3,
    uploadCategory = "general",
  } = field;

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [tagDraft, setTagDraft] = useState("");
  const [galleryUrlDraft, setGalleryUrlDraft] = useState("");

  const handle = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => onChange(name, e.target.value);

  const uploadFile = async (file: File): Promise<string | null> => {
    setUploading(true);
    setUploadError("");
    try {
      const result = await apiUpload(file, uploadCategory);
      return result.url;
    } catch (err: any) {
      setUploadError(err?.message || "Upload failed");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const url = await uploadFile(file);
    if (url) onChange(name, url);
  };

  const handleGalleryFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    const current: string[] = Array.isArray(value) ? value : [];
    const uploaded: string[] = [];
    for (const file of files) {
      const url = await uploadFile(file);
      if (url) uploaded.push(url);
    }
    if (uploaded.length > 0) onChange(name, [...current, ...uploaded]);
  };

  const removeGalleryItem = (index: number) => {
    const current: string[] = Array.isArray(value) ? value : [];
    onChange(name, current.filter((_, i) => i !== index));
  };

  const addGalleryUrl = (raw: string) => {
    const url = raw.trim();
    if (!url) return;
    const current: string[] = Array.isArray(value) ? value : [];
    if (current.includes(url)) {
      setGalleryUrlDraft("");
      return;
    }
    onChange(name, [...current, url]);
    setGalleryUrlDraft("");
  };

  const handleGalleryUrlKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addGalleryUrl(galleryUrlDraft);
    }
  };

  const addTag = (raw: string) => {
    const tag = raw.trim();
    if (!tag) return;
    const current: string[] = Array.isArray(value) ? value : [];
    if (current.includes(tag)) {
      setTagDraft("");
      return;
    }
    onChange(name, [...current, tag]);
    setTagDraft("");
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagDraft);
    } else if (e.key === "Backspace" && !tagDraft && Array.isArray(value) && value.length > 0) {
      onChange(name, value.slice(0, -1));
    }
  };

  const removeTag = (index: number) => {
    const current: string[] = Array.isArray(value) ? value : [];
    onChange(name, current.filter((_, i) => i !== index));
  };

  const control = (() => {
    if (type === "select") {
      return (
        <select name={name} value={value ?? ""} onChange={handle} disabled={disabled} required={required}>
          {!required && <option value="">-- Select --</option>}
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    if (type === "textarea") {
      return (
        <textarea
          name={name}
          value={value ?? ""}
          onChange={handle}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          rows={rows}
        />
      );
    }

    if (type === "boolean") {
      return null; // rendered separately below as a toggle
    }

    return (
      <input
        type={type === "image" ? "url" : type}
        name={name}
        value={value ?? ""}
        onChange={handle}
        placeholder={placeholder}
        disabled={disabled}
      />
    );
  })();

  if (type === "boolean") {
    return (
      <div className={`ff${field.span === 2 ? " ff-span-2" : ""}`}>
        <label className="ff-toggle-row" htmlFor={name}>
          <span className="ff-label" style={{ marginBottom: 0 }}>
            {Icon && <Icon size={15} className="ff-icon" />}
            {label}
          </span>
          <span
            className={`ff-toggle ${value ? "is-on" : ""}`}
            role="switch"
            aria-checked={!!value}
            onClick={() => !disabled && onChange(name, !value)}
          >
            <span className="ff-toggle-knob" />
          </span>
        </label>
        {helpText && <span className="ff-help">{helpText}</span>}
      </div>
    );
  }

  return (
    <div className={`ff${field.span === 2 ? " ff-span-2" : ""}`}>
      <label className="ff-label" htmlFor={name}>
        {Icon && <Icon size={15} className="ff-icon" />}
        {label}
        {required && <span className="ff-required">*</span>}
      </label>

      {type === "image" ? (
        <div className="ff-image-row">
          <div className="ff-control">{control}</div>
          <label className={`ff-upload-btn ${uploading ? "is-uploading" : ""}`} title="Upload image">
            {uploading ? <Loader2 size={16} className="spin" /> : <UploadCloud size={16} />}
            <input type="file" accept="image/*" hidden onChange={handleImageFileChange} disabled={uploading} />
          </label>
          <div className="ff-image-preview">
            {value ? (
              <img src={value} alt={label} onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
            ) : (
              <ImageOff size={20} color="var(--text-secondary)" />
            )}
          </div>
        </div>
      ) : type === "gallery" ? (
        <div className="ff-gallery">
          <div className="ff-gallery-grid">
            {(Array.isArray(value) ? value : []).map((url: string, idx: number) => (
              <div className="ff-gallery-item" key={`${url}-${idx}`}>
                <img src={url} alt={`${label} ${idx + 1}`} />
                <button type="button" className="ff-gallery-remove" onClick={() => removeGalleryItem(idx)}>
                  <X size={12} />
                </button>
              </div>
            ))}
            <label className={`ff-gallery-add ${uploading ? "is-uploading" : ""}`}>
              {uploading ? <Loader2 size={18} className="spin" /> : <UploadCloud size={18} />}
              <span>{uploading ? "Uploading..." : "Add"}</span>
              <input type="file" accept="image/*" multiple hidden onChange={handleGalleryFileChange} disabled={uploading} />
            </label>
          </div>
          <div className="ff-gallery-url-row">
            <input
              type="url"
              className="ff-gallery-url-input"
              value={galleryUrlDraft}
              onChange={(e) => setGalleryUrlDraft(e.target.value)}
              onKeyDown={handleGalleryUrlKeyDown}
              placeholder="Or paste an image URL and press Enter..."
              disabled={disabled}
            />
            <button type="button" className="ff-gallery-url-add" onClick={() => addGalleryUrl(galleryUrlDraft)}>
              Add
            </button>
          </div>
        </div>
      ) : type === "tags" ? (
        <div className="ff-tags">
          {(Array.isArray(value) ? value : []).map((tag: string, idx: number) => (
            <span className="ff-tag" key={`${tag}-${idx}`}>
              {tag}
              <button type="button" onClick={() => removeTag(idx)}>
                <X size={11} />
              </button>
            </span>
          ))}
          <input
            type="text"
            className="ff-tag-input"
            value={tagDraft}
            onChange={(e) => setTagDraft(e.target.value)}
            onKeyDown={handleTagKeyDown}
            onBlur={() => addTag(tagDraft)}
            placeholder={placeholder || "Type and press Enter..."}
            disabled={disabled}
          />
        </div>
      ) : (
        <div className="ff-control">{control}</div>
      )}

      {uploadError && (
        <span className="ff-help" style={{ color: "var(--danger-color)" }}>
          {uploadError}
        </span>
      )}
      {helpText && <span className="ff-help">{helpText}</span>}
    </div>
  );
};

interface SmartFormProps {
  sections: FormSectionConfig[];
  formData: Record<string, any>;
  onFieldChange: (name: string, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  error?: string;
  success?: string;
  className?: string;
}

/**
 * A single, config-driven form renderer used across the admin panel (full
 * page forms and modal forms alike). Pass a declarative list of sections /
 * fields and it takes care of layout, icons, required markers, help text,
 * image/gallery uploads (to S3 via the backend), and the submit/cancel footer.
 */
export const SmartForm: React.FC<SmartFormProps> = ({
  sections,
  formData,
  onFieldChange,
  onSubmit,
  submitting,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  onCancel,
  error,
  success,
  className = "",
}) => {
  return (
    <form className={`smart-form ${className}`} onSubmit={onSubmit}>
      {error && (
        <div className="smart-form-banner error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="smart-form-banner success">
          <CheckCircle2 size={16} />
          <span>{success}</span>
        </div>
      )}

      {sections.map((section, idx) => {
        if (section.visibleWhen && !section.visibleWhen(formData)) return null;

        const visibleFields = section.fields.filter(
          (f) => !f.visibleWhen || f.visibleWhen(formData)
        );
        if (visibleFields.length === 0) return null;

        return (
          <div className="form-section" key={section.title || idx}>
            {(section.title || section.description) && (
              <div className="form-section-header">
                {section.icon && (
                  <div className="form-section-icon">
                    <section.icon size={18} />
                  </div>
                )}
                <div>
                  {section.title && <div className="form-section-title">{section.title}</div>}
                  {section.description && (
                    <div className="form-section-description">{section.description}</div>
                  )}
                </div>
              </div>
            )}

            <div className="form-grid">
              {visibleFields.map((field) => (
                <SmartField
                  key={field.name}
                  field={
                    field.optionsFor
                      ? { ...field, options: field.optionsFor(formData) }
                      : field
                  }
                  value={formData[field.name]}
                  onChange={onFieldChange}
                />
              ))}
            </div>
          </div>
        );
      })}

      <div className="smart-form-actions">
        {onCancel && (
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={submitting}>
            {cancelLabel}
          </button>
        )}
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default SmartForm;
