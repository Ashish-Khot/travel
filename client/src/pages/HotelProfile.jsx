

import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Paper, Grid, TextField, InputAdornment, Button, Chip, Avatar, IconButton, CircularProgress, Alert, Snackbar } from "@mui/material";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadIcon from "@mui/icons-material/CloudUpload";
import api from "../api";

export default function HotelProfile() {

  // Demo amenities list
  const allAmenities = [
    { label: "Wi-Fi", value: "Wi-Fi" },
    { label: "AC", value: "AC" },
    { label: "Parking", value: "Parking" },
    { label: "Restaurant", value: "Restaurant" },
  ];


  // TODO: Replace with actual userId from auth context
  const userId = localStorage.getItem("userId");

  const [profile, setProfile] = useState({
    name: "Test Hotel Update",
    email: "info@traveloguegrand.com",
    phone: "+1 (305) 555-0123",
    address: "Updated Address",
    amenities: ["Wi-Fi", "Parking"],
    images: [],
  });
  const [editing, setEditing] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [alert, setAlert] = useState({ open: false, type: 'success', message: '' });
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef();

  // Fetch full hotel profile from backend
  const fetchProfile = async () => {
    if (!userId) return;
    try {
      const res = await api.get(`/hotel/profile/${userId}`);
      setProfile({
        name: res.data.name || '',
        email: res.data.email || '',
        phone: res.data.phone || '',
        address: res.data.address || '',
        amenities: res.data.amenities || [],
        images: res.data.images || []
      });
    } catch (err) {
      setProfile({ name: '', email: '', phone: '', address: '', amenities: [], images: [] });
    }
  };
  useEffect(() => { fetchProfile(); }, [userId]);

  const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });
  const handleAmenityToggle = (amenity) => {
    setProfile((prev) => {
      const exists = prev.amenities.includes(amenity);
      const newAmenities = exists
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity];
      return { ...prev, amenities: newAmenities };
    });
  };
  // Add image by URL (persist to backend)
  const handleAddImage = async () => {
    if (!newImageUrl.trim() || !userId) return;
    setUploading(true);
    try {
      await api.post(`/hotel/images/url/${userId}`, { url: newImageUrl });
      setNewImageUrl("");
      await fetchProfile();
      setAlert({ open: true, type: 'success', message: 'Image URL added successfully.' });
    } catch (err) {
      setAlert({ open: true, type: 'error', message: err?.response?.data?.error || 'Failed to add image URL.' });
    }
    setUploading(false);
  };

  // Upload image file (persist to backend)
  const handleUploadImage = async (e) => {
    if (!e.target.files || !e.target.files[0] || !userId) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("image", e.target.files[0]);
    try {
      await api.post(`/hotel/images/upload/${userId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchProfile();
      setAlert({ open: true, type: 'success', message: 'Image uploaded successfully.' });
    } catch (err) {
      setAlert({ open: true, type: 'error', message: err?.response?.data?.error || 'Failed to upload image.' });
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Remove image (persist to backend)
  const handleRemoveImage = async (idx) => {
    if (!userId) return;
    const url = profile.images[idx];
    setUploading(true);
    try {
      await api.delete(`/hotel/images/${userId}`, { data: { url } });
      await fetchProfile();
      setAlert({ open: true, type: 'success', message: 'Image removed.' });
    } catch (err) {
      setAlert({ open: true, type: 'error', message: err?.response?.data?.error || 'Failed to remove image.' });
    }
    setUploading(false);
  };

  // Save all profile changes
  const handleSave = async () => {
    if (!userId) {
      setAlert({ open: true, type: 'error', message: 'User not logged in.' });
      return;
    }
    setSaving(true);
    console.log('Saving profile:', profile);
    try {
      const res = await api.put(`/hotel/profile/${userId}`,
        {
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          address: profile.address,
          amenities: profile.amenities,
          images: profile.images
        }
      );
      setProfile(res.data);
      setAlert({ open: true, type: 'success', message: 'Profile saved successfully.' });
      setEditing(false);
    } catch (err) {
      setAlert({ open: true, type: 'error', message: err?.response?.data?.error || 'Failed to save profile.' });
      setSaving(false);
    }
    setSaving(false);
  };

  return (
    <Box>
      <Snackbar open={alert.open} autoHideDuration={4000} onClose={() => setAlert({ ...alert, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setAlert({ ...alert, open: false })} severity={alert.type} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
      <Typography variant="h4" fontWeight={700} mb={1}>
        Hotel Profile
      </Typography>
      <Typography color="text.secondary" mb={3}>
        Manage your hotel information and amenities
      </Typography>
      <Paper elevation={2} sx={{ p: 4, borderRadius: 3, maxWidth: 950 }}>
        {/* Basic Info */}
        <Typography variant="h6" fontWeight={600} mb={2}>Basic Information</Typography>
        <Grid container spacing={3} mb={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Hotel Name"
              name="name"
              value={profile.name}
              onChange={handleChange}
              InputProps={{ startAdornment: <InputAdornment position="start"><AccountBoxIcon /></InputAdornment> }}
              sx={{ mb: 2 }}
              disabled={!editing}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment> }}
              sx={{ mb: 2 }}
              disabled={!editing}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Contact Number"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon /></InputAdornment> }}
              sx={{ mb: 2 }}
              disabled={!editing}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={profile.address}
              onChange={handleChange}
              InputProps={{ startAdornment: <InputAdornment position="start"><LocationOnIcon /></InputAdornment> }}
              sx={{ mb: 2 }}
              disabled={!editing}
            />
          </Grid>
        </Grid>

        {/* Amenities Section */}
        <Typography variant="h6" fontWeight={600} mb={1}>Amenities</Typography>
        <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
          {allAmenities.map((a) => (
            <Button
              key={a.value}
              variant={profile.amenities.includes(a.value) ? "contained" : "outlined"}
              color={profile.amenities.includes(a.value) ? "success" : "inherit"}
              sx={{ minWidth: 140, borderRadius: 2, fontWeight: 500, fontSize: 18, py: 2 }}
              onClick={editing ? () => handleAmenityToggle(a.value) : undefined}
              disabled={!editing}
              startIcon={a.icon}
            >
              {a.label}
            </Button>
          ))}
        </Box>

        {/* Hotel Images Section */}
        <Typography variant="h6" fontWeight={600} mb={1}>Hotel Images</Typography>
        <Box display="flex" alignItems="center" mb={2}>
          <Box display="flex" gap={2} flexWrap="wrap" sx={{ overflowX: 'auto', py: 1 }}>
            {profile.images.length === 0 && !editing && (
              <Typography color="text.secondary" sx={{ px: 2, py: 4 }}>
                No images uploaded yet.
              </Typography>
            )}
            {profile.images.map((img, idx) => {
              // If image is a local upload, prepend backend URL
              const isLocal = img.startsWith('/uploads/');
              const src = isLocal ? `http://localhost:3001${img}` : img;
              return (
                <Box key={idx} sx={{ position: 'relative', width: 180, height: 120, borderRadius: 2, overflow: 'hidden', boxShadow: 1 }}>
                  <img src={src} alt="hotel" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {editing && (
                    <IconButton size="small" sx={{ position: 'absolute', top: 6, right: 6, bgcolor: 'rgba(255,255,255,0.8)' }} onClick={() => handleRemoveImage(idx)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  )}
                </Box>
              );
            })}
            {uploading && <Box display="flex" alignItems="center" justifyContent="center" sx={{ width: 60 }}><CircularProgress size={28} /></Box>}
          </Box>
          {editing && (
            <Box ml={3} display="flex" alignItems="center" gap={1}>
              <TextField
                size="small"
                label="Add Image URL"
                value={newImageUrl}
                onChange={e => setNewImageUrl(e.target.value)}
                sx={{ minWidth: 200 }}
                disabled={uploading}
              />
              <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={handleAddImage} disabled={uploading}>
                Add Image URL
              </Button>
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                ref={fileInputRef}
                onChange={handleUploadImage}
                disabled={uploading}
              />
              <Button
                variant="contained"
                color="primary"
                startIcon={<UploadIcon />}
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                disabled={uploading}
              >
                Upload Image
              </Button>
            </Box>
          )}
        </Box>

        {/* Save/Edit Button */}
        <Box display="flex" justifyContent="flex-end" mt={4}>
          {editing ? (
            <Button variant="contained" color="success" size="large" sx={{ px: 4, fontWeight: 600 }} onClick={handleSave} disabled={saving}>
              {saving ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
            </Button>
          ) : (
            <Button variant="contained" color="primary" size="large" sx={{ px: 4, fontWeight: 600 }} onClick={() => setEditing(true)} startIcon={<EditIcon />}>
              Edit Profile
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
