import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid, Paper, Chip, Avatar, Stack, CircularProgress, TextField, InputAdornment, IconButton, MenuItem, Select } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import PlaceIcon from '@mui/icons-material/Place';
import { fetchHospitals } from '../../common/opentripmap';

const LOCATIONS = [
  { label: 'Paris', value: 'paris', lat: 48.8566, lon: 2.3522 },
  { label: 'London', value: 'london', lat: 51.5074, lon: -0.1278 },
  { label: 'New York', value: 'newyork', lat: 40.7128, lon: -74.0060 },
  { label: 'Tokyo', value: 'tokyo', lat: 35.6895, lon: 139.6917 },
];

// Emergency contacts by country/city (can be expanded or fetched from API)
const EMERGENCY_CONTACTS_MAP = {
  paris: [
    { label: 'Police', number: '17', icon: <LocalPoliceIcon fontSize="large" />, color: '#F44336' },
    { label: 'Ambulance', number: '15', icon: <LocalHospitalIcon fontSize="large" />, color: '#FF9800' },
    { label: 'Fire', number: '18', icon: <LocalFireDepartmentIcon fontSize="large" />, color: '#FBC02D' },
    { label: 'General Emergency', number: '112', icon: <LocalPhoneIcon fontSize="large" />, color: '#448AFF' },
  ],
  london: [
    { label: 'Police', number: '999', icon: <LocalPoliceIcon fontSize="large" />, color: '#F44336' },
    { label: 'Ambulance', number: '999', icon: <LocalHospitalIcon fontSize="large" />, color: '#FF9800' },
    { label: 'Fire', number: '999', icon: <LocalFireDepartmentIcon fontSize="large" />, color: '#FBC02D' },
    { label: 'General Emergency', number: '112', icon: <LocalPhoneIcon fontSize="large" />, color: '#448AFF' },
  ],
  newyork: [
    { label: 'Police', number: '911', icon: <LocalPoliceIcon fontSize="large" />, color: '#F44336' },
    { label: 'Ambulance', number: '911', icon: <LocalHospitalIcon fontSize="large" />, color: '#FF9800' },
    { label: 'Fire', number: '911', icon: <LocalFireDepartmentIcon fontSize="large" />, color: '#FBC02D' },
    { label: 'General Emergency', number: '911', icon: <LocalPhoneIcon fontSize="large" />, color: '#448AFF' },
  ],
  tokyo: [
    { label: 'Police', number: '110', icon: <LocalPoliceIcon fontSize="large" />, color: '#F44336' },
    { label: 'Ambulance', number: '119', icon: <LocalHospitalIcon fontSize="large" />, color: '#FF9800' },
    { label: 'Fire', number: '119', icon: <LocalFireDepartmentIcon fontSize="large" />, color: '#FBC02D' },
    { label: 'General Emergency', number: '112', icon: <LocalPhoneIcon fontSize="large" />, color: '#448AFF' },
  ],
};

