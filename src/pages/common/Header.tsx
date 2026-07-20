import React from "react";
import { Search, Bell } from "lucide-react";

const Header = () => {
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
            <span className="user-name">Command Center Admin</span>
            <span className="user-role">Super Admin</span>
          </div>

          <div className="user-avatar">
            <img
              src="https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff"
              alt="Admin"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;