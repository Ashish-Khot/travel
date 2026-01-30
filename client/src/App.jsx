import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import NavigationBar from './layout/NavigationBar';
import MainLayout from './layout/MainLayout';
import LandingPage from './home/LandingPage';
import GuideRegistrationForm from '../src/GuideRegistrationForm';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <MainLayout>
        <NavigationBar />
        <LandingPage />
      </MainLayout>
    </ErrorBoundary>
  );
}

// Add route for guide registration
export default function AppRoutes() {
  return (
    <Routes>
      {/* ...other routes... */}
      <Route path="/register/guide" element={<GuideRegistrationForm />} />
    </Routes>
  );
}
