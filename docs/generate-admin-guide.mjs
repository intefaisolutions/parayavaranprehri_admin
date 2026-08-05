import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  LevelFormat,
} from "docx";
import fs from "fs";

const h1 = (t) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 160 },
    children: [new TextRun({ text: t, bold: true })],
  });
const h2 = (t) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
    children: [new TextRun({ text: t, bold: true })],
  });
const h3 = (t) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text: t, bold: true })],
  });
const p = (t) =>
  new Paragraph({
    spacing: { after: 100 },
    children: [new TextRun(t)],
  });
const bullet = (t) =>
  new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: 60 },
    children: [new TextRun(t)],
  });
const numbered = (ref, t) =>
  new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { after: 80 },
    children: [new TextRun(t)],
  });
const note = (t) =>
  new Paragraph({
    spacing: { before: 80, after: 120 },
    children: [
      new TextRun({ text: "Note: ", bold: true, color: "166534" }),
      new TextRun({ text: t, italics: true }),
    ],
  });
const warn = (t) =>
  new Paragraph({
    spacing: { before: 80, after: 120 },
    children: [
      new TextRun({ text: "Important: ", bold: true, color: "B45309" }),
      new TextRun(t),
    ],
  });
const code = (t) =>
  new Paragraph({
    spacing: { after: 80 },
    children: [new TextRun({ text: t, font: "Consolas", size: 18 })],
  });

