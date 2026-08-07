/**
 * Client Implementation Guide — Paryavaran Prahri Admin
 * Run: node docs/generate-client-implementation-guide.mjs
 */
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  LevelFormat,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
} from "docx";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
const tip = (t) =>
  new Paragraph({
    spacing: { before: 80, after: 120 },
    children: [
      new TextRun({ text: "Tip: ", bold: true, color: "1D4ED8" }),
      new TextRun(t),
    ],
  });
const boldLine = (label, value) =>
  new Paragraph({
    spacing: { after: 60 },
    children: [
      new TextRun({ text: `${label}: `, bold: true }),
      new TextRun(value),
    ],
  });

function cell(text, opts = {}) {
  const { bold = false, fill = null, width = 2340 } = opts;
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: fill ? { type: ShadingType.CLEAR, fill } : undefined,
    children: [
      new Paragraph({
        spacing: { before: 60, after: 60 },
        children: [
          new TextRun({
            text,
            bold,
            size: 18,
            color: fill ? "FFFFFF" : "0F172A",
          }),
        ],
      }),
    ],
  });
}

function simpleTable(headers, rows) {
  const colW = Math.floor(9360 / headers.length);
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: headers.map(() => colW),
    rows: [
      new TableRow({
        children: headers.map((h) =>
          cell(h, { bold: true, fill: "166534", width: colW }),
        ),
      }),
      ...rows.map(
        (r) =>
          new TableRow({
            children: r.map((c) => cell(String(c), { width: colW })),
          }),
      ),
    ],
  });
}

