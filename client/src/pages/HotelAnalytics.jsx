import React from "react";
import { Box, Typography, Paper, Grid, Card, CardContent } from "@mui/material";
import BarChartIcon from "@mui/icons-material/BarChart";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

export default function HotelAnalytics() {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={1}>Analytics & Reports</Typography>
      <Typography color="text.secondary" mb={3}>Earnings, occupancy rates, and booking trends</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <AttachMoneyIcon color="success" fontSize="large" />
                <Box>
                  <Typography variant="h6" fontWeight={700}>Total Earnings</Typography>
                  <Typography variant="h4" fontWeight={800}>$12,500</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <BarChartIcon color="info" fontSize="large" />
                <Box>
                  <Typography variant="h6" fontWeight={700}>Occupancy Rate</Typography>
                  <Typography variant="h4" fontWeight={800}>78%</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mt: 4 }}>
        <Typography variant="h6" fontWeight={700} mb={2}>Booking Trends</Typography>
        <Typography color="text.secondary">(Chart placeholder: Integrate chart library for real data)</Typography>
        <Box height={180} display="flex" alignItems="center" justifyContent="center" color="#aaa">
          [Booking Trends Chart]
        </Box>
      </Paper>
    </Box>
  );
}