const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: "•",
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: { indent: { left: 720, hanging: 360 } },
            },
          },
        ],
      },
      ...["login", "aws", "tpl", "issue", "dl"].map((reference) => ({
        reference,
        levels: [
          {
            level: 0,
            format: LevelFormat.DECIMAL,
            text: "%1.",
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: { indent: { left: 720, hanging: 360 } },
            },
          },
        ],
      })),
    ],
  },
  sections: [
    {
      properties: {
        page: {
          margin: { top: 720, bottom: 720, left: 864, right: 864 },
        },
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: "PARYAVARAN PRAHRI",
              bold: true,
              size: 36,
              color: "166534",
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: "Admin Panel — Step-by-Step Process Guide",
              bold: true,
              size: 28,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 320 },
          border: {
            bottom: {
              style: BorderStyle.SINGLE,
              size: 12,
              color: "166534",
              space: 8,
            },
          },
          children: [
            new TextRun({
              text: "Certificates · S3 Assets · Preview · PDF · WhatsApp  |  Version 1.0  |  Aug 2026",
              size: 18,
              color: "64748B",
            }),
          ],
        }),

        h1("1. Purpose"),
        p(
          "This document explains how an Admin should set up AWS storage, create certificate templates (logo / signature / background), issue certificates, download professional PDFs, and share on WhatsApp.",
        ),

        h1("2. Prerequisites"),
        bullet("Admin access to Paryavaran Prahri Admin Panel"),
        bullet(
          "Backend running (API at http://localhost:3000/api/v1 or production URL)",
        ),
        bullet(
          "AWS account with permission to create IAM users and S3 buckets",
        ),
        bullet(
          "Dedicated S3 bucket name: paryavaranprehri (region: ap-south-1 recommended)",
        ),

        h1("3. Login to Admin"),
        numbered("login", "Open Admin Panel URL (local: http://localhost:5173)."),
        numbered("login", "Login with Super Admin / Admin email and password."),
        numbered(
          "login",
          "Default local seed (if not changed): superadmin@paryavaran.com",
        ),
        note("Change the default password in production immediately."),

        h1("4. AWS S3 Setup (Required for Logo / Signature Preview)"),
        warn(
          "If AWS keys are quarantined (AWSCompromisedKeyQuarantineV3), preview will show 403 even if the bucket is correct. Same old quarantined keys will NOT work on a new bucket.",
        ),

        h2("4.1 Create / confirm bucket"),
        numbered("aws", "AWS Console → S3 → Create bucket (or open existing)."),
        numbered("aws", "Bucket name: paryavaranprehri"),
        numbered("aws", "Region: Asia Pacific (Mumbai) ap-south-1"),
        numbered(
          "aws",
          "Block Public Access can stay ON (app uses signed URLs for private files).",
        ),

        h2("4.2 Create IAM user and keys (non-quarantined)"),
        numbered(
          "aws",
          "IAM → Users → Create user (example: paryavaran-admin-s3).",
        ),
        numbered(
          "aws",
          "Attach a policy allowing at least: s3:PutObject, s3:GetObject, s3:DeleteObject on arn:aws:s3:::paryavaranprehri/*",
        ),
        numbered(
          "aws",
          "Security credentials → Create access key → Application running outside AWS.",
        ),
        numbered(
          "aws",
          "Copy Access Key ID and Secret Access Key securely (shown only once).",
        ),

        h2("4.3 Configure backend .env"),
        p("In parayavaranprehri_backend/.env set:"),
        code("AWS_ACCESS_KEY_ID=<new_key_id>"),
        code("AWS_SECRET_ACCESS_KEY=<new_secret>"),
        code("AWS_REGION=ap-south-1"),
        code("AWS_S3_BUCKET_NAME=paryavaranprehri"),
        numbered("aws", "Restart backend (pnpm run start:dev)."),
        numbered(
          "aws",
          'Confirm log line: S3 uploads ready → bucket="paryavaranprehri" region="ap-south-1"',
        ),

        h2("4.4 Quick verify (optional)"),
        p(
          "Upload a small PNG to POST /api/v1/uploads?category=certificates with form field name file, then open data.signedUrl in a new tab. Expect HTTP 200 and image/* content-type. If 403 with AWSCompromisedKeyQuarantineV3 — keys are still blocked; create new keys.",
        ),

        h1("5. Create / Edit Certificate Template"),
        h2("5.1 Open form"),
        numbered(
          "tpl",
          "Sidebar → Certificates → Add (or open list → Edit).",
        ),
        numbered("tpl", "Routes: /certificates/add and /certificates/edit"),

        h2("5.2 Fill basic details"),
        bullet("Title (e.g. Certificate of Participation)"),
        bullet("Certificate type / event name / description"),
        bullet("Status: Active (only Active templates can be issued)"),

        h2("5.3 Branding and Assets (Logo, Signature, Background)"),
        numbered("tpl", "Go to section: Branding & Assets"),
        numbered(
          "tpl",
          "Logo → Upload Photo (PNG/JPG recommended, clear square logo)",
        ),
        numbered(
          "tpl",
          "Signature → Upload authorized signature image (transparent PNG preferred)",
        ),
        numbered("tpl", "Background → Optional certificate background image"),
        numbered(
          "tpl",
          "Wait until preview thumbnail shows the image (not Preview unavailable).",
        ),
        numbered(
          "tpl",
          "Check live Mitra preview on the right — logo/signature should appear.",
        ),
        numbered("tpl", "Save / Update template."),
        note(
          "System stores a permanent S3 URL in the database and uses a temporary signed URL only for on-screen preview. Old files uploaded with quarantined keys may need re-upload after new keys are configured.",
        ),

        h1("6. Issue a Certificate"),
        numbered("issue", "Go to Issue Certificate (/certificates/issue)."),
        numbered("issue", "Select an Active template."),
        numbered(
          "issue",
          "Select recipient Mitra / enter recipient details (name, mobile).",
        ),
        numbered(
          "issue",
          "Confirm preview looks correct (logo, title, name, signature).",
        ),
        numbered(
          "issue",
          "Submit / Issue. System generates certificate number and verify code.",
        ),

        h1("7. View Issued Certificates"),
        bullet("Open Issued Certificates list."),
        bullet("Eye icon → Mitra-style preview modal."),
        bullet("Confirm issue date, verify code, and branding assets."),

        h1("8. Download Professional PDF"),
        numbered(
          "dl",
          "In Issued Certificates (or preview) click Download / PDF.",
        ),
        numbered(
          "dl",
          "A new tab opens with A4 landscape professional certificate.",
        ),
        numbered(
          "dl",
          "Browser print dialog → Destination: Save as PDF.",
        ),
        numbered(
          "dl",
          "Paper size: A4, Landscape, Margins: None / Default as shown.",
        ),
        numbered(
          "dl",
          "Save file (e.g. Certificate-of-Participation-RecipientName.pdf).",
        ),
        note(
          "PDF design includes border, logo, background, signature, seal, issue date, and verify code. Images load via signed S3 URLs before print.",
        ),

        h1("9. Share on WhatsApp"),
        bullet("Click Share WhatsApp on issued certificate."),
        bullet(
          "Preferred: backend API sends to recipient mobile if WhatsApp API is configured.",
        ),
        bullet(
          "Fallback: WhatsApp Web / app opens with certificate text (title, recipient, verify code).",
        ),

        h1("10. Troubleshooting"),
        h3("Preview blocked / Preview unavailable"),
        bullet(
          "Cause: private S3 + GetObject denied, or expired signed URL.",
        ),
        bullet(
          "Fix: use non-quarantined IAM keys; re-upload logo/signature; click Open for fresh signed link.",
        ),

        h3('Upload API error: "Field name missing"'),
        bullet('Multipart form field must be named exactly: file'),
        bullet('Example curl: -F "file=@C:/path/logo.png"'),

        h3("Signed URL returns 403 AccessDenied"),
        bullet(
          "Check S3 XML error for AWSCompromisedKeyQuarantineV3.",
        ),
        bullet(
          "Rotate IAM keys; updating only bucket name is not enough.",
        ),

        h3("PDF has no logo/signature"),
        bullet("Re-upload assets after keys are fixed."),
        bullet(
          "Ensure template fields logoUrl / signatureUrl / backgroundUrl are saved.",
        ),

        h1("11. Related Admin Screens (Quick Map)"),
        bullet("Certificate templates list → Certificates"),
        bullet(
          "Add/Edit template → /certificates/add and /certificates/edit",
        ),
        bullet("Issue → /certificates/issue"),
        bullet("Issued list → Issued Certificates"),
        bullet("Image upload UI → SmartForm (type: image)"),
        bullet("Mitra preview component → CertificateMitraPreview"),
        bullet("Backend upload/signed → POST/GET /api/v1/uploads"),

        h1("12. Support Checklist Before Go-Live"),
        bullet(
          "New IAM keys in production .env (never commit secrets to git)",
        ),
        bullet("Bucket paryavaranprehri exists in correct region"),
        bullet("Upload test image → preview shows in Admin"),
        bullet(
          "Issue sample certificate → PDF download shows logo + signature",
        ),
        bullet("WhatsApp share tested on real recipient number"),
        bullet("Default Super Admin password changed"),

        new Paragraph({
          spacing: { before: 400 },
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "— End of Admin Process Guide —",
              italics: true,
              color: "64748B",
              size: 20,
            }),
          ],
        }),
      ],
    },
  ],
});

const buf = await Packer.toBuffer(doc);
const out = new URL(
  "./Paryavaran_Prahri_Admin_Step_by_Step_Guide.docx",
  import.meta.url,
);
fs.writeFileSync(out, buf);
console.log("Wrote", out.pathname, buf.length, "bytes");
