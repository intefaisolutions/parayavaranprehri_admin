import React from 'react';
import { Search, Plus, Filter } from 'lucide-react';

const GenericPage = ({ title, desc, actionName }: { title: string, desc: string, actionName?: string }) => (
  <div className="dashboard-area">
    <div className="page-header">
      <div className="page-title">
        <h1>{title}</h1>
        <p>{desc}</p>
      </div>
      {actionName && (
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="icon-btn" title="Filter"><Filter size={18} /></button>
          <button className="btn-primary"><Plus size={18} /> {actionName}</button>
        </div>
      )}
    </div>
    <div className="card">
      <div className="search-bar" style={{ width: '100%', marginBottom: '24px', background: 'rgba(0,0,0,0.2)' }}>
        <Search size={18} color="var(--text-secondary)" />
        <input type="text" placeholder={`Search in ${title}...`} />
      </div>
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <p>No records found in {title}. Click on "{actionName}" to add new entries.</p>
      </div>
    </div>
  </div>
);

export const VehiclesView = () => <GenericPage title="Vehicle Management" desc="Manage all registered vehicles and linked trees." actionName="Add Vehicle" />;
export const IdentityView = () => <GenericPage title="Person Identity Management" desc="Generate and manage permanent digital identities." actionName="Generate ID" />;
export const TasksView = () => <GenericPage title="Task Management" desc="Assign work to Paryavaran Mitras." actionName="Assign Task" />;
export const VidhanSabhaView = () => <GenericPage title="Vidhan Sabha Management" desc="Manage constituencies, zones, and sectors." actionName="Add Vidhan Sabha" />;
export const LocationView = () => <GenericPage title="Location Master" desc="Hierarchy of Country, State, District, etc." actionName="Add Location" />;
export const MapView = () => <GenericPage title="Map Management" desc="Manage all plantation GPS locations." actionName="Add Marker" />;
export const NewsView = () => <GenericPage title="News Management" desc="Publish announcements and campaign updates." actionName="Add News" />;
export const MediaView = () => <GenericPage title="Media Management" desc="Central library for all images, videos, and PDFs." actionName="Upload Media" />;
export const LeadersView = () => <GenericPage title="Initiative Leaders Management" desc="Manage leadership information." actionName="Add Leader" />;
export const CertificatesView = () => <GenericPage title="Certificates Management" desc="Manage digital certificate templates." actionName="Create Template" />;
export const PartnersView = () => <GenericPage title="Channel Partner Management" desc="Manage all partner organizations (NGOs, CSRs)." actionName="Add Partner" />;
export const NotificationsView = () => <GenericPage title="Notifications" desc="Send push notifications to mobile app users." actionName="Send Notification" />;
export const CallCenterView = () => <GenericPage title="Call Center Management" desc="Manage all support channels and emergency contacts." actionName="Add Contact" />;
export const LanguagesView = () => <GenericPage title="Language Management" desc="Support multiple languages for the mobile app." actionName="Add Language" />;
export const ReportsView = () => <GenericPage title="Reports" desc="Generate and download administrative reports." actionName="Generate Report" />;
export const SettingsView = () => <GenericPage title="System Settings" desc="Configure global application settings and branding." />;
export const RolesView = () => <GenericPage title="Role & Permission Management" desc="Control access based on Role and Location." actionName="Add Role" />;
export const AuditView = () => <GenericPage title="Audit Logs" desc="History of all administrative activities." />;
