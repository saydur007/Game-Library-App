const express  = require('express');
const TierList = require('../models/TierList');
const auth     = require('../middleware/auth');

const router = express.Router();

// GET /api/tierlist — get current user's tier list
router.get('/', auth, async (req, res) => {
  try {
    const tierList = await TierList.findOne({ userId: req.user.id });
    res.json({
      success: true,
      data: tierList || { tiers: { S: [], A: [], B: [], C: [], D: [] } }
    });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/tierlist — create or update tier list
router.put('/', auth, async (req, res) => {
  try {
    const { tiers } = req.body;
    const tierList = await TierList.findOneAndUpdate(
      { userId: req.user.id },
      { tiers, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: tierList });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
