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
  Leaf
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { id: "dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { id: "persons", icon: <Users size={20} />, label: "Person Management" },
    { id: "vehicles", icon: <Car size={20} />, label: "Vehicle Management" },
    { id: "trees", icon: <TreePine size={20} />, label: "Tree Management" },
    { id: "identity", icon: <FileBadge size={20} />, label: "Person Identity" },
    { id: "mitras", icon: <UserCheck size={20} />, label: "Paryavaran Mitra" },
    { id: "tasks", icon: <ClipboardList size={20} />, label: "Task Management" },
    { id: "vidhansabha", icon: <Building size={20} />, label: "Vidhan Sabha" },
    { id: "location", icon: <MapPin size={20} />, label: "Location Master" },
    { id: "map", icon: <Map size={20} />, label: "Map Management" },
    { id: "news", icon: <Newspaper size={20} />, label: "News Management" },
    { id: "media", icon: <ImageIcon size={20} />, label: "Media Management" },
    { id: "leaders", icon: <Users2 size={20} />, label: "Initiative Leaders" },
    { id: "certificates", icon: <Award size={20} />, label: "Certificates" },
    { id: "partners", icon: <Handshake size={20} />, label: "Channel Partners" },
    { id: "notifications", icon: <Bell size={20} />, label: "Notifications" },
    { id: "callcenter", icon: <PhoneCall size={20} />, label: "Call Center" },
    { id: "languages", icon: <Languages size={20} />, label: "Languages" },
    { id: "reports", icon: <Download size={20} />, label: "Reports" },
    { id: "settings", icon: <Settings size={20} />, label: "System Settings" },
    { id: "roles", icon: <ShieldCheck size={20} />, label: "Role & Permissions" },
    { id: "audit", icon: <History size={20} />, label: "Audit Logs" }
  ];

  return (
    <aside className="sidebar" style={{ overflowY: "auto" }}>
      <div
        className="brand"
        style={{
          position: "sticky",
          top: 0,
          background: "inherit",
          zIndex: 10
        }}
      >
        <div className="brand-icon">
          <Leaf size={24} />
        </div>

        Paryavaran Prahri
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
              className={`nav-item ${active ? "active" : ""}`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;