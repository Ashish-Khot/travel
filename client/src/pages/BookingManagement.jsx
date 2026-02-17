import React, { useState } from "react";
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

const initialBookings = [
  { guest: "John Doe", room: "Double Room", date: "2026-02-15", status: "Confirmed" },
  { guest: "Jane Smith", room: "Deluxe Suite", date: "2026-02-18", status: "Pending" },
  { guest: "Alex Lee", room: "Presidential Suite", date: "2026-02-20", status: "Cancelled" },
];

export default function BookingManagement() {
  const [bookings, setBookings] = useState(initialBookings);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ guest: '', room: '', date: '', status: 'Pending' });
  const [editIdx, setEditIdx] = useState(-1);

  const handleOpen = (idx = -1) => {
    setEditIdx(idx);
    if (idx >= 0) setForm(bookings[idx]);
    else setForm({ guest: '', room: '', date: '', status: 'Pending' });
    setOpen(true);
  };
  const handleClose = () => setOpen(false);
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSave = () => {
    if (editIdx >= 0) {
      const updated = [...bookings];
      updated[editIdx] = form;
      setBookings(updated);
    } else {
      setBookings([...bookings, form]);
    }
    setOpen(false);
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={1}>Booking Management</Typography>
      <Typography color="text.secondary" mb={3}>View and manage hotel bookings</Typography>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button variant="contained" color="primary" startIcon={<CalendarMonthIcon />} onClick={() => handleOpen()}>
          Add Booking
        </Button>
      </Box>
      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 700 }}>Guest</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Room</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.map((booking, idx) => (
              <TableRow key={idx}>
                <TableCell>{booking.guest}</TableCell>
                <TableCell>{booking.room}</TableCell>
                <TableCell>{booking.date}</TableCell>
                <TableCell>{booking.status}</TableCell>
                <TableCell>
                  <Button size="small" color="info" onClick={() => handleOpen(idx)}>Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editIdx >= 0 ? 'Edit Booking' : 'Add Booking'}</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Guest" name="guest" value={form.guest} onChange={handleChange} fullWidth />
          <TextField margin="dense" label="Room" name="room" value={form.room} onChange={handleChange} fullWidth />
          <TextField margin="dense" label="Date" name="date" value={form.date} onChange={handleChange} fullWidth type="date" InputLabelProps={{ shrink: true }} />
          <TextField margin="dense" label="Status" name="status" value={form.status} onChange={handleChange} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
