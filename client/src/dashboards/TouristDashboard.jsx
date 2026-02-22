
// Modern, premium Tourist Dashboard using MUI v5 and Framer Motion
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';
import AppBarTop from './components/AppBarTop';
import SidebarNav from './components/SidebarNav';


import ExploreGuides from './components/ExploreGuides';
import ExploreDestinations from './components/ExploreDestinations';
import MyBookings from './components/MyBookings';
import ChatPanel from './components/ChatPanel';
import ReviewsPanel from './components/ReviewsPanel';
import TravelTipsPanel from './components/TravelTipsPanel';
import EmergencySupportPanel from './components/EmergencySupportPanel';
import TouristProfile from './components/TouristProfile';
import TouristSettings from './components/TouristSettings';
import TouristNotifications from './components/TouristNotifications';
import CreateTravelogue from './components/CreateTravelogue';
import MyTravelogues from './components/MyTravelogues';
import TravelogueSearch from './components/TravelogueSearch';
import WelcomeSection from './components/WelcomeSection';
import DashboardMetrics from './components/DashboardMetrics';
import AIRecommendations from './components/AIRecommendations';
import WeatherForecastCard from './components/WeatherForecastCard';
import WeatherSearch from './components/WeatherSearch';
import { Tabs, Tab } from '@mui/material';

function TouristDashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useMediaQuery('(max-width:900px)');
  const [selectedTab, setSelectedTab] = useState('Dashboard');
  const [weatherModal, setWeatherModal] = useState(false);
  const [travelogueSubTab, setTravelogueSubTab] = useState('create');

  // Responsive sidebar toggle
  const handleSidebarToggle = () => setSidebarOpen((open) => !open);

  // Sidebar navigation items
  const navItems = [
    { label: 'Dashboard', value: 'Dashboard' },
    { label: 'Notifications', value: 'Notifications' },
    { label: 'Explore Destinations', value: 'Explore Destinations' },
    { label: 'Explore Guides', value: 'Explore Guides' },
    { label: 'My Bookings', value: 'My Bookings' },
    { label: 'Chat', value: 'Chat' },
    { label: 'Reviews', value: 'Reviews' },
    { label: 'Travelogue', value: 'Travelogue' },
    { label: 'Travel Tips', value: 'Travel Tips' },
    { label: 'Emergency', value: 'Emergency' },
    { label: 'Profile', value: 'Profile' },
    { label: 'Settings', value: 'Settings' },
  ];

  return (
    <ThemeProvider theme={theme('light')}>
      <CssBaseline />
      {/* AppBar */}
      <AppBarTop user={user} />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Sidebar Navigation */}
        <SidebarNav
          open={!isMobile && sidebarOpen}
          onToggle={handleSidebarToggle}
          navItems={navItems}
          selectedTab={selectedTab}
          onSelect={setSelectedTab}
        />
        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 4 },
            pt: { xs: 9, sm: 11 }, // Add top padding for fixed AppBar
            maxWidth: '1600px',
            mx: 'auto',
            transition: 'padding 0.2s',
          }}
        >
          {selectedTab === 'Dashboard' && (
            <Box>
              {/* Welcome Section */}
              <WelcomeSection user={user} />
              {/* Metrics Row */}
              <DashboardMetrics />
              {/* Recommendations + Weather Row */}
              <Box display={{ xs: 'block', md: 'flex' }} gap={3}>
                <Box flex={2} minWidth={0}>
                  <AIRecommendations />
                </Box>
                <Box flex={1} minWidth={260} maxWidth={420}>
                  <WeatherForecastCard onClick={() => setWeatherModal(true)} clickable />
                </Box>
                <WeatherSearch open={weatherModal} onClose={() => setWeatherModal(false)} />
              </Box>
            </Box>
          )}
          {selectedTab === 'Notifications' && <TouristNotifications />}
          {selectedTab === 'Explore Destinations' && <ExploreDestinations />}
          {selectedTab === 'Explore Guides' && <ExploreGuides />}
          {selectedTab === 'My Bookings' && <MyBookings />}
          {selectedTab === 'Chat' && <ChatPanel />}
          {selectedTab === 'Reviews' && <ReviewsPanel />}
          {selectedTab === 'Travelogue' && (
            <Box>
              {/* Travelogue Sub-tabs */}
              <Box sx={{
                bgcolor: '#ffffff',
                borderRadius: '16px',
                mb: 3,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                overflow: 'hidden'
              }}>
                <Tabs
                  value={travelogueSubTab}
                  onChange={(e, newValue) => setTravelogueSubTab(newValue)}
                  sx={{
                    borderBottom: '1px solid rgba(79,138,139,0.1)',
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      color: '#6B7280',
                      minWidth: 120,
                      '&.Mui-selected': {
                        color: '#4F8A8B'
                      }
                    },
                    '& .MuiTabs-indicator': {
                      background: 'linear-gradient(135deg, #4F8A8B 0%, #6BA8AC 100%)',
                      height: 3
                    }
                  }}
                >
                  <Tab value="create" label="Create Travelogue" />
                  <Tab value="my" label="My Travelogues" />
                  <Tab value="explore" label="Explore Stories" />
                </Tabs>
              </Box>

              {/* Sub-tab Content */}
              {travelogueSubTab === 'create' && <CreateTravelogue />}
              {travelogueSubTab === 'my' && <MyTravelogues />}
              {travelogueSubTab === 'explore' && <TravelogueSearch />}
            </Box>
          )}
          {selectedTab === 'Travel Tips' && <TravelTipsPanel />}
          {selectedTab === 'Emergency' && <EmergencySupportPanel />}
          {selectedTab === 'Profile' && <TouristProfile user={user} />}
          {selectedTab === 'Settings' && <TouristSettings />}
          {/* Add other tab content as needed */}
        </Box>
      </Box>

    </ThemeProvider>
  );
}

export default TouristDashboard;
