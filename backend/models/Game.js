const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  genre: { type: String, required: true },
  hoursPlayed: { type: Number, default: 0 },
  price: { type: Number, required: true },
  buyLink: { type: String, default: '#' },
  coverUrl: { type: String, default: '' },
  dateAdded: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Game', gameSchema);
