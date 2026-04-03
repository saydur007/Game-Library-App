/**
 * Backfill script — generates and stores embeddings for all games in MongoDB.
 *
 * Run from the backend directory:
 *   node scripts/embedAll.js
 *
 * Games that already have embeddings are skipped.
 * A 1.2s delay between calls avoids HuggingFace free-tier rate limits.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Game = require('../models/Game');
const { buildEmbedding } = require('../utils/embeddings');

const DELAY_MS = 1200;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gamelibrary';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const games = await Game.find({
    $or: [{ embedding: null }, { embedding: { $size: 0 } }, { embedding: { $exists: false } }]
  });

  if (games.length === 0) {
    console.log('All games already have embeddings. Nothing to do.');
    await mongoose.disconnect();
    return;
  }

  console.log(`Found ${games.length} game(s) without embeddings. Starting...\n`);

  let success = 0;
  let failed = 0;

  for (const game of games) {
    try {
      const embedding = await buildEmbedding(game);
      await Game.updateOne({ _id: game._id }, { embedding });
      console.log(`✓ ${game.title} (${embedding.length} dims)`);
      success++;
    } catch (err) {
      console.error(`✗ ${game.title}: ${err.message}`);
      failed++;
    }

    // Respect HuggingFace free tier rate limit
    if (games.indexOf(game) < games.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  console.log(`\nDone. ${success} embedded, ${failed} failed.`);
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
