import React, { useState } from 'react';
import api from '../src/api';
import { Box, Typography, TextField, Button, MenuItem, CircularProgress, Alert } from '@mui/material';

const languageOptions = ['English', 'Hindi', 'Spanish', 'French', 'German', 'Chinese', 'Other'];

export default function GuideRegistrationForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    country: '',
    bio: '',
    experienceYears: '',
    languages: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleLanguagesChange = e => {
    setForm(prev => ({ ...prev, languages: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Register user as guide and create Guide profile
      const res = await api.post('/auth/register', {
        ...form,
        role: 'guide',
      });
      // Create Guide profile (approved: false)
      await api.post('/guide/apply', {
        bio: form.bio,
        experienceYears: form.experienceYears,
        languages: form.languages,
      });
      setSuccess('Registration submitted! Awaiting admin approval.');
      setForm({
        name: '', email: '', password: '', phone: '', country: '', bio: '', experienceYears: '', languages: [],
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed.');
    }
    setLoading(false);
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4, p: 3, bgcolor: '#fff', borderRadius: 3, boxShadow: 2 }}>
      <Typography variant="h4" fontWeight={700} mb={2}>Guide Registration</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField label="Name" name="name" value={form.name} onChange={handleChange} fullWidth required sx={{ mb: 2 }} />
        <TextField label="Email" name="email" value={form.email} onChange={handleChange} fullWidth required sx={{ mb: 2 }} />
        <TextField label="Password" name="password" type="password" value={form.password} onChange={handleChange} fullWidth required sx={{ mb: 2 }} />
        <TextField label="Phone" name="phone" value={form.phone} onChange={handleChange} fullWidth required sx={{ mb: 2 }} />
        <TextField label="Country" name="country" value={form.country} onChange={handleChange} fullWidth required sx={{ mb: 2 }} />
        <TextField label="Bio" name="bio" value={form.bio} onChange={handleChange} fullWidth multiline rows={2} required sx={{ mb: 2 }} />
        <TextField label="Experience (years)" name="experienceYears" value={form.experienceYears} onChange={handleChange} fullWidth required sx={{ mb: 2 }} />
        <TextField
          select
          label="Languages"
          name="languages"
          value={form.languages}
          onChange={handleLanguagesChange}
          fullWidth
          SelectProps={{ multiple: true }}
          sx={{ mb: 2 }}
        >
          {languageOptions.map(lang => (
            <MenuItem key={lang} value={lang}>{lang}</MenuItem>
          ))}
        </TextField>
        <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ py: 1.5, fontWeight: 700 }}>
          {loading ? <CircularProgress size={24} /> : 'Register as Guide'}
        </Button>
      </form>
    </Box>
  );
}
