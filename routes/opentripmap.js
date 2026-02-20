// opentripmap.js - OpenTripMap API integration
const express = require('express');
const axios = require('axios');
const router = express.Router();

const OPENTRIPMAP_API_KEY = '5ae2e3f221c38a28845f05b621d821dbc5e99f718b7311572cceb893';

// Fetch places by search (city or keyword)
router.get('/search', async (req, res) => {
  const { query = '', lat, lon, radius = 10000, limit = 12 } = req.query;
  try {
    let searchLat = lat, searchLon = lon;
    // If lat/lon not provided, get city coordinates first
    if (!lat || !lon) {
      const geoUrl = `https://api.opentripmap.com/0.1/en/places/geoname?name=${encodeURIComponent(query)}&apikey=${OPENTRIPMAP_API_KEY}`;
      const geoRes = await axios.get(geoUrl);
      if (geoRes.data && geoRes.data.lat && geoRes.data.lon) {
        searchLat = geoRes.data.lat;
        searchLon = geoRes.data.lon;
      }
    }
    // Now fetch places by radius
    let features = [];
    if (searchLat && searchLon) {
      const radiusUrl = `https://api.opentripmap.com/0.1/en/places/radius?radius=${radius}&lon=${searchLon}&lat=${searchLat}&limit=${limit}&apikey=${OPENTRIPMAP_API_KEY}`;
      const { data } = await axios.get(radiusUrl);
      features = data.features || [];
    }
    // If no OpenTripMap places found, use Wikipedia REST API
    if (!features.length) {
      try {
        const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
        const wikiRes = await axios.get(wikiUrl);
        const w = wikiRes.data;
        if (w && w.title && w.extract) {
          return res.json({ features: [{
            properties: {
              name: w.title,
              description: w.extract,
              image: w.thumbnail?.source || w.originalimage?.source || 'https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg',
              xid: null,
              kinds: 'Wikipedia',
            },
            geometry: { coordinates: [null, null] },
          }] });
        }
      } catch (e) {
        // Wikipedia fallback failed, return empty
      }
    }
    // Return OpenTripMap results
    return res.json({ features });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch from OpenTripMap', details: err.message });
  }
});

// Fetch place details by xid
router.get('/place/:xid', async (req, res) => {
  const { xid } = req.params;
  try {
    const url = `https://api.opentripmap.com/0.1/en/places/xid/${xid}?apikey=${OPENTRIPMAP_API_KEY}`;
    const { data } = await axios.get(url);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch place details', details: err.message });
  }
});

module.exports = router;
