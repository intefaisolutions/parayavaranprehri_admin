import React from "react";

const StatCard = ({ title, value, icon, color, showLiveCount, valueColor }) => {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <span className="stat-title">{title}</span>
        <div className="stat-icon" style={{ color: color }}>
          {icon}
        </div>
      </div>
      <div className="stat-value" style={{ color: valueColor || "inherit" }}>
        {value}
      </div>
      {showLiveCount && (
        <div className="stat-trend" style={{ color: "var(--text-secondary)" }}>
          <span>Live count</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
