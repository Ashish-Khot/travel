import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Chip, Box, CircularProgress } from '@mui/material';

export default function GuideInfoDialog({ open, onClose, guide, loading, onApprove, onReject, approving, rejecting, isGuide }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isGuide ? 'Guide Information' : 'User Information'}</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        ) : guide ? (
          <Box>
            <Typography variant="h6" fontWeight={700}>{isGuide ? guide.userId?.name : guide.name}</Typography>
            <Typography color="text.secondary" mb={1}>{isGuide ? guide.userId?.email : guide.email}</Typography>
            {isGuide && guide.rejected && (
              <Chip label="Rejected" color="error" sx={{ mb: 2 }} />
            )}
            {isGuide && !guide.rejected && (
              <Chip label={guide.approved ? 'Approved' : 'Pending'} color={guide.approved ? 'success' : 'warning'} sx={{ mb: 2 }} />
            )}
            {isGuide ? (
              <>
                <Typography><b>Bio:</b> {guide.bio || '-'}</Typography>
                <Typography><b>Experience:</b> {guide.experienceYears || 0} years</Typography>
                <Typography><b>Languages:</b> {guide.languages?.join(', ') || '-'}</Typography>
                <Typography><b>Phone:</b> {guide.phone || '-'}</Typography>
                <Typography><b>Country:</b> {guide.userId?.country || '-'}</Typography>
                <Typography><b>Ratings:</b> {guide.ratings || 0}</Typography>
                <Typography><b>Earnings:</b> {guide.earnings || 0}</Typography>
              </>
            ) : (
              <>
                <Typography><b>Role:</b> {guide.role}</Typography>
                <Typography><b>Status:</b> {guide.status}</Typography>
                <Typography><b>Location:</b> {guide.location || '-'}</Typography>
                <Typography><b>Phone:</b> {guide.phone || '-'}</Typography>
                <Typography><b>Country:</b> {guide.country || '-'}</Typography>
              </>
            )}
          </Box>
        ) : (
          <Typography>No user info found.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        {isGuide && !guide?.approved && (
          <>
            <Button onClick={onReject} color="error" disabled={rejecting}>{rejecting ? 'Rejecting...' : 'Reject'}</Button>
            <Button onClick={onApprove} color="success" variant="contained" disabled={approving}>{approving ? 'Approving...' : 'Approve'}</Button>
          </>
        )}
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
