const express = require('express');
const Game = require('../models/Game');
const auth = require('../middleware/auth');
const { fetchTextEmbedding, cosineSimilarity, l2normalize, IGDB_GENRES } = require('../utils/embeddings');
const { getGamesByGenre } = require('../igdb');

const GENRE_ID_MAP = {
  'Role-playing (RPG)': 12,
  'Shooter': 5,
  'Adventure': 31,
  'Platformer': 8,
  'Strategy': 15,
  'Puzzle': 9,
  'Racing': 10,
  'Sports': 14,
  'Fighting': 4,
  "Hack and slash/Beat 'em up": 25,
};

// Module-level cache — warmed on first /global call, reused for all subsequent calls
const genreEmbeddingCache = new Map();

function igdbCoverUrl(raw) {
  if (!raw) return null;
  return raw.replace(/^\/\//, 'https://').replace('/t_thumb/', '/t_cover_big/');
}

const router = express.Router();

// POST /api/mood
// Body: { mood: string }
// Embeds the mood text and cosine-matches against the text portion of each
// user library game's embedding. Returns top 5 sorted by vibe score.
router.post('/', auth, async (req, res) => {
  try {
    const { mood } = req.body;
    if (!mood || typeof mood !== 'string' || !mood.trim()) {
      return res.status(400).json({ success: false, message: 'mood string is required' });
    }

    // Embed the mood text → 384-dim → scale to match game text slice weighting
    const rawMoodVec = await fetchTextEmbedding(mood.trim());
    const moodVec = l2normalize(rawMoodVec).map(v => v * Math.sqrt(0.6));

    // Load user's games that have embeddings
    const games = await Game.find({
      userId: req.user.id,
      embedding: { $exists: true, $ne: null, $not: { $size: 0 } },
    }).select('id title genre coverUrl price hoursPlayed embedding');

    if (games.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // Score each game: compare moodVec against the text slice of game.embedding
    // Blended vector layout: [0..14] = structured (15 dims), [15..398] = text (384 dims)
    const STRUCT_DIMS = 15;
    const scored = games.map(game => {
      const textSlice = game.embedding.slice(STRUCT_DIMS);
      const score = cosineSimilarity(moodVec, textSlice);
      return {
        id: game.id,
        _id: game._id,
        title: game.title,
        genre: game.genre,
        coverUrl: game.coverUrl,
        price: game.price,
        hoursPlayed: game.hoursPlayed,
        vibeScore: score,
      };
    });

    const top5 = scored
      .sort((a, b) => b.vibeScore - a.vibeScore)
      .slice(0, 5);

    res.json({ success: true, data: top5 });
  } catch (err) {
    const detail = err?.message ?? 'unknown error';
    console.error('Mood match error:', detail);
    res.status(500).json({ success: false, message: `Mood match failed: ${detail}` });
  }
});

// POST /api/mood/global
// Body: { mood: string }
// No auth required — results are public IGDB games.
// Embeds mood text, cosine-matches against cached genre embeddings,
// picks top 2 genres, fetches IGDB games for each, returns merged top 10.
router.post('/global', async (req, res) => {
  try {
    const { mood } = req.body;
    if (!mood || typeof mood !== 'string' || !mood.trim()) {
      return res.status(400).json({ success: false, message: 'mood string is required' });
    }

    // 1. Embed the mood text
    const moodVec = await fetchTextEmbedding(mood.trim());

    // 2. Warm genre embedding cache (only fetches genres not yet cached)
    await Promise.all(
      IGDB_GENRES.map(async (genre) => {
        if (!genreEmbeddingCache.has(genre)) {
          const vec = await fetchTextEmbedding(genre);
          genreEmbeddingCache.set(genre, vec);
        }
      })
    );

    // 3. Score each genre against the mood vector, take top 2
    const genreScores = IGDB_GENRES
      .map(genre => ({ genre, score: cosineSimilarity(moodVec, genreEmbeddingCache.get(genre)) }))
      .sort((a, b) => b.score - a.score);

    const topGenreIds = genreScores
      .slice(0, 2)
      .map(g => GENRE_ID_MAP[g.genre])
      .filter(Boolean);

    // 4. Fetch IGDB games for both genres in parallel
    const results = await Promise.all(topGenreIds.map(id => getGamesByGenre(id)));

    // 5. Merge + deduplicate by IGDB game id
    const seen = new Set();
    const merged = results.flat().filter(g => {
      if (seen.has(g.id)) return false;
      seen.add(g.id);
      return true;
    }).slice(0, 10);

    // 6. Shape response
    const data = merged.map(g => ({
      igdbId: g.id,
      title: g.name,
      genre: g.genres?.[0]?.name ?? null,
      coverUrl: igdbCoverUrl(g.cover?.url),
      rating: g.rating ?? null,
    }));

    res.json({ success: true, data });
  } catch (err) {
    const detail = err?.message ?? 'unknown error';
    console.error('Global mood match error:', detail);
    res.status(500).json({ success: false, message: `Global mood match failed: ${detail}` });
  }
});

module.exports = router;
