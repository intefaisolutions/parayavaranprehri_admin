import { apiFetch } from "../../utils/apiConfig";
import type { CertificatePreviewData } from "./CertificateMitraPreview";

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

/** Template/designer placeholders — not real DB verification codes. */
export function isDemoCertificateCode(code?: string) {
  const c = String(code || "")
    .trim()
    .toUpperCase();
  if (!c) return true;
  return (
    c === "PP-PREVIEW" ||
    c === "PP-DEMO-CODE" ||
    c === "PP-XXXX-XXXX" ||
    c.startsWith("PP-DEMO") ||
    c.startsWith("PP-PREVIEW")
  );
}

/** Public share URL — never expose raw S3 links in WhatsApp. */
export function getCertificatePublicUrl(verificationCode?: string) {
  const code = String(verificationCode || "").trim();
  if (!code || isDemoCertificateCode(code)) return "";
  const base = String(
    import.meta.env.VITE_PUBLIC_SITE_URL ||
      import.meta.env.VITE_APP_PUBLIC_URL ||
      (typeof window !== "undefined" ? window.location.origin : ""),
  ).replace(/\/$/, "");
  return `${base}/certificate/${encodeURIComponent(code)}`;
}

export function buildCertificateShareText(data: CertificatePreviewData) {
  const viewUrl = getCertificatePublicUrl(data.verificationCode);
  const lines = [
    `🌱 Paryavaran Prahri Certificate`,
    ``,
    data.recipientName
      ? `Congratulations ${data.recipientName}!`
      : `Congratulations!`,
    ``,
    `Your ${data.title || "Certificate of Appreciation"} is ready.`,
    data.certificateNumber
      ? `Certificate No: ${data.certificateNumber}`
      : "",
    data.eventName ? `Event: ${data.eventName}` : "",
    data.issueDate ? `Issued: ${formatDate(data.issueDate)}` : "",
    viewUrl ? `` : "",
    viewUrl ? `View Certificate:` : "",
    viewUrl || "",
    !viewUrl
      ? `\n(Note: Issue a real certificate first to get a working view link.)`
      : "",
  ].filter((line, idx, arr) => {
    // keep intentional blank lines only between content blocks
    if (line !== "") return true;
    return idx > 0 && arr[idx - 1] !== "";
  });
  return lines.join("\n").trim();
}

/**
 * Opens WhatsApp with a prefilled message.
 * By default does NOT lock to a phone number — many recipient mobiles
 * are not on WhatsApp and then Desktop shows "isn't on WhatsApp".
 * Pass `toRecipient: true` only when you intentionally want wa.me/<number>.
 */
