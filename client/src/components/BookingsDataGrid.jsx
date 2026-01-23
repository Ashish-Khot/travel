
import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Box, Chip, Stack } from '@mui/material';
import api from '../api';




export default function BookingsDataGrid({ bookings = [], onStatusChange, onChat }) {
  const [loadingIds, setLoadingIds] = React.useState([]);

  const handleStatus = async (id, status) => {
    setLoadingIds((prev) => [...prev, id]);
    try {
      await api.patch(`/booking/status/${id}`, { status });
      if (onStatusChange) onStatusChange();
    } catch (err) {
      alert('Failed to update booking status');
    }
    setLoadingIds((prev) => prev.filter((x) => x !== id));
  };

  const columns = [
    { field: 'tourist', headerName: 'Tourist', flex: 1, minWidth: 120 },
    { field: 'tour', headerName: 'Tour', flex: 1, minWidth: 140 },
    { field: 'date', headerName: 'Date', flex: 1, minWidth: 110 },
    { field: 'amount', headerName: 'Amount', flex: 1, minWidth: 100, renderCell: (params) => `$${params.value}` },
    { field: 'status', headerName: 'Status', flex: 1, minWidth: 100, renderCell: (params) => (
      <Chip label={params.value} color={params.value === 'Accepted' ? 'success' : params.value === 'Rejected' ? 'error' : 'warning'} size="small" />
    ) },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1.2,
      minWidth: 200,
      sortable: false,
      renderCell: (params) => {
        const disabled = loadingIds.includes(params.row.id) || ['Accepted', 'Rejected'].includes(params.row.status);
        return (
          <Stack direction="row" spacing={1}>
            <Button variant="contained" color="success" size="small" disabled={disabled} onClick={() => handleStatus(params.row.id, 'accepted')}>Accept</Button>
            <Button variant="outlined" color="error" size="small" disabled={disabled} onClick={() => handleStatus(params.row.id, 'rejected')}>Reject</Button>
            <Button variant="outlined" color="primary" size="small" onClick={() => onChat && onChat(params.row.originalBooking)}>Chat</Button>
          </Stack>
        );
      },
    },
  ];

  // Map backend bookings to DataGrid rows
  const rows = bookings.map((b, idx) => ({
    id: b._id || idx,
    tourist: b.touristId?.name || 'Unknown',
    tour: b.destination || 'N/A',
    date: b.date ? new Date(b.date).toISOString().slice(0, 10) : '',
    amount: b.price || 0,
    status: b.status ? (b.status.charAt(0).toUpperCase() + b.status.slice(1)) : 'Pending',
    originalBooking: b,
  }));
  return (
    <Box sx={{ height: 420, width: '100%', bgcolor: 'background.paper', borderRadius: 4, boxShadow: 3, p: 2 }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        disableSelectionOnClick
        sx={{
          borderRadius: 3,
          '& .MuiDataGrid-columnHeaders': { fontWeight: 700, fontSize: 16 },
          '& .MuiDataGrid-row': { transition: 'background 0.2s', '&:hover': { background: 'rgba(25, 118, 210, 0.04)' } },
        }}
      />
    </Box>
  );
}
