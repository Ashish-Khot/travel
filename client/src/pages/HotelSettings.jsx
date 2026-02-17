import React, { useState } from "react";
import { Box, Typography, Paper, TextField, Button, Grid } from "@mui/material";

export default function HotelSettings() {
  const [form, setForm] = useState({
    password: '',
    confirmPassword: '',
    notifications: true,
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSave = () => {
    // Save settings logic here
    alert('Settings saved!');
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={1}>Settings</Typography>
      <Typography color="text.secondary" mb={3}>Manage your account and preferences</Typography>
      <Paper elevation={2} sx={{ p: 4, borderRadius: 3, maxWidth: 600 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="New Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
        <Box mt={3}>
          <Button variant="contained" color="primary" onClick={handleSave}>Save Settings</Button>
        </Box>
      </Paper>
    </Box>
  );
}
