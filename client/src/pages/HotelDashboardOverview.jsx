import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Paper, Button, CircularProgress } from "@mui/material";
import api from "../api";
import HotelIcon from "@mui/icons-material/Hotel";
import BedIcon from "@mui/icons-material/Bed";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import StarIcon from "@mui/icons-material/Star";
import AccountBoxIcon from "@mui/icons-material/AccountBox";

export default function HotelDashboardOverview() {
  const userId = localStorage.getItem("userId");
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        if (!userId) return;
        const res = await api.get(`/room/hotel/${userId}`);
        setRooms(res.data);
      } catch (err) {
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, [userId]);

  const totalRooms = rooms.reduce((sum, r) => sum + (Number(r.total) || 0), 0);
  const availableRooms = rooms.reduce((sum, r) => sum + (Number(r.available) || 0), 0);

  return (
    <Box sx={{ fontFamily: 'Inter, Poppins, Arial, sans-serif' }}>
      <Typography variant="h4" fontWeight={700} mb={1} sx={{ fontFamily: 'Poppins, Inter, Arial, sans-serif', color: 'var(--mui-primary)' }}>
        Dashboard Overview
      </Typography>
      <Typography color="text.secondary" mb={3} sx={{ fontSize: { xs: 16, md: 18 } }}>
        Welcome back! Here's your hotel performance at a glance.
      </Typography>
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2.5, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', color: '#222' }}>
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#7c3aed', fontWeight: 600 }}>TOTAL ROOMS</Typography>
              {loading ? <CircularProgress size={24} /> : <Typography variant="h5" fontWeight={800}>{totalRooms}</Typography>}
            </Box>
            <HotelIcon sx={{ color: '#7c3aed', fontSize: 40 }} />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2.5, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', color: '#222' }}>
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#06b6d4', fontWeight: 600 }}>AVAILABLE ROOMS</Typography>
              {loading ? <CircularProgress size={24} /> : <Typography variant="h5" fontWeight={800}>{availableRooms}</Typography>}
            </Box>
            <BedIcon sx={{ color: '#06b6d4', fontSize: 40 }} />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2.5, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)', color: '#222' }}>
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#0ea5e9', fontWeight: 600 }}>MESSAGES TODAY</Typography>
              <Typography variant="h5" fontWeight={800}>0</Typography>
            </Box>
            <ChatBubbleOutlineIcon sx={{ color: '#0ea5e9', fontSize: 40 }} />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2.5, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #f9d423 0%, #ff4e50 100%)', color: '#222' }}>
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#fbbf24', fontWeight: 600 }}>AVERAGE RATING</Typography>
              <Typography variant="h5" fontWeight={800}>4.7</Typography>
            </Box>
            <StarIcon sx={{ color: '#fbbf24', fontSize: 40 }} />
          </Paper>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: { xs: 2, md: 3 }, borderRadius: 4, mb: 2, fontFamily: 'Inter, Arial, sans-serif' }}>
            <Typography variant="h6" fontWeight={700} mb={2} sx={{ color: 'var(--mui-primary)', fontFamily: 'Poppins, Inter, Arial, sans-serif' }}>Recent Activity</Typography>
            <Box mb={1} display="flex" alignItems="center">
              <ChatBubbleOutlineIcon sx={{ color: '#22c55e', mr: 1 }} />
              <Typography fontWeight={600}>New message from tourist <Typography variant="caption" color="text.secondary" ml={1}>2 minutes ago</Typography></Typography>
            </Box>
            <Box mb={1} display="flex" alignItems="center">
              <StarIcon sx={{ color: '#fbbf24', mr: 1 }} />
              <Typography fontWeight={600}>New review received <Typography variant="caption" color="text.secondary" ml={1}>1 hour ago</Typography></Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <BedIcon sx={{ color: '#06b6d4', mr: 1 }} />
              <Typography fontWeight={600}>Room availability updated <Typography variant="caption" color="text.secondary" ml={1}>3 hours ago</Typography></Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: { xs: 2, md: 3 }, borderRadius: 4, fontFamily: 'Inter, Arial, sans-serif' }}>
            <Typography variant="h6" fontWeight={700} mb={2} sx={{ color: 'var(--mui-primary)', fontFamily: 'Poppins, Inter, Arial, sans-serif' }}>Quick Actions</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Button fullWidth variant="contained" sx={{ fontWeight: 700, borderRadius: 2, py: 1.5, mb: 1, background: 'linear-gradient(90deg, #6366f1 0%, #06b6d4 100%)', color: '#fff', fontFamily: 'Poppins, Inter, Arial, sans-serif' }} startIcon={<BedIcon />}>
                  Add Room
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button fullWidth variant="contained" sx={{ fontWeight: 700, borderRadius: 2, py: 1.5, mb: 1, background: 'linear-gradient(90deg, #f472b6 0%, #6366f1 100%)', color: '#fff', fontFamily: 'Poppins, Inter, Arial, sans-serif' }} startIcon={<ChatBubbleOutlineIcon />}>
                  View Chats
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button fullWidth variant="outlined" sx={{ fontWeight: 700, borderRadius: 2, py: 1.5, mb: 1, color: 'var(--mui-success)', borderColor: 'var(--mui-success)', fontFamily: 'Poppins, Inter, Arial, sans-serif' }} startIcon={<AccountBoxIcon />}>
                  Update Profile
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button fullWidth variant="outlined" sx={{ fontWeight: 700, borderRadius: 2, py: 1.5, color: 'var(--mui-warning)', borderColor: 'var(--mui-warning)', fontFamily: 'Poppins, Inter, Arial, sans-serif' }} startIcon={<StarIcon />}>
                  View Reviews
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
