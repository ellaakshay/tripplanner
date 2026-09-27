const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  userInput: { type: String, required: true },
  itinerary: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Trip', tripSchema);
