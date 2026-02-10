import React, { useEffect, useState } from 'react';
import { Paper, Typography, Box, Button, Grid, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Stack, Snackbar, Alert, Divider } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import api from '../../src/api';

export default function TravelogueManagement() {
  const [travelogues, setTravelogues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchTravelogues();
  }, []);

  const fetchTravelogues = async () => {
    setLoading(true);
    try {
      const res = await api.get('/adminTravelogue');
      setTravelogues(res.data.travelogues || []);
    } catch {
      setSnackbar({ open: true, message: 'Failed to fetch travelogues', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    setActionLoading(true);
    try {
      const res = await api.post(`/adminTravelogue/action/${id}`, { action });
      const msg = res?.data?.message || `Travelogue ${action}d successfully`;
      setSnackbar({ open: true, message: msg, severity: 'success' });
      fetchTravelogues();
      setSelected(null);
    } catch (err) {
      const msg = err?.response?.data?.message || `Failed to ${action} travelogue`;
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    { field: '_id', headerName: 'ID', width: 90 },
    { field: 'title', headerName: 'Title', width: 200 },
    {
      field: 'creator',
      headerName: 'Creator',
      width: 160,
      valueGetter: (params) => {
        const row = params?.row;
        if (!row) return 'N/A';
        const guide = row.guideId;
        if (!guide) return 'N/A';
        if (typeof guide === 'object' && guide !== null) {
          return guide.name || guide.email || 'N/A';
        }
        return typeof guide === 'string' ? guide : 'N/A';
      }
    },
    { field: 'status', headerName: 'Status', width: 120, renderCell: (params) => (
      <Chip label={params.value} color={params.value === 'approved' ? 'success' : params.value === 'rejected' ? 'error' : 'warning'} size="small" />
    ) },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" color="info" onClick={() => setSelected(params.row)}>View</Button>
          {params.row.status === 'pending' && <>
            <Button size="small" variant="outlined" color="success" onClick={() => handleAction(params.row._id, 'approve')}>Approve</Button>
            <Button size="small" variant="outlined" color="error" onClick={() => handleAction(params.row._id, 'reject')}>Reject</Button>
          </>}
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ p: { xs: 1, md: 4 }, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Paper elevation={1} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, mb: 4, maxWidth: 1200, mx: 'auto' }}>
        <Typography variant="h5" fontWeight={700} color="text.primary" gutterBottom>
          Travelogue Management
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <DataGrid
          rows={travelogues}
          columns={columns}
          getRowId={row => row._id}
          loading={loading}
          pageSize={8}
          rowsPerPageOptions={[8]}
          disableSelectionOnClick
          sx={{
            border: '1px solid #e0e0e0',
            fontSize: '1rem',
            bgcolor: 'background.paper',
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: '#f5f5f5', color: 'text.primary', fontWeight: 700, fontSize: '1.05rem',
            },
            '& .MuiDataGrid-row': {
              bgcolor: 'background.paper',
              '&:hover': { bgcolor: '#f0f4f8' },
            },
            '& .MuiDataGrid-cell': { borderBottom: '1px solid #f0f0f0' },
            '& .MuiDataGrid-footerContainer': { bgcolor: '#fafafa' },
          }}
        />
      </Paper>
      {/* Travelogue Details Dialog */}
      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ fontWeight: 600, fontSize: '1.2rem', color: 'text.primary', pb: 0 }}>
          Travelogue Details
        </DialogTitle>
        <DialogContent dividers sx={{ bgcolor: 'background.paper', p: { xs: 2, md: 3 } }}>
          {selected && (
            <Box>
              <Typography variant="h6" fontWeight={600} mb={1}>{selected.title}</Typography>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                By: {selected.guideId?.name || 'N/A'} ({selected.guideId?.email || 'N/A'})
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" mb={2}>{selected.description}</Typography>
              <Stack direction="row" spacing={2} mb={2}>
                <Typography variant="body2" color="text.secondary">Destination: <b>{selected.location}</b></Typography>
                <Typography variant="body2" color="text.secondary">Rating: <b>{selected.rating || 'N/A'}</b></Typography>
              </Stack>
              <Stack direction="row" spacing={1} mt={1} mb={2}>
                {selected.tags?.map(tag => <Chip key={tag} label={tag} size="small" color="default" />)}
              </Stack>
              <Typography variant="subtitle1" fontWeight={600} mt={3} mb={1}>Media:</Typography>
              <Grid container spacing={2} mt={0}>
                {selected.images && selected.images.length > 0 ? (
                  selected.images.map((img, idx) => (
                    <Grid item xs={6} sm={4} md={3} key={idx}>
                      <Box
                        sx={{
                          aspectRatio: '4/3',
                          width: '100%',
                          bgcolor: '#fafbfc',
                          border: '1px solid #e0e0e0',
                          borderRadius: 2,
                          boxShadow: 1,
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          transition: 'box-shadow 0.2s',
                          '&:hover': {
                            boxShadow: 4,
                          },
                        }}
                      >
                        {img.match(/\.(mp4|webm|ogg)$/i) ? (
                          <video
                            src={img.startsWith('http') ? img : `http://localhost:3001/${img.replace(/^\/?/, '')}`}
                            controls
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              borderRadius: 12,
                              background: '#eee',
                            }}
                          />
                        ) : (
                          <Box
                            component="img"
                            src={img.startsWith('http') ? img : `http://localhost:3001/${img.replace(/^\/?/, '')}`}
                            alt="media"
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              borderRadius: 2,
                              transition: 'transform 0.2s',
                              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                              '&:hover': {
                                transform: 'scale(1.04)',
                              },
                              background: '#eee',
                            }}
                            onError={e => {
                              if (!e.target.dataset.fallback) {
                                e.target.dataset.fallback = 'true';
                                e.target.src = '/no-image-fallback.png';
                              }
                            }}
                          />
                        )}
                      </Box>
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}><Typography color="text.secondary">No media uploaded.</Typography></Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSelected(null)} variant="outlined" color="primary">Close</Button>
          {selected?.status === 'pending' && <>
            <Button onClick={() => handleAction(selected._id, 'approve')} color="success" variant="contained" disabled={actionLoading}>Approve</Button>
            <Button onClick={() => handleAction(selected._id, 'reject')} color="error" variant="contained" disabled={actionLoading}>Reject</Button>
          </>}
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
