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

export function buildCertificateShareText(data: CertificatePreviewData) {
  const lines = [
    `Paryavaran Prahri Certificate`,
    data.title || "Certificate of Appreciation",
    data.recipientName ? `Recipient: ${data.recipientName}` : "",
    data.eventName ? `Event: ${data.eventName}` : "",
    data.certificateNumber
      ? `Certificate No: ${data.certificateNumber}`
      : "",
    data.verificationCode
      ? `Verify code: ${data.verificationCode}`
      : "",
    data.issueDate ? `Issued: ${formatDate(data.issueDate)}` : "",
  ].filter(Boolean);
  return lines.join("\n");
}

export function openWhatsAppShare(opts: {
  mobile?: string;
  text: string;
}) {
  const digits = String(opts.mobile || "").replace(/\D/g, "");
  const phone =
    digits.length === 10
      ? `91${digits}`
      : digits.length > 10
        ? digits
        : "";
  const encoded = encodeURIComponent(opts.text);
  const url = phone
    ? `https://wa.me/${phone}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

/** Opens a print-friendly page so admin can Save as PDF / Download. */
export function downloadCertificatePdf(data: CertificatePreviewData) {
  const title = data.title || "Certificate of Appreciation";
  const name = data.recipientName || "Mitra Name";
  const desc =
    data.description ||
    "In recognition of dedicated service as a Paryavaran Mitra under the green cover initiative.";
  const bg = data.backgroundUrl
    ? `background-image:url('${data.backgroundUrl}');background-size:cover;background-position:center;`
    : "background:linear-gradient(160deg,#f8faf8,#eef7f0 55%,#e7f2ea);";

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)} - ${escapeHtml(name)}</title>
  <style>
    @page { size: A4 landscape; margin: 12mm; }
    body { margin: 0; font-family: Georgia, 'Times New Roman', serif; background: #e2e8f0; }
    .sheet {
      width: 100%; min-height: 180mm; ${bg}
      border: 1px solid #bbf7d0; border-radius: 12px; padding: 28px 36px;
      box-sizing: border-box; position: relative; text-align: center;
      color: #14532d;
    }
    .sheet::before {
      content: ''; position: absolute; inset: 0;
      background: rgba(248,250,248,0.78); border-radius: 12px;
    }
    .inner { position: relative; z-index: 1; }
    .logo { width: 72px; height: 72px; object-fit: contain; margin: 0 auto 8px; display: block; }
    .eyebrow { font-family: system-ui,sans-serif; font-size: 11px; letter-spacing: .14em;
      text-transform: uppercase; font-weight: 700; color: #166534; }
    h1 { font-size: 34px; margin: 8px 0; }
    .presented { font-family: system-ui,sans-serif; font-size: 13px; color: #64748b; }
    .name { font-size: 30px; margin: 8px 0 12px; border-bottom: 1px solid #86efac;
      display: inline-block; padding-bottom: 6px; min-width: 40%; color: #0f172a; }
    .desc { font-family: system-ui,sans-serif; font-size: 14px; color: #334155; max-width: 720px; margin: 0 auto; line-height: 1.5; }
    .event { font-family: system-ui,sans-serif; font-weight: 700; color: #166534; margin-top: 10px; }
    .meta { display: flex; justify-content: space-between; margin-top: 36px; text-align: left;
      font-family: system-ui,sans-serif; font-size: 12px; }
    .meta .right { text-align: right; }
    .label { color: #94a3b8; text-transform: uppercase; letter-spacing: .08em; font-size: 10px; }
    .value { color: #0f172a; font-weight: 600; margin-bottom: 8px; }
    .sig { max-width: 120px; max-height: 48px; object-fit: contain; }
    @media print { body { background: #fff; } .no-print { display: none !important; } }
  </style>
</head>
<body>
  <p class="no-print" style="text-align:center;font-family:system-ui;padding:12px">
    Use <strong>Print → Save as PDF</strong> to download this certificate.
  </p>
  <div class="sheet">
    <div class="inner">
      ${
        data.logoUrl
          ? `<img class="logo" src="${escapeAttr(data.logoUrl)}" alt="Logo" />`
          : `<div class="logo" style="background:#166534;color:#fff;border-radius:12px;display:grid;place-items:center;font-weight:800;font-family:system-ui">PP</div>`
      }
      <div class="eyebrow">Paryavaran Prahri${
        data.certificateType ? ` · ${escapeHtml(data.certificateType)}` : ""
      }</div>
      <h1>${escapeHtml(title)}</h1>
      <p class="presented">This certificate is proudly presented to</p>
      <div class="name">${escapeHtml(name)}</div>
      <p class="desc">${escapeHtml(desc)}</p>
      ${
        data.eventName
          ? `<p class="event">${escapeHtml(data.eventName)}</p>`
          : ""
      }
      <div class="meta">
        <div>
          <div class="label">Issue date</div>
          <div class="value">${escapeHtml(formatDate(data.issueDate))}</div>
          ${
            data.certificateNumber
              ? `<div class="label">Certificate no.</div><div class="value">${escapeHtml(data.certificateNumber)}</div>`
              : ""
          }
          <div class="label">Verify code</div>
          <div class="value">${escapeHtml(data.verificationCode || "PP-XXXX-XXXX")}</div>
        </div>
        <div class="right">
          ${
            data.signatureUrl
              ? `<img class="sig" src="${escapeAttr(data.signatureUrl)}" alt="Signature" />`
              : `<div style="width:120px;height:1px;background:#94a3b8;margin:24px 0 6px auto"></div>`
          }
          <div class="label">Authorized signature</div>
        </div>
      </div>
    </div>
  </div>
  <script>window.onload = function () { setTimeout(function () { window.print(); }, 250); };</script>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank", "noopener,noreferrer");
  if (!win) {
    // Popup blocked — force download HTML instead
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slugFile(title)}-${slugFile(name)}.html`;
    a.click();
  }
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
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
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "certificate";
}
