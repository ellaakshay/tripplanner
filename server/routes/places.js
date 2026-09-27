const express = require('express');

const router = express.Router();

function readCoordinate(value, min, max) {
  const coordinate = Number(value);
  return Number.isFinite(coordinate) && coordinate >= min && coordinate <= max ? coordinate : null;
}

function distanceKm(first, second) {
  const radians = Math.PI / 180;
  const latitudeDelta = (second.lat - first.lat) * radians;
  const longitudeDelta = (second.lng - first.lng) * radians;
  const value = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(first.lat * radians) * Math.cos(second.lat * radians) * Math.sin(longitudeDelta / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

router.get('/', async (req, res) => {
  const from = {
    lat: readCoordinate(req.query.fromLat, -90, 90),
    lng: readCoordinate(req.query.fromLng, -180, 180)
  };
  const to = {
    lat: readCoordinate(req.query.toLat, -90, 90),
    lng: readCoordinate(req.query.toLng, -180, 180)
  };
  if (Object.values(from).includes(null) || Object.values(to).includes(null)) {
    return res.status(400).json({ error: 'Valid start and destination coordinates are required.' });
  }

  const distance = distanceKm(from, to);
  const sampleCount = Math.min(24, Math.max(2, Math.ceil(distance / 80)));
  const samples = Array.from({ length: sampleCount + 1 }, (_, index) => ({
    lat: from.lat + (to.lat - from.lat) * index / sampleCount,
    lng: from.lng + (to.lng - from.lng) * index / sampleCount
  }));
  const aroundQueries = samples.map((point) => `nwr(around:35000,${point.lat},${point.lng})["tourism"~"^(attraction|viewpoint|museum|gallery|zoo|theme_park)$"];\n    nwr(around:35000,${point.lat},${point.lng})["historic"~"^(monument|archaeological_site|castle)$"];`).join('\n    ');
  const query = `[out:json][timeout:20];\n(\n    ${aroundQueries}\n);\nout center tags 200;`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 22000);

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      signal: controller.signal,
      headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ data: query })
    });
    if (!response.ok) return res.status(502).json({ error: 'Tourist places are temporarily unavailable.' });
    const payload = await response.json();
    const places = new Map();

    for (const element of payload.elements || []) {
      const tags = element.tags || {};
      const lat = Number(element.lat ?? element.center?.lat);
      const lng = Number(element.lon ?? element.center?.lon);
      const name = tags.name || tags['name:en'];
      if (!name || !Number.isFinite(lat) || !Number.isFinite(lng)) continue;

      const destination = distanceKm({ lat, lng }, to) <= 45;
      const type = tags.tourism || tags.historic || 'sight';
      places.set(`${element.type}/${element.id}`, {
        id: `${element.type}/${element.id}`,
        name,
        type: type.replaceAll('_', ' '),
        lat,
        lng,
        destination
      });
    }

    return res.json({ places: [...places.values()].slice(0, 40) });
  } catch (error) {
    return res.status(502).json({ error: error.name === 'AbortError' ? 'Tourist place lookup timed out.' : 'Tourist places are temporarily unavailable.' });
  } finally {
    clearTimeout(timeout);
  }
});

module.exports = router;