export function openWhatsAppShare(opts: {
  mobile?: string;
  text: string;
  /** If true, open chat with this mobile. Default false = pick any contact. */
  toRecipient?: boolean;
}) {
  const encoded = encodeURIComponent(opts.text);
  let phone = "";
  if (opts.toRecipient) {
    const digits = String(opts.mobile || "").replace(/\D/g, "");
    phone =
      digits.length === 10
        ? `91${digits}`
        : digits.length >= 12
          ? digits
          : "";
  }
  const url = phone
    ? `https://wa.me/${phone}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export async function resolveSignedUrl(url?: string): Promise<string> {
  if (!url?.trim()) return "";
  if (url.startsWith("blob:") || url.startsWith("data:")) return url;
  // Prefer permanent S3 URL — signed GET often 403s in browser/print
  if (/amazonaws\.com|\.s3[.-]/i.test(url)) {
    return url.split("?")[0];
  }
  return url;
}

/**
 * Opens a professional print page (A4 landscape).
 * Resolves private S3 assets to signed URLs so logo / signature / background show in PDF.
 */
export async function downloadCertificatePdf(data: CertificatePreviewData) {
  const title = data.title || "Certificate of Appreciation";
  const name = data.recipientName || "Mitra Name";
  const desc =
    data.description ||
    "In recognition of dedicated service as a Paryavaran Mitra under the green cover initiative.";

  const [logoUrl, signatureUrl, backgroundUrl] = await Promise.all([
    resolveSignedUrl(data.logoUrl),
    resolveSignedUrl(data.signatureUrl),
    resolveSignedUrl(data.backgroundUrl),
  ]);

  const typeLabel = data.certificateType
    ? String(data.certificateType).toUpperCase()
    : "APPRECIATION";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)} — ${escapeHtml(name)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Cormorant+Garamond:ital,wght@0,500;0,700;1,500&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet" />
  <style>
    @page { size: A4 landscape; margin: 0; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      background: #0f172a;
      font-family: "Source Sans 3", system-ui, sans-serif;
      color: #14532d;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .toolbar {
      position: sticky; top: 0; z-index: 10;
      display: flex; gap: 10px; justify-content: center; align-items: center;
      flex-wrap: wrap;
      padding: 12px 16px;
      background: rgba(15, 23, 42, 0.92);
      color: #e2e8f0;
      font-size: 13px;
    }
    .toolbar button {
      border: 0; border-radius: 8px; padding: 8px 14px; cursor: pointer;
      font-weight: 700; font-size: 13px;
    }
    .toolbar .print { background: #16a34a; color: #fff; }
    .toolbar .hint { opacity: 0.85; }

    .page {
      width: 297mm;
      height: 210mm;
      margin: 16px auto;
      position: relative;
      background: #f7faf7;
      overflow: hidden;
      box-shadow: 0 20px 50px rgba(0,0,0,.35);
    }

    .bg {
      position: absolute; inset: 0;
      background:
        ${
          backgroundUrl
            ? `url("${escapeAttr(backgroundUrl)}") center/cover no-repeat`
            : `radial-gradient(circle at 15% 20%, rgba(34,197,94,.18), transparent 42%),
               radial-gradient(circle at 85% 80%, rgba(21,128,61,.14), transparent 40%),
               linear-gradient(145deg, #fbfdfb 0%, #eef8f1 48%, #e5f3ea 100%)`
        };
    }
    .bg-veil {
      position: absolute; inset: 0;
      background: ${
        backgroundUrl
          ? "linear-gradient(180deg, rgba(255,255,255,.82) 0%, rgba(248,252,249,.88) 45%, rgba(255,255,255,.86) 100%)"
          : "transparent"
      };
    }

    .frame-outer {
      position: absolute; inset: 8mm;
      border: 2.5px solid #166534;
      border-radius: 4px;
    }
    .frame-inner {
      position: absolute; inset: 11mm;
      border: 1px solid rgba(180, 140, 50, 0.75);
      border-radius: 2px;
      box-shadow: inset 0 0 0 6px rgba(255,255,255,.35);
    }
    .corner {
      position: absolute; width: 28px; height: 28px;
      border: 2px solid #b8860b;
    }
    .corner.tl { top: 12mm; left: 12mm; border-right: 0; border-bottom: 0; }
    .corner.tr { top: 12mm; right: 12mm; border-left: 0; border-bottom: 0; }
    .corner.bl { bottom: 12mm; left: 12mm; border-right: 0; border-top: 0; }
    .corner.br { bottom: 12mm; right: 12mm; border-left: 0; border-top: 0; }

    .content {
      position: absolute;
      inset: 16mm 20mm 14mm;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      z-index: 2;
    }

    .logo-wrap {
      width: 78px; height: 78px;
      border-radius: 50%;
      background: #fff;
      border: 2px solid rgba(22,101,52,.25);
      display: grid; place-items: center;
      overflow: hidden;
      box-shadow: 0 6px 18px rgba(15,23,42,.08);
      margin-bottom: 6px;
    }
    .logo-wrap img { width: 100%; height: 100%; object-fit: cover; }
    .logo-fallback {
      width: 100%; height: 100%;
      display: grid; place-items: center;
      background: linear-gradient(145deg, #166534, #15803d);
      color: #fff; font-weight: 800; font-size: 22px;
      font-family: "Source Sans 3", sans-serif;
    }

    .eyebrow {
      font-family: "Source Sans 3", sans-serif;
      font-size: 11px;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      font-weight: 700;
      color: #166534;
      margin-top: 4px;
    }
    h1 {
      font-family: "Cinzel", Georgia, serif;
      font-size: 38px;
      font-weight: 700;
      margin: 8px 0 4px;
      color: #14532d;
      letter-spacing: 0.02em;
      line-height: 1.15;
    }
    .presented {
      font-family: "Cormorant Garamond", Georgia, serif;
      font-style: italic;
      font-size: 18px;
      color: #475569;
      margin: 4px 0 2px;
    }
    .name {
      font-family: "Cinzel", Georgia, serif;
      font-size: 34px;
      font-weight: 700;
      color: #0f172a;
      margin: 4px 0 8px;
      padding: 0 12px 8px;
      border-bottom: 2px solid #b8860b;
      min-width: 42%;
      display: inline-block;
    }
    .ornament {
      width: 120px; height: 10px; margin: 2px auto 10px;
      background:
        linear-gradient(90deg, transparent, #b8860b 20%, #166534 50%, #b8860b 80%, transparent);
      opacity: 0.7;
      border-radius: 999px;
    }
    .desc {
      font-family: "Cormorant Garamond", Georgia, serif;
      font-size: 18px;
      line-height: 1.45;
      color: #334155;
      max-width: 780px;
      margin: 0 auto;
    }
    .event {
      margin-top: 10px;
      font-family: "Source Sans 3", sans-serif;
      font-size: 14px;
      font-weight: 700;
      color: #166534;
      letter-spacing: 0.04em;
    }

    .footer {
      margin-top: auto;
      width: 100%;
      display: grid;
      grid-template-columns: 1.1fr 0.8fr 1.1fr;
      gap: 16px;
      align-items: end;
      padding-top: 18px;
    }
    .meta-block { text-align: left; }
    .meta-block.right { text-align: right; }
    .meta-block.center { text-align: center; }
    .label {
      font-size: 10px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 700;
      font-family: "Source Sans 3", sans-serif;
    }
    .value {
      margin-top: 3px;
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
      font-family: "Source Sans 3", sans-serif;
    }
    .sig-img {
      max-width: 140px;
      max-height: 54px;
      object-fit: contain;
      margin: 0 0 4px auto;
      display: block;
    }
    .sig-line {
      width: 140px;
      height: 1px;
      background: #94a3b8;
      margin: 28px 0 6px auto;
    }
    .seal {
      width: 72px; height: 72px; margin: 0 auto;
      border-radius: 50%;
      border: 2px dashed #b8860b;
      display: grid; place-items: center;
      color: #166534;
      font-family: "Cinzel", serif;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.06em;
      background: rgba(255,255,255,.75);
      line-height: 1.2;
      text-transform: uppercase;
    }

    @media print {
      body { background: #fff; }
      .toolbar { display: none !important; }
      .page {
        margin: 0;
        width: 297mm;
        height: 210mm;
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <span class="hint">Professional certificate ready — click Print and choose <strong>Save as PDF</strong></span>
    <button class="print" onclick="window.print()">Print / Save PDF</button>
  </div>

  <div class="page">
    <div class="bg"></div>
    <div class="bg-veil"></div>
    <div class="frame-outer"></div>
    <div class="frame-inner"></div>
    <div class="corner tl"></div>
    <div class="corner tr"></div>
    <div class="corner bl"></div>
    <div class="corner br"></div>

    <div class="content">
      <div class="logo-wrap">
        ${
          logoUrl
            ? `<img src="${escapeAttr(logoUrl)}" alt="Logo" />`
            : `<div class="logo-fallback">PP</div>`
        }
      </div>

      <div class="eyebrow">Paryavaran Prahri · ${escapeHtml(typeLabel)}</div>
      <h1>${escapeHtml(title)}</h1>
      <p class="presented">This certificate is proudly presented to</p>
      <div class="name">${escapeHtml(name)}</div>
      <div class="ornament"></div>
      <p class="desc">${escapeHtml(desc)}</p>
      ${
        data.eventName
          ? `<p class="event">${escapeHtml(data.eventName)}</p>`
          : ""
      }

      <div class="footer">
        <div class="meta-block">
          <div class="label">Issue date</div>
          <div class="value">${escapeHtml(formatDate(data.issueDate))}</div>
          ${
            data.certificateNumber
              ? `<div class="label" style="margin-top:10px">Certificate no.</div>
                 <div class="value">${escapeHtml(data.certificateNumber)}</div>`
              : ""
          }
          <div class="label" style="margin-top:10px">Verify code</div>
          <div class="value">${escapeHtml(data.verificationCode || "PP-XXXX-XXXX")}</div>
        </div>

        <div class="meta-block center">
          <div class="seal">Official<br/>Seal</div>
          ${
            data.templateName
              ? `<div class="label" style="margin-top:8px">${escapeHtml(data.templateName)}</div>`
              : ""
          }
        </div>

        <div class="meta-block right">
          ${
            signatureUrl
              ? `<img class="sig-img" src="${escapeAttr(signatureUrl)}" alt="Signature" />`
              : `<div class="sig-line"></div>`
          }
          <div class="label">Authorized signature</div>
          <div class="value">Paryavaran Prahri</div>
        </div>
      </div>
    </div>
  </div>

  <script>
    (function () {
      var imgs = Array.prototype.slice.call(document.images || []);
      if (!imgs.length) {
        setTimeout(function () { window.print(); }, 400);
        return;
      }
      var left = imgs.length;
      var done = function () {
        left -= 1;
        if (left <= 0) setTimeout(function () { window.print(); }, 350);
      };
      imgs.forEach(function (img) {
        if (img.complete) done();
        else {
          img.addEventListener("load", done);
          img.addEventListener("error", done);
        }
      });
      setTimeout(function () { window.print(); }, 4000);
    })();
  </script>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank", "noopener,noreferrer");
  if (!win) {
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slugFile(title)}-${slugFile(name)}.html`;
    a.click();
  }
  setTimeout(() => URL.revokeObjectURL(url), 120_000);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(value: string) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

function slugFile(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "certificate"
  );
}
