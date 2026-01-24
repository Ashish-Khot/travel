


import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import NavigationBar from './layout/NavigationBar';
import MainLayout from './layout/MainLayout';
import LandingPage from './home/LandingPage';
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

export default App;
