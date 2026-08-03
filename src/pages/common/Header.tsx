import React from "react";
import { Search, Bell, LogOut, Menu, PanelLeftClose, PanelLeft } from "lucide-react";
import { apiFetch } from "../../utils/apiConfig";

interface HeaderProps {
  onToggleMobileSidebar?: () => void;
  onToggleCollapse?: () => void;
  sidebarCollapsed?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  onToggleMobileSidebar,
  onToggleCollapse,
  sidebarCollapsed = false,
}) => {
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();

  const displayName = storedUser.firstName
    ? `${storedUser.firstName} ${storedUser.lastName || ""}`.trim()
    : storedUser.email || storedUser.phone || "Command Center Admin";

  const displayRole = (storedUser.role || "Super Admin")
    .toString()
    .replace(/_/g, " ");

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    try {
      if (refreshToken) {
        await apiFetch("/api/v1/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch {
      // Ignore network/logout errors, clear the session locally regardless
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="icon-btn menu-toggle-mobile"
          onClick={onToggleMobileSidebar}
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <button
          type="button"
          className="icon-btn menu-toggle-desktop"
          onClick={onToggleCollapse}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
        </button>

        <div className="search-bar">
          <Search size={18} color="var(--text-secondary)" aria-hidden="true" />
          <input
            type="search"
            placeholder="Global search..."
            aria-label="Global search"
          />
        </div>
      </div>

      <div className="topbar-actions">
        <button type="button" className="icon-btn" aria-label="Notifications">
          <Bell size={20} />
        </button>

        <div className="user-profile">
          <div className="user-info">
            <span className="user-name">{displayName}</span>
            <span
              className="user-role"
              style={{ textTransform: "capitalize" }}
            >
              {displayRole}
            </span>
          </div>

          <div className="user-avatar">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D8ABC&color=fff`}
              alt=""
            />
          </div>
        </div>

        <button
          type="button"
          className="icon-btn"
          title="Logout"
          aria-label="Logout"
          onClick={handleLogout}
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Header;
