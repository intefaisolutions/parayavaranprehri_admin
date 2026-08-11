import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Car,
  TreePine,
  FileBadge,
  UserCheck,
  ClipboardList,
  Building,
  Map,
  Newspaper,
  Image as ImageIcon,
  Users2,
  Award,
  Handshake,
  Bell,
  PhoneCall,
  Languages,
  Download,
  Settings,
  ShieldCheck,
  History,
  Leaf,
  Sparkles,
  Sprout,
  Route,
  CalendarDays,
  AlertTriangle,
  Wrench,
  X,
  MapPinned,
} from "lucide-react";

/**
 * Sidebar ordered by setup workflow:
 * 1) Create masters first → 2) Register people → 3) Plant trees → 4) Field ops → 5) Content → 6) System
 */
const menuSections = [
  {
    title: "Overview",
    items: [
      { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    ],
  },
  {
    title: "1. Location Masters",
    hint: "Create these first",
    items: [
      { id: "vidhansabha", icon: Building, label: "Vidhan Sabha" },
    ],
  },
  {
    title: "2. Land & Tree Masters",
    hint: "Then create land & tree catalog",
    items: [
      { id: "lands", icon: MapPinned, label: "Land Management" },
      { id: "tree-masters", icon: Leaf, label: "Tree Master Catalog" },
      { id: "map", icon: Map, label: "Plantation Map" },
    ],
  },
  {
    title: "3. People & Vehicles",
    hint: "Register persons before planting",
    items: [
      { id: "persons", icon: Users, label: "Person Management" },
      { id: "identity", icon: FileBadge, label: "Person Identity" },
      { id: "vehicles", icon: Car, label: "Vehicle Management" },
      { id: "mitras", icon: UserCheck, label: "Paryavaran Mitra" },
    ],
  },
  {
    title: "4. Plantation",
    hint: "Catalog → request → approve",
    items: [
      { id: "plantations", icon: Sprout, label: "Plantation Requests" },
      { id: "trees", icon: TreePine, label: "Tree Management" },
      { id: "rashi-trees", icon: Sparkles, label: "Rashi Tree Recommendations" },
      {
        id: "rashi-plant-requests",
        icon: Leaf,
        label: "Sacred Tree Plant Requests",
      },
    ],
  },
  {
    title: "5. Field Operations",
    items: [
      { id: "tasks", icon: ClipboardList, label: "Task Management" },
      { id: "mitra-events", icon: CalendarDays, label: "Mitra Events" },
      { id: "field-issues", icon: AlertTriangle, label: "Field Issues" },
      { id: "maintenance-logs", icon: Wrench, label: "Maintenance Logs" },
    ],
  },
  {
    title: "6. Engagement & Content",
    items: [
      { id: "journey", icon: Route, label: "Journey & Achievements" },
      { id: "certificates", icon: Award, label: "Certificates" },
      { id: "certificates/issued", icon: FileBadge, label: "Issued Certificates" },
      { id: "news", icon: Newspaper, label: "News Management" },
      { id: "media", icon: ImageIcon, label: "Media Management" },
      { id: "leaders", icon: Users2, label: "Initiative Leaders" },
      { id: "partners", icon: Handshake, label: "Channel Partners" },
      { id: "notifications", icon: Bell, label: "Notifications" },
    ],
  },
  {
    title: "7. Support & Reports",
    items: [
      { id: "callcenter", icon: PhoneCall, label: "Call Center" },
      { id: "languages", icon: Languages, label: "Languages" },
      { id: "reports", icon: Download, label: "Reports" },
    ],
  },
  {
    title: "8. System",
    items: [
      { id: "settings", icon: Settings, label: "System Settings" },
      { id: "roles", icon: ShieldCheck, label: "Role & Permissions" },
      { id: "audit", icon: History, label: "Audit Logs" },
    ],
  },
];

const Sidebar = ({
  mobileOpen = false,
  collapsed = false,
  onNavigate,
  onCloseMobile,
}) => {
  const location = useLocation();

  const isActive = (itemId) => {
    if (itemId === "dashboard") {
      return (
        location.pathname === "/" ||
        location.pathname.startsWith("/dashboard")
      );
    }
    // Prefer exact segment match so "certificates" doesn't activate "certificates/issued" wrongly
    // and "lands" doesn't match unrelated paths.
    return (
      location.pathname === `/${itemId}` ||
      location.pathname.startsWith(`/${itemId}/`)
    );
  };

  return (
    <aside
      className={`sidebar${collapsed ? " is-collapsed" : ""}${mobileOpen ? " is-mobile-open" : ""}`}
      aria-label="Main navigation"
    >
      <div className="brand">
        <div className="brand-icon" aria-hidden="true">
          <Leaf size={24} />
        </div>
        <span className="brand-text">Paryavaran Prahri</span>
        <button
          type="button"
          className="sidebar-mobile-close"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="nav-menu">
        {menuSections.map((section) => (
          <div className="nav-section" key={section.title}>
            <div className="nav-section-header">
              <span className="nav-section-title">{section.title}</span>
              {section.hint && (
                <span className="nav-section-hint">{section.hint}</span>
              )}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.id);
              return (
                <Link
                  key={item.id}
                  to={`/${item.id}`}
                  className={`nav-item${active ? " active" : ""}`}
                  title={item.label}
                  aria-current={active ? "page" : undefined}
                  onClick={() => onNavigate?.()}
                >
                  <span className="nav-icon" aria-hidden="true">
                    <Icon size={20} />
                  </span>
                  <span className="nav-label">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
