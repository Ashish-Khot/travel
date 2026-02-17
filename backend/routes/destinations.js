import express from 'express';
import Destination from '../models/Destination.js';

const router = express.Router();

// GET /api/popular-destinations
router.get('/popular-destinations', async (req, res) => {
	try {
		const destinations = await Destination.find({});
		res.json(destinations);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

export default router;