function EmergencySupportPanel() {
  const [location, setLocation] = useState('paris');
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [searchLoc, setSearchLoc] = useState(null);

  useEffect(() => {
    let loc;
    if (searchLoc) {
      loc = searchLoc;
    } else {
      loc = LOCATIONS.find(l => l.value === location);
    }
    if (!loc) return;
    setLoading(true);
    fetchHospitals(loc.lat, loc.lon, 5000)
      .then(results => {
        const mapped = results.map(f => ({
          name: f.properties.name || 'Unknown Hospital',
          address: f.properties.address || '',
          distance: f.properties.dist ? `${Math.round(f.properties.dist)} m` : '',
        }));
        setHospitals(mapped);
      })
      .catch(() => setHospitals([]))
      .finally(() => setLoading(false));
  }, [location, searchLoc]);

  const emergencyContacts = EMERGENCY_CONTACTS_MAP[location] || [];

  // Search handler: use OpenTripMap geocoding to get lat/lon
  const handleSearch = async () => {
    if (!search.trim()) return;
    setLoading(true);
    try {
      const resp = await fetch(`https://api.opentripmap.com/0.1/en/places/geoname?name=${encodeURIComponent(search)}&apikey=5ae2e3f221c38a28845f05b621d821dbc5e99f718b7311572cceb893`);
      const data = await resp.json();
      if (data.lat && data.lon) {
        setSearchLoc({ lat: data.lat, lon: data.lon, value: 'search', label: search });
      } else {
        setSearchLoc(null);
        setHospitals([]);
      }
    } catch {
      setSearchLoc(null);
      setHospitals([]);
    }
    setLoading(false);
  };

  // Reset search
  const handleResetSearch = () => {
    setSearch('');
    setSearchLoc(null);
  };

  return (
    <Box sx={{
      p: { xs: 2, md: 5 },
      bgcolor: 'linear-gradient(135deg, #f8fafc 0%, #e3e9f7 100%)',
      minHeight: '100vh',
      borderRadius: 6,
      boxShadow: '0 8px 32px 0 rgba(60, 80, 120, 0.12)',
      maxWidth: 900,
      mx: 'auto',
      mt: 4,
      mb: 4,
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={2}>
        <Avatar sx={{ bgcolor: '#F44336', width: 56, height: 56, boxShadow: 2 }}>
          <LocalPoliceIcon fontSize="large" />
        </Avatar>
        <Box>
          <Typography variant="h3" fontWeight={800} color="primary.main" sx={{ letterSpacing: 1 }}>
            Emergency Support
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, mt: 0.5 }}>
            Quick access to emergency contacts and nearby hospitals
          </Typography>
        </Box>
      </Stack>
      <Box mt={3} mb={2}>
        <Typography variant="subtitle2" fontWeight={600} mb={1}>
          Select Your Location or Search
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ flexWrap: 'wrap' }}>
          <Select
            value={location}
            onChange={e => { setLocation(e.target.value); setSearchLoc(null); }}
            size="small"
            sx={{ minWidth: 140, borderRadius: 5, bgcolor: '#fff', boxShadow: 1 }}
          >
            {LOCATIONS.map((loc) => (
              <MenuItem key={loc.value} value={loc.value}>{loc.label}</MenuItem>
            ))}
          </Select>
          <TextField
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Type a city or place..."
            size="small"
            sx={{ minWidth: 220, borderRadius: 5, bgcolor: '#fff', boxShadow: 1 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleSearch} edge="end" color="primary">
                    <SearchIcon />
                  </IconButton>
                  {searchLoc && (
                    <IconButton onClick={handleResetSearch} edge="end" color="secondary">
                      ✕
                    </IconButton>
                  )}
                </InputAdornment>
              ),
            }}
          />
        </Stack>
        {searchLoc && (
          <Typography variant="caption" color="primary" sx={{ mt: 1, ml: 1 }}>
            Showing results for "{searchLoc.label}" <Button size="small" onClick={handleResetSearch}>Reset</Button>
          </Typography>
        )}
      </Box>
      <Box mt={4} mb={2}>
        <Typography variant="h5" fontWeight={800} mb={2} color="primary.main" sx={{ letterSpacing: 0.5 }}>
          Emergency Contact Numbers
        </Typography>
        <Grid container spacing={3} alignItems="stretch">
          {emergencyContacts.map((contact) => (
            <Grid item xs={12} sm={6} md={3} key={contact.label} sx={{ display: 'flex' }}>
              <Paper
                elevation={6}
                sx={{
                  bgcolor: contact.color,
                  color: '#fff',
                  borderRadius: '22px',
                  p: 0,
                  height: 160,
                  width: '100%',
                  minWidth: 220,
                  maxWidth: 320,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 6px 24px 0 rgba(0,0,0,0.10)',
                  transition: 'box-shadow 0.2s',
                  '&:hover': {
                    boxShadow: '0 12px 32px 0 rgba(0,0,0,0.18)',
                  },
                  m: 'auto',
                }}
              >
                <Box mb={1.5} display="flex" alignItems="center" justifyContent="center">
                  {React.cloneElement(contact.icon, { fontSize: 'large', sx: { fontSize: 36 } })}
                </Box>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5, fontSize: 19, textAlign: 'center', lineHeight: 1 }}>
                  {contact.label}
                </Typography>
                <Typography variant="h4" fontWeight={900} sx={{ fontSize: 32, textAlign: 'center', lineHeight: 1 }}>
                  {contact.number}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
      <Box mt={5}>
        <Typography variant="h5" fontWeight={800} mb={2} color="primary.main" sx={{ letterSpacing: 0.5 }}>
          Nearby Hospitals
        </Typography>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
            <CircularProgress size={40} color="primary" />
          </Box>
        ) : (
          <Stack spacing={3}>
            {hospitals.length === 0 && (
              <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, textAlign: 'center', mt: 2 }}>No hospitals found for this location.</Typography>
            )}
            {hospitals.map((h, idx) => (
              <Paper
                key={h.name + idx}
                elevation={4}
                sx={{
                  borderRadius: 4,
                  p: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  bgcolor: '#fff',
                  border: '1px solid #E3E9F7',
                  boxShadow: '0 4px 16px 0 rgba(60, 80, 120, 0.08)',
                }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: '#388E3C', width: 48, height: 48, boxShadow: 1 }}>
                    <LocalHospitalIcon fontSize="large" />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={800} sx={{ fontSize: 18 }}>
                      {h.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {h.address}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={h.distance}
                  sx={{ bgcolor: '#E8F5E9', color: '#388E3C', fontWeight: 700, fontSize: 16, px: 2, py: 1 }}
                  size="medium"
                />
              </Paper>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
}

export default EmergencySupportPanel;
