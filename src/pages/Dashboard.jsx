import React, { useEffect, useState } from "react";
import {
  Download,
  Users,
  Car,
  TreePine,
  UserCheck,
  ListChecks,
  UserCog,
  Send,
  Activity,
  Bell,
  Loader2
} from "lucide-react";
import { apiFetchMeta } from "../utils/apiConfig";

const formatRelativeTime = (dateStr) => {
  if (!dateStr) return "";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  if (Number.isNaN(diffMs)) return "";

  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
};

const csvEscape = (value) => {
  const text = value == null ? "" : String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
};

const downloadCsv = (filename, rows) => {
  const content = `\uFEFF${rows.map((row) => row.map(csvEscape).join(",")).join("\r\n")}`;
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  const [counts, setCounts] = useState({
    persons: 0,
    vehicles: 0,
    trees: 0,
    mitras: 0,
    pendingTasks: 0,
    activePersons: 0,
    sentNotifications: 0
  });
  const [recentPersons, setRecentPersons] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);

  const [topOxygen, setTopOxygen] = useState([]);
  const [topTrees, setTopTrees] = useState([]);
  const [topLand, setTopLand] = useState([]);

  useEffect(() => {
    let isMounted = true;

    // Each lookup is fetched independently so one failing endpoint
    // doesn't blank out the rest of the dashboard - failures default to 0/empty.
    const safeMeta = async (endpoint) => {
      try {
        return await apiFetchMeta(endpoint);
      } catch {
        return { items: [], total: 0 };
      }
    };

    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const [
          personsRes,
          vehiclesRes,
          treesRes,
          mitrasRes,
          pendingTasksRes,
          activePersonsRes,
          sentNotificationsRes,
          recentPersonsRes,
          recentNotificationsRes,
          vidhanSabhasRes
        ] = await Promise.all([
          safeMeta("/api/v1/persons?limit=1"),
          safeMeta("/api/v1/vehicles"),
          safeMeta("/api/v1/trees"),
          safeMeta("/api/v1/mitras"),
          safeMeta("/api/v1/tasks?limit=1&status=Pending"),
          safeMeta("/api/v1/persons?limit=1&status=Active"),
          safeMeta("/api/v1/notifications?limit=1&status=Sent"),
          safeMeta("/api/v1/persons?limit=5&sortBy=createdAt&sortOrder=desc"),
          safeMeta("/api/v1/notifications?limit=5&sortBy=createdAt&sortOrder=desc"),
          safeMeta("/api/v1/vidhan-sabhas?limit=500")
        ]);

        if (!isMounted) return;

        setCounts({
          persons: personsRes.total,
          vehicles: vehiclesRes.total,
          trees: treesRes.total,
          mitras: mitrasRes.total,
          pendingTasks: pendingTasksRes.total,
          activePersons: activePersonsRes.total,
          sentNotifications: sentNotificationsRes.total
        });
        setRecentPersons(recentPersonsRes.items || []);
        setRecentNotifications(recentNotificationsRes.items || []);

        const vsData = vidhanSabhasRes.items || [];
        setTopOxygen([...vsData].sort((a, b) => (b.estimatedOxygenTonsPerYear || 0) - (a.estimatedOxygenTonsPerYear || 0)).slice(0, 5));
        setTopTrees([...vsData].sort((a, b) => (b.totalTrees || 0) - (a.totalTrees || 0)).slice(0, 5));
        setTopLand([...vsData].sort((a, b) => {
          const landA = (a.governmentLandAcres || 0) + (a.privateLandAcres || 0);
          const landB = (b.governmentLandAcres || 0) + (b.privateLandAcres || 0);
          return landB - landA;
        }).slice(0, 5));
      } catch (err) {
        if (isMounted) setError(err.message || "Failed to load dashboard data");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  const formatNumber = (value) => (value || 0).toLocaleString("en-IN");

  const handleExportReport = () => {
    if (exporting || loading) return;
    setExporting(true);
    setError("");
    try {
      const stamp = new Date().toISOString().slice(0, 10);
      const generatedAt = new Date().toLocaleString("en-IN");
      const rows = [
        ["Paryavaran Prahri — Dashboard Export"],
        ["Generated At", generatedAt],
        [],
        ["Metric", "Count"],
        ["Registered Persons", counts.persons],
        ["Active Persons", counts.activePersons],
        ["Total Vehicles", counts.vehicles],
        ["Total Trees", counts.trees],
        ["Paryavaran Mitras", counts.mitras],
        ["Pending Tasks", counts.pendingTasks],
        ["Sent Notifications", counts.sentNotifications],
        [],
        ["Recent Persons"],
        ["Name", "Mobile", "Status", "Registered At"],
        ...(recentPersons.length
          ? recentPersons.map((p) => [
              p.name || "",
              p.mobile || "",
              p.status || "",
              p.createdAt
                ? new Date(p.createdAt).toLocaleString("en-IN")
                : "",
            ])
          : [["No recent persons", "", "", ""]]),
        [],
        ["Recent Notifications"],
        ["Title", "Status", "Sent At"],
        ...(recentNotifications.length
          ? recentNotifications.map((n) => [
              n.title || n.message || "",
              n.status || "",
              n.createdAt
                ? new Date(n.createdAt).toLocaleString("en-IN")
                : "",
            ])
          : [["No recent notifications", "", ""]]),
      ];

      downloadCsv(`dashboard_report_${stamp}.csv`, rows);
    } catch (err) {
      setError(err.message || "Failed to export dashboard report");
    } finally {
      setExporting(false);
    }
  };

  const statCards = [
    {
      title: "Registered Persons",
      value: counts.persons,
      color: "#00d2ff",
      icon: <Users size={20} />
    },
    {
      title: "Total Vehicles",
      value: counts.vehicles,
      color: "#ffb300",
      icon: <Car size={20} />
    },
    {
      title: "Total Trees",
      value: counts.trees,
      color: "#00e676",
      icon: <TreePine size={20} />
    },
    {
      title: "Paryavaran Mitras",
      value: counts.mitras,
      color: "#ff007a",
      icon: <UserCheck size={20} />
    }
  ];

  const secondaryCards = [
    {
      title: "Pending Tasks",
      value: counts.pendingTasks,
      color: "#ff3d00",
      icon: <ListChecks size={18} />
    },
    {
      title: "Active Persons",
      value: counts.activePersons,
      color: "#00e676",
      icon: <UserCog size={18} />
    },
    {
      title: "Notifications Sent",
      value: counts.sentNotifications,
      color: "#00d2ff",
      icon: <Send size={18} />
    }
  ];

  if (loading) {
    return (
      <div className="dashboard-area">
        <div style={{ display: "flex", justifyContent: "center", padding: "80px" }}>
          <Loader2 size={28} className="spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-area">

      <div className="page-header">
        <div className="page-title">
          <h1>Dashboard</h1>
          <p>Overview of the entire Paryavaran Prahri ecosystem.</p>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={handleExportReport}
          disabled={loading || exporting}
          title="Download dashboard overview as CSV"
        >
          {exporting ? <Loader2 size={18} className="spin" /> : <Download size={18} />}
          {exporting ? "Exporting..." : "Export Report"}
        </button>
      </div>

      {error && (
        <div
          style={{
            background: "rgba(255, 61, 0, 0.1)",
            color: "#ff3d00",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "16px"
          }}
        >
          {error}
        </div>
      )}

      <div
        className="stats-grid"
        style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
      >
        {statCards.map((item, index) => (
          <div className="stat-card" key={index}>
            <div className="stat-header">
              <span className="stat-title">{item.title}</span>

              <div className="stat-icon" style={{ color: item.color }}>
                {item.icon}
              </div>
            </div>

            <div className="stat-value">{formatNumber(item.value)}</div>

            <div className="stat-trend" style={{ color: "var(--text-secondary)" }}>
              <span>Live count</span>
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
        {secondaryCards.map((item, index) => (
          <div className="stat-card" key={index}>
            <div className="stat-header">
              <span className="stat-title">{item.title}</span>

              <div className="stat-icon" style={{ color: item.color }}>
                {item.icon}
              </div>
            </div>

            <div className="stat-value" style={{ color: item.color }}>
              {formatNumber(item.value)}
            </div>
          </div>
        ))}
      </div>

      <div className="content-grid" style={{ marginTop: "24px" }}>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Registrations</h2>

            <button className="icon-btn" style={{ width: 32, height: 32 }}>
              <Activity size={16} />
            </button>
          </div>

          {recentPersons.length === 0 ? (
            <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--text-secondary)" }}>
              No data yet
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {recentPersons.map((person) => (
                  <tr key={person._id}>
                    <td>{person.personId || "-"}</td>
                    <td>{person.name || "-"}</td>
                    <td>{person.mobile || "-"}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          person.status === "Active" ? "status-active" : "status-inactive"
                        }`}
                      >
                        {person.status || "Unknown"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Notifications</h2>
          </div>

          {recentNotifications.length === 0 ? (
            <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--text-secondary)" }}>
              No data yet
            </div>
          ) : (
            <div className="activity-feed">
              {recentNotifications.map((notification) => (
                <div className="activity-item" key={notification._id}>
                  <div className="activity-icon" style={{ color: "#00e676" }}>
                    <Bell size={16} />
                  </div>

                  <div className="activity-details">
                    <p>
                      <strong>{notification.notificationTitle || "Notification"}</strong>
                      {notification.message ? ` — ${notification.message}` : ""}
                    </p>

                    <span className="activity-time">
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <div className="content-grid" style={{ marginTop: "24px", gridTemplateColumns: "repeat(3, 1fr)" }}>
        {/* Top Oxygen */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Top Oxygen Producers</h2>
          </div>
          {topOxygen.length === 0 ? (
            <div style={{ padding: "16px", textAlign: "center", color: "var(--text-secondary)" }}>No data</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vidhan Sabha</th>
                  <th style={{ textAlign: "right" }}>Oxygen (Tons/Yr)</th>
                </tr>
              </thead>
              <tbody>
                {topOxygen.map((vs, idx) => (
                  <tr key={vs._id || idx}>
                    <td>{vs.vidhanSabhaName}</td>
                    <td style={{ textAlign: "right", color: "#00d2ff", fontWeight: "bold" }}>
                      {formatNumber(vs.estimatedOxygenTonsPerYear)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Top Trees */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Highest Tree Count</h2>
          </div>
          {topTrees.length === 0 ? (
            <div style={{ padding: "16px", textAlign: "center", color: "var(--text-secondary)" }}>No data</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vidhan Sabha</th>
                  <th style={{ textAlign: "right" }}>Trees</th>
                </tr>
              </thead>
              <tbody>
                {topTrees.map((vs, idx) => (
                  <tr key={vs._id || idx}>
                    <td>{vs.vidhanSabhaName}</td>
                    <td style={{ textAlign: "right", color: "#00e676", fontWeight: "bold" }}>
                      {formatNumber(vs.totalTrees)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Top Land */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Most Registered Land</h2>
          </div>
          {topLand.length === 0 ? (
            <div style={{ padding: "16px", textAlign: "center", color: "var(--text-secondary)" }}>No data</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vidhan Sabha</th>
                  <th style={{ textAlign: "right" }}>Area (Acres)</th>
                </tr>
              </thead>
              <tbody>
                {topLand.map((vs, idx) => {
                  const area = (vs.governmentLandAcres || 0) + (vs.privateLandAcres || 0);
                  return (
                    <tr key={vs._id || idx}>
                      <td>{vs.vidhanSabhaName}</td>
                      <td style={{ textAlign: "right", color: "#ffb300", fontWeight: "bold" }}>
                        {formatNumber(Math.round(area * 10) / 10)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
