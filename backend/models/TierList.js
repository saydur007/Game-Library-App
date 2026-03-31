const mongoose = require('mongoose');

const tierListSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  tiers: {
    S: { type: [String], default: [] },
    A: { type: [String], default: [] },
    B: { type: [String], default: [] },
    C: { type: [String], default: [] },
    D: { type: [String], default: [] }
  },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TierList', tierListSchema);
