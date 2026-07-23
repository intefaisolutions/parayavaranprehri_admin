import React from "react";
import { AlertCircle, CheckCircle2, ImageOff } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "email"
  | "tel"
  | "number"
  | "date"
  | "url"
  | "image";

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
  rows?: number;
  span?: 1 | 2;
  /** Only rendered when this returns true (or is omitted). Useful for conditional fields. */
  visibleWhen?: (formData: Record<string, any>) => boolean;
}

export interface FormSectionConfig {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  fields: FieldConfig[];
}

interface SmartFieldProps {
  field: FieldConfig;
  value: any;
  onChange: (name: string, value: string) => void;
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
  } = field;

  const handle = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => onChange(name, e.target.value);

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

    return (
      <input
        type={type === "image" ? "url" : type}
        name={name}
        value={value ?? ""}
        onChange={handle}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
      />
    );
  })();

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
          <div className="ff-image-preview">
            {value ? (
              <img src={value} alt={label} onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
            ) : (
              <ImageOff size={20} color="var(--text-secondary)" />
            )}
          </div>
        </div>
      ) : (
        <div className="ff-control">{control}</div>
      )}

      {helpText && <span className="ff-help">{helpText}</span>}
    </div>
  );
};

interface SmartFormProps {
  sections: FormSectionConfig[];
  formData: Record<string, any>;
  onFieldChange: (name: string, value: string) => void;
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
 * image previews, and the submit/cancel footer.
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
                  field={field}
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
