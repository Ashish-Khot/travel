import React from 'react';
import { Paper, Typography, Box, Grid, Card, CardContent } from '@mui/material';

const analytics = [
  { label: 'Most Viewed Travelogue', value: 'Trip to Goa' },
  { label: 'Popular Destination', value: 'Manali' },
  { label: 'Active Users', value: 1200 },
];

export default function AnalyticsReports() {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>Analytics & Reports</Typography>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {analytics.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.label}>
            <Card elevation={2} sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {item.label}
                </Typography>
                <Typography variant="h5" fontWeight={800} color="primary">
                  {item.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Paper elevation={1} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          User Engagement Statistics
        </Typography>
        <Typography color="text.secondary">Charts and statistics will appear here.</Typography>
      </Paper>
    </Box>
  );
}
