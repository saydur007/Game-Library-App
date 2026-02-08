const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Load games data from JSON file
let games = [];

function loadGames() {
  try {
    const data = fs.readFileSync(path.join(__dirname, '../games.json'), 'utf8');
    games = JSON.parse(data);
  } catch (error) {
    console.error('Error loading games.json:', error);
    games = [];
  }
}

function saveGames() {
  try {
    fs.writeFileSync(path.join(__dirname, '../games.json'), JSON.stringify(games, null, 2));
  } catch (error) {
    console.error('Error saving games.json:', error);
  }
}

loadGames();

// ===== REST API ENDPOINTS =====

// GET - Retrieve all games
router.get('/', (req, res) => {
  try {
    res.status(200).json({ success: true, data: games });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST - Add a new game to the library
router.post('/', (req, res) => {
  try {
    const { title, genre, hoursPlayed, price, buyLink } = req.body;

    if (!title || !genre || price === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: title, genre, price' 
      });
    }

    const newGame = {
      id: games.length > 0 ? Math.max(...games.map(g => g.id)) + 1 : 1,
      title,
      genre,
      hoursPlayed: hoursPlayed || 0,
      price,
      buyLink: buyLink || '#',
      dateAdded: new Date().toISOString()
    };

    games.push(newGame);
    saveGames();

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
router.delete('/:id', (req, res) => {
  try {
    const gameId = parseInt(req.params.id);
    const gameIndex = games.findIndex(g => g.id === gameId);

    if (gameIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Game not found' 
      });
    }

    const deletedGame = games.splice(gameIndex, 1);
    saveGames();

    res.status(200).json({ 
      success: true, 
      message: 'Game deleted successfully', 
      data: deletedGame[0] 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PUT - Update hours played for a game
router.put('/:id', (req, res) => {
  try {
    const gameId = parseInt(req.params.id);
    const { hoursPlayed } = req.body;

    if (hoursPlayed === undefined || hoursPlayed === null) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required field: hoursPlayed' 
      });
    }

    const gameIndex = games.findIndex(g => g.id === gameId);

    if (gameIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Game not found' 
      });
    }

    games[gameIndex].hoursPlayed = parseInt(hoursPlayed);
    saveGames();

    res.status(200).json({ 
      success: true, 
      message: 'Hours played updated successfully', 
      data: games[gameIndex] 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
