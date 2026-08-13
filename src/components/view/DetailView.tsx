import React from "react";
import { ArrowLeft, Loader2, type LucideIcon } from "lucide-react";
import { MediaImage } from "../media/MediaImage";
import "./DetailView.css";

export type DetailBadgeTone =
  | "success"
  | "warning"
  | "danger"
  | "neutral"
  | "info";

export interface DetailBadge {
  label: string;
  tone?: DetailBadgeTone;
}

export interface DetailField {
  label: string;
  value?: React.ReactNode;
  icon?: LucideIcon;
  /** 1 = half width on desktop, 2 = full width */
  span?: 1 | 2;
}

export interface DetailSection {
  title: string;
  description?: string;
  icon?: LucideIcon;
  fields: DetailField[];
}

export interface DetailMetaItem {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
}

export interface DetailViewProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  /** Large avatar / photo in the hero */
  avatarUrl?: string;
  avatarFallback?: string;
  headline: string;
  subheadline?: string;
  badges?: DetailBadge[];
  /** Compact stats under the hero (e.g. vehicles, trees, last login) */
  meta?: DetailMetaItem[];
  sections: DetailSection[];
  /** Extra blocks below sections (tables, galleries, etc.) */
  children?: React.ReactNode;
  actions?: React.ReactNode;
  loading?: boolean;
  error?: string;
}

const toneClass = (tone: DetailBadgeTone = "neutral") =>
  `detail-badge detail-badge--${tone}`;

const displayValue = (value?: React.ReactNode) => {
  if (value === undefined || value === null || value === "") return "—";
  return value;
};

/**
 * Reusable read-only detail layout for admin View screens.
 * Use this instead of disabled SmartForm fields.
 */
export const DetailView: React.FC<DetailViewProps> = ({
  title,
  subtitle,
  onBack,
  avatarUrl,
  avatarFallback,
  headline,
  subheadline,
  badges = [],
  meta = [],
  sections,
  children,
  actions,
  loading,
  error,
}) => {
  const initials =
    avatarFallback ||
    headline
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") ||
    "?";

  return (
    <div className="detail-view">
      <header className="detail-view__header">
        <div className="detail-view__header-left">
          {onBack && (
            <button
              type="button"
              className="icon-btn"
              onClick={onBack}
              title="Back"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div>
            <h1 className="detail-view__title">{title}</h1>
            {subtitle && <p className="detail-view__subtitle">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="detail-view__actions">{actions}</div>}
      </header>

      {error && <div className="detail-view__error">{error}</div>}

      {loading ? (
        <div className="detail-view__loading">
          <Loader2 size={28} className="spin" />
          <span>Loading details…</span>
        </div>
      ) : (
        <>
          <section className="detail-hero">
            <div className="detail-hero__avatar">
              {avatarUrl ? (
                <MediaImage src={avatarUrl} alt={headline} />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div className="detail-hero__body">
              <h2 className="detail-hero__name">{headline}</h2>
              {subheadline && (
                <p className="detail-hero__sub">{subheadline}</p>
              )}
              {badges.length > 0 && (
                <div className="detail-hero__badges">
                  {badges.map((b) => (
                    <span key={b.label} className={toneClass(b.tone)}>
                      {b.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>

          {meta.length > 0 && (
            <div className="detail-meta">
              {meta.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="detail-meta__item">
                    {Icon && (
                      <span className="detail-meta__icon">
                        <Icon size={16} />
                      </span>
                    )}
                    <div>
                      <div className="detail-meta__label">{item.label}</div>
                      <div className="detail-meta__value">
                        {displayValue(item.value)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="detail-sections">
            {sections.map((section) => {
              const SectionIcon = section.icon;
              return (
                <section key={section.title} className="detail-section">
                  <div className="detail-section__head">
                    {SectionIcon && (
                      <span className="detail-section__icon">
                        <SectionIcon size={18} />
                      </span>
                    )}
                    <div>
                      <h3 className="detail-section__title">{section.title}</h3>
                      {section.description && (
                        <p className="detail-section__desc">
                          {section.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="detail-fields">
                    {section.fields.map((field) => {
                      const FieldIcon = field.icon;
                      return (
                        <div
                          key={field.label}
                          className={`detail-field ${
                            field.span === 2 ? "detail-field--full" : ""
                          }`}
                        >
                          <div className="detail-field__label">
                            {FieldIcon && <FieldIcon size={14} />}
                            <span>{field.label}</span>
                          </div>
                          <div className="detail-field__value">
                            {displayValue(field.value)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>

          {children}
        </>
      )}
    </div>
  );
};

export default DetailView;
