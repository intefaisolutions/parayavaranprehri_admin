import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "./pages/common/Sidebar";
import Header from "./pages/common/Header";

import Dashboard from "./pages/Dashboard";
import { PersonsView } from "./pages/Persons";
import { VehiclesView } from "./pages/Vehicles";
import { TreesView } from "./pages/Trees";
import { IdentityView } from "./pages/Identity";
import { MitrasView } from "./pages/Mitras";
import { TasksView } from "./pages/TaskManagement";

import { TaskForm } from "./pages/forms/TaskForm";

import { VidhanSabhaView } from "./pages/VidhanSabha";
import { VidhanSabhaForm } from "./pages/forms/VidhanSabhaForm";

import { LocationView } from "./pages/LocationMaster";
import { MapView } from "./pages/MapManagement";
import { NewsView } from "./pages/NewsManagement";
import { MediaView } from "./pages/MediaManagement";
import { LeadersView } from "./pages/InitiativeLeaders";

import { CertificatesView } from "./pages/Certificates";
import { CertificateForm } from "./pages/forms/CertificateForm";

import { PartnersView } from "./pages/ChannelPartners";
import { PartnerForm } from "./pages/forms/PartnerForm";

import { NotificationsView } from "./pages/NotificationsView";
import { CallCenterView } from "./pages/CallCenterView";
import { LanguagesView } from "./pages/LanguagesView";

import { ReportsView } from "./pages/ReportsView";
import { ReportForm } from "./pages/forms/ReportForm";

import { SettingsView } from "./pages/SystemSettings";
import { RolesView } from "./pages/RolesView";

import { AuditView } from "./pages/AuditView";
import { AuditForm } from "./pages/forms/AuditForm";

import { LoginView } from "./pages/Login";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
          <Route path="/vehicles" element={<VehiclesView />} />
          <Route path="/trees" element={<TreesView />} />
          <Route path="/identity" element={<IdentityView />} />
          <Route path="/mitras" element={<MitrasView />} />

          <Route path="/tasks" element={<TasksView />} />
          <Route path="/tasks/add" element={<TaskForm />} />
          <Route path="/tasks/edit" element={<TaskForm />} />

          <Route path="/vidhansabha" element={<VidhanSabhaView />} />
          <Route path="/vidhansabha/add" element={<VidhanSabhaForm />} />
          <Route path="/vidhansabha/edit" element={<VidhanSabhaForm />} />

          <Route path="/location" element={<LocationView />} />
          <Route path="/map" element={<MapView />} />

          <Route path="/news" element={<NewsView />} />
          <Route path="/media" element={<MediaView />} />

          <Route path="/leaders" element={<LeadersView />} />

          <Route path="/certificates" element={<CertificatesView />} />
          <Route path="/certificates/add" element={<CertificateForm />} />
          <Route path="/certificates/edit" element={<CertificateForm />} />

          <Route path="/partners" element={<PartnersView />} />
          <Route path="/partners/add" element={<PartnerForm />} />
          <Route path="/partners/edit" element={<PartnerForm />} />

          <Route path="/notifications" element={<NotificationsView />} />
          <Route path="/callcenter" element={<CallCenterView />} />

          <Route path="/languages" element={<LanguagesView />} />

          <Route path="/reports" element={<ReportsView />} />
          <Route path="/reports/add" element={<ReportForm />} />
          <Route path="/reports/edit" element={<ReportForm />} />

          <Route path="/settings" element={<SettingsView />} />
          <Route path="/roles" element={<RolesView />} />

          <Route path="/audit" element={<AuditView />} />
          <Route path="/audit/add" element={<AuditForm />} />
          <Route path="/audit/edit" element={<AuditForm />} />

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