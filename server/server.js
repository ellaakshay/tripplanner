const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const generateRouter = require('./routes/generate');
const geocodeRouter = require('./routes/geocode');
const placesRouter = require('./routes/places');
const tripsRouter = require('./routes/trips');

const app = express();
const port = process.env.PORT || 5002;
function parseOrigins(value = '') {
  return value.split(',').map((entry) => {
    try {
      return new URL(entry.trim()).origin;
    } catch {
      return null;
    }
  }).filter(Boolean);
}

const allowedOrigins = new Set([
  ...parseOrigins(process.env.CLIENT_ORIGIN),
  ...parseOrigins(process.env.RENDER_EXTERNAL_URL),
  'https://tripplanner-gmgk.onrender.com',
  'http://localhost:5173',
  'http://localhost:5174',
  `http://localhost:${port}`
]);

app.use(cors({
  origin(origin, callback) {
    const isLocalDevelopmentOrigin = /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin || '');
    if (!origin || allowedOrigins.has(origin) || isLocalDevelopmentOrigin) return callback(null, true);
    return callback(new Error('CORS origin is not allowed.'));
  }
}));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => res.json({
  ok: true,
  mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
}));
app.use('/api/generate', generateRouter);
app.use('/api/geocode', geocodeRouter);
app.use('/api/places', placesRouter);
app.use('/api/trips', tripsRouter);

const clientDist = path.join(__dirname, '..', 'client', 'dist');

console.log('Client dist:', clientDist);

app.use(express.static(clientDist));

app.get('/', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.use((error, req, res, next) => {
  console.error('SERVER ERROR:', error);
  next(error);
});

const server = app.listen(port, async () => {
  console.log(`Server listening on http://localhost:${port}`);
  await connectDB();
});

server.on('error', async (error) => {
  if (error.code === 'EADDRINUSE') {
    try {
      const response = await fetch(`http://localhost:${port}/api/health`);
      if (response.ok) {
        const health = await response.json();
        console.log(`MongoDB ${health.mongodb}.`);
        process.exit(0);
      }
    } catch {
      // A different service owns the port.
    }
    console.error(`Port ${port} is already in use by another service.`);
    process.exitCode = 1;
    return;
  }
  console.error('Server failed to start:', error);
  process.exitCode = 1;
});
