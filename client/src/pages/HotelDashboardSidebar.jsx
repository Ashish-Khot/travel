import React from "react";
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Avatar, Box, Typography, Badge } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import HotelIcon from "@mui/icons-material/Hotel";
import ChatIcon from "@mui/icons-material/Chat";
import StarIcon from "@mui/icons-material/Star";

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "dashboard" },
  { text: "Hotel Profile", icon: <AccountBoxIcon />, path: "profile" },
  { text: "Rooms", icon: <HotelIcon />, path: "rooms" },
  { text: "Bookings", icon: <DashboardIcon />, path: "bookings" },
  { text: "Chat", icon: <ChatIcon />, path: "chat", badge: 3 },
  { text: "Reviews", icon: <StarIcon />, path: "reviews" },
  { text: "Notifications", icon: <DashboardIcon />, path: "notifications" },
  { text: "Analytics", icon: <DashboardIcon />, path: "analytics" },
  { text: "Settings", icon: <AccountBoxIcon />, path: "settings" },
];


export default function HotelDashboardSidebar({ selected, onSelect }) {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 260,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: 260,
          boxSizing: 'border-box',
          background: 'linear-gradient(160deg, #232526 0%, #414345 100%)',
          color: '#f3f4f6',
          fontFamily: "'Poppins', 'Inter', Arial, sans-serif",
          borderRight: 'none',
          boxShadow: '4px 0 24px 0 rgba(30,41,59,0.10)',
          zIndex: 1201,
        },
        display: { xs: 'none', sm: 'block' },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ p: 3, pb: 2 }}>
          <Typography variant="h5" fontWeight={800} sx={{ color: '#fff', fontFamily: 'Poppins, Inter, Arial, sans-serif', letterSpacing: 1, fontSize: 28 }}>Travelogue</Typography>
          <Typography variant="subtitle2" sx={{ color: '#a5b4fc', fontWeight: 600, fontSize: 16 }}>Hotel Dashboard</Typography>
        </Box>
        <List>
          {menuItems.map((item, idx) => (
            <ListItem
              key={item.text}
              component="li"
              onClick={() => onSelect(item.path)}
              selected={selected === item.path}
              sx={{
                borderRadius: 2,
                mb: 1,
                cursor: 'pointer',
                fontFamily: 'Inter, Arial, sans-serif',
                transition: 'background 0.2s, color 0.2s',
                ...(selected === item.path && {
                  background: 'rgba(99,102,241,0.12)',
                  color: '#a5b4fc',
                  fontWeight: 700,
                }),
                '&:hover': {
                  background: 'rgba(99,102,241,0.18)',
                  color: '#fff',
                },
              }}
            >
              <ListItemIcon sx={{ color: selected === item.path ? '#a5b4fc' : '#cbd5e1' }}>
                {item.badge ? (
                  <Badge badgeContent={item.badge} color="error">{item.icon}</Badge>
                ) : item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', background: 'rgba(99,102,241,0.10)', borderRadius: 2, m: 2 }}>
          <Avatar sx={{ bgcolor: '#a5b4fc', color: '#232526', mr: 2, fontWeight: 700, fontSize: 20 }}>A</Avatar>
          <Box>
            <Typography fontWeight={700} sx={{ color: '#fff', fontFamily: 'Poppins, Inter, Arial, sans-serif', fontSize: 16 }}>Admin</Typography>
            <Typography variant="caption" sx={{ color: '#a5b4fc', fontSize: 13 }}>Hotel Manager</Typography>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}
