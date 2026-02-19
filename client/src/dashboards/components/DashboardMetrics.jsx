// DashboardMetrics.jsx
// Dashboard metrics cards row for Tourist Dashboard
import React from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import PublicIcon from '@mui/icons-material/Public';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

// Dummy data for now
const metrics = [
  {
    title: 'Upcoming Trips',
    value: 2,
    sub: '+1 this month',
    icon: <EventAvailableIcon sx={{ color: '#1976d2', fontSize: 32 }} />, 
    color: '#e3f2fd',
  },
  {
    title: 'Countries Visited',
    value: 12,
    sub: '+2 this year',
    icon: <PublicIcon sx={{ color: '#43a047', fontSize: 32 }} />, 
    color: '#e8f5e9',
  },
  {
    title: 'Saved Destinations',
    value: 8,
    sub: '3 new',
    icon: <BookmarkIcon sx={{ color: '#ffb300', fontSize: 32 }} />, 
    color: '#fffde7',
  },
  {
    title: 'Reward Points',
    value: '3,450',
    sub: '+450 earned',
    icon: <EmojiEventsIcon sx={{ color: '#ab47bc', fontSize: 32 }} />, 
    color: '#f3e5f5',
  },
];

export default function DashboardMetrics() {
  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {metrics.map((m) => (
        <Grid item xs={12} sm={6} md={3} key={m.title}>
          <Card sx={{ borderRadius: 3, boxShadow: 1, bgcolor: m.color }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                {m.icon}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>{m.title}</Typography>
                  <Typography variant="h5" fontWeight={700}>{m.value}</Typography>
                  <Typography variant="body2" color="success.main" fontWeight={500}>{m.sub}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
