import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
});

// Re-attach token on module load (handles page refresh)
const storedToken = localStorage.getItem('token');
if (storedToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
}

async function unwrap(promise) {
    const res = await promise;
    if (res && res.data) {
        return res.data.data !== undefined ? res.data.data : res.data;
    }
    return res;
}

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export function getGames() {
    return unwrap(api.get('/games'));
}

export function getGame(id) {
    return unwrap(api.get(`/games/${id}`));
}

export function addGame(payload) {
    return unwrap(api.post('/games', payload));
}

export function removeGame(id) {
    return unwrap(api.delete(`/games/${id}`));
}

export function editHours(id, hours) {
    return unwrap(api.put(`/games/${id}`, { hoursPlayed: hours }));
}

// igdb endpoints
export function getTrendingGames() {
    return unwrap(api.get('/igdb/trending'));
}

export function searchIgdb(name) {
    return unwrap(api.get(`/igdb/search/${encodeURIComponent(name)}`));
}

export function getGamesByGenre(genreId) {
    return unwrap(api.get(`/igdb/genre/${genreId}`));
}

export default api;

// --- Auth ---
export function register(payload)  { return unwrap(api.post('/auth/register', payload)); }
export function login(payload)     { return unwrap(api.post('/auth/login', payload)); }
export function getMe()            { return unwrap(api.get('/auth/me')); }

// --- Messages ---
export function getUsers()                { return unwrap(api.get('/messages/users')); }
export function getConversation(userId)   { return unwrap(api.get(`/messages/${userId}`)); }

// --- Tier List ---
export function getTierList()             { return unwrap(api.get('/tierlist')); }
export function saveTierList(tiers)       { return unwrap(api.put('/tierlist', { tiers })); }

// --- Steam ---
export function connectSteam(steamId)     { return unwrap(api.post('/steam/connect', { steamId })); }
export function getSteamLibrary()         { return unwrap(api.get('/steam/library')); }

// --- Game with country ---
export function editGame(id, payload)     { return unwrap(api.put(`/games/${id}`, payload)); }

// --- AI Similarity ---
export function getSimilarGames(gameId)                      { return unwrap(api.get(`/games/${gameId}/similar`)); }
export function explainSimilarity(gameId, similarGames)      { return unwrap(api.post(`/games/${gameId}/explain`, { similarGames })); }
export function getGameOverview(trendingGame, library)       { return unwrap(api.post('/games/overview', { trendingGame, library })); }
export function getMoodMatches(mood)                         { return unwrap(api.post('/mood', { mood })); }
export function getGlobalMoodMatches(mood)                   { return unwrap(api.post('/mood/global', { mood })); }
