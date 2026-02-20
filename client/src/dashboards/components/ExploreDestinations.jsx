import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
// Remove MUI Grid, use CSS grid for more control
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
const filters = [
  'All',
  'Landmark',
  'Monument',
  'Nature',
  'Historic',
  'Museum',
  'Park',
  'Temple',
  'Beach',
  'Fort',
  'Wonder',
  'Popular',
  'Heritage Site',
  'Natural Wonder',
];

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
  const [filter, setFilter] = useState('All');
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
  const handleSearch = async () => {
    setLoading(true);
    setError('');
    setSearch(pendingSearch);
    try {
      // Fetch from OpenTripMap
      const res = await fetch(`http://localhost:3001/api/opentripmap/search?query=${encodeURIComponent(pendingSearch)}&limit=12`);
      const data = await res.json();
      let places = [];
      if (data.features) {
        places = data.features.map(f => {
          // Wikipedia fallback
          if (f.properties.kinds === 'Wikipedia') {
            return {
              xid: null,
              name: f.properties.name,
              lat: null,
              lon: null,
              category: 'Wikipedia',
              image: f.properties.image || '/fallback-destination.jpg',
              description: f.properties.description || 'No description available.',
            };
          }
          return {
            xid: f.properties.xid,
            name: f.properties.name,
            lat: f.geometry.coordinates[1],
            lon: f.geometry.coordinates[0],
            category: f.properties.kinds,
            image: f.properties.image || '/fallback-destination.jpg',
            description: f.properties.description || '',
          };
        });
      }
      setDestinations(places);
      setLoading(false);
    } catch (err) {
      setError('Failed to load OpenTripMap destinations.');
      setLoading(false);
    }
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
    const matchesFilter = filter === 'All' || (dest.details?.kinds || dest.category || '').toLowerCase().includes(filter.toLowerCase()) || (dest.details?.tags || []).map(t => t.toLowerCase()).includes(filter.toLowerCase());
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
    return matchesCategory && matchesFilter && matchesRating && matchesSearch && matchesDistance;
  });

  // Filter logic for crawled destinations
  const filteredCrawled = crawledDestinations.filter(dest => {
    const matchesCategory = category === 'All' || (dest.category || '').toLowerCase().includes(category.toLowerCase());
    const matchesFilter = filter === 'All' || (dest.details?.kinds || dest.category || '').toLowerCase().includes(filter.toLowerCase()) || (dest.details?.tags || []).map(t => t.toLowerCase()).includes(filter.toLowerCase());
    const matchesRating = (dest.rating || 0) >= rating;
    let matchesDistance = true;
    if (distance > 0 && userLocation && dest.lat && dest.lon) {
      const d = getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, dest.lat, dest.lon);
      matchesDistance = d <= distance;
    }
    return matchesCategory && matchesFilter && matchesRating && matchesDistance;
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
      <Typography variant="h4" fontWeight={700} mb={3} sx={{ fontFamily: 'serif', letterSpacing: '-1px' }}>Explore the Destination</Typography>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 2,
          mb: 4,
          p: 3,
          borderRadius: 4,
          boxShadow: '0 2px 16px 0 rgba(60,72,88,0.08)',
          bgcolor: '#fff',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <TextField
          label="Search destinations..."
          value={pendingSearch}
          onChange={e => setPendingSearch(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><span role="img" aria-label="search">🔍</span></InputAdornment>,
            sx: { borderRadius: 3, bgcolor: '#f7f7f7' }
          }}
          sx={{ minWidth: 220, flex: 1 }}
        />
        <TextField
          select
          label="Category"
          value={category}
          onChange={e => setCategory(e.target.value)}
          sx={{ minWidth: 140, flex: 1, background: '#f7f7f7', borderRadius: 3 }}
        >
          {categories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
        </TextField>
        <TextField
          select
          label="Filter"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          sx={{ minWidth: 140, flex: 1, background: '#f7f7f7', borderRadius: 3 }}
        >
          {filters.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
        </TextField>
        <TextField
          label="Min Rating"
          type="number"
          value={rating}
          onChange={e => setRating(Number(e.target.value))}
          inputProps={{ min: 0, max: 5, step: 0.1 }}
          sx={{ minWidth: 120, flex: 1, background: '#f7f7f7', borderRadius: 3 }}
        />
        <TextField
          label="Max Distance (km)"
          type="number"
          value={distance}
          onChange={e => setDistance(Number(e.target.value))}
          inputProps={{ min: 0, step: 1 }}
          sx={{ minWidth: 170, flex: 1, background: '#f7f7f7', borderRadius: 3 }}
          disabled={!userLocation}
          helperText={!userLocation ? 'Enable location for distance filter' : ''}
        />
        <Button
          variant="contained"
          color="success"
          onClick={handleSearch}
          sx={{
            minWidth: 120,
            px: 4,
            py: 1.5,
            fontWeight: 700,
            fontSize: 18,
            borderRadius: 3,
            boxShadow: '0 2px 8px 0 rgba(60,72,88,0.10)',
            textTransform: 'none',
            letterSpacing: 0,
            bgcolor: '#3b7f6a',
            '&:hover': { bgcolor: '#25614a' },
          }}
        >
          Search
        </Button>
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr 1fr',
            md: '1fr 1fr 1fr'
          },
          gap: 4,
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          mb: 4,
        }}
      >
        {filtered.length === 0 ? (
          <Box width="100%" textAlign="center" py={6} gridColumn="1/-1">
            <Typography>No destinations found.</Typography>
          </Box>
        ) : filtered.map(dest => (
          <Box key={dest.xid || dest.name} sx={{ width: '100%', minWidth: 0 }}>
            <Card
              onClick={async () => {
                // Fetch details only when clicked
                if (dest.xid) {
                  try {
                    const detailRes = await fetch(`http://localhost:3001/api/opentripmap/place/${dest.xid}`);
                    const detail = await detailRes.json();
                    setSelected({
                      ...dest,
                      description: detail.wikipedia_extract || detail.info?.descr || '',
                      image: detail.preview?.source || '/fallback-destination.jpg',
                      city: detail.address?.city || '',
                      country: detail.address?.country || '',
                      rating: detail.rate || 0,
                      details: detail.kinds || '',
                    });
                  } catch {
                    setSelected(dest);
                  }
                } else {
                  setSelected(dest);
                }
              }}
              sx={{
                cursor: 'pointer',
                height: 370,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 4,
                boxShadow: '0 4px 24px 0 rgba(60,72,88,0.10)',
                transition: 'transform 0.18s, box-shadow 0.18s',
                '&:hover': {
                  transform: 'translateY(-6px) scale(1.03)',
                  boxShadow: '0 8px 32px 0 rgba(60,72,88,0.18)',
                },
                overflow: 'hidden',
                bgcolor: '#fff',
              }}
            >
              <Box sx={{ width: '100%', height: 170, overflow: 'hidden', bgcolor: '#f3f3f3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={dest.image || '/fallback-destination.jpg'}
                  alt={dest.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: 170, minWidth: '100%' }}
                  onError={e => { e.target.onerror = null; e.target.src = '/fallback-destination.jpg'; }}
                />
              </Box>
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 2 }}>
                <Typography variant="h6" fontWeight={700} mb={0.5} sx={{ fontFamily: 'serif' }}>{dest.name}</Typography>
                <Typography variant="body2" color="text.secondary" mb={0.5} sx={{ fontSize: 14 }}>
                  {(dest.category || '').split(',').join(', ')}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1} sx={{ fontSize: 13, minHeight: 36, maxHeight: 36, overflow: 'hidden', textOverflow: 'ellipsis' }}>{dest.description}</Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
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
