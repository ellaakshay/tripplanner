const express = require('express');

const router = express.Router();

router.get('/', async (req, res) => {
  const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (!query) return res.status(400).json({ error: 'A location query is required.' });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(`https://photon.komoot.io/api/?limit=1&q=${encodeURIComponent(query)}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json', 'User-Agent': 'NomadAI Trip Planner/1.0' }
    });
    if (!response.ok) return res.status(response.status).json({ error: 'Location lookup failed.' });
    const payload = await response.json();
    const place = payload.features?.[0];
    if (!place) return res.json(null);
    const [lng, lat] = place.geometry.coordinates;
    return res.json({ lat, lng, label: [place.properties.name, place.properties.state, place.properties.country].filter(Boolean).join(', ') });
  } catch (error) {
    return res.status(502).json({ error: error.name === 'AbortError' ? 'Location lookup timed out.' : 'Location lookup failed.' });
  } finally {
    clearTimeout(timeout);
  }
});

module.exports = router;
