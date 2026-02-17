
import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton } from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import api from "../api";


// TODO: Replace with actual hotelId from auth/user context
const getHotelId = () => {
  // Example: return localStorage.getItem('hotelId')
  // For now, return a placeholder or fetch from user context
  return localStorage.getItem('userId');
};


export default function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [open, setOpen] = useState(false);
  const [editIdx, setEditIdx] = useState(-1);
  const [form, setForm] = useState({ type: '', price: '', total: '', available: '', status: 'Available' });
  const [loading, setLoading] = useState(false);

  // Fetch rooms from backend
  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const hotelId = getHotelId();
        if (!hotelId) return;
        const res = await api.get(`/room/hotel/${hotelId}`);
        setRooms(res.data);
      } catch (err) {
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);


  const handleOpen = (idx = -1) => {
    setEditIdx(idx);
    if (idx >= 0) setForm(rooms[idx]);
    else setForm({ type: '', price: '', total: '', available: '', status: 'Available' });
    setOpen(true);
  };
  const handleClose = () => setOpen(false);
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // Save (add or update) room
  const handleSave = async () => {
    const hotelId = getHotelId();
    if (!hotelId) return;
    try {
      if (editIdx >= 0) {
        // Update
        const updated = await api.put(`/room/${rooms[editIdx]._id}`, form);
        const newRooms = [...rooms];
        newRooms[editIdx] = updated.data;
        setRooms(newRooms);
      } else {
        // Add
        const created = await api.post(`/room/hotel/${hotelId}`, form);
        setRooms([...rooms, created.data]);
      }
    } catch (err) {
      // handle error
    }
    setOpen(false);
  };

  // Delete room
  const handleDelete = async idx => {
    try {
      await api.delete(`/room/${rooms[idx]._id}`);
      setRooms(rooms.filter((_, i) => i !== idx));
    } catch (err) {
      // handle error
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={1}>Room Management</Typography>
      <Typography color="text.secondary" mb={3}>Manage your hotel rooms and pricing</Typography>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Add Room
        </Button>
      </Box>
      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 700 }}>ROOM TYPE</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>PRICE/NIGHT</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>TOTAL ROOMS</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>AVAILABLE</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>STATUS</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6}>Loading...</TableCell></TableRow>
            ) : rooms.length === 0 ? (
              <TableRow><TableCell colSpan={6}>No rooms found.</TableCell></TableRow>
            ) : (
              rooms.map((room, idx) => (
                <TableRow key={room._id || room.type}>
                  <TableCell>{room.type}</TableCell>
                  <TableCell>${room.price}</TableCell>
                  <TableCell>{room.total}</TableCell>
                  <TableCell>{room.available}</TableCell>
                  <TableCell>
                    <Chip label={room.status} color={room.status === 'Full' ? 'error' : 'success'} variant={room.status === 'Full' ? 'filled' : 'outlined'} />
                  </TableCell>
                  <TableCell>
                    <IconButton color="info" onClick={() => handleOpen(idx)}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(idx)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editIdx >= 0 ? 'Edit Room' : 'Add Room'}</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Room Type" name="type" value={form.type} onChange={handleChange} fullWidth />
          <TextField margin="dense" label="Price/Night" name="price" value={form.price} onChange={handleChange} fullWidth type="number" />
          <TextField margin="dense" label="Total Rooms" name="total" value={form.total} onChange={handleChange} fullWidth type="number" />
          <TextField margin="dense" label="Available" name="available" value={form.available} onChange={handleChange} fullWidth type="number" />
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
