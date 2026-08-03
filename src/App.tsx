import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "./pages/common/Sidebar";
import Header from "./pages/common/Header";

import Dashboard from "./pages/Dashboard";
import { PersonsView } from "./pages/Persons";
import { PersonForm } from "./pages/forms/PersonForm";
import { VehiclesView } from "./pages/Vehicles";
import { VehicleForm } from "./pages/forms/VehicleForm";
import { TreesView } from "./pages/Trees";
import { TreeForm } from "./pages/forms/TreeForm";
import { IdentityView } from "./pages/Identity";
import { IdentityForm } from "./pages/forms/IdentityForm";
import { MitrasView } from "./pages/Mitras";
import { MitraForm } from "./pages/forms/MitraForm";
import { TasksView } from "./pages/TaskManagement";

import { TaskForm } from "./pages/forms/TaskForm";

import { VidhanSabhaView } from "./pages/VidhanSabha";
import { VidhanSabhaForm } from "./pages/forms/VidhanSabhaForm";

import { LocationView } from "./pages/LocationMaster";
import { LocationForm } from "./pages/forms/LocationForm";
import { MapView } from "./pages/MapManagement";
import { MapRecordForm } from "./pages/forms/MapRecordForm";
import { NewsView } from "./pages/NewsManagement";
import { NewsForm } from "./pages/forms/NewsForm";
import { MediaView } from "./pages/MediaManagement";
import { MediaForm } from "./pages/forms/MediaForm";
import { LeadersView } from "./pages/InitiativeLeaders";
import { LeaderForm } from "./pages/forms/LeaderForm";

import { CertificatesView } from "./pages/Certificates";
import { CertificateForm } from "./pages/forms/CertificateForm";
import { IssuedCertificatesView } from "./pages/IssuedCertificates";
import { IssueCertificateForm } from "./pages/forms/IssueCertificateForm";

import { RashiTreesView } from "./pages/RashiTrees";
import { RashiTreeForm } from "./pages/forms/RashiTreeForm";

import { PartnersView } from "./pages/ChannelPartners";
import { PartnerForm } from "./pages/forms/PartnerForm";

import { NotificationsView } from "./pages/NotificationsView";
import { NotificationForm } from "./pages/forms/NotificationForm";
import { CallCenterView } from "./pages/CallCenterView";
import { CallCenterForm } from "./pages/forms/CallCenterForm";
import { LanguagesView } from "./pages/LanguagesView";
import { LanguageForm } from "./pages/forms/LanguageForm";

import { ReportsView } from "./pages/ReportsView";
import { ReportForm } from "./pages/forms/ReportForm";

import { SettingsView } from "./pages/SystemSettings";
import { SystemSettingForm } from "./pages/forms/SystemSettingForm";
import { RolesView } from "./pages/RolesView";
import { RoleForm } from "./pages/forms/RoleForm";

import { AuditView } from "./pages/AuditView";
import { AuditForm } from "./pages/forms/AuditForm";

import { JourneyView } from "./pages/JourneyManagement";
import { JourneyAchievementForm } from "./pages/forms/JourneyAchievementForm";
import { JourneyProfileForm } from "./pages/forms/JourneyProfileForm";
import { MitraEventsView } from "./pages/MitraEvents";
import { MitraEventForm } from "./pages/forms/MitraEventForm";
import { MitraEventAttendanceView } from "./pages/MitraEventAttendance";
import { FieldIssuesView } from "./pages/FieldIssues";
import { FieldIssueStatusForm } from "./pages/forms/FieldIssueStatusForm";
import { MaintenanceLogsView } from "./pages/MaintenanceLogs";
import { MaintenanceLogForm } from "./pages/forms/MaintenanceLogForm";

