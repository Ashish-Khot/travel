const express = require('express');
const Destination = require('../models/Destination');
const { crawlDestinations } = require('../backend/crawler');

const router = express.Router();

// GET /api/destinations
router.get('/destinations', async (req, res) => {
  try {
    const destinations = await Destination.find({});
    res.json(destinations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/destinations/crawl
router.get('/destinations/crawl', async (req, res) => {
  try {
    const search = req.query.search || '';
    const crawled = await crawlDestinations(search);
    res.json(crawled);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
