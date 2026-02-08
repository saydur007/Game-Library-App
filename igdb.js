// IGDB API Handler
const axios = require('axios');

// Store token and expiration time
let accessToken = null;
let tokenExpiration = null;

// IGDB Configuration
const IGDB_CLIENT_ID = process.env.IGDB_CLIENT_ID;
const IGDB_CLIENT_SECRET = process.env.IGDB_CLIENT_SECRET;
const IGDB_AUTH_URL = 'https://id.twitch.tv/oauth2/token';
const IGDB_API_URL = 'https://api.igdb.com/v4';

// Get or refresh access token
async function getAccessToken() {
  // We check if token is still valid
  if (accessToken && tokenExpiration && Date.now() < tokenExpiration) {
    return accessToken;
  }

  try {
    const response = await axios.post(IGDB_AUTH_URL, null, {
      params: {
        client_id: IGDB_CLIENT_ID,
        client_secret: IGDB_CLIENT_SECRET,
        grant_type: 'client_credentials'
      }
    });

    accessToken = response.data.access_token;
    tokenExpiration = Date.now() + (response.data.expires_in * 1000); 

    console.log('✓ IGDB token obtained successfully');
    return accessToken;
  } catch (error) {
    console.error('Error getting IGDB access token:', error.message);
    throw new Error('Failed to authenticate with IGDB');
  }
}

// Fetch games from IGDB
async function fetchGamesFromIGDB(query = 'fields name, rating, genres, platforms, release_dates; limit 10;') {
  try {
    const token = await getAccessToken();

    const response = await axios.post(`${IGDB_API_URL}/games`, query, {
      headers: {
        'Client-ID': IGDB_CLIENT_ID,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching from IGDB:', error.message);
    throw new Error('Failed to fetch games from IGDB');
  }
}

// Fetch trending games (sorted by rating)
async function getTrendingGames() {
  const query = `
    fields name, rating, genres, platforms, release_dates;
    where rating > 80;
    sort rating desc;
    limit 20;
  `;
  return fetchGamesFromIGDB(query);
}

// Search games by name
async function searchGamesByName(name) {
  const query = `
    fields name, rating, genres, platforms, release_dates;
    search "${name}";
    limit 10;
  `;
  return fetchGamesFromIGDB(query);
}

// Fetch popular games by genre
async function getGamesByGenre(genreId) {
  const query = `
    fields name, rating, genres, platforms, release_dates;
    where genres = [${genreId}];
    sort rating desc;
    limit 15;
  `;
  return fetchGamesFromIGDB(query);
}

module.exports = {
  getAccessToken,
  fetchGamesFromIGDB,
  getTrendingGames,
  searchGamesByName,
  getGamesByGenre
};
