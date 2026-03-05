import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
});

async function unwrap(promise) {
    const res = await promise;
    if (res && res.data) {
        return res.data.data !== undefined ? res.data.data : res.data;
    }
    return res;
}

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
