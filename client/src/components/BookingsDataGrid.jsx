
import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Box, Chip, Stack, CircularProgress, Typography, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert } from '@mui/material';
import api from '../api';




export default function BookingsDataGrid({ bookings = [], onStatusChange, onChat }) {
  // State for message dialog
  const [msgDialogOpen, setMsgDialogOpen] = React.useState(false);
  const [msgText, setMsgText] = React.useState('');
  const [msgLoading, setMsgLoading] = React.useState(false);
  const [msgSuccess, setMsgSuccess] = React.useState(false);
  const [msgError, setMsgError] = React.useState('');
  const [msgTourist, setMsgTourist] = React.useState(null);
    // Open message dialog for a tourist
    const handleOpenMsgDialog = (tourist) => {
      setMsgTourist(tourist);
      setMsgText('');
      setMsgDialogOpen(true);
      setMsgError('');
    };

    // Send message to tourist (simulate API call)
    const handleSendMsg = async () => {
      if (!msgText.trim()) {
        setMsgError('Message cannot be empty.');
        return;
      }
      setMsgLoading(true);
      setMsgError('');
      try {
        // Replace with real API call as needed
        await new Promise((res) => setTimeout(res, 900));
        setMsgSuccess(true);
        setMsgDialogOpen(false);
      } catch (e) {
        setMsgError('Failed to send message. Please try again.');
      }
      setMsgLoading(false);
    };
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
    { field: 'dateRange', headerName: 'Date/Time', flex: 1, minWidth: 180 },
    { field: 'amount', headerName: 'Amount', flex: 1, minWidth: 100, renderCell: (params) => <b>{`$${params.value}`}</b> },
    { field: 'status', headerName: 'Status', flex: 1, minWidth: 120, renderCell: (params) => {
      let color = 'warning', icon = null;
      if (params.value === 'Accepted') { color = 'success'; icon = '✔️'; }
      else if (params.value === 'Rejected') { color = 'error'; icon = '❌'; }
      else if (params.value === 'Confirmed') { color = 'warning'; icon = '⏳'; }
      else if (params.value === 'Pending') { color = 'default'; icon = '⏳'; }
      return (
        <Chip
          label={<span style={{fontWeight:600,display:'flex',alignItems:'center',gap:4}}>{icon} {params.value}</span>}
          color={color}
          size="small"
          sx={{ fontSize: 14, px: 1.5, py: 0.5, borderRadius: 2, boxShadow: '0 1px 4px #0001', letterSpacing:0.2 }}
        />
      );
    } },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1.5,
      minWidth: 270,
      sortable: false,
      renderCell: (params) => {
        const disabled = loadingIds.includes(params.row.id) || ['Accepted', 'Rejected'].includes(params.row.status);
        const isLoading = loadingIds.includes(params.row.id);
        const isCompleted = params.row.status === 'Confirmed' || params.row.status === 'Accepted';
        return (
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              color="success"
              size="small"
              disabled={disabled}
              sx={{ borderRadius: 3, boxShadow: '0 2px 8px #4caf5022', fontWeight: 600, minWidth: 80 }}
              onClick={() => handleStatus(params.row.id, 'accepted')}
              startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : null}
            >
              Accept
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              disabled={disabled}
              sx={{ borderRadius: 3, fontWeight: 600, minWidth: 80, borderWidth:2 }}
              onClick={() => handleStatus(params.row.id, 'rejected')}
              startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : null}
            >
              Reject
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              sx={{ borderRadius: 3, fontWeight: 600, minWidth: 70, borderWidth:2 }}
              onClick={() => onChat && onChat(params.row.originalBooking)}
            >
              Chat
            </Button>
            {isCompleted && (
              <Button
                variant="contained"
                color="info"
                size="small"
                sx={{ borderRadius: 3, fontWeight: 600, minWidth: 120, boxShadow: '0 2px 8px #0288d122' }}
                onClick={() => handleOpenMsgDialog(params.row)}
              >
                Send Message
              </Button>
            )}
          </Stack>
        );
      },
    },
  ];

  // Map backend bookings to DataGrid rows
  const rows = bookings.map((b, idx) => {
    let dateRange = '';
    if (b.startDateTime && b.endDateTime) {
      const start = new Date(b.startDateTime);
      const end = new Date(b.endDateTime);
      const sameDay = start.toDateString() === end.toDateString();
      if (sameDay) {
        dateRange = `${start.toLocaleDateString()} ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      } else {
        dateRange = `${start.toLocaleDateString()} ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleDateString()} ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
    } else if (b.date) {
      // Fallback for legacy bookings
      const legacy = new Date(b.date);
      dateRange = legacy.toLocaleDateString();
    }
    return {
      id: b._id || idx,
      tourist: b.touristId?.name || 'Unknown',
      tour: b.destination || 'N/A',
      dateRange,
      amount: b.price || 0,
      status: b.status ? (b.status.charAt(0).toUpperCase() + b.status.slice(1)) : 'Pending',
      originalBooking: b,
    };
  });
  // Loading/empty state
  if (!bookings) {
    return (
      <Box sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.paper', borderRadius: 4, boxShadow: 3, p: 2 }}>
        <CircularProgress size={40} color="primary" />
      </Box>
    );
  }
  if (bookings.length === 0) {
    return (
      <Box sx={{ height: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.paper', borderRadius: 4, boxShadow: 3, p: 2 }}>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>No bookings found</Typography>
        <Typography variant="body2" color="text.disabled">Bookings will appear here when available.</Typography>
      </Box>
    );
  }
  return (
    <>
      <Box sx={{
        height: 440,
        width: '100%',
        bgcolor: 'background.paper',
        borderRadius: 5,
        boxShadow: '0 4px 24px #0002',
        p: 3,
        border: '1.5px solid #e3e8f0',
        transition: 'box-shadow 0.2s',
      }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 25, 100]}
          disableSelectionOnClick
          sx={{
            borderRadius: 3,
            fontSize: 15,
            '& .MuiDataGrid-columnHeaders': { fontWeight: 700, fontSize: 17, bgcolor: '#f8fafc', borderRadius: 2 },
            '& .MuiDataGrid-row': {
              transition: 'background 0.2s',
              '&:hover': { background: 'rgba(25, 118, 210, 0.07)', boxShadow: '0 2px 12px #1976d20a' },
              borderRadius: 2,
              mx: 0.5,
            },
            '& .MuiDataGrid-cell': { py: 1.2, px: 1 },
            '& .MuiDataGrid-footerContainer': { bgcolor: '#f8fafc', borderRadius: 2 },
          }}
        />
      </Box>
      {/* Message Dialog */}
      <Dialog open={msgDialogOpen} onClose={() => setMsgDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Send Message to Tourist</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
            {msgTourist ? `To: ${msgTourist.tourist}` : ''}
          </Typography>
          <TextField
            autoFocus
            multiline
            minRows={3}
            maxRows={6}
            fullWidth
            placeholder="Write your message (e.g. 'Thank you for choosing me as your guide! If you have any feedback or need help, feel free to reach out.')"
            value={msgText}
            onChange={e => setMsgText(e.target.value)}
            disabled={msgLoading}
            error={!!msgError}
            helperText={msgError}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMsgDialogOpen(false)} disabled={msgLoading}>Cancel</Button>
          <Button onClick={handleSendMsg} variant="contained" color="primary" disabled={msgLoading} sx={{ minWidth: 100 }}>
            {msgLoading ? <CircularProgress size={18} color="inherit" /> : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Success Snackbar */}
      <Snackbar open={msgSuccess} autoHideDuration={3000} onClose={() => setMsgSuccess(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setMsgSuccess(false)} severity="success" variant="filled" sx={{ fontWeight: 600 }}>
          Message sent to tourist successfully!
        </Alert>
      </Snackbar>
    </>
  );
}
