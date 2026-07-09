import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
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
  Search,
  ChevronUp,
  Activity,
  Leaf
} from 'lucide-react';

import { PersonsView } from './pages/Persons';
import { TreesView } from './pages/Trees';
import { MitrasView } from './pages/Mitras';
import { LoginView } from './pages/Login';
import {
  VehiclesView, IdentityView, TasksView, VidhanSabhaView, LocationView,
  MapView, NewsView, MediaView, LeadersView, CertificatesView, PartnersView,
  NotificationsView, CallCenterView, LanguagesView, ReportsView, SettingsView,
  RolesView, AuditView
} from './pages/AdditionalPages';

// --- Dashboard View (Matches FCD Section 3) ---

const DashboardView = () => (
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

    {/* Information Displayed from FCD */}
    <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-title">Registered Persons</span>
          <div className="stat-icon" style={{ color: '#00d2ff' }}>
            <Users size={20} />
          </div>
        </div>
        <div className="stat-value">12,450</div>
        <div className="stat-trend trend-up">
          <ChevronUp size={16} /><span>+14.5% this month</span>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-title">Total Vehicles</span>
          <div className="stat-icon" style={{ color: '#ffb300' }}>
            <Car size={20} />
          </div>
        </div>
        <div className="stat-value">8,300</div>
        <div className="stat-trend trend-up">
          <ChevronUp size={16} /><span>+2.1% this week</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-title">Total Trees</span>
          <div className="stat-icon" style={{ color: '#00e676' }}>
            <TreePine size={20} />
          </div>
        </div>
        <div className="stat-value">845,020</div>
        <div className="stat-trend trend-up">
          <ChevronUp size={16} /><span>+2.3% this week</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-title">Paryavaran Mitras</span>
          <div className="stat-icon" style={{ color: '#ff007a' }}>
            <UserCheck size={20} />
          </div>
        </div>
        <div className="stat-value">1,250</div>
        <div className="stat-trend trend-up">
          <ChevronUp size={16} /><span>+12 new today</span>
        </div>
      </div>
    </div>

    <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginTop: '24px' }}>
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
        <div className="stat-value" style={{ color: '#ff3d00' }}>45</div>
      </div>
      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-title">Today's Activities</span>
        </div>
        <div className="stat-value">8,921</div>
      </div>
    </div>

    <div className="content-grid" style={{ marginTop: '24px' }}>
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
              <td><span className="status-badge status-active">Active</span></td>
            </tr>
            <tr>
              <td>VH-002</td>
              <td>MP09 AB 1234</td>
              <td>Vehicle</td>
              <td><span className="status-badge status-active">Approved</span></td>
            </tr>
            <tr>
              <td>PM-003</td>
              <td>Rohan Gupta</td>
              <td>Paryavaran Mitra</td>
              <td><span className="status-badge" style={{ background: 'rgba(255, 179, 0, 0.1)', color: '#ffb300' }}>Pending</span></td>
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
            <div className="activity-icon" style={{ color: '#00e676' }}>
              <Bell size={16} />
            </div>
            <div className="activity-details">
              <p>System update sent to all <strong>Vehicle Owners</strong>.</p>
              <span className="activity-time">2 hours ago</span>
            </div>
          </div>
          
          <div className="activity-item">
            <div className="activity-icon" style={{ color: '#ffb300' }}>
              <Bell size={16} />
            </div>
            <div className="activity-details">
              <p>New task assigned to Mitras in <strong>Rau Vidhan Sabha</strong>.</p>
              <span className="activity-time">5 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// --- Main App ---

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { id: 'persons', icon: <Users size={20} />, label: 'Person Management' },
    { id: 'vehicles', icon: <Car size={20} />, label: 'Vehicle Management' },
    { id: 'trees', icon: <TreePine size={20} />, label: 'Tree Management' },
    { id: 'identity', icon: <FileBadge size={20} />, label: 'Person Identity' },
    { id: 'mitras', icon: <UserCheck size={20} />, label: 'Paryavaran Mitra' },
    { id: 'tasks', icon: <ClipboardList size={20} />, label: 'Task Management' },
    { id: 'vidhansabha', icon: <Building size={20} />, label: 'Vidhan Sabha' },
    { id: 'location', icon: <MapPin size={20} />, label: 'Location Master' },
    { id: 'map', icon: <Map size={20} />, label: 'Map Management' },
    { id: 'news', icon: <Newspaper size={20} />, label: 'News Management' },
    { id: 'media', icon: <ImageIcon size={20} />, label: 'Media Management' },
    { id: 'leaders', icon: <Users2 size={20} />, label: 'Initiative Leaders' },
    { id: 'certificates', icon: <Award size={20} />, label: 'Certificates' },
    { id: 'partners', icon: <Handshake size={20} />, label: 'Channel Partners' },
    { id: 'notifications', icon: <Bell size={20} />, label: 'Notifications' },
    { id: 'callcenter', icon: <PhoneCall size={20} />, label: 'Call Center' },
    { id: 'languages', icon: <Languages size={20} />, label: 'Languages' },
    { id: 'reports', icon: <Download size={20} />, label: 'Reports' },
    { id: 'settings', icon: <Settings size={20} />, label: 'System Settings' },
    { id: 'roles', icon: <ShieldCheck size={20} />, label: 'Role & Permissions' },
    { id: 'audit', icon: <History size={20} />, label: 'Audit Logs' },
  ];

  const renderRoutes = () => (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginView onLogin={() => setIsAuthenticated(true)} />
      } />
      
      {/* Protected Routes */}
      {isAuthenticated ? (
        <>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardView />} />
          <Route path="/persons" element={<PersonsView />} />
          <Route path="/vehicles" element={<VehiclesView />} />
          <Route path="/trees" element={<TreesView />} />
          <Route path="/identity" element={<IdentityView />} />
          <Route path="/mitras" element={<MitrasView />} />
          <Route path="/tasks" element={<TasksView />} />
          <Route path="/vidhansabha" element={<VidhanSabhaView />} />
          <Route path="/location" element={<LocationView />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/news" element={<NewsView />} />
          <Route path="/media" element={<MediaView />} />
          <Route path="/leaders" element={<LeadersView />} />
          <Route path="/certificates" element={<CertificatesView />} />
          <Route path="/partners" element={<PartnersView />} />
          <Route path="/notifications" element={<NotificationsView />} />
          <Route path="/callcenter" element={<CallCenterView />} />
          <Route path="/languages" element={<LanguagesView />} />
          <Route path="/reports" element={<ReportsView />} />
          <Route path="/settings" element={<SettingsView />} />
          <Route path="/roles" element={<RolesView />} />
          <Route path="/audit" element={<AuditView />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );

  // If not authenticated and we are not explicitly on the login route, 
  // the Routes block above will redirect to /login.
  // We only render the Admin Layout (sidebar/topbar) if authenticated.
  if (!isAuthenticated) {
    return renderRoutes();
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="sidebar" style={{ overflowY: 'auto' }}>
        <div className="brand" style={{ position: 'sticky', top: 0, background: 'inherit', zIndex: 10 }}>
          <div className="brand-icon">
            <Leaf size={24} />
          </div>
          Paryavaran Prahri
        </div>
        
        <nav className="nav-menu">
          {menuItems.map((item) => {
            const isActive = location.pathname.includes(item.id) || (location.pathname === '/' && item.id === 'dashboard');
            return (
              <Link 
                key={item.id}
                to={`/${item.id}`}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Topbar */}
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
                <img src="https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff" alt="Admin" />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic View Area */}
        {renderRoutes()}
        
      </main>
    </div>
  );
}

export default App;
