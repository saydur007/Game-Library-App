import { useEffect, useMemo, useState } from 'react';
import { addGame, getGames, getTrendingGames } from '../api';
import AlertMessage from '../components/AlertMessage';
import GameCard from '../components/GameCard';

function normalizeIgdbGame(game) {
  return {
    id: game.id,
    title: game.name || 'Unknown Game',
    genre: Array.isArray(game.genres) ? game.genres.join(', ') : 'Unknown',
    hoursPlayed: 0,
    price: 29.99,
    buyLink: '#',
    rating: game.rating,
  };
}

function TrendingView() {
  const [filter, setFilter] = useState('all');
  const [alert, setAlert] = useState(null);
  const [igdbGames, setIgdbGames] = useState([]);
  const [libraryGames, setLibraryGames] = useState([]);

  function showAlert(message, type) {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  }

  async function loadData() {
    try {
      const [igdbResult, libraryResult] = await Promise.all([getTrendingGames(), getGames()]);

      // API helpers now return raw data arrays/objects
      const igdbData = Array.isArray(igdbResult) ? igdbResult : [];
      const libraryData = Array.isArray(libraryResult) ? libraryResult : [];

      setIgdbGames(igdbData.map(normalizeIgdbGame));
      setLibraryGames(libraryData);
    } catch (error) {
      showAlert(error.message, 'error');
      setIgdbGames([]);
      setLibraryGames([]);
    }
  }

  async function addToLibrary(game) {
    try {
      const payload = {
        title: game.title,
        genre: game.genre,
        hoursPlayed: game.hoursPlayed || 0,
        price: game.price || 29.99,
        buyLink: game.buyLink || '#',
      };

      const result = await addGame(payload);
      showAlert(`${result.title} added to your library!`, 'success');
      loadData();
    } catch (error) {
      showAlert(error.message, 'error');
    }
  }

  const titleSet = useMemo(
    () => new Set(libraryGames.map((game) => String(game.title).toLowerCase())),
    [libraryGames]
  );

  const visibleGames = useMemo(() => {
    const withSource = [
      ...igdbGames.map((game) => ({ ...game, source: 'igdb' })),
      ...libraryGames.map((game) => ({ ...game, source: 'local' })),
    ];

    if (filter === 'trending') return withSource.filter((game) => game.source === 'igdb');
    if (filter === 'library') return withSource.filter((game) => game.source === 'local');
    return withSource;
  }, [filter, igdbGames, libraryGames]);

  useEffect(() => {
    loadData();
  }, []);

  return (
    <section>
      <h1>Trending and New Games</h1>
      <p className="muted">
        Discover popular games from IGDB and add them to your personal library.
      </p>
      <AlertMessage alert={alert} />

      <div className="filters">
        <button
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'btn-primary' : 'btn-secondary'}
        >
          All Games
        </button>
        <button
          onClick={() => setFilter('trending')}
          className={filter === 'trending' ? 'btn-primary' : 'btn-secondary'}
        >
          IGDB Trending
        </button>
        <button
          onClick={() => setFilter('library')}
          className={filter === 'library' ? 'btn-primary' : 'btn-secondary'}
        >
          My Library
        </button>
      </div>

      {visibleGames.length === 0 ? (
        <div className="empty-state">No games available right now.</div>
      ) : (
        <div className="game-grid">
          {visibleGames.map((game) => (
            <GameCard
              key={`${game.source}-${game.id}`}
              game={game}
              source={game.source}
              inLibrary={titleSet.has(String(game.title).toLowerCase())}
              onAddToLibrary={addToLibrary}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default TrendingView;