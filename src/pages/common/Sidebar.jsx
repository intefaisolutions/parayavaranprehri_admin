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
  MapPin,
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
} from "lucide-react";

const Sidebar = ({
  mobileOpen = false,
  collapsed = false,
  onNavigate,
  onCloseMobile,
}) => {
  const location = useLocation();

  const menuItems = [
    { id: "dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { id: "persons", icon: <Users size={20} />, label: "Person Management" },
    { id: "vehicles", icon: <Car size={20} />, label: "Vehicle Management" },
    { id: "tree-masters", icon: <Leaf size={20} />, label: "Tree Master Catalog" },
    { id: "plantations", icon: <Sprout size={20} />, label: "Plantation Requests" },
    { id: "trees", icon: <TreePine size={20} />, label: "Tree Management" },
    { id: "lands", icon: <MapPin size={20} />, label: "Land Management" },
    { id: "identity", icon: <FileBadge size={20} />, label: "Person Identity" },
    { id: "mitras", icon: <UserCheck size={20} />, label: "Paryavaran Mitra" },
    { id: "tasks", icon: <ClipboardList size={20} />, label: "Task Management" },
    { id: "mitra-events", icon: <CalendarDays size={20} />, label: "Mitra Events" },
    { id: "field-issues", icon: <AlertTriangle size={20} />, label: "Field Issues" },
    { id: "maintenance-logs", icon: <Wrench size={20} />, label: "Maintenance Logs" },
    { id: "vidhansabha", icon: <Building size={20} />, label: "Vidhan Sabha" },
    { id: "location", icon: <MapPin size={20} />, label: "Location Master" },
    { id: "map", icon: <Map size={20} />, label: "Map Management" },
    { id: "news", icon: <Newspaper size={20} />, label: "News Management" },
    { id: "media", icon: <ImageIcon size={20} />, label: "Media Management" },
    { id: "leaders", icon: <Users2 size={20} />, label: "Initiative Leaders" },
    { id: "journey", icon: <Route size={20} />, label: "Journey & Achievements" },
    { id: "certificates", icon: <Award size={20} />, label: "Certificates" },
    { id: "certificates/issued", icon: <FileBadge size={20} />, label: "Issued Certificates" },
    { id: "rashi-trees", icon: <Sparkles size={20} />, label: "Rashi Tree Recommendations" },
    { id: "partners", icon: <Handshake size={20} />, label: "Channel Partners" },
    { id: "notifications", icon: <Bell size={20} />, label: "Notifications" },
    { id: "callcenter", icon: <PhoneCall size={20} />, label: "Call Center" },
    { id: "languages", icon: <Languages size={20} />, label: "Languages" },
    { id: "reports", icon: <Download size={20} />, label: "Reports" },
    { id: "settings", icon: <Settings size={20} />, label: "System Settings" },
    { id: "roles", icon: <ShieldCheck size={20} />, label: "Role & Permissions" },
    { id: "audit", icon: <History size={20} />, label: "Audit Logs" },
  ];

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
        {menuItems.map((item) => {
          const active =
            location.pathname.includes(item.id) ||
            (location.pathname === "/" && item.id === "dashboard");

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
                {item.icon}
              </span>
              <span className="nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
