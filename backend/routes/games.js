const express = require('express');
const Game = require('../models/Game');

const router = express.Router();

// ===== REST API ENDPOINTS =====

// GET - Retrieve all games
router.get('/', async (req, res) => {
  try {
    const games = await Game.find().sort({ id: 1 });
    res.status(200).json({ success: true, data: games });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET - Retrieve a single game by id
router.get('/:id', async (req, res) => {
  try {
    const gameId = parseInt(req.params.id);
    const game = await Game.findOne({ id: gameId });
    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }
    res.status(200).json({ success: true, data: game });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST - Add a new game to the library
router.post('/', async (req, res) => {
  try {
    const { title, genre, hoursPlayed, price, buyLink } = req.body;

    if (!title || !genre || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, genre, price'
      });
    }

    const lastGame = await Game.findOne().sort({ id: -1 });
    const newId = lastGame ? lastGame.id + 1 : 1;

    const newGame = new Game({
      id: newId,
      title,
      genre,
      hoursPlayed: hoursPlayed || 0,
      price,
      buyLink: buyLink || '#'
    });

    await newGame.save();

    res.status(201).json({
      success: true,
      message: 'Game added successfully',
      data: newGame
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// DELETE - Remove a game from the library
router.delete('/:id', async (req, res) => {
  try {
    const gameId = parseInt(req.params.id);
    const deletedGame = await Game.findOneAndDelete({ id: gameId });

    if (!deletedGame) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Game deleted successfully',
      data: deletedGame
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PUT - Update a game
router.put('/:id', async (req, res) => {
  try {
    const gameId = parseInt(req.params.id);
    const updates = req.body;

    const game = await Game.findOneAndUpdate({ id: gameId }, updates, { new: true });

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Game updated successfully',
      data: game
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
