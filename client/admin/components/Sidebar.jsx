import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Toolbar, Typography } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BookIcon from '@mui/icons-material/Book';
import PlaceIcon from '@mui/icons-material/Place';
import CategoryIcon from '@mui/icons-material/Category';
import CommentIcon from '@mui/icons-material/Comment';
import BarChartIcon from '@mui/icons-material/BarChart';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Overview', path: '/admin', icon: <DashboardIcon /> },
  { label: 'Users', path: '/admin/users', icon: <PeopleIcon /> },
  { label: 'Travelogues', path: '/admin/travelogues', icon: <BookIcon /> },
  { label: 'Destinations', path: '/admin/destinations', icon: <PlaceIcon /> },
  { label: 'Categories', path: '/admin/categories', icon: <CategoryIcon /> },
  { label: 'Comments', path: '/admin/comments', icon: <CommentIcon /> },
  { label: 'Analytics', path: '/admin/analytics', icon: <BarChartIcon /> },
  { label: 'Notifications', path: '/admin/notifications', icon: <NotificationsIcon /> },
  { label: 'Settings', path: '/admin/settings', icon: <SettingsIcon /> },
];

export default function Sidebar() {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box', background: 'var(--sidebar-bg)', color: 'var(--sidebar-text)' },
      }}
    >
      <Toolbar />
      <Typography variant="h6" fontWeight={900} sx={{ p: 2, pb: 0 }}>
        Travelogue Admin
      </Typography>
      <List>
        {navItems.map(item => (
          <NavLink key={item.path} to={item.path} style={{ textDecoration: 'none', color: 'inherit' }}>
            {({ isActive }) => (
              <ListItem disablePadding>
                <ListItemButton selected={isActive} sx={{ borderRadius: 2, mb: 1, background: isActive ? 'var(--sidebar-active)' : 'none' }}>
                  <ListItemIcon sx={{ color: isActive ? 'var(--sidebar-active-text)' : 'inherit' }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} sx={{ color: isActive ? 'var(--sidebar-active-text)' : 'inherit' }} />
                </ListItemButton>
              </ListItem>
            )}
          </NavLink>
        ))}
      </List>
    </Drawer>
  );
}
