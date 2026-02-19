
import React, { useState, useRef, useEffect } from 'react';
import api from '../../api';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Modal from '@mui/material/Modal';
import Divider from '@mui/material/Divider';
import EmailIcon from '@mui/icons-material/EmailOutlined';
import PersonIcon from '@mui/icons-material/PersonOutline';
import PhoneIcon from '@mui/icons-material/PhoneOutlined';
import LanguageIcon from '@mui/icons-material/LanguageOutlined';
import SaveIcon from '@mui/icons-material/SaveAltOutlined';
import PublicIcon from '@mui/icons-material/Public';
import CakeIcon from '@mui/icons-material/CakeOutlined';
import WcIcon from '@mui/icons-material/WcOutlined';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

const languageOptions = ['English', 'Hindi', 'Spanish', 'French', 'German', 'Chinese', 'Other'];
const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];

export default function TouristProfileEdit({ user, onSave }) {
  // State for form fields
  const initialForm = {
    fullName: user?.fullName ?? user?.name ?? '',
    avatar: user?.avatar ?? '',
    dob: user?.dob ?? '',
    gender: user?.gender ?? '',
    language: user?.language ?? '',
    nationality: user?.nationality ?? user?.country ?? '',
    interests: user?.interests ?? '',
    phone: user?.phone ?? user?.mobile ?? '',
  };
  const [form, setForm] = useState(initialForm);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef();
  const [openEdit, setOpenEdit] = useState(false);

  // Helper for avatar
  const getAvatarUrl = (avatar) => {
    if (!avatar) return '';
    if (avatar.startsWith('http://') || avatar.startsWith('https://')) return avatar;
    return `http://localhost:3001${avatar}`;
  };

  // Update form and avatarPreview when user prop changes (e.g. after reload)
  useEffect(() => {
    setForm({
      fullName: user?.fullName ?? user?.name ?? '',
      avatar: user?.avatar ?? '',
      dob: user?.dob ?? '',
      gender: user?.gender ?? '',
      language: user?.language ?? '',
      nationality: user?.nationality ?? user?.country ?? '',
      interests: user?.interests ?? '',
      phone: user?.phone ?? user?.mobile ?? '',
    });
    setAvatarPreview(getAvatarUrl(user?.avatar));
  }, [user]);

  // Handlers
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const userId = user?._id;
      const res = await api.post(`/tourist/avatar/${userId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const avatarUrl = res.data.avatar;
      setAvatarPreview(getAvatarUrl(avatarUrl));
      setForm((prev) => ({ ...prev, avatar: avatarUrl }));
    } catch (err) {
      setError('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      let avatarUrl = form.avatar;
      if (avatarUrl && avatarUrl.startsWith('data:')) {
        avatarUrl = '';
      }
      const payload = {
        fullName: form.fullName,
        avatar: avatarUrl,
        dob: form.dob,
        gender: form.gender,
        language: form.language,
        nationality: form.nationality,
        interests: form.interests,
        phone: form.phone,
      };
      const userId = user?._id;
      const res = await api.put(`/tourist/${userId}`, payload);
      setSuccess(true);
      if (onSave) onSave(res.data);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  // Profile Info Card
  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, justifyContent: 'center', alignItems: 'flex-start', minHeight: '80vh', bgcolor: '#f5f8fc', p: 4 }}>
      {/* Profile Card - Premium Look */}
      <Paper elevation={8} sx={{ minWidth: 360, maxWidth: 420, borderRadius: 6, p: 5, bgcolor: '#fff', boxShadow: '0 8px 32px 0 rgba(44, 62, 80, 0.18)', position: 'relative', overflow: 'visible' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          {/* Avatar with ring and edit button */}
          <Box sx={{ position: 'relative', mb: 2 }}>
            <Avatar src={avatarPreview || form.avatar || '/default-avatar.png'} alt={form.fullName} sx={{ width: 130, height: 130, boxShadow: 4, border: '5px solid #e0e7ef', background: 'linear-gradient(135deg, #e0e7ef 0%, #fff 100%)' }} />
            <input accept="image/*" style={{ display: 'none' }} id="avatar-upload" type="file" ref={fileInputRef} onChange={handleAvatarChange} />
            <label htmlFor="avatar-upload">
              <IconButton color="primary" component="span" disabled={uploading} sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: '#fff', borderRadius: 2, boxShadow: 2, zIndex: 2 }}>
                <PhotoCamera />
              </IconButton>
            </label>
          </Box>
          <Typography fontWeight={700} fontSize={22} color="#2d3748" sx={{ mb: 1 }}>{form.fullName}</Typography>
          <Typography fontSize={16} color="text.secondary" sx={{ mb: 1 }}>{user?.email || 'Not Provided'}</Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        {/* Profile Info - Rich Layout */}
        <Box>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <PhoneIcon sx={{ color: '#3d5a2c' }} />
            <Typography fontSize={16} color="text.secondary">{form.phone || 'Not Provided'}</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <PublicIcon sx={{ color: '#3d5a2c' }} />
            <Typography fontSize={16} color="text.secondary">{form.nationality || 'Not Provided'}</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <CakeIcon sx={{ color: '#3d5a2c' }} />
            <Typography fontSize={16} color="text.secondary">{form.dob ? new Date(form.dob).toLocaleDateString() : 'Not Provided'}</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <WcIcon sx={{ color: '#3d5a2c' }} />
            <Typography fontSize={16} color="text.secondary">{form.gender || 'Not Provided'}</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <LanguageIcon sx={{ color: '#3d5a2c' }} />
            <Typography fontSize={16} color="text.secondary">{form.language || 'Not Provided'}</Typography>
          </Box>
        </Box>
        <Button variant="contained" color="primary" sx={{ fontWeight: 700, fontSize: 18, borderRadius: 3, py: 1.5, mt: 3, boxShadow: 2, background: 'linear-gradient(90deg, #3d5a2c 0%, #6b8e23 100%)' }} onClick={() => setOpenEdit(true)}>Edit Profile</Button>
      </Paper>

      {/* Edit Modal */}
      <Modal open={openEdit} onClose={() => setOpenEdit(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 480, bgcolor: '#fff', borderRadius: 6, boxShadow: 24, p: 5, background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)' }}>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 3, color: '#2d3748' }}>Edit Profile</Typography>
          <form onSubmit={handleSubmit}>
            {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
            {success && <Typography color="success.main" sx={{ mb: 2 }}>Profile updated successfully!</Typography>}
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField name="fullName" label="Full Name" value={form.fullName} onChange={handleChange} fullWidth required variant="outlined" sx={{ mb: 2, background: '#f5f8fc', borderRadius: 2 }} />
              </Grid>
              <Grid item xs={12}>
                <TextField name="phone" label="Phone Number" value={form.phone} onChange={handleChange} fullWidth variant="outlined" sx={{ mb: 2, background: '#f5f8fc', borderRadius: 2 }} />
              </Grid>
              <Grid item xs={12}>
                <TextField name="nationality" label="Nationality" value={form.nationality} onChange={handleChange} fullWidth variant="outlined" sx={{ mb: 2, background: '#f5f8fc', borderRadius: 2 }} />
              </Grid>
              <Grid item xs={12}>
                <TextField name="dob" label="Date of Birth" type="date" value={form.dob} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} variant="outlined" sx={{ mb: 2, background: '#f5f8fc', borderRadius: 2 }} />
              </Grid>
              <Grid item xs={12}>
                <TextField select name="gender" label="Gender" value={form.gender} onChange={handleChange} fullWidth variant="outlined" sx={{ mb: 2, background: '#f5f8fc', borderRadius: 2 }}>
                  {genderOptions.map((g) => (<MenuItem key={g} value={g}>{g}</MenuItem>))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField select name="language" label="Preferred Language" value={form.language} onChange={handleChange} fullWidth variant="outlined" sx={{ mb: 2, background: '#f5f8fc', borderRadius: 2 }}>
                  {languageOptions.map((lang) => (<MenuItem key={lang} value={lang}>{lang}</MenuItem>))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary" fullWidth startIcon={<SaveIcon />} disabled={saving} sx={{ fontWeight: 700, fontSize: 18, borderRadius: 3, py: 1.5, mt: 3, boxShadow: 2, background: 'linear-gradient(90deg, #3d5a2c 0%, #6b8e23 100%)' }}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Modal>
    </Box>
  );
}
