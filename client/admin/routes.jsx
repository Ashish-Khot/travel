import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminApp from './App';
import DashboardOverview from './pages/DashboardOverview';
import UserManagement from './pages/UserManagement';
import TravelogueManagement from './pages/TravelogueManagement';
import DestinationManagement from './pages/DestinationManagement';
import CategoryTagManagement from './pages/CategoryTagManagement';
import CommentModeration from './pages/CommentModeration';
import AnalyticsReports from './pages/AnalyticsReports';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AdminApp />}>
        <Route index element={<DashboardOverview />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="travelogues" element={<TravelogueManagement />} />
        <Route path="destinations" element={<DestinationManagement />} />
        <Route path="categories" element={<CategoryTagManagement />} />
        <Route path="comments" element={<CommentModeration />} />
        <Route path="analytics" element={<AnalyticsReports />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
