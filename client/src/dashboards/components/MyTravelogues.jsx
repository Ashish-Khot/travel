import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Grid, Card, CardContent, Stack, Chip, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Menu, MenuItem
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import API from '../../api';

const statusColors = {
  approved: { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', label: 'Approved' },
  pending: { bg: 'rgba(251, 191, 36, 0.1)', text: '#f59e0b', label: 'Pending' },
  rejected: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', label: 'Rejected' },
  draft: { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280', label: 'Draft' }
};

export default function MyTravelogues() {
  const [travelogues, setTravelogues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedTravelogue, setSelectedTravelogue] = useState(null);
  const [error, setError] = useState('');
  const userId = JSON.parse(localStorage.getItem('user') || '{}')._id;

  useEffect(() => {
    fetchTravelogues();
  }, [statusFilter, page]);

  const fetchTravelogues = async () => {
    try {
      setLoading(true);
      setError('');
      const status = statusFilter !== 'all' ? statusFilter : null;
      const query = status ? `?status=${status}&page=${page}&limit=12` : `?page=${page}&limit=12`;
      const response = await API.get(`/travelogue/user/${userId}${query}`);
      
      setTravelogues(response.data.travelogues || []);
      setTotalPages(response.data.pages || 1);
    } catch (err) {
      setError('Failed to fetch travelogues');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/travelogue/${deleteConfirm._id}`);
      setTravelogues(travelogues.filter(t => t._id !== deleteConfirm._id));
      setDeleteConfirm(null);
      setMenuAnchor(null);
    } catch (err) {
      setError('Failed to delete travelogue');
      console.error(err);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#F8FAFB', pb: 4 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, sm: 2.5, md: 3 } }}>
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(79,138,139,0.12)',
            bgcolor: '#ffffff',
            mt: 1.5,
            mb: 3,
            p: { xs: 2, sm: 3, md: 4 }
          }}
        >
          <Typography
            variant="h4"
            fontWeight={800}
            color="#1a1a1a"
            mb={2}
            sx={{ letterSpacing: '0.5px' }}
          >
            My Travelogues
          </Typography>
          <Typography variant="body1" color="#6B7280" mb={3}>
            Manage and track all your travel stories
          </Typography>

          {/* Status Filters */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} flexWrap="wrap">
            {['all', 'draft', 'pending', 'approved', 'rejected'].map(status => (
              <Button
                key={status}
                variant={statusFilter === status ? 'contained' : 'outlined'}
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'capitalize',
                  fontWeight: 600,
                  ...(statusFilter === status ? {
                    background: 'linear-gradient(135deg, #4F8A8B 0%, #6BA8AC 100%)',
                    color: '#fff',
                    boxShadow: '0 4px 12px rgba(79,138,139,0.3)'
                  } : {
                    borderColor: '#E5E7EB',
                    color: '#6B7280'
                  })
                }}
              >
                {status}
              </Button>
            ))}
          </Stack>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3, borderRadius: '12px' }}>
            {error}
          </Alert>
        )}

        {/* Loading */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : travelogues.length === 0 ? (
          <Card elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: '16px', border: '2px dashed rgba(79,138,139,0.2)' }}>
            <TrendingUpIcon sx={{ fontSize: 48, color: '#4F8A8B', mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" color="#6B7280" mb={1}>
              No travelogues yet
            </Typography>
            <Typography variant="body2" color="#6B7280" mb={2}>
              Start sharing your travel stories today!
            </Typography>
            <Button
              variant="contained"
              sx={{
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #4F8A8B 0%, #6BA8AC 100%)',
                px: 3,
                py: 1.2,
                fontWeight: 700
              }}
            >
              Create First Travelogue
            </Button>
          </Card>
        ) : (
          <>
            {/* Travelogues Grid */}
            <Grid container spacing={2.5} mb={4}>
              {travelogues.map(travelogue => {
                const statusInfo = statusColors[travelogue.status];
                const thumbnailUrl = travelogue.images && travelogue.images[0]
                  ? (travelogue.images[0].startsWith('http')
                    ? travelogue.images[0]
                    : `http://localhost:3001${travelogue.images[0]}`)
                  : '/no-image.png';

                return (
                  <Grid item xs={12} sm={6} md={4} key={travelogue._id}>
                    <Card
                      elevation={0}
                      sx={{
                        borderRadius: '16px',
                        overflow: 'hidden',
                        border: '1px solid rgba(79,138,139,0.1)',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 12px 32px rgba(79,138,139,0.15)',
                          transform: 'translateY(-4px)'
                        }
                      }}
                    >
                      {/* Thumbnail */}
                      <Box
                        sx={{
                          position: 'relative',
                          paddingBottom: '66.67%',
                          overflow: 'hidden',
                          bgcolor: '#f0f0f0'
                        }}
                      >
                        <Box
                          component="img"
                          src={thumbnailUrl}
                          alt={travelogue.title}
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            e.target.src = '/no-image.png';
                          }}
                        />

                        {/* Status Badge */}
                        <Chip
                          label={statusInfo.label}
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 12,
                            left: 12,
                            zIndex: 2,
                            bgcolor: statusInfo.bg,
                            color: statusInfo.text,
                            fontWeight: 700,
                            fontSize: '0.75rem'
                          }}
                        />

                        {/* Menu Button */}
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTravelogue(travelogue);
                            setMenuAnchor(e.currentTarget);
                          }}
                          sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            zIndex: 2,
                            bgcolor: 'rgba(255,255,255,0.95)',
                            color: '#6B7280',
                            '&:hover': { bgcolor: '#fff' }
                          }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Box>

                      {/* Content */}
                      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                        <Typography
                          variant="h6"
                          fontWeight={700}
                          color="#1a1a1a"
                          mb={1}
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {travelogue.title}
                        </Typography>

                        <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
                          {travelogue.location && (
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <LocationOnIcon sx={{ fontSize: 16, color: '#4F8A8B' }} />
                              <Typography variant="caption" color="#6B7280" fontWeight={600}>
                                {travelogue.location}
                              </Typography>
                            </Stack>
                          )}
                          {travelogue.duration && (
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <CalendarTodayIcon sx={{ fontSize: 16, color: '#4F8A8B' }} />
                              <Typography variant="caption" color="#6B7280" fontWeight={600}>
                                {travelogue.duration}d
                              </Typography>
                            </Stack>
                          )}
                        </Stack>

                        <Typography
                          variant="body2"
                          color="#6B7280"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {travelogue.description}
                        </Typography>
                      </CardContent>

                      {/* Footer Stats */}
                      <Box sx={{ px: 2, py: 1.5, bgcolor: 'rgba(79,138,139,0.02)', borderTop: '1px solid rgba(79,138,139,0.1)' }}>
                        <Stack direction="row" spacing={2} justifyContent="space-around">
                          <Stack alignItems="center">
                            <Typography variant="caption" fontWeight={700} color="#4F8A8B">
                              {travelogue.views || 0}
                            </Typography>
                            <Typography variant="caption" color="#6B7280" fontSize="0.7rem">
                              Views
                            </Typography>
                          </Stack>
                          <Stack alignItems="center">
                            <Typography variant="caption" fontWeight={700} color="#ef4444">
                              {travelogue.likes?.length || 0}
                            </Typography>
                            <Typography variant="caption" color="#6B7280" fontSize="0.7rem">
                              Likes
                            </Typography>
                          </Stack>
                          <Stack alignItems="center">
                            <Typography variant="caption" fontWeight={700} color="#F9ED69">
                              {travelogue.comments?.length || 0}
                            </Typography>
                            <Typography variant="caption" color="#6B7280" fontSize="0.7rem">
                              Comments
                            </Typography>
                          </Stack>
                        </Stack>
                      </Box>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 4 }}>
                <Button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  variant="outlined"
                  sx={{ borderRadius: '10px', borderColor: '#E5E7EB', color: '#6B7280' }}
                >
                  Previous
                </Button>
                <Typography sx={{ alignSelf: 'center', fontWeight: 700, color: '#6B7280' }}>
                  Page {page} of {totalPages}
                </Typography>
                <Button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  variant="outlined"
                  sx={{ borderRadius: '10px', borderColor: '#E5E7EB', color: '#6B7280' }}
                >
                  Next
                </Button>
              </Stack>
            )}
          </>
        )}
      </Box>

      {/* Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        PaperProps={{
          sx: { borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }
        }}
      >
        <MenuItem
          onClick={() => {
            setMenuAnchor(null);
            // Handle edit
          }}
        >
          <EditIcon sx={{ mr: 1.5, color: '#4F8A8B' }} fontSize="small" />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            setDeleteConfirm(selectedTravelogue);
            setMenuAnchor(null);
          }}
        >
          <DeleteIcon sx={{ mr: 1.5, color: '#ef4444' }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deleteConfirm)}
        onClose={() => setDeleteConfirm(null)}
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle fontWeight={700} color="#1a1a1a">
          Delete Travelogue
        </DialogTitle>
        <DialogContent>
          <Typography color="#6B7280">
            Are you sure you want to delete "{deleteConfirm?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setDeleteConfirm(null)}
            sx={{ borderRadius: '10px', borderColor: '#E5E7EB', color: '#6B7280' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleDelete}
            sx={{
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}