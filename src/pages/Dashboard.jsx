import React from "react";
import {
  Download,
  Users,
  Car,
  TreePine,
  UserCheck,
  ChevronUp,
  Activity,
  Bell
} from "lucide-react";

const Dashboard = () => (
  <div className="dashboard-area">

    <div className="page-header">
      <div className="page-title">
        <h1>Dashboard</h1>
        <p>Overview of the entire Paryavaran Prahri ecosystem.</p>
      </div>

      <button className="btn-primary">
        <Download size={18} />
        Export Report
      </button>
    </div>

    <div
      className="stats-grid"
      style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
    >
      {[
        {
          title: "Registered Persons",
          value: "12,450",
          color: "#00d2ff",
          trend: "+14.5% this month",
          icon: <Users size={20} />
        },
        {
          title: "Total Vehicles",
          value: "8,300",
          color: "#ffb300",
          trend: "+2.1% this week",
          icon: <Car size={20} />
        },
        {
          title: "Total Trees",
          value: "845,020",
          color: "#00e676",
          trend: "+2.3% this week",
          icon: <TreePine size={20} />
        },
        {
          title: "Paryavaran Mitras",
          value: "1,250",
          color: "#ff007a",
          trend: "+12 new today",
          icon: <UserCheck size={20} />
        }
      ].map((item, index) => (
        <div className="stat-card" key={index}>
          <div className="stat-header">
            <span className="stat-title">{item.title}</span>

            <div className="stat-icon" style={{ color: item.color }}>
              {item.icon}
            </div>
          </div>

          <div className="stat-value">{item.value}</div>

          <div className="stat-trend trend-up">
            <ChevronUp size={16} />
            <span>{item.trend}</span>
          </div>
        </div>
      ))}
    </div>

    <div
      className="stats-grid"
      style={{
        gridTemplateColumns: "repeat(3,1fr)",
        marginTop: "24px"
      }}
    >
      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-title">Trees Verified Today</span>
        </div>
        <div className="stat-value">1,402</div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-title">Pending Approvals</span>
        </div>

        <div className="stat-value" style={{ color: "#ff3d00" }}>
          45
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-title">Today's Activities</span>
        </div>

        <div className="stat-value">8,921</div>
      </div>
    </div>

    <div className="content-grid" style={{ marginTop: "24px" }}>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Registrations</h2>

          <button className="icon-btn" style={{ width: 32, height: 32 }}>
            <Activity size={16} />
          </button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Entity</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>PR-001</td>
              <td>Aarav Patel</td>
              <td>Person</td>
              <td>
                <span className="status-badge status-active">
                  Active
                </span>
              </td>
            </tr>

            <tr>
              <td>VH-002</td>
              <td>MP09 AB 1234</td>
              <td>Vehicle</td>
              <td>
                <span className="status-badge status-active">
                  Approved
                </span>
              </td>
            </tr>

            <tr>
              <td>PM-003</td>
              <td>Rohan Gupta</td>
              <td>Paryavaran Mitra</td>
              <td>
                <span
                  className="status-badge"
                  style={{
                    background: "rgba(255,179,0,0.1)",
                    color: "#ffb300"
                  }}
                >
                  Pending
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Notifications</h2>
        </div>

        <div className="activity-feed">

          <div className="activity-item">
            <div className="activity-icon" style={{ color: "#00e676" }}>
              <Bell size={16} />
            </div>

            <div className="activity-details">
              <p>
                System update sent to all <strong>Vehicle Owners</strong>.
              </p>

              <span className="activity-time">
                2 hours ago
              </span>
            </div>
          </div>

          <div className="activity-item">
            <div className="activity-icon" style={{ color: "#ffb300" }}>
              <Bell size={16} />
            </div>

            <div className="activity-details">
              <p>
                New task assigned to Mitras in <strong>Rau Vidhan Sabha</strong>.
              </p>

              <span className="activity-time">
                5 hours ago
              </span>
            </div>
          </div>

        </div>
      </div>

    </div>

  </div>
);

export default Dashboard;