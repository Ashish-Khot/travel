import React from 'react';
import { Paper, Typography, Box, Button, Grid } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const columns = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'title', headerName: 'Title', width: 200 },
  { field: 'creator', headerName: 'Creator', width: 160 },
  { field: 'status', headerName: 'Status', width: 120 },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 250,
    renderCell: () => (
      <>
        <Button size="small" variant="outlined" color="success" sx={{ mr: 1 }}>Approve</Button>
        <Button size="small" variant="outlined" color="error" sx={{ mr: 1 }}>Reject</Button>
        <Button size="small" variant="outlined">Edit</Button>
        <Button size="small" variant="outlined" color="secondary">Delete</Button>
      </>
    ),
  },
];

const rows = [
  { id: 1, title: 'Trip to Goa', creator: 'Alice', status: 'Pending' },
  { id: 2, title: 'Himalayan Trek', creator: 'Bob', status: 'Approved' },
  { id: 3, title: 'Desert Safari', creator: 'Carol', status: 'Rejected' },
];

export default function TravelogueManagement() {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>Travelogue Management</Typography>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <Grid container justifyContent="flex-end">
          <Button variant="contained" color="primary">Add Travelogue</Button>
        </Grid>
      </Paper>
      <Paper elevation={1} sx={{ height: 400, borderRadius: 3 }}>
        <DataGrid rows={rows} columns={columns} pageSize={5} rowsPerPageOptions={[5]} disableSelectionOnClick />
      </Paper>
    </Box>
  );
}
