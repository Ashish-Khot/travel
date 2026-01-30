  // Dummy barData for chart (replace with real data if available)
  const barData = [
    { month: 'Jan', users: 0 },
    { month: 'Feb', users: 0 },
    { month: 'Mar', users: 0 },
    { month: 'Apr', users: 0 },
    { month: 'May', users: 0 },
    { month: 'Jun', users: 0 },
  ];
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Avatar,
  Alert,
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import HotelIcon from '@mui/icons-material/Hotel';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DescriptionIcon from '@mui/icons-material/Description';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';


import api from '../../src/api';


export default function DashboardOverview() {
  const [stats, setStats] = useState({
    touristCount: 0,
    guideCount: 0,
    hotelCount: 0,
    hospitalCount: 0,
    travelogueCount: 0,
    chatCount: 0,
    pendingGuides: 0
  });
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState('');

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const res = await api.get('/adminDashboard/dashboard-stats');
        setStats(res.data);
      } catch (err) {
        // handle error
      }
      setLoading(false);
    }
    // Get admin name from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setAdminName(user?.name || 'Admin');
    fetchStats();
  }, []);

  const statCards = [
    {
      label: 'Total Tourists',
      value: stats.touristCount,
      icon: <GroupIcon />,
      color: '#3b82f6',
    },
    {
      label: 'Total Guides',
      value: stats.guideCount,
      icon: <PersonAddAltIcon />,
      color: '#22c55e',
    },
    {
      label: 'Total Hotels',
      value: stats.hotelCount,
      icon: <HotelIcon />,
      color: '#a78bfa',
    },
    {
      label: 'Total Hospitals',
      value: stats.hospitalCount,
      icon: <LocalHospitalIcon />,
      color: '#ef4444',
    },
    {
      label: 'Active Chats',
      value: stats.chatCount,
      icon: <ChatBubbleOutlineIcon />,
      color: '#06b6d4',
    },
    {
      label: 'Pending Approvals',
      value: stats.pendingGuides,
      icon: <WarningAmberIcon />,
      color: '#fbbf24',
    },
    {
      label: 'Total Travelogues',
      value: stats.travelogueCount,
      icon: <DescriptionIcon />,
      color: '#6366f1',
    },
    // Emergency Requests can be implemented if you have such data
    {
      label: 'Emergency Requests',
      value: 0,
      icon: <ReportProblemIcon />,
      color: '#ef4444',
    },
  ];

  const pieData = [
    { name: 'Tourists', value: stats.touristCount, color: '#3b82f6' },
    { name: 'Guides', value: stats.guideCount, color: '#22c55e' },
    { name: 'Hotels', value: stats.hotelCount, color: '#a78bfa' },
    { name: 'Hospitals', value: stats.hospitalCount, color: '#ef4444' },
  ];

  return (
    <Box sx={{ p: { xs: 1, md: 4 }, background: 'var(--bg)' }}>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
        Welcome back, <b>{adminName}</b>
      </Typography>
      <Typography variant="h3" fontWeight={900} sx={{ mb: 1 }}>
        Dashboard Overview
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Welcome to your admin control center
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <Paper
              elevation={2}
              sx={{
                borderRadius: 3,
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography
                  color="text.secondary"
                  fontWeight={600}
                  fontSize={16}
                >
                  {stat.label}
                </Typography>
                <Typography variant="h4" fontWeight={900}>
                  {loading ? '...' : stat.value}
                </Typography>
              </Box>
              <Avatar
                sx={{
                  bgcolor: stat.color,
                  width: 48,
                  height: 48,
                }}
              >
                {stat.icon}
              </Avatar>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ borderRadius: 3, p: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Monthly User Registrations
            </Typography>
            <Box sx={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="users"
                    fill="#fbbf24"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ borderRadius: 3, p: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              User Distribution
            </Typography>
            <Box sx={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label={({
                      name,
                      percent,
                    }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      <Paper
        elevation={2}
        sx={{
          borderRadius: 3,
          p: 3,
          background: '#fffbeb',
        }}
      >
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Quick Alerts
        </Typography>
        <Alert
          icon={<WarningAmberIcon fontSize="inherit" />}
          severity="warning"
          sx={{
            background: '#fef3c7',
            color: '#92400e',
            fontWeight: 600,
          }}
        >
          Pending Approvals
          <br />
          <Typography
            component="span"
            fontWeight={400}
            color="inherit"
          ></Typography>
          {loading ? '...' : `${stats.pendingGuides} users waiting for approval`}
        </Alert>
      </Paper>
    </Box>
  );
}
