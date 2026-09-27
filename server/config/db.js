const mongoose = require('mongoose');

let reconnectTimer;
let reconnecting = false;

function scheduleReconnect() {
  if (reconnectTimer || reconnecting || !process.env.MONGODB_URI) return;

  reconnectTimer = setTimeout(async () => {
    reconnectTimer = undefined;
    await connectDB();
  }, 10000);
}

async function connectDB() {
  const uri = process.env.MONGODB_URI?.trim();

  if (!uri) {
    console.warn('MONGODB_URI is not set; saved trips are disabled.');
    return false;
  }

  reconnecting = true;
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });

    console.log(`MongoDB connected to ${conn.connection.name}.`);
    return true;
  } catch (error) {
    console.warn(`MongoDB unavailable; retrying in 10 seconds: ${error.message}`);
    scheduleReconnect();
    return false;
  } finally {
    reconnecting = false;
  }
}

mongoose.connection.on("disconnected", () => {
  console.warn('MongoDB disconnected; saved trips are temporarily unavailable.');
  scheduleReconnect();
});

mongoose.connection.on("error", (err) => {
  console.warn(`MongoDB connection error: ${err.message}`);
});

module.exports = connectDB;