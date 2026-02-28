const express = require('express');
const router = express.Router();
const igdb = require('../igdb');

// Get trending games from IGDB
router.get('/trending', async (req, res) => {
  try {
    const games = await igdb.getTrendingGames();
    res.status(200).json({ 
      success: true, 
      data: games,
      message: 'Trending games fetched from IGDB'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Search games by name
router.get('/search/:name', async (req, res) => {
  try {
    const { name } = req.params;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Game name is required' 
      });
    }

    const games = await igdb.searchGamesByName(name);
    res.status(200).json({ 
      success: true, 
      data: games,
      message: `Search results for "${name}"`
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get games by genre
router.get('/genre/:genreId', async (req, res) => {
  try {
    const { genreId } = req.params;
    
    if (!genreId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Genre ID is required' 
      });
    }

    const games = await igdb.getGamesByGenre(parseInt(genreId));
    res.status(200).json({ 
      success: true, 
      data: games,
      message: `Games fetched for genre ID: ${genreId}`
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;
