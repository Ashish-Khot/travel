import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Rating from '@mui/material/Rating';


// Fetch destinations from backend

const categories = ['All', 'Island', 'Mountain', 'City', 'Heritage'];

// Haversine formula for distance in km
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}


// Placeholder for map (remove map to avoid white screen if map fails)
function DestinationMap({ destinations, center, zoom }) {
  return (
    <Box sx={{ height: 300, width: '100%', bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2, border: '1px solid #eee' }}>
      <Typography color="text.secondary">[Map preview unavailable]</Typography>
    </Box>
  );
}

export default function ExploreDestinations() {
  const [search, setSearch] = useState('');
  const [pendingSearch, setPendingSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [rating, setRating] = useState(0);
  const [distance, setDistance] = useState(0); // 0 means no filter
  const [userLocation, setUserLocation] = useState(null);
  const [selected, setSelected] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [crawledDestinations, setCrawledDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch('http://localhost:3001/api/destination/destinations')
      .then(res => res.json())
      .then(data => {
        setDestinations(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load destinations.');
        setLoading(false);
      });
  }, []);

  // Search-triggered web crawling
  const handleSearch = () => {
    setLoading(true);
    setError('');
    // Search DB
    fetch('http://localhost:3001/api/destination/destinations')
      .then(res => res.json())
      .then(data => {
        setDestinations(data);
        // Search crawl
        fetch(`http://localhost:3001/api/destination/destinations/crawl?search=${encodeURIComponent(pendingSearch)}`)
          .then(res => res.json())
          .then(crawlData => {
            setCrawledDestinations(Array.isArray(crawlData) ? crawlData : []);
            setSearch(pendingSearch);
            setLoading(false);
          })
          .catch(err => {
            setError('Failed to load web destinations.');
            setLoading(false);
          });
      })
      .catch(err => {
        setError('Failed to load destinations.');
        setLoading(false);
      });
  };

  // Get user location for distance filter
  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation(null)
      );
    }
  }, []);

  // Filter logic for DB destinations
  const filteredDB = destinations.filter(dest => {
    const matchesCategory = category === 'All' || (dest.category || dest.details?.kinds || '').toLowerCase().includes(category.toLowerCase());
    const matchesRating = (dest.rating || 0) >= rating;
    const matchesSearch =
      (dest.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (dest.city || '').toLowerCase().includes(search.toLowerCase()) ||
      (dest.country || '').toLowerCase().includes(search.toLowerCase());
    let matchesDistance = true;
    if (distance > 0 && userLocation && dest.lat && dest.lon) {
      const d = getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, dest.lat, dest.lon);
      matchesDistance = d <= distance;
    }
    return matchesCategory && matchesRating && matchesSearch && matchesDistance;
  });

  // Filter logic for crawled destinations
  const filteredCrawled = crawledDestinations.filter(dest => {
    const matchesCategory = category === 'All' || (dest.category || '').toLowerCase().includes(category.toLowerCase());
    const matchesRating = (dest.rating || 0) >= rating;
    let matchesDistance = true;
    if (distance > 0 && userLocation && dest.lat && dest.lon) {
      const d = getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, dest.lat, dest.lon);
      matchesDistance = d <= distance;
    }
    return matchesCategory && matchesRating && matchesDistance;
  });

  // Merge both
  const filtered = [...filteredDB, ...filteredCrawled];

  if (loading) {
    return (
      <Box minHeight="40vh" display="flex" alignItems="center" justifyContent="center">
        <Typography variant="h6">Loading destinations...</Typography>
      </Box>
    );
  }
  if (error) {
    return (
      <Box minHeight="40vh" display="flex" alignItems="center" justifyContent="center">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>Explore the Destination</Typography>
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <TextField
          label="Search"
          value={pendingSearch}
          onChange={e => setPendingSearch(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start">🔍</InputAdornment>
          }}
        />
        <Button variant="contained" color="primary" onClick={handleSearch} sx={{ minWidth: 120 }}>
          Search
        </Button>
        <TextField
          select
          label="Category"
          value={category}
          onChange={e => setCategory(e.target.value)}
          sx={{ minWidth: 120 }}
        >
          {categories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
        </TextField>
        <TextField
          label="Min Rating"
          type="number"
          value={rating}
          onChange={e => setRating(Number(e.target.value))}
          inputProps={{ min: 0, max: 5, step: 0.1 }}
          sx={{ minWidth: 120 }}
        />
        <TextField
          label="Max Distance (km)"
          type="number"
          value={distance}
          onChange={e => setDistance(Number(e.target.value))}
          inputProps={{ min: 0, step: 1 }}
          sx={{ minWidth: 150 }}
          disabled={!userLocation}
          helperText={!userLocation ? 'Enable location for distance filter' : ''}
        />
      </Box>
      <Grid container spacing={3}>
        {filtered.length === 0 ? (
          <Box width="100%" textAlign="center" py={6}>
            <Typography>No destinations found.</Typography>
          </Box>
        ) : filtered.map(dest => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={dest._id || dest.xid || dest.name}>
            <Card onClick={() => setSelected(dest)} sx={{ cursor: 'pointer', height: '100%' }}>
              <CardMedia
                component="img"
                height="160"
                image={dest.image}
                alt={dest.name}
              />
              <CardContent>
                <Typography variant="h6" fontWeight={700}>{dest.name}</Typography>
                <Typography variant="body2" color="text.secondary">{dest.details?.kinds || dest.category || ''} • {dest.city || dest.location || ''} {dest.country ? '• ' + dest.country : ''}</Typography>
                <Typography variant="body2" mt={1}>{dest.description}</Typography>
                <Box display="flex" alignItems="center" mt={1}>
                  <Rating value={dest.rating || 0} precision={0.1} readOnly size="small" />
                  <Typography variant="caption" ml={1}>{dest.rating || 'N/A'}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box mt={4}>
        <DestinationMap destinations={filtered} center={{ lat: 36.3932, lng: 25.4615 }} zoom={2} />
      </Box>
      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="md" fullWidth>
        {selected && (
          <>
            <DialogTitle>{selected.name} - Details</DialogTitle>
            <DialogContent>
              <img src={selected.image} alt={selected.name} style={{ width: '100%', borderRadius: 8, marginBottom: 16 }} />
              <Typography variant="h6">Category: {selected.details?.kinds || selected.category || ''}</Typography>
              <Typography variant="body1" mt={1}>{selected.description}</Typography>
              <Typography variant="body2" mt={2}><b>Location:</b> {selected.city || selected.location || ''} {selected.country ? '• ' + selected.country : ''}</Typography>
              <Typography variant="body2" mt={2}><b>History:</b> {selected.history || ''}</Typography>
              <Typography variant="body2" mt={2}><b>Visiting Hours:</b> {selected.visitingHours || ''}</Typography>
              <Typography variant="body2" mt={2}><b>Ticket Info:</b> {selected.ticketInfo || ''}</Typography>
              {selected.nearby && (
                <>
                  <Typography variant="body2" mt={2}><b>Nearby Hotels:</b> {selected.nearby.hotels.join(', ')}</Typography>
                  <Typography variant="body2" mt={2}><b>Nearby Food:</b> {selected.nearby.food.join(', ')}</Typography>
                  <Typography variant="body2" mt={2}><b>Nearby Hospitals:</b> {selected.nearby.hospitals.join(', ')}</Typography>
                </>
              )}
              <Box mt={3}>
                <DestinationMap destinations={[selected]} center={{ lat: selected.lat, lng: selected.lon }} zoom={12} />
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
}
