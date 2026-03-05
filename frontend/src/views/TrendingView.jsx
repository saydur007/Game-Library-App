import { useEffect, useMemo, useState } from 'react';
import { addGame, getGames, getTrendingGames } from '../api';
import AlertMessage from '../components/AlertMessage';
import './TrendingView.css';

function igdbCoverUrl(cover) {
  if (!cover?.url) return '';
  return 'https:' + cover.url.replace('t_thumb', 't_cover_big');
}

function normalizeIgdbGame(game) {
  return {
    id: game.id,
    title: game.name || 'Unknown Game',
    genre: Array.isArray(game.genres) ? game.genres.map(g => g.name || g).join(', ') : null,
    cover: game.cover,
    coverUrl: igdbCoverUrl(game.cover),
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
  const [loading, setLoading] = useState(true);

  function showAlert(message, type) {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  }

  async function loadData() {
    setLoading(true);
    try {
      const [igdbResult, libraryResult] = await Promise.all([getTrendingGames(), getGames()]);
      setIgdbGames(Array.isArray(igdbResult) ? igdbResult.map(normalizeIgdbGame) : []);
      setLibraryGames(Array.isArray(libraryResult) ? libraryResult : []);
    } catch (error) {
      showAlert(error.message, 'error');
      setIgdbGames([]);
      setLibraryGames([]);
    } finally {
      setLoading(false);
    }
  }

  async function addToLibrary(game) {
    try {
      const result = await addGame({
        title: game.title,
        genre: game.genre || 'Unknown',
        hoursPlayed: 0,
        price: game.price || 29.99,
        buyLink: game.buyLink || '#',
        coverUrl: game.coverUrl || '',
      });
      showAlert(`${result.title} added to your library!`, 'success');
      loadData();
    } catch (error) {
      showAlert(error.message, 'error');
    }
  }

  const titleSet = useMemo(
    () => new Set(libraryGames.map(g => String(g.title).toLowerCase())),
    [libraryGames]
  );

  const visibleGames = useMemo(() => {
    const igdb = igdbGames.map(g => ({ ...g, source: 'igdb' }));
    const local = libraryGames.map(g => ({ ...g, source: 'local' }));
    if (filter === 'trending') return igdb;
    if (filter === 'library') return local;
    return [...igdb, ...local];
  }, [filter, igdbGames, libraryGames]);

  useEffect(() => { loadData(); }, []);

  const FILTERS = [
    { key: 'all',      label: 'All Games' },
    { key: 'trending', label: 'IGDB Trending' },
    { key: 'library',  label: 'My Library' },
  ];

  return (
    <section className="trending-page">

      {/* Hero */}
      <div className="trending-hero">
        <h1 className="trending-hero-title">Trending Games</h1>
        <p className="trending-hero-subtitle">
          Top-rated titles from IGDB — add any to your personal library
        </p>

        {/* Filter tabs */}
        <div className="trending-filters">
          {FILTERS.map(f => (
            <button
              key={f.key}
              className={`trending-filter-btn${filter === f.key ? ' active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <AlertMessage alert={alert} />

      {/* Loading skeleton */}
      {loading && (
        <div className="trending-skeleton-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="trending-skeleton-card" style={{ animationDelay: `${i * 0.05}s` }} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && visibleGames.length === 0 && (
        <div className="trending-empty">
          <div className="trending-empty-icon">🎮</div>
          <p>No games to show here.</p>
        </div>
      )}

      {/* Count label */}
      {!loading && visibleGames.length > 0 && (
        <p className="trending-count-label">
          <span className="trending-count">{visibleGames.length}</span> games
        </p>
      )}

      {/* Poster grid */}
      {!loading && visibleGames.length > 0 && (
        <div className="trending-grid">
          {visibleGames.map((game, i) => {
            const inLibrary = titleSet.has(String(game.title).toLowerCase());
            const isLocal = game.source === 'local';
            return (
              <div
                key={`${game.source}-${game.id}`}
                className="trending-card"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                {/* Cover */}
                {game.coverUrl
                  ? <img src={game.coverUrl} alt={game.title} className="trending-card-cover" />
                  : <div className="trending-card-no-cover"><span>🎮</span></div>
                }

                {/* Source badge */}
                <div className={`trending-card-source ${isLocal ? 'source-local' : 'source-igdb'}`}>
                  {isLocal ? 'Your Library' : 'IGDB'}
                </div>

                {/* In-library badge */}
                {!isLocal && inLibrary && (
                  <div className="trending-card-in-library">✓ Saved</div>
                )}

                {/* Rating */}
                {game.rating && (
                  <div className="trending-card-rating">★ {Math.round(game.rating)}</div>
                )}

                {/* Bottom overlay */}
                <div className="trending-card-overlay">
                  <div className="trending-card-title">{game.title}</div>
                  {game.genre && <div className="trending-card-genre">{game.genre}</div>}
                </div>

                {/* Hover action — only for unsaved IGDB games */}
                {!isLocal && !inLibrary && (
                  <div className="trending-card-hover">
                    <button
                      className="trending-card-add-btn"
                      onClick={() => addToLibrary(game)}
                    >
                      + Add to Library
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default TrendingView;
