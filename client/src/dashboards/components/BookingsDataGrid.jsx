import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '../../common/Button';
import Modal from '@mui/material/Modal';
import ChatPanel from './ChatPanel';


export default function BookingsDataGrid({ bookings = [], onStatusChange }) {
  const [openChat, setOpenChat] = useState(false);
  const [chatBookingId, setChatBookingId] = useState(null);
  const [openReviewDialog, setOpenReviewDialog] = useState(false);
  const [reviewMsg, setReviewMsg] = useState('Thank you for exploring Jaipur with me 😊\nIf you have a moment, I’d love to hear your feedback.');
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [sending, setSending] = useState(false);
  const api = require('../../api').default;

  return (
    <Box>
      {bookings.length === 0 ? (
        <Typography>No bookings found.</Typography>
      ) : (
        bookings.map((booking) => (
          <Box key={booking._id} sx={{ bgcolor: '#fff', borderRadius: 3, boxShadow: 2, p: 3, mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography fontWeight={700} fontSize={20} mb={1}>{booking.destination || 'Tour'}</Typography>
              <Chip label={booking.status} color={booking.status === 'pending' ? 'warning' : booking.status === 'confirmed' ? 'success' : booking.status === 'completed' ? 'info' : 'default'} size="small" sx={{ mb: 1 }} />
              <Typography fontSize={15} color="text.secondary">{new Date(booking.date).toLocaleDateString()} </Typography>
              <Typography fontSize={15} color="text.secondary">Tourist: {booking.touristId?.name || booking.touristId}</Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography fontWeight={700} color="green" fontSize={22}>${booking.price || 0}</Typography>
              <Typography fontSize={13} color="text.secondary">Total Price</Typography>
              <Box mt={2} sx={{ display: 'flex', gap: 1 }}>
                <Button onClick={() => { setChatBookingId(booking._id); setOpenChat(true); }} className="bg-green-600 hover:bg-green-700">Chat</Button>
                {/* Show review request button for completed bookings that haven't sent a review request */}
                {booking.status === 'completed' && !booking.reviewRequestSent && (
                  <Button onClick={() => { setSelectedBookingId(booking._id); setOpenReviewDialog(true); setReviewMsg('Thank you for exploring Jaipur with me 😊\nIf you have a moment, I’d love to hear your feedback.'); }} className="bg-blue-600 hover:bg-blue-700">Request Review</Button>
                )}
                {/* Show sent status if already sent */}
                {booking.status === 'completed' && booking.reviewRequestSent && (
                  <Chip label="Review Requested" color="info" size="small" />
                )}
              </Box>
            </Box>
          </Box>
        ))
      )}
      {/* Chat Modal */}
      <Modal open={openChat} onClose={() => setOpenChat(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: '#f8fdf7', borderRadius: 2, boxShadow: 4, p: 0, minWidth: 700, minHeight: 500 }}>
          {openChat && chatBookingId && (
            <ChatPanel bookingId={chatBookingId} />
          )}
        </Box>
      </Modal>
      {/* Review Request Dialog */}
      <Dialog open={openReviewDialog} onClose={() => setOpenReviewDialog(false)}>
        <DialogTitle>Send Review Request</DialogTitle>
        <DialogContent>
          <TextField
            label="Message to Tourist"
            multiline
            minRows={3}
            fullWidth
            value={reviewMsg}
            onChange={e => setReviewMsg(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReviewDialog(false)}>Cancel</Button>
          <Button
            onClick={async () => {
              setSending(true);
              try {
                await api.put(`/booking/review-request/${selectedBookingId}`, { message: reviewMsg });
                setOpenReviewDialog(false);
                setSelectedBookingId(null);
                if (onStatusChange) onStatusChange();
              } catch (err) {
                alert('Failed to send review request');
              } finally {
                setSending(false);
              }
            }}
            disabled={sending}
            variant="contained"
            color="primary"
          >
            Send Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
