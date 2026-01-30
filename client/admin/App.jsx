import React from 'react';
import { ThemeProvider } from './theme';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import { Outlet } from 'react-router-dom';

export default function AdminApp() {
  return (
    <ThemeProvider>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Topbar />
          <main style={{ flex: 1, padding: 24 }}>
            <Outlet />
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
