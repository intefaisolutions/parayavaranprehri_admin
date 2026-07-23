import React from "react";
import { ArrowLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface FormPageHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  onBack?: () => void;
}

/** Consistent header (icon badge + title + subtitle + back button) for full-page forms. */
export const FormPageHeader: React.FC<FormPageHeaderProps> = ({
  icon: Icon,
  title,
  subtitle,
  onBack,
}) => {
  return (
    <div className="form-page-header">
      {onBack && (
        <button type="button" className="icon-btn" onClick={onBack} title="Back">
          <ArrowLeft size={18} />
        </button>
      )}
      <div className="form-page-icon">
        <Icon size={24} />
      </div>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>{title}</h1>
        {subtitle && <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>{subtitle}</p>}
      </div>
    </div>
  );
};

export default FormPageHeader;
