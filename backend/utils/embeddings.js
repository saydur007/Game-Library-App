/**
 * Hybrid Embedding Pipeline
 * Converts IGDB game metadata into a blended vector:
 *   - 15-dim hand-crafted structured vector
 *   - 384-dim semantic text embedding (Hugging Face)
 * Entry point: buildEmbedding(game) → Number[399]
 */

const axios = require('axios');

// Top 10 IGDB genres — used for one-hot encoding in buildStructuredVector
const IGDB_GENRES = [
  'Role-playing (RPG)',
  'Shooter',
  'Adventure',
  'Platformer',
  'Strategy',
  'Puzzle',
  'Racing',
  'Sports',
  'Fighting',
  'Hack and slash/Beat \'em up',
];

// ISO alpha-2 country → region index (0=Americas, 1=Europe, 2=Asia)
const COUNTRY_REGIONS = {
  US: 0, CA: 0, MX: 0, BR: 0, AR: 0,
  GB: 1, DE: 1, FR: 1, PL: 1, SE: 1, FI: 1, NL: 1, ES: 1, IT: 1, CZ: 1, HU: 1, RO: 1,
  JP: 2, KR: 2, CN: 2, TW: 2,
};

/**
 * Fetches a 384-dimensional semantic embedding from Hugging Face.
 * @param {string} text
 * @returns {Promise<number[]>}
 */
async function fetchTextEmbedding(text) {
  const url = 'https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction';

  const headers = { 'Content-Type': 'application/json' };
  const hfToken = process.env.HF_API_TOKEN;
  if (hfToken) headers['Authorization'] = `Bearer ${hfToken}`;

  const response = await axios.post(url, { inputs: text }, { headers });
  const raw = response.data;
  const vec = Array.isArray(raw[0]) ? raw[0] : raw;

  if (!Array.isArray(vec) || vec.length !== 384) {
    throw new Error(`Unexpected embedding shape from HuggingFace: ${JSON.stringify(vec).slice(0, 100)}`);
  }

  return vec;
}

/**
 * L2-normalizes a vector: returns v / ||v||
 * @param {number[]} vec
 * @returns {number[]}
 */
function l2normalize(vec) {
  const magnitude = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
  if (magnitude === 0) return vec;
  return vec.map(v => v / magnitude);
}

/**
 * Builds a 15-dimensional structured feature vector from game metadata.
 * Dims 0–9:   genre one-hot
 * Dim  10:    normalized price (0–1, max $70)
 * Dim  11:    normalized hours played (0–1, max 200h)
 * Dims 12–14: developer region one-hot (Americas / Europe / Asia)
 * @param {object} game
 * @returns {number[]}
 */
function buildStructuredVector(game) {
  const genreVec = IGDB_GENRES.map(g => g === game.genre ? 1 : 0);
  const priceNorm = Math.min(game.price / 70, 1);
  const hoursNorm = Math.min(game.hoursPlayed / 200, 1);

  const regionVec = [0, 0, 0];
  if (game.countryOfOrigin) {
    const regionIndex = COUNTRY_REGIONS[game.countryOfOrigin];
    if (regionIndex !== undefined) regionVec[regionIndex] = 1;
  }

  return [...genreVec, priceNorm, hoursNorm, ...regionVec];
}

/**
 * Blends structured and text vectors into a single hybrid vector.
 * Weights: 40% structured, 60% text (via sqrt scaling before concatenation).
 * @param {number[]} structured
 * @param {number[]} text
 * @returns {number[]}
 */
function blendVectors(structured, text) {
  const scaledStructured = l2normalize(structured).map(v => v * Math.sqrt(0.4));
  const scaledText = l2normalize(text).map(v => v * Math.sqrt(0.6));
  return [...scaledStructured, ...scaledText];
}

/**
 * Computes cosine similarity between two equal-length vectors.
 * Returns a value in [-1, 1] where 1 = identical, 0 = unrelated.
 * @param {number[]} vecA
 * @param {number[]} vecB
 * @returns {number}
 */
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Builds the full hybrid embedding for a game document.
 * This is what gets stored in game.embedding in MongoDB.
 * @param {object} game - Mongoose Game document
 * @returns {Promise<number[]>}
 */
async function buildEmbedding(game) {
  const inputText = [game.title, game.genre].filter(Boolean).join('. ');
  const [structured, textVec] = await Promise.all([
    Promise.resolve(buildStructuredVector(game)),
    fetchTextEmbedding(inputText),
  ]);
  return blendVectors(structured, textVec);
}

module.exports = {
  buildEmbedding,
  fetchTextEmbedding,
  buildStructuredVector,
  blendVectors,
  cosineSimilarity,
  l2normalize,
  IGDB_GENRES,
  COUNTRY_REGIONS,
};
