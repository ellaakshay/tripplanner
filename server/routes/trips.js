const express = require('express');
const mongoose = require('mongoose');
const Trip = require('../models/Trip');

const router = express.Router();

function databaseUnavailable(res) {
  return res.status(503).json({ error: 'Saved trips are unavailable while MongoDB is offline.' });
}

router.post('/', async (req, res) => {
  const { userInput, itinerary } = req.body;
  if (typeof userInput !== 'string' || !userInput.trim() || !itinerary || typeof itinerary !== 'object') {
    return res.status(400).json({ error: 'userInput and itinerary are required.' });
  }
  if (mongoose.connection.readyState !== 1) return databaseUnavailable(res);

  try {
    const trip = await Trip.create({ userInput: userInput.trim(), itinerary });
    return res.status(201).json({ id: trip._id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  if (mongoose.connection.readyState !== 1) return databaseUnavailable(res);

  try {
    const trips = await Trip.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .select('_id itinerary.destination createdAt')
      .lean();
    return res.json(trips.map((trip) => ({
      id: trip._id,
      destination: trip.itinerary?.destination || 'Untitled trip',
      createdAt: trip.createdAt
    })));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  if (mongoose.connection.readyState !== 1) return databaseUnavailable(res);
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Trip not found.' });

  try {
    const trip = await Trip.findById(req.params.id).select('itinerary userInput').lean();
    if (!trip) return res.status(404).json({ error: 'Trip not found.' });
    return res.json(trip);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
