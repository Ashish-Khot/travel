import React from 'react';
import { Paper, Typography, Box, Button, Grid, TextField } from '@mui/material';

const destinations = [
  { id: 1, name: 'Goa', category: 'Beach', status: 'Enabled' },
  { id: 2, name: 'Manali', category: 'Mountain', status: 'Enabled' },
  { id: 3, name: 'Agra', category: 'Heritage', status: 'Disabled' },
];

export default function DestinationManagement() {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>Destination Management</Typography>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField label="Search destinations" fullWidth size="small" />
          </Grid>
          <Grid item xs={12} sm={6} md={8} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Button variant="contained" color="primary">Add Destination</Button>
          </Grid>
        </Grid>
      </Paper>
      <Paper elevation={1} sx={{ borderRadius: 3 }}>
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2}>
            {destinations.map(dest => (
              <Grid item xs={12} sm={6} md={4} key={dest.id}>
                <Paper elevation={2} sx={{ p: 2, borderRadius: 2, mb: 2 }}>
                  <Typography variant="h6">{dest.name}</Typography>
                  <Typography color="text.secondary">{dest.category}</Typography>
                  <Typography color={dest.status === 'Enabled' ? 'success.main' : 'error.main'} fontWeight={600}>
                    {dest.status}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Button size="small" variant="outlined" color="success" sx={{ mr: 1 }}>Enable</Button>
                    <Button size="small" variant="outlined" color="error">Disable</Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
}
