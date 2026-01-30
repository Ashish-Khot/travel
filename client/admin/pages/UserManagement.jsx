import React, { useEffect, useState } from 'react';
import api from '../../src/api';
import {
  Box, Typography, Paper, Button, TextField, InputAdornment, MenuItem, Select, FormControl, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Grid
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';


import GuideInfoDialog from '../components/GuideInfoDialog';

const roleColors = {
  tourist: { label: 'tourist', color: 'primary', sx: { bgcolor: '#e0e7ff', color: '#2563eb', fontWeight: 600 } },
  guide: { label: 'guide', color: 'success', sx: { bgcolor: '#d1fae5', color: '#059669', fontWeight: 600 } },
  hotel: { label: 'hotel', color: 'secondary', sx: { bgcolor: '#ede9fe', color: '#7c3aed', fontWeight: 600 } },
  hospital: { label: 'hospital', color: 'error', sx: { bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 600 } },
};
const statusColors = {
  pending: { label: 'pending', color: 'warning', sx: { bgcolor: '#fef9c3', color: '#b45309', fontWeight: 600 } },
  active: { label: 'active', color: 'success', sx: { bgcolor: '#d1fae5', color: '#059669', fontWeight: 600 } },
  disabled: { label: 'disabled', color: 'default', sx: { bgcolor: '#f3f4f6', color: '#6b7280', fontWeight: 600 } },
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // user object (any role)
  const [guideInfo, setGuideInfo] = useState(null);
  const [guideLoading, setGuideLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  // Open dialog and fetch guide info for guides, or show basic info for others
  const handleEditUser = async (user) => {
    setSelectedUser(user);
    setDialogOpen(true);
    setGuideInfo(null);
    if (user.role === 'guide' && user.guideId) {
      setGuideLoading(true);
      try {
        // Fetch guide info by userId
        const res = await api.get(`/guide/profile/${user._id}`);
        setGuideInfo(res.data.guide);
      } catch (err) {
        setGuideInfo(null);
      }
      setGuideLoading(false);
    } else {
      setGuideLoading(false);
      setGuideInfo(null);
    }
  };

  // Refetch users from backend
  const refetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.users || []);
    } catch (err) {
      setUsers([]);
    }
    setLoading(false);
  };

  // Approve guide from dialog
  const handleApproveGuide = async () => {
    if (!guideInfo?._id) return;
    setApproving(true);
    try {
      const res = await api.post(`/adminGuide/action/${guideInfo._id}`, { action: 'approve' });
      if (res?.data?.message === 'Guide approved') {
        alert('Guide approved successfully.');
        setDialogOpen(false);
        await refetchUsers();
      } else {
        alert('Failed to approve guide.');
      }
    } catch (err) {
      alert('Failed to approve guide.');
    }
    setApproving(false);
  };

  // Reject guide from dialog
  const handleRejectGuide = async () => {
    if (!guideInfo?._id) return;
    setRejecting(true);
    try {
      const res = await api.post(`/adminGuide/action/${guideInfo._id}`, { action: 'reject' });
      if (res?.data?.message === 'Guide rejected') {
        alert('Guide rejected.');
        // Keep dialog open so admin can still see info
        await refetchUsers();
        // Optionally update guideInfo state to reflect rejection
        setGuideInfo(prev => prev ? { ...prev, rejected: true, approved: false } : prev);
      } else {
        alert('Failed to reject guide.');
      }
    } catch (err) {
      alert('Failed to reject guide.');
    }
    setRejecting(false);
  };

  // Delete user
  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete user ${user.name}? This action cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${user._id}`);
      setUsers(prev => prev.filter(u => u._id !== user._id));
    } catch (err) {
      alert('Failed to delete user.');
    }
  };

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        const res = await api.get('/admin/users');
        setUsers(res.data.users || []);
      } catch (err) {
        setUsers([]);
      }
      setLoading(false);
    }
    fetchUsers();
  }, []);

  // Filtering logic
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <Box sx={{ p: { xs: 1, md: 4 }, background: 'var(--bg)' }}>
      <Typography variant="h3" fontWeight={900} sx={{ mb: 1 }}>
        User Management
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Manage tourists, guides, hotels, and hospitals
      </Typography>
      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs={12} md={6} lg={7}>
          <TextField
            fullWidth
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              sx: { borderRadius: 2, background: '#fff' },
            }}
            size="medium"
          />
        </Grid>
        <Grid item xs={6} md={3} lg={2}>
          <FormControl fullWidth size="medium">
            <Select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} sx={{ borderRadius: 2, background: '#fff' }}>
              <MenuItem value="all">All Roles</MenuItem>
              <MenuItem value="tourist">Tourist</MenuItem>
              <MenuItem value="guide">Guide</MenuItem>
              <MenuItem value="hotel">Hotel</MenuItem>
              <MenuItem value="hospital">Hospital</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} md={3} lg={2}>
          <FormControl fullWidth size="medium">
            <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} sx={{ borderRadius: 2, background: '#fff' }}>
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="disabled">Disabled</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={12} lg={1} sx={{ textAlign: { xs: 'right', md: 'right' } }}>
          <Button variant="contained" startIcon={<AddIcon />} sx={{ borderRadius: 2, fontWeight: 700, background: '#0f172a', color: '#fff', px: 3, py: 1.5, boxShadow: 'none', textTransform: 'none' }}>
            Add User
          </Button>
        </Grid>
      </Grid>
      <Paper elevation={1} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: 16 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 16 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 16 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 16 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 16 }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 16 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">Loading...</TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">No users found.</TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user, idx) => (
                  <TableRow key={user._id || idx}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip label={roleColors[user.role]?.label || user.role} sx={{ ...roleColors[user.role]?.sx, fontSize: 15, px: 2, py: 0.5, borderRadius: 2 }} />
                    </TableCell>
                    <TableCell>
                      <Chip label={statusColors[user.status]?.label || user.status} sx={{ ...statusColors[user.status]?.sx, fontSize: 15, px: 2, py: 0.5, borderRadius: 2 }} />
                    </TableCell>
                    <TableCell>{user.location || '-'}</TableCell>
                    <TableCell>
                      {/* Edit button for all users */}
                      <IconButton color="primary" sx={{ mr: 1 }} onClick={() => handleEditUser(user)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDeleteUser(user)}><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    {/* Guide Info Dialog (also used for non-guides) */}
    <GuideInfoDialog
      open={dialogOpen}
      onClose={() => setDialogOpen(false)}
      guide={selectedUser?.role === 'guide' ? guideInfo : selectedUser}
      loading={guideLoading}
      onApprove={handleApproveGuide}
      onReject={handleRejectGuide}
      approving={approving}
      rejecting={rejecting}
      isGuide={selectedUser?.role === 'guide'}
    />
  </Box>
  );
}
