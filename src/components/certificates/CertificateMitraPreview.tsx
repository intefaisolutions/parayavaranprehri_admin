import React, { useEffect, useState } from "react";
import { Download, MessageCircle, Smartphone } from "lucide-react";
import { apiFetch } from "../../utils/apiConfig";
import {
  buildCertificateShareText,
  downloadCertificatePdf,
  isDemoCertificateCode,
  openWhatsAppShare,
  resolveSignedUrl,
} from "./certificateShare";
import "./CertificateMitraPreview.css";

export type CertificatePreviewData = {
  title?: string;
  recipientName?: string;
  description?: string;
  eventName?: string;
  issueDate?: string | Date;
  verificationCode?: string;
  certificateNumber?: string;
  logoUrl?: string;
  signatureUrl?: string;
  backgroundUrl?: string;
  templateName?: string;
  certificateType?: string;
};

type Props = {
  data: CertificatePreviewData;
  /** phone frame = how Mitra app roughly shows it; wide = print-like */
  variant?: "phone" | "wide";
  className?: string;
  /** Issued certificate Mongo id — enables API WhatsApp share */
  certificateId?: string;
  recipientMobile?: string;
  showActions?: boolean;
};

function formatDate(value?: string | Date) {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function CertificateMitraPreview({
  data,
  variant = "phone",
  className = "",
  certificateId,
  recipientMobile,
  showActions = true,
}: Props) {
  const [actionMsg, setActionMsg] = useState("");
  const [sharing, setSharing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [logoSrc, setLogoSrc] = useState("");
  const [signatureSrc, setSignatureSrc] = useState("");
  const [backgroundSrc, setBackgroundSrc] = useState("");

  const title = data.title || "Certificate of Appreciation";
  const name = data.recipientName || "Mitra Name";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [logo, signature, background] = await Promise.all([
        resolveSignedUrl(data.logoUrl),
        resolveSignedUrl(data.signatureUrl),
        resolveSignedUrl(data.backgroundUrl),
      ]);
      if (cancelled) return;
      setLogoSrc(logo);
      setSignatureSrc(signature);
      setBackgroundSrc(background);
    })();
    return () => {
      cancelled = true;
    };
  }, [data.logoUrl, data.signatureUrl, data.backgroundUrl]);

  const handleDownload = async () => {
    setActionMsg("");
    setDownloading(true);
    try {
      await downloadCertificatePdf({
        ...data,
        logoUrl: logoSrc || data.logoUrl,
        signatureUrl: signatureSrc || data.signatureUrl,
        backgroundUrl: backgroundSrc || data.backgroundUrl,
      });
      setActionMsg("Print dialog opened — choose Save as PDF to download.");
    } catch {
      setActionMsg("Could not prepare PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleWhatsApp = async () => {
    setActionMsg("");

    // Template preview uses PP-PREVIEW / PP-DEMO-CODE — those are not in DB
    if (!certificateId || isDemoCertificateCode(data.verificationCode)) {
      setActionMsg(
        "This is only a design preview. Go to Certificates → Issue, issue to a Mitra, then Share WhatsApp for a real working link.",
      );
      return;
    }

    const text = buildCertificateShareText(data);

    // Open compose without locking to recipient number (may not be on WhatsApp)
    openWhatsAppShare({ text });
    setActionMsg(
      "WhatsApp opened with the certificate link — pick any contact to send.",
    );

    if (recipientMobile) {
      setSharing(true);
      try {
        const result = await apiFetch<{ success?: boolean; error?: string }>(
          `/api/v1/certificates/${certificateId}/share-whatsapp`,
          { method: "POST" },
        );
        if (result?.success) {
          setActionMsg(
            "Shared via WhatsApp API to recipient, and opened compose as backup.",
          );
        }
      } catch {
        /* compose already opened */
      } finally {
        setSharing(false);
      }
    }
  };

  const actions = showActions ? (
    <div className="cert-actions">
      <button
        type="button"
        className="btn-secondary cert-action-btn"
        onClick={handleDownload}
        disabled={downloading}
      >
        <Download size={16} />
        {downloading ? "Preparing…" : "Download / PDF"}
      </button>
      <button
        type="button"
        className="btn-primary cert-action-btn"
        onClick={handleWhatsApp}
        disabled={sharing}
      >
        <MessageCircle size={16} />
        {sharing ? "Sharing…" : "Share WhatsApp"}
      </button>
      {actionMsg ? <p className="cert-action-msg">{actionMsg}</p> : null}
    </div>
  ) : null;

  const card = (
    <div
      className={`cert-card${backgroundSrc || data.backgroundUrl ? " has-bg" : ""}`}
      style={
        backgroundSrc || data.backgroundUrl
          ? { backgroundImage: `url(${backgroundSrc || data.backgroundUrl})` }
          : undefined
      }
    >
      <div className="cert-frame" aria-hidden />
      <div className="cert-card-inner">
        {logoSrc || data.logoUrl ? (
          <img className="cert-logo" src={logoSrc || data.logoUrl} alt="Logo" />
        ) : (
          <div className="cert-logo-fallback">PP</div>
        )}

        <div className="cert-eyebrow">
          Paryavaran Prahri
          {data.certificateType ? ` · ${data.certificateType}` : ""}
        </div>
        <h3 className="cert-title">{title}</h3>
        <p className="cert-presented">This certificate is proudly presented to</p>
        <p className="cert-name">{name}</p>
        <div className="cert-ornament" aria-hidden />

        {data.description ? (
          <p className="cert-desc">{data.description}</p>
        ) : (
          <p className="cert-desc">
            In recognition of dedicated service as a Paryavaran Mitra under the
            green cover initiative.
          </p>
        )}

        {data.eventName ? (
          <p className="cert-event">{data.eventName}</p>
        ) : null}

        <div className="cert-meta">
          <div className="cert-meta-block">
            <div className="cert-meta-label">Issue date</div>
            <div className="cert-meta-value">{formatDate(data.issueDate)}</div>
            {data.certificateNumber ? (
              <>
                <div className="cert-meta-label" style={{ marginTop: 6 }}>
                  Certificate no.
                </div>
                <div className="cert-meta-value">{data.certificateNumber}</div>
              </>
            ) : null}
            {data.verificationCode ? (
              <>
                <div className="cert-meta-label" style={{ marginTop: 6 }}>
                  Verify code
                </div>
                <div className="cert-meta-value">{data.verificationCode}</div>
              </>
            ) : (
              <>
                <div className="cert-meta-label" style={{ marginTop: 6 }}>
                  Verify code
                </div>
                <div className="cert-meta-value">PP-XXXX-XXXX</div>
              </>
            )}
          </div>

          <div className="cert-meta-block right">
            {signatureSrc || data.signatureUrl ? (
              <img
                className="cert-signature"
                src={signatureSrc || data.signatureUrl}
                alt="Signature"
              />
            ) : (
              <div className="cert-signature-line" />
            )}
            <div className="cert-meta-label">Authorized signature</div>
          </div>
        </div>

        <div className="cert-footer">
          {data.templateName
            ? `Template: ${data.templateName}`
            : "Shown as Mitra sees it in the app"}
        </div>
      </div>
    </div>
  );

  if (variant === "wide") {
    return (
      <div className={`cert-mitra-preview-wrap cert-preview-wide ${className}`}>
        <div className="cert-mitra-preview-label">
          <div>
            <h4>Certificate preview</h4>
            <p>How this looks when issued (wide view).</p>
          </div>
        </div>
        {card}
        {actions}
      </div>
    );
  }

  return (
    <div className={`cert-mitra-preview-wrap ${className}`}>
      <div className="cert-mitra-preview-label">
        <div>
          <h4>Mitra app view</h4>
          <p>Preview · download PDF · share on WhatsApp.</p>
        </div>
      </div>
      <div className="cert-mitra-phone">
        <div className="cert-mitra-phone-notch">
          <span />
        </div>
        <div className="cert-mitra-phone-screen">
          <div className="cert-mitra-app-bar">
            <Smartphone size={14} />
            Certificates
          </div>
          {card}
        </div>
      </div>
      {actions}
    </div>
  );
}

export default CertificateMitraPreview;