import { LoginView } from "./pages/Login";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem('accessToken')
  );

  const renderRoutes = () => (
    <Routes>

      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginView onLogin={() => setIsAuthenticated(true)} />
          )
        }
      />

      {isAuthenticated ? (
        <>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/persons" element={<PersonsView />} />
          <Route path="/persons/add" element={<PersonForm />} />
          <Route path="/persons/edit" element={<PersonForm />} />
          <Route path="/persons/view" element={<PersonForm />} />
          <Route path="/vehicles" element={<VehiclesView />} />
          <Route path="/vehicles/add" element={<VehicleForm />} />
          <Route path="/vehicles/edit" element={<VehicleForm />} />
          <Route path="/trees" element={<TreesView />} />
          <Route path="/trees/add" element={<TreeForm />} />
          <Route path="/trees/edit" element={<TreeForm />} />
          <Route path="/identity" element={<IdentityView />} />
          <Route path="/identity/add" element={<IdentityForm />} />
          <Route path="/identity/edit" element={<IdentityForm />} />
          <Route path="/mitras" element={<MitrasView />} />
          <Route path="/mitras/add" element={<MitraForm />} />
          <Route path="/mitras/edit" element={<MitraForm />} />

          <Route path="/tasks" element={<TasksView />} />
          <Route path="/tasks/add" element={<TaskForm />} />
          <Route path="/tasks/edit" element={<TaskForm />} />

          <Route path="/vidhansabha" element={<VidhanSabhaView />} />
          <Route path="/vidhansabha/add" element={<VidhanSabhaForm />} />
          <Route path="/vidhansabha/edit" element={<VidhanSabhaForm />} />

          <Route path="/location" element={<LocationView />} />
          <Route path="/location/add" element={<LocationForm />} />
          <Route path="/location/edit" element={<LocationForm />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/map/add" element={<MapRecordForm />} />
          <Route path="/map/edit" element={<MapRecordForm />} />

          <Route path="/news" element={<NewsView />} />
          <Route path="/news/add" element={<NewsForm />} />
          <Route path="/news/edit" element={<NewsForm />} />
          <Route path="/media" element={<MediaView />} />
          <Route path="/media/add" element={<MediaForm />} />
          <Route path="/media/edit" element={<MediaForm />} />

          <Route path="/leaders" element={<LeadersView />} />
          <Route path="/leaders/add" element={<LeaderForm />} />
          <Route path="/leaders/edit" element={<LeaderForm />} />

          <Route path="/certificates" element={<CertificatesView />} />
          <Route path="/certificates/add" element={<CertificateForm />} />
          <Route path="/certificates/edit" element={<CertificateForm />} />
          <Route path="/certificates/issued" element={<IssuedCertificatesView />} />
          <Route path="/certificates/issue" element={<IssueCertificateForm />} />

          <Route path="/rashi-trees" element={<RashiTreesView />} />
          <Route path="/rashi-trees/add" element={<RashiTreeForm />} />
          <Route path="/rashi-trees/edit" element={<RashiTreeForm />} />

          <Route path="/partners" element={<PartnersView />} />
          <Route path="/partners/add" element={<PartnerForm />} />
          <Route path="/partners/edit" element={<PartnerForm />} />

          <Route path="/notifications" element={<NotificationsView />} />
          <Route path="/notifications/add" element={<NotificationForm />} />
          <Route path="/notifications/edit" element={<NotificationForm />} />
          <Route path="/callcenter" element={<CallCenterView />} />
          <Route path="/callcenter/add" element={<CallCenterForm />} />
          <Route path="/callcenter/edit" element={<CallCenterForm />} />

          <Route path="/languages" element={<LanguagesView />} />
          <Route path="/languages/add" element={<LanguageForm />} />
          <Route path="/languages/edit" element={<LanguageForm />} />

          <Route path="/reports" element={<ReportsView />} />
          <Route path="/reports/add" element={<ReportForm />} />
          <Route path="/reports/edit" element={<ReportForm />} />

          <Route path="/settings" element={<SettingsView />} />
          <Route path="/settings/add" element={<SystemSettingForm />} />
          <Route path="/settings/edit" element={<SystemSettingForm />} />
          <Route path="/roles" element={<RolesView />} />
          <Route path="/roles/add" element={<RoleForm />} />
          <Route path="/roles/edit" element={<RoleForm />} />

          <Route path="/audit" element={<AuditView />} />
          <Route path="/audit/add" element={<AuditForm />} />
          <Route path="/audit/edit" element={<AuditForm />} />

          <Route path="/journey" element={<JourneyView />} />
          <Route path="/journey/add" element={<JourneyAchievementForm />} />
          <Route path="/journey/edit" element={<JourneyAchievementForm />} />
          <Route path="/journey/profile" element={<JourneyProfileForm />} />

          <Route path="/mitra-events" element={<MitraEventsView />} />
          <Route path="/mitra-events/add" element={<MitraEventForm />} />
          <Route path="/mitra-events/edit" element={<MitraEventForm />} />
          <Route
            path="/mitra-events/attendance"
            element={<MitraEventAttendanceView />}
          />

          <Route path="/field-issues" element={<FieldIssuesView />} />
          <Route path="/field-issues/edit" element={<FieldIssueStatusForm />} />

          <Route path="/maintenance-logs" element={<MaintenanceLogsView />} />
          <Route path="/maintenance-logs/add" element={<MaintenanceLogForm />} />
          <Route
            path="/maintenance-logs/view"
            element={<MaintenanceLogForm />}
          />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}

    </Routes>
  );

  if (!isAuthenticated) { return renderRoutes(); }

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="main-content">
        <Header />
        {renderRoutes()}
      </main>
    </div>
  );
}

export default App;