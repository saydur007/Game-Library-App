const express = require('express');
const jwt     = require('jsonwebtoken');
const Game    = require('../models/Game');
const auth    = require('../middleware/auth');
const { buildEmbedding } = require('../utils/embeddings');

const router = express.Router();

// Helper: populate req.user from token if present — does NOT block request
function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try { req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET); } catch {}
  }
  next();
}

// GET / — authenticated users see their games; unauthenticated see seed data
router.get('/', optionalAuth, async (req, res) => {
  try {
    const filter = req.user ? { userId: req.user.id } : { userId: null };
    const games = await Game.find(filter).sort({ id: 1 });
    res.status(200).json({ success: true, data: games });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /:id — no auth required
router.get('/:id', async (req, res) => {
  try {
    const game = await Game.findOne({ id: parseInt(req.params.id) });
    if (!game) return res.status(404).json({ success: false, message: 'Game not found' });
    res.status(200).json({ success: true, data: game });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST / — requires auth, assigns userId
router.post('/', auth, async (req, res) => {
  try {
    const { title, genre, hoursPlayed, price, buyLink, coverUrl, countryOfOrigin } = req.body;
    if (!title || !genre || price === undefined)
      return res.status(400).json({ success: false, message: 'Missing required fields: title, genre, price' });
    const lastGame = await Game.findOne().sort({ id: -1 });
    const newId = lastGame ? lastGame.id + 1 : 1;
    const newGame = await Game.create({
      id: newId, title, genre,
      hoursPlayed: hoursPlayed || 0,
      price,
      buyLink:         buyLink || '#',
      coverUrl:        coverUrl || '',
      countryOfOrigin: countryOfOrigin || null,
      userId:          req.user.id
    });
    res.status(201).json({ success: true, message: 'Game added successfully', data: newGame });

    // Fire-and-forget: generate embedding in background
    buildEmbedding(newGame)
      .then(embedding => Game.findByIdAndUpdate(newGame._id, { embedding }))
      .catch(err => console.error('Auto-embed failed for game', newGame.id, err.message));
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PUT /:id — requires auth, only own games
// Accepts either numeric id or MongoDB _id (ObjectId string)
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const mongoose = require('mongoose');
    const isObjectId = mongoose.Types.ObjectId.isValid(id) && id.length === 24;
    const filter = isObjectId
      ? { _id: id, userId: req.user.id }
      : { id: parseInt(id), userId: req.user.id };
    const game = await Game.findOneAndUpdate(filter, req.body, { new: true });
    if (!game) return res.status(404).json({ success: false, message: 'Game not found' });
    res.status(200).json({ success: true, message: 'Game updated successfully', data: game });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// DELETE /:id — requires auth, only own games
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await Game.findOneAndDelete({ id: parseInt(req.params.id), userId: req.user.id });
    if (!deleted) return res.status(404).json({ success: false, message: 'Game not found' });
    res.status(200).json({ success: true, message: 'Game deleted successfully', data: deleted });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
