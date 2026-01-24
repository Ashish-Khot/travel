import React, { useEffect, useState, useRef } from 'react';
import api from '../../api';
import { io } from 'socket.io-client';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Modal from '@mui/material/Modal';
import ChatPanel from './ChatPanel';
import TextField from '@mui/material/TextField';
import Button from '../../common/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

export default function MyBookings() {
  const [openChat, setOpenChat] = useState(false);
  const [chatBookingId, setChatBookingId] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [editFields, setEditFields] = useState({ destination: '', date: '', price: 0 });
  const [deleteBookingId, setDeleteBookingId] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Open edit booking modal
  const handleOpenEdit = (booking) => {
    setSelectedBooking(booking);
    setEditFields({
      destination: booking.destination || '',
      date: booking.date ? new Date(booking.date).toISOString().slice(0, 10) : '',
      price: booking.price || 0
    });
    setOpenEdit(true);
  };

  // Submit booking edit
  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/booking/${selectedBooking._id}`, {
        destination: editFields.destination,
        date: editFields.date,
        price: editFields.price
      });
      setSnackbar({ open: true, message: 'Booking updated successfully!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update booking.', severity: 'error' });
    } finally {
      setOpenEdit(false);
      setSelectedBooking(null);
      // Refresh bookings
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const res = await api.get(`/booking/tourist/${user._id}`);
      setBookings(res.data.bookings || []);
    }
  };

  // Open delete confirmation
  const handleOpenDelete = (bookingId) => {
    setDeleteBookingId(bookingId);
    setOpenDelete(true);
  };

  // Confirm delete booking
  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/booking/${deleteBookingId}`);
      setSnackbar({ open: true, message: 'Booking deleted successfully!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete booking.', severity: 'error' });
    } finally {
      setOpenDelete(false);
      setDeleteBookingId(null);
      // Refresh bookings
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const res = await api.get(`/booking/tourist/${user._id}`);
      setBookings(res.data.bookings || []);
    }
  };


  useEffect(() => {
    let socket;
    async function fetchBookings() {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user._id) return;
        const res = await api.get(`/booking/tourist/${user._id}`);
        setBookings(res.data.bookings || []);
        // Setup socket connection for real-time updates
        if (!socket) {
          socket = io('http://localhost:3001');
          socket.emit('joinTouristRoom', { touristId: user._id });
          socket.on('bookingUpdate', (data) => {
            if (data && data.touristId === user._id) {
              fetchBookings();
            }
          });
        }
      } catch (err) {
        setBookings([]);
      }
    }
    fetchBookings();
    return () => {
      if (socket) {
        socket.off('bookingUpdate');
        socket.disconnect();
      }
    };
  }, []);



  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Typography variant="h4" fontWeight={700} mb={2}>
        My Bookings
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" mb={3}>
        Track and manage your tour bookings
      </Typography>
      {bookings.length === 0 ? (
        <Typography>No bookings found.</Typography>
      ) : (
        <>
          {bookings.map((booking) => (
            <Box key={booking._id} sx={{ bgcolor: '#fff', borderRadius: 3, boxShadow: 2, p: 3, mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography fontWeight={700} fontSize={20} mb={1}>{booking.destination || 'Tour'}</Typography>
                <Chip label={booking.status} color={booking.status === 'pending' ? 'warning' : booking.status === 'confirmed' ? 'success' : booking.status === 'completed' ? 'info' : 'default'} size="small" sx={{ mb: 1 }} />
                <Typography fontSize={15} color="text.secondary">{new Date(booking.date).toLocaleDateString()} </Typography>
                <Typography fontSize={15} color="text.secondary">Guide: {booking.guideId?.name || booking.guideId}</Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography fontWeight={700} color="green" fontSize={22}>${booking.price || 0}</Typography>
                <Typography fontSize={13} color="text.secondary">Total Price</Typography>
                <Box mt={2} sx={{ display: 'flex', gap: 1 }}>
                  <Button onClick={() => { setChatBookingId(booking._id); setOpenChat(true); }} className="bg-green-600 hover:bg-green-700">Chat</Button>
                  {(booking.status === 'pending' || booking.status === 'cancelled') && (
                    <>
                      <Button onClick={() => handleOpenEdit(booking)} className="bg-yellow-500 hover:bg-yellow-600">Edit</Button>
                      <Button onClick={() => handleOpenDelete(booking._id)} className="bg-red-600 hover:bg-red-700">Delete</Button>
                    </>
                  )}
                </Box>
              </Box>
            </Box>
          ))}
          {/* Chat Modal */}
          <Modal open={openChat} onClose={() => setOpenChat(false)}>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: '#f8fdf7', borderRadius: 2, boxShadow: 4, p: 0, minWidth: 700, minHeight: 500 }}>
              {openChat && chatBookingId && (
                <ChatPanel bookingId={chatBookingId} />
              )}
            </Box>
          </Modal>
          {/* Edit Booking Modal */}
          <Modal open={openEdit} onClose={() => setOpenEdit(false)}>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: '#fff', borderRadius: 2, boxShadow: 4, p: 3, minWidth: 320 }}>
              <Typography variant="h6" mb={2}>Edit Booking</Typography>
              <form onSubmit={handleSubmitEdit}>
                <TextField label="Destination" fullWidth margin="normal" value={editFields.destination} onChange={e => setEditFields(f => ({ ...f, destination: e.target.value }))} />
                <TextField label="Date" type="date" fullWidth margin="normal" value={editFields.date} onChange={e => setEditFields(f => ({ ...f, date: e.target.value }))} InputLabelProps={{ shrink: true }} />
                <TextField label="Price" type="number" fullWidth margin="normal" value={editFields.price} onChange={e => setEditFields(f => ({ ...f, price: e.target.value }))} />
                <Box mt={2} sx={{ display: 'flex', gap: 2 }}>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Save</Button>
                  <Button onClick={() => setOpenEdit(false)} className="bg-gray-400 hover:bg-gray-500">Cancel</Button>
                </Box>
              </form>
            </Box>
          </Modal>

          {/* Delete Booking Modal */}
          <Modal open={openDelete} onClose={() => setOpenDelete(false)}>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: '#fff', borderRadius: 2, boxShadow: 4, p: 3, minWidth: 320 }}>
              <Typography variant="h6" mb={2}>Delete Booking</Typography>
              <Typography mb={3}>Are you sure you want to delete this booking?</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">Delete</Button>
                <Button onClick={() => setOpenDelete(false)} className="bg-gray-400 hover:bg-gray-500">Cancel</Button>
              </Box>
            </Box>
          </Modal>

          {/* Snackbar for user feedback */}
          <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
            <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
              {snackbar.message}
            </Alert>
          </Snackbar>
        </>
      )}
    </Box>
  );
}
