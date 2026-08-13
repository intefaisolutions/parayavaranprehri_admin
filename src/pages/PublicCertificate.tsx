import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertCircle, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { API_CONFIG, getApiUrl } from "../utils/apiConfig";
import {
  CertificateMitraPreview,
  type CertificatePreviewData,
} from "../components/certificates/CertificateMitraPreview";
import { isDemoCertificateCode } from "../components/certificates/certificateShare";
import "./PublicCertificate.css";

type PublicCertPayload = {
  valid?: boolean;
  status?: string;
  recipientName?: string;
  title?: string;
  description?: string;
  eventName?: string;
  issueDate?: string;
  certificateNumber?: string;
  verificationCode?: string;
  pdfUrl?: string | null;
  template?: {
    templateName?: string;
    certificateType?: string;
    logoUrl?: string;
    signatureUrl?: string;
    backgroundUrl?: string;
  } | null;
};

async function fetchPublicCertificate(code: string): Promise<PublicCertPayload> {
  const res = await fetch(
    getApiUrl(`/api/v1/certificates/verify/${encodeURIComponent(code)}`),
    { headers: { Accept: "application/json" } },
  );
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      body?.message || body?.error || `Certificate not found (${res.status})`;
    throw new Error(Array.isArray(message) ? message.join(", ") : message);
  }
  return (body?.data ?? body) as PublicCertPayload;
}

export const PublicCertificatePage = () => {
  const { code = "" } = useParams<{ code: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payload, setPayload] = useState<PublicCertPayload | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!code.trim()) {
        setError("Missing certificate code");
        setLoading(false);
        return;
      }
      if (isDemoCertificateCode(code)) {
        setError(
          "PP-PREVIEW / PP-DEMO-CODE are design placeholders, not real certificates. Issue a certificate to a Mitra first, then use Share WhatsApp — that link will work.",
        );
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const data = await fetchPublicCertificate(code.trim());
        if (!cancelled) setPayload(data);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Certificate not found");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code]);

  const preview: CertificatePreviewData | null = payload
    ? {
        title: payload.title,
        recipientName: payload.recipientName,
        description: payload.description,
        eventName: payload.eventName,
        issueDate: payload.issueDate,
        verificationCode: payload.verificationCode,
        certificateNumber: payload.certificateNumber,
        logoUrl: payload.template?.logoUrl,
        signatureUrl: payload.template?.signatureUrl,
        backgroundUrl: payload.template?.backgroundUrl,
        templateName: payload.template?.templateName,
        certificateType: payload.template?.certificateType,
      }
    : null;

  const revoked = payload?.status === "REVOKED";

  return (
    <div className="public-cert-page">
      <header className="public-cert-header">
        <div className="public-cert-brand">
          <ShieldCheck size={22} />
          <div>
            <strong>{API_CONFIG.appName || "Paryavaran Prahri"}</strong>
            <span>Certificate verification</span>
          </div>
        </div>
        <Link to="/login" className="public-cert-login">
          Admin login
        </Link>
      </header>

      <main className="public-cert-main">
        {loading ? (
          <div className="public-cert-state">
            <Loader2 size={28} className="spin" />
            <p>Verifying certificate…</p>
          </div>
        ) : error ? (
          <div className="public-cert-state is-error">
            <AlertCircle size={28} />
            <h1>
              {isDemoCertificateCode(code)
                ? "Preview link only"
                : "Certificate not found"}
            </h1>
            <p>{error}</p>
            <p className="public-cert-hint">
              {isDemoCertificateCode(code)
                ? "Admin path: Certificates → Issued / Issue → Share WhatsApp."
                : "Check the verification code in your WhatsApp message and try again."}
            </p>
          </div>
        ) : preview ? (
          <>
            <div
              className={`public-cert-banner ${
                revoked || payload?.valid === false ? "is-warn" : "is-ok"
              }`}
            >
              {revoked || payload?.valid === false ? (
                <AlertCircle size={18} />
              ) : (
                <CheckCircle2 size={18} />
              )}
              <span>
                {revoked
                  ? "This certificate has been revoked."
                  : "Verified — this certificate was issued by Paryavaran Prahri."}
              </span>
            </div>

            <CertificateMitraPreview
              data={preview}
              variant="phone"
              showActions
              recipientMobile={undefined}
            />

            <div className="public-cert-meta">
              <div>
                <span>Certificate No</span>
                <strong>{payload?.certificateNumber || "—"}</strong>
              </div>
              <div>
                <span>Verify code</span>
                <strong>{payload?.verificationCode || code}</strong>
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
};

export default PublicCertificatePage;
