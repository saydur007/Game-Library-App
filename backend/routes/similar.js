const express = require('express');
const mongoose = require('mongoose');
const OpenAI = require('openai');
const Game = require('../models/Game');
const { cosineSimilarity } = require('../utils/embeddings');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const router = express.Router();

// Resolves a route param to a Mongoose query filter.
// Supports both numeric id (seed games) and MongoDB ObjectId strings (user games).
function resolveFilter(id) {
  const isObjectId = mongoose.Types.ObjectId.isValid(id) && id.length === 24;
  return isObjectId ? { _id: id } : { id: parseInt(id) };
}

// GET /api/games/:id/similar
// Returns the top 5 most similar games by cosine similarity on stored embeddings.
// No auth required — works for both seed games and user games.
router.get('/:id/similar', async (req, res) => {
  try {
    const queryGame = await Game.findOne(resolveFilter(req.params.id));
    if (!queryGame) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }
    if (!queryGame.embedding || queryGame.embedding.length === 0) {
      return res.status(400).json({ success: false, message: 'This game has no embedding yet. Run the embed script first.' });
    }

    // Load all other games that have embeddings
    const candidates = await Game.find({
      _id: { $ne: queryGame._id },
      embedding: { $exists: true, $ne: null, $not: { $size: 0 } },
    }).select('id title genre coverUrl price hoursPlayed countryOfOrigin embedding');

    // Score each candidate
    const scored = candidates.map(game => ({
      id: game.id,
      _id: game._id,
      title: game.title,
      genre: game.genre,
      coverUrl: game.coverUrl,
      price: game.price,
      similarityScore: cosineSimilarity(queryGame.embedding, game.embedding),
    }));

    // Sort descending, take top 5
    const top5 = scored
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, 5);

    res.json({ success: true, data: top5 });
  } catch (err) {
    console.error('Similar games error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/games/:id/explain
// Accepts { similarGames } in body, calls Ollama to generate a natural language
// explanation of what the similar games have in common with the query game.
// Prompt template is intentionally left for the developer to own.
router.post('/:id/explain', async (req, res) => {
  try {
    const queryGame = await Game.findOne(resolveFilter(req.params.id));
    if (!queryGame) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }

    const { similarGames } = req.body;
    if (!similarGames || !Array.isArray(similarGames) || similarGames.length === 0) {
      return res.status(400).json({ success: false, message: 'similarGames array is required' });
    }

    const prompt = buildPrompt(queryGame, similarGames);

    const completion = await openai.chat.completions.create({
      model: 'gpt-5.4-mini',
      messages: [{ role: 'user', content: prompt }],
      max_completion_tokens: 200,
    });

    const explanation = completion.choices[0].message.content;
    res.json({ success: true, data: { explanation } });
  } catch (err) {
    const status = err?.status ?? err?.response?.status;
    const detail = err?.message ?? 'unknown error';
    console.error('Explain error:', status, detail);
    const message = status === 429
      ? 'Rate limit hit — wait a moment and try again.'
      : `Failed to generate explanation: ${detail}`;
    res.status(500).json({ success: false, message });
  }
});


/**
 * Builds the prompt sent to Ollama for generating a similarity explanation.
 * queryGame: { title, genre, price }
 * similarGames: [{ title, genre, similarityScore }, ...]
 */
function buildPrompt(queryGame, similarGames) {
  const gameList = similarGames
    .map((g, i) => `${i + 1}. ${g.title} (${g.genre})`)
    .join('\n');


  return `You are a game recommendation assistant.

A user is interested in: "${queryGame.title}" (${queryGame.genre}).

The following games were found to be most similar based on their metadata and description:
${gameList}

In 2-3 sentences, explain what these games have in common with "${queryGame.title}".
Focus on gameplay style, themes, and tone. Be concise and helpful. Be playful with the language and poke some fun at the user.
If users get recommended a soft genre of game, then say they are not worthy of souls like game and should stick to walking simulators like this. Just full on roast them.`;
}

// POST /api/games/overview
// Accepts { trendingGame: { title, genre, rating }, library: [{ title, genre, hoursPlayed }] }
// Returns an AI-generated overview of whether the trending game fits the user's library taste.
router.post('/overview', async (req, res) => {
  try {
    const { trendingGame, library } = req.body;
    if (!trendingGame?.title) {
      return res.status(400).json({ success: false, message: 'trendingGame with title is required' });
    }

    const prompt = buildOverviewPrompt(trendingGame, Array.isArray(library) ? library : []);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_completion_tokens: 220,
    });

    const overview = completion.choices[0].message.content;
    res.json({ success: true, data: { overview } });
  } catch (err) {
    const status = err?.status ?? err?.response?.status;
    const detail = err?.message ?? 'unknown error';
    console.error('Overview error:', status, detail);
    const message = status === 429
      ? 'Rate limit hit — wait a moment and try again.'
      : `Failed to generate overview: ${detail}`;
    res.status(500).json({ success: false, message });
  }
});

/**
 * Builds the prompt for the library-fit overview.
 * trendingGame: { title, genre, rating }
 * library: [{ title, genre, hoursPlayed }, ...]
 */
function buildOverviewPrompt(trendingGame, library) {
  const libraryList = library.length > 0
    ? library.map(g => `- ${g.title} (${g.genre || 'Unknown'}, ${g.hoursPlayed || 0}h played)`).join('\n')
    : 'The user has no games in their library yet.';

  return `You are a snarky but insightful game recommendation AI.

The user's current library:
${libraryList}

They are considering adding: "${trendingGame.title}" (${trendingGame.genre || 'Unknown genre'}${trendingGame.rating ? `, rated ${Math.round(trendingGame.rating)}/100` : ''}).

In 2-3 sentences, tell them whether this game fits their taste based on what they already play.
Be direct, a little playful, and actually helpful. If the game is a great fit, hype it up. If it's way off their usual taste, roast them gently for even considering it.`;
}

module.exports = router;
