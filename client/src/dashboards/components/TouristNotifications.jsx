import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import api from '../../api';

export default function TouristNotifications({ onReview }) {
  const [notifications, setNotifications] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    // Fetch notifications from backend (replace with your API endpoint)
    async function fetchNotifications() {
      try {
        const res = await api.get('/notifications/tourist');
        setNotifications(res.data.notifications || []);
      } catch (err) {
        setNotifications([]);
      }
    }
    fetchNotifications();
  }, []);

  const handleAccept = (notif) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
    setSnackbar({ open: true, message: 'You can now review your guide in the Reviews section.', severity: 'success' });
    if (onReview) onReview(notif.bookingId);
    // Optionally, trigger backend update here
  };

  const handleDecline = (notif) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
    setSnackbar({ open: true, message: 'You declined to review this tour.', severity: 'info' });
    // Optionally, notify guide here
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" fontWeight={700} mb={2}>Notifications</Typography>
      {notifications.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>No pending notifications.</Paper>
      ) : (
        <Stack spacing={2}>
          {notifications.map((notif) => (
            <Paper key={notif.id} sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography fontWeight={600}>{notif.guideName} - {notif.tourName}</Typography>
              <Typography color="text.secondary">{notif.message}</Typography>
              <Stack direction="row" spacing={2} mt={1}>
                <Button variant="contained" color="success" onClick={() => handleAccept(notif)}>Accept & Review</Button>
                <Button variant="outlined" color="error" onClick={() => handleDecline(notif)}>Decline</Button>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
