const express = require('express');
const axios   = require('axios');
const User    = require('../models/User');
const auth    = require('../middleware/auth');

const router = express.Router();
const STEAM_API = 'https://api.steampowered.com';

// POST /api/steam/connect — link Steam ID to user account
router.post('/connect', auth, async (req, res) => {
  const { steamId } = req.body;
  if (!steamId)
    return res.status(400).json({ success: false, message: 'steamId required' });
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { steamId },
      { new: true }
    ).select('-passwordHash');
    res.json({ success: true, data: user });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/steam/library — fetch owned games from Steam
router.get('/library', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user?.steamId)
      return res.status(400).json({ success: false, message: 'No Steam ID linked. Go to Profile to connect Steam.' });

    const response = await axios.get(`${STEAM_API}/IPlayerService/GetOwnedGames/v1/`, {
      params: {
        key:                       process.env.STEAM_API_KEY,
        steamid:                   user.steamId,
        include_appinfo:           1,
        include_played_free_games: 1
      }
    });

    const games = response.data?.response?.games || [];
    const normalized = games.map(g => ({
      title:       g.name,
      hoursPlayed: Math.round((g.playtime_forever || 0) / 60),
      coverUrl:    `https://cdn.akamai.steamstatic.com/steam/apps/${g.appid}/header.jpg`,
      buyLink:     `https://store.steampowered.com/app/${g.appid}`,
      steamAppId:  g.appid
    }));

    res.json({ success: true, data: normalized });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch Steam library: ' + err.message });
  }
});

module.exports = router;
