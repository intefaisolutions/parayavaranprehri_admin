import React from "react";
import { Search, Bell, LogOut } from "lucide-react";
import { apiFetch } from "../../utils/apiConfig";

const Header = () => {
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

  const displayRole = (storedUser.role || "Super Admin").toString().replace(/_/g, " ");

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
      <div className="search-bar">
        <Search size={18} color="var(--text-secondary)" />
        <input type="text" placeholder="Global search..." />
      </div>

      <div className="topbar-actions">
        <button className="icon-btn">
          <Bell size={20} />
        </button>

        <div className="user-profile">
          <div className="user-info">
            <span className="user-name">{displayName}</span>
            <span className="user-role" style={{ textTransform: "capitalize" }}>{displayRole}</span>
          </div>

          <div className="user-avatar">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D8ABC&color=fff`}
              alt="Admin"
            />
          </div>
        </div>

        <button className="icon-btn" title="Logout" onClick={handleLogout}>
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Header;