const stepRefs = [
  "login",
  "vs",
  "land",
  "tm",
  "person",
  "vehicle",
  "mitra",
  "plant",
  "tree",
  "task",
  "event",
  "maint",
  "journey",
  "cert",
  "news",
  "media",
  "leaders",
  "settings",
  "checklist",
];

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
      ...stepRefs.map((reference) => ({
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
              size: 40,
              color: "166534",
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: "Admin Panel — Client Implementation Guide",
              bold: true,
              size: 28,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: "One-by-One Setup Order · Module Dependency · Field Operations · Content",
              size: 20,
              color: "475569",
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 360 },
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
              text: "For Client / Implementation Team  |  Version 1.0  |  August 2026",
              size: 18,
              color: "64748B",
            }),
          ],
        }),

        // ── 1 ──
        h1("1. Purpose of This Document"),
        p(
          "This guide explains how the Paryavaran Prahri Admin Panel works end-to-end, and the exact order in which data must be created. Follow the steps from top to bottom. Do not skip Location Masters and jump to Plantation — later modules depend on earlier ones.",
        ),
        p(
          "Share this document with the client implementation team so they can set up masters, register people, create plantation records, run field operations, and publish engagement content correctly.",
        ),

        // ── 2 ──
        h1("2. How the System Fits Together (Overall)"),
        p(
          "Paryavaran Prahri tracks plantation and tree care by geography and people. At a high level:",
        ),
        bullet(
          "Geography starts with Country → State → District → Vidhan Sabha (constituency).",
        ),
        bullet(
          "Land parcels sit under a Vidhan Sabha / district and hold plantation capacity.",
        ),
        bullet(
          "Tree Master Catalog defines which tree species can be requested.",
        ),
        bullet(
          "Persons (citizens) and Vehicles (with insurance) are registered before planting.",
        ),
        bullet(
          "Paryavaran Mitras (volunteers) are approved for field care in a Vidhan Sabha.",
        ),
        bullet(
          "Plantation Requests link Tree Catalog + Land + Person + Vehicle.",
        ),
        bullet(
          "Tree Management stores individual trees (e.g. TR-0001) for map, tasks, and maintenance.",
        ),
        bullet(
          "Field Operations (Tasks, Events, Issues, Maintenance Logs) use Mitras and Trees.",
        ),
        bullet(
          "Engagement content (Journey, Certificates, News, Media) is shown in the citizen / Mitra apps.",
        ),

        h2("2.1 Recommended creation order (must follow)"),
        p(
          "Create modules in this sequence. Each row depends on the rows above it.",
        ),
        simpleTable(
          ["Step", "Module (Admin menu)", "Depends on"],
          [
            ["1", "Vidhan Sabha", "Geo master (Country / State / District)"],
            ["2", "Land Management", "Vidhan Sabha + State / District"],
            ["3", "Tree Master Catalog", "Nothing (can be parallel with Step 2)"],
            ["4", "Person Management", "Nothing (recommended before planting)"],
            ["5", "Vehicle Management", "Person (owner link)"],
            ["6", "Paryavaran Mitra", "Vidhan Sabha (Land / Tree optional)"],
            ["7", "Plantation Requests", "Tree Master + Land + Person + Vehicle"],
            ["8", "Tree Management", "Person + Land (+ Mitra optional)"],
            ["9", "Task / Events / Maintenance", "Mitra + Land / Tree"],
            ["10", "Certificates / News / Media / Journey", "Independent content setup"],
          ],
        ),
        new Paragraph({ spacing: { after: 160 }, children: [] }),
        warn(
          "If Vidhan Sabha or Land is missing, Plantation Request, Mitra assignment, and Task cascade will fail or show empty dropdowns.",
        ),

        // ── 3 ──
        h1("3. Login"),
        numbered("login", "Open Admin Panel URL (example local: http://localhost:5173)."),
        numbered("login", "Sign in with Super Admin / Admin credentials."),
        numbered(
          "login",
          "Use the left sidebar. Sections are numbered 1–8 in the same order as this guide.",
        ),
        tip(
          "Use Global Search (Ctrl+K) to jump to pages or find Persons, Mitras, Lands, Vidhan Sabha, and Certificates.",
        ),

        // ── 4 ──
        h1("4. Step 1 — Location Masters: Vidhan Sabha"),
        boldLine("Menu", "1. Location Masters → Vidhan Sabha"),
        boldLine("Route", "/vidhansabha → Add"),
        p(
          "Vidhan Sabha is the constituency master. Lands, Mitras, tasks, and many reports hang off this record. Create every active constituency before land or Mitra setup.",
        ),

        h2("4.1 Why this comes first"),
        bullet("Land form asks for State / District / Vidhan Sabha."),
        bullet("Mitra form requires Vidhan Sabha."),
        bullet("Task Assignment filters by State → District → Vidhan Sabha → Land → Tree."),
        bullet("Dashboard and map views group activity by constituency."),

        h2("4.2 How to create a Vidhan Sabha"),
        numbered("vs", "Go to Vidhan Sabha → Add."),
        numbered(
          "vs",
          "Select Country (usually India) → State → District (cascading dropdowns).",
        ),
        numbered(
          "vs",
          "Select Vidhan Sabha from the geo master list for that district.",
        ),
        numbered("vs", "Optionally assign an Admin user for that constituency."),
        numbered("vs", "Set Status = Active."),
        numbered(
          "vs",
          "Optional stats (Total Persons, Vehicles, Land acres, Trees, Mitras) can be filled later; many are updated by operations.",
        ),
        numbered("vs", "Save. Confirm the row appears in the Vidhan Sabha list."),
        tip(
          "Create all constituencies you will operate in (e.g. Indore-1, Indore-2, Rau) before adding lands.",
        ),

        h2("4.3 Sample data (example)"),
        bullet("Country: India"),
        bullet("State: Madhya Pradesh"),
        bullet("District: Indore"),
        bullet("Vidhan Sabha: Indore-1 (or as listed in geo master)"),
        bullet("Status: Active"),

        // ── 5 ──
        h1("5. Step 2 — Land Management"),
        boldLine("Menu", "2. Land & Tree Masters → Land Management"),
        boldLine("Route", "/lands → Add"),
        p(
          "A Land is a plantation parcel (government plot, school ground, private farm, etc.). Trees and plantation requests are attached to a land.",
        ),

        h2("5.1 Prerequisites"),
        bullet("Vidhan Sabha for that State / District must already exist (Active)."),

        h2("5.2 How to create a Land"),
        numbered("land", "Go to Land Management → Add."),
        numbered(
          "land",
          "Fill ownership: Land Ownership, Department / Org, Owner contact, Mobile.",
        ),
        numbered(
          "land",
          "Set Land Status (e.g. Available for Plantation).",
        ),
        numbered(
          "land",
          "Enter Land Name, Survey / Khasra No., Area + Unit, Maximum Tree Capacity.",
        ),
        numbered(
          "land",
          "Select Country → State → District → Vidhan Sabha (and Tehsil / Village if shown).",
        ),
        numbered(
          "land",
          "Add Latitude / Longitude if available (helps Plantation Map).",
        ),
        numbered("land", "Save and verify in the Land list."),
        note(
          "Maximum Tree Capacity is used to understand remaining plantation space on that parcel.",
        ),

        h2("5.3 Sample data"),
        bullet("Land Name: Rau Community Ground"),
        bullet("Ownership: Panchayat / Government"),
        bullet("Area: 2 Acre"),
        bullet("Max Tree Capacity: 500"),
        bullet("State / District / VS: Madhya Pradesh / Indore / (your VS)"),
        bullet("Status: Available for Plantation"),

        // ── 6 ──
        h1("6. Step 3 — Tree Master Catalog"),
        boldLine("Menu", "2. Land & Tree Masters → Tree Master Catalog"),
        boldLine("Route", "/tree-masters → Add"),
        p(
          "Tree Master is the species catalog (Neem, Peepal, etc.). Plantation Requests pick a tree from this catalog — they do not invent species freely.",
        ),

        h2("6.1 How to create"),
        numbered("tm", "Go to Tree Master Catalog → Add."),
        numbered(
          "tm",
          "Enter common name, scientific name, and any recommended care / oxygen info shown on the form.",
        ),
        numbered("tm", "Upload an image if available."),
        numbered("tm", "Set status Active and Save."),
        tip(
          "Add all commonly planted species first (Neem, Peepal, Banyan, Mango, etc.) so Plantation Request dropdown is ready.",
        ),

        // ── 7 ──
        h1("7. Step 4 — Person Management"),
        boldLine("Menu", "3. People & Vehicles → Person Management"),
        boldLine("Route", "/persons → Add"),
        p(
          "A Person is a registered citizen / planter. Plantation Requests and Tree ownership require a person record.",
        ),

        h2("7.1 How to create"),
        numbered("person", "Go to Person Management → Add."),
        numbered(
          "person",
          "Enter Full Name, Mobile (required), Email, DOB, Gender.",
        ),
        numbered("person", "Add Address, City, State, Pincode."),
        numbered(
          "person",
          "Optional: ID Proof Type + Number, Photo upload.",
        ),
        numbered("person", "Save. Note the generated Person ID."),
        note(
          "Person Identity module can store additional KYC / identity documents linked to the person.",
        ),

        h2("7.2 Sample data"),
        bullet("Name: Rahul Sharma"),
        bullet("Mobile: 9876543210"),
        bullet("Email: rahul.sharma@example.com"),
        bullet("City / State: Indore / Madhya Pradesh"),

        // ── 8 ──
        h1("8. Step 5 — Vehicle Management"),
        boldLine("Menu", "3. People & Vehicles → Vehicle Management"),
        boldLine("Route", "/vehicles → Add"),
        p(
          "Vehicles are linked to persons. Plantation policy rules require an Active insurance policy on a selected vehicle before a plantation request can proceed.",
        ),

        h2("8.1 How to create"),
        numbered("vehicle", "Register the Person first."),
        numbered(
          "vehicle",
          "Go to Vehicle Management → Add (or add vehicles while editing a Person, if that flow is used).",
        ),
        numbered(
          "vehicle",
          "Enter Plate Number, Vehicle Name / ID, Fuel Type, Insurance details.",
        ),
        numbered(
          "vehicle",
          "Ensure policy status will show as Active when selected in Plantation Request.",
        ),
        warn(
          "In Plantation Request, if the selected vehicle policy is Expired or Not Insured, submit is blocked. Only Active policy vehicles are allowed.",
        ),

        // ── 9 ──
        h1("9. Step 6 — Paryavaran Mitra"),
        boldLine("Menu", "3. People & Vehicles → Paryavaran Mitra"),
        boldLine("Route", "/mitras → Add"),
        p(
          "Mitras are field volunteers. They receive tasks, attend Mitra Events, log maintenance, and can receive certificates.",
        ),

        h2("9.1 Prerequisites"),
        bullet("Vidhan Sabha must exist."),
        bullet("Land / Tree optional at registration; can be assigned later."),

        h2("9.2 How to create"),
        numbered("mitra", "Go to Paryavaran Mitra → Add."),
        numbered("mitra", "Enter Full Name, Mobile (required), Email, Profession."),
        numbered(
          "mitra",
          "Select State → District → Vidhan Sabha (required).",
        ),
        numbered(
          "mitra",
          "Optionally select Land and Tree assignment (none / all on land / specific tree).",
        ),
        numbered(
          "mitra",
          "Set Membership (Free / Premium) and Status = Approved for field work.",
        ),
        numbered("mitra", "Save."),
        tip(
          "Task Assigned Mitra dropdown lists Approved Mitras only. Keep Status = Approved for active volunteers.",
        ),

        // ── 10 ──
        h1("10. Step 7 — Plantation Requests"),
        boldLine("Menu", "4. Plantation → Plantation Requests"),
        boldLine("Route", "/plantations → Add"),
        p(
          "A Plantation Request is the operational request to plant N trees of a catalog species on a land for a registered person, with a vehicle / policy check.",
        ),

        h2("10.1 Prerequisites (all must exist)"),
        bullet("Tree Master Catalog entry"),
        bullet("Land parcel"),
        bullet("Registered Person"),
        bullet("Vehicle with Active insurance (for that person)"),

        h2("10.2 How to create"),
        numbered("plant", "Go to Plantation Requests → Add."),
        numbered(
          "plant",
          "Select Tree from catalog, Tree Count, Plantation Date.",
        ),
        numbered(
          "plant",
          "Select State → District → Land Parcel.",
        ),
        numbered(
          "plant",
          "Search / select Registered Person (name, mobile, person ID auto-fill).",
        ),
        numbered(
          "plant",
          "Select vehicle(s) shown for that person. Confirm Policy Status = Active.",
        ),
        numbered("plant", "Upload plantation images if available; add remarks."),
        numbered("plant", "Submit. Review / Approve from the Plantations list as needed."),
        note(
          "Status flow typically includes Pending → Approved / Rejected → Planted. Use review actions on the list screen.",
        ),

        // ── 11 ──
        h1("11. Step 8 — Tree Management"),
        boldLine("Menu", "4. Plantation → Tree Management"),
        boldLine("Route", "/trees → Add"),
        p(
          "Each planted tree gets a unique Tree ID (example: TR-0001). This ID is used in Maintenance Logs, map pins, Mitra assignment, and analytics.",
        ),

        h2("11.1 How to create"),
        numbered("tree", "Go to Tree Management → Add."),
        numbered(
          "tree",
          "Enter Tree Name, Species, Scientific Name, Plantation Date, Status.",
        ),
        numbered(
          "tree",
          "Select Owner (Person) — required. Vehicle / policy fields can link from owner.",
        ),
        numbered(
          "tree",
          "Select State → District → Land (and Vidhan Sabha context as shown).",
        ),
        numbered(
          "tree",
          "Optionally assign a Mitra for ongoing care.",
        ),
        numbered("tree", "Upload tree image; Save."),
        tip(
          "After save, note the Tree ID (TR-xxxx). Maintenance Log Tree Code dropdown shows: TR-0001 - Neem.",
        ),

        h2("11.2 Plantation Map"),
        p(
          "Menu: Land & Tree Masters → Plantation Map. Shows tree / land pins. Useful after trees have coordinates or land geo data.",
        ),

        h2("11.3 Rashi Tree Recommendations"),
        p(
          "Optional content module for astrological / rashi-based tree suggestions shown in the app. Can be filled anytime after Tree Masters exist.",
        ),

        // ── 12 ──
        h1("12. Step 9 — Field Operations"),
        p(
          "Use these after Mitras and Trees exist. Order within this section is flexible.",
        ),

        h2("12.1 Task Management"),
        boldLine("Menu", "5. Field Operations → Task Management"),
        numbered(
          "task",
          "Add Task → choose State → District → Vidhan Sabha → Land → Tree (cascade).",
        ),
        numbered(
          "task",
          "Select Assigned Mitra from Approved Mitras dropdown.",
        ),
        numbered(
          "task",
          "Set title, description, dates, priority / status as on form → Save.",
        ),
        note(
          "Zone / Sector are not used. Geography is State → District → Vidhan Sabha → Land → Tree.",
        ),

        h2("12.2 Mitra Events"),
        boldLine("Menu", "5. Field Operations → Mitra Events"),
        numbered(
          "event",
          "Add event with Title, Date, Time, Location, Organizer, Description.",
        ),
        numbered(
          "event",
          "Events appear for Mitras in the app for awareness / attendance.",
        ),
        p("Sample: Van Mahotsav Drive | 2026-08-15 | 07:00 | Rau Ground, Indore | Organizer: District Green Cell."),

        h2("12.3 Field Issues"),
        p(
          "Mitras / field users report issues (water shortage, damaged guard, disease, etc.). Admin reviews and updates status from Field Issues.",
        ),

        h2("12.4 Maintenance Logs"),
        boldLine("Menu", "5. Field Operations → Maintenance Logs"),
        numbered(
          "maint",
          "Add Maintenance Log → select Tree Code from dropdown (only existing trees).",
        ),
        numbered(
          "maint",
          "Select Activity: Watering, Fertilizer, Pruning, Weeding, Pest Control, Mulching, Inspection, Other.",
        ),
        numbered(
          "maint",
          "Add Remarks; Logged At defaults to today (optional change) → Save Log.",
        ),
        warn(
          "Tree Code is not free text. Trees must already exist in Tree Management.",
        ),

        // ── 13 ──
        h1("13. Step 10 — Engagement & Content"),
        p(
          "These modules feed the citizen app and Mitra experience. They can be prepared in parallel once branding assets (S3) are ready.",
        ),

        h2("13.1 Journey & Achievements"),
        numbered(
          "journey",
          "Set Journey Profile (name, subtitle, photo, stats, tags, inspiration).",
        ),
        numbered(
          "journey",
          "Add Achievements: Year, Type, Title, Subtitle / Organization, Image.",
        ),
        numbered(
          "journey",
          "Types include: Recognition, Award, Record, Doctorate, International, Milestone, Certification.",
        ),

        h2("13.2 Certificates"),
        numbered(
          "cert",
          "Create Certificate Template (title, type, logo, signature, background) — Status Active.",
        ),
        numbered(
          "cert",
          "Issue Certificate to a Mitra / recipient → appears under Issued Certificates.",
        ),
        numbered(
          "cert",
          "Download professional A4 landscape PDF; share via WhatsApp as needed.",
        ),
        note(
          "Logo / signature preview needs valid AWS S3 credentials (non-quarantined keys). See separate Certificates / S3 guide if assets fail to preview.",
        ),

        h2("13.3 News Management"),
        numbered(
          "news",
          "Add news with title, summary, body, image, publish date / status.",
        ),
        p("Published news appears in the citizen app news section."),

        h2("13.4 Media Management"),
        numbered("media", "Upload Media → choose File."),
        numbered("media", "Enter Media Name, Media Type (Image / Video / PDF / Document)."),
        numbered(
          "media",
          "Select Used In Module: Home Banner, News, Events, Plantation, Maintenance, Gallery, Campaigns, Achievements, Citizen App, About Us, Certificates, Volunteers.",
        ),
        numbered("media", "Set Status Active → Add Media."),
        tip(
          "Tag media with the correct Used In Module so the app / CMS can fetch the right banner or gallery set.",
        ),

        h2("13.5 Initiative Leaders & Channel Partners"),
        numbered(
          "leaders",
          "Add Initiative Leaders (name, role, photo, bio) for About / leadership screens.",
        ),
        numbered(
          "leaders",
          "Add Channel Partners (organization, logo, contact) for partner listings.",
        ),

        h2("13.6 Notifications"),
        p(
          "Compose push / in-app notifications for citizens or Mitras (title, body, audience, schedule) as per form fields.",
        ),

        // ── 14 ──
        h1("14. Support, Reports & System"),
        h2("14.1 Call Center"),
        p("Log and track support calls / tickets related to plantation or app users."),
        h2("14.2 Languages"),
        p("Manage language packs / labels for multi-language UI if enabled."),
        h2("14.3 Reports"),
        p("Export operational reports (plantations, trees, Mitras, etc.) as configured."),
        h2("14.4 System Settings"),
        numbered(
          "settings",
          "Configure mission targets, feature flags, and global keys (e.g. Mission 2047 progress).",
        ),
        h2("14.5 Role & Permissions"),
        p("Create roles and assign menu / API permissions for Admin staff."),
        h2("14.6 Audit Logs"),
        p("Review who created / changed critical records for compliance."),

        // ── 15 ──
        h1("15. End-to-End Happy Path (Quick Checklist)"),
        p("Use this checklist for a first complete dry run with the client:"),
        numbered("checklist", "Login as Super Admin."),
        numbered(
          "checklist",
          "Create 1 Vidhan Sabha (State + District + VS = Active).",
        ),
        numbered("checklist", "Create 1 Land under that VS (Available)."),
        numbered("checklist", "Create 2–3 Tree Masters (Neem, Peepal, Banyan)."),
        numbered("checklist", "Create 1 Person with mobile + email."),
        numbered("checklist", "Add 1 Vehicle for that Person with Active policy."),
        numbered(
          "checklist",
          "Create 1 Mitra (Approved) linked to the same Vidhan Sabha.",
        ),
        numbered(
          "checklist",
          "Create Plantation Request (Tree Master + Land + Person + Active vehicle) → Approve / Planted.",
        ),
        numbered(
          "checklist",
          "Create Tree in Tree Management (TR-0001) on that Land / Person; assign Mitra.",
        ),
        numbered(
          "checklist",
          "Assign a Task to the Mitra for that Land / Tree.",
        ),
        numbered(
          "checklist",
          "Add Maintenance Log selecting TR-0001 + Watering.",
        ),
        numbered(
          "checklist",
          "Add one Journey Achievement, one News item, one Media (Home Banner).",
        ),
        numbered(
          "checklist",
          "Create Certificate template with logo/signature → Issue to Mitra → Download PDF.",
        ),
        tip(
          "If any dropdown is empty, go back one step in the dependency table — the parent master is usually missing or Inactive.",
        ),

        // ── 16 ──
        h1("16. Common Mistakes to Avoid"),
        bullet("Creating Plantation Request before Tree Master / Land / Person."),
        bullet("Selecting a vehicle with Expired insurance."),
        bullet("Mitra Status left as Pending — then Task Assigned Mitra list is empty."),
        bullet("Typing Tree Code manually in Maintenance Log — use dropdown only."),
        bullet("Skipping Vidhan Sabha — Land / Mitra / Task geography will break."),
        bullet("Uploading certificate logo without valid S3 keys — preview shows unavailable / 403."),

        // ── 17 ──
        h1("17. Roles of Admin vs App"),
        simpleTable(
          ["Area", "Admin Panel", "Citizen / Mitra App"],
          [
            ["Masters (VS, Land, Tree Catalog)", "Create & maintain", "Read / select only"],
            ["Persons / Vehicles", "Register & verify", "Self-register / view own"],
            ["Plantation & Trees", "Create, approve, assign", "Request / view own trees"],
            ["Tasks / Events / Logs", "Assign & review", "Receive & submit field data"],
            ["News / Media / Journey", "Publish content", "Consume content"],
            ["Certificates", "Template + issue + PDF", "View / share received"],
          ],
        ),
        new Paragraph({ spacing: { after: 200 }, children: [] }),

        // ── 18 ──
        h1("18. Document Control"),
        boldLine("Product", "Paryavaran Prahri"),
        boldLine("Audience", "Client implementation / operations team"),
        boldLine("Scope", "Admin Panel setup order and module dependencies"),
        boldLine("Version", "1.0 — August 2026"),
        p(
          "For certificate PDF / AWS S3 asset setup details, refer to the companion document: Paryavaran_Prahri_Admin_Step_by_Step_Guide.docx (Certificates · S3 · Preview · PDF · WhatsApp).",
        ),
        new Paragraph({
          spacing: { before: 280 },
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "— End of Client Implementation Guide —",
              italics: true,
              color: "64748B",
              size: 18,
            }),
          ],
        }),
      ],
    },
  ],
});

const outPath = path.join(
  __dirname,
  "Paryavaran_Prahri_Client_Implementation_Guide.docx",
);

const buffer = await Packer.toBuffer(doc);
fs.writeFileSync(outPath, buffer);
console.log("Wrote:", outPath);
