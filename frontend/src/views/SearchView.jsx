import { useMemo, useState } from 'react';
import { addGame, getGames, searchIgdb } from '../api';
import AlertMessage from '../components/AlertMessage';
import './SearchView.css';

function igdbCoverUrl(cover) {
  if (!cover?.url) return '';
  return 'https:' + cover.url.replace('t_thumb', 't_cover_big');
}

function normalizeIgdbGame(game) {
  return {
    id: game.id,
    title: game.name || 'Unknown Game',
    genre: Array.isArray(game.genres) ? game.genres.map(g => g.name || g).join(', ') : null,
    coverUrl: igdbCoverUrl(game.cover),
    rating: typeof game.rating === 'number' ? game.rating : null,
    hoursPlayed: 0,
    price: 29.99,
    buyLink: '#',
  };
}

function SearchView() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [libraryGames, setLibraryGames] = useState([]);
  const [alert, setAlert] = useState(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  function showAlert(message, type) {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResults([]);
    try {
      const [igdbResults, libraryData] = await Promise.all([
        searchIgdb(query.trim()),
        getGames(),
      ]);
      setResults(Array.isArray(igdbResults) ? igdbResults.map(normalizeIgdbGame) : []);
      setLibraryGames(Array.isArray(libraryData) ? libraryData : []);
      setSearched(true);
    } catch (error) {
      showAlert(error.message, 'error');
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
      const libraryData = await getGames();
      setLibraryGames(Array.isArray(libraryData) ? libraryData : []);
    } catch (error) {
      showAlert(error.message, 'error');
    }
  }

  const libraryTitles = useMemo(
    () => new Set(libraryGames.map(g => String(g.title).toLowerCase())),
    [libraryGames]
  );

  return (
    <section className="search-page">

      {/* Hero */}
      <div className="search-hero">
        <h1 className="search-hero-title">Discover Games</h1>
        <p className="search-hero-subtitle">
          Search the IGDB database and add any game to your library
        </p>
        <form className="search-bar-wrapper" onSubmit={handleSearch}>
          <span className="search-bar-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            className="search-bar"
            type="text"
            placeholder="Search for any game..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
          <button className="search-bar-btn" type="submit" disabled={loading}>
            {loading ? <span className="search-btn-spinner" /> : 'Search'}
          </button>
        </form>
      </div>

      <AlertMessage alert={alert} />

      {/* Loading skeleton */}
      {loading && (
        <div className="search-skeleton-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="search-skeleton-card" style={{ animationDelay: `${i * 0.06}s` }} />
          ))}
        </div>
      )}

      {/* Initial state */}
      {!searched && !loading && (
        <div className="search-initial-state">
          <div className="search-initial-icon">🎮</div>
          <p>Start typing to discover games from the IGDB database</p>
          <div className="search-suggestions">
            {['Elden Ring', 'The Witcher', 'Cyberpunk', 'Hollow Knight'].map(s => (
              <button
                key={s}
                className="search-suggestion-chip"
                onClick={() => { setQuery(s); }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No results */}
      {searched && results.length === 0 && !loading && (
        <div className="search-no-results">
          <div className="search-initial-icon">🔍</div>
          <p>No results found for <strong>&ldquo;{query}&rdquo;</strong></p>
          <span>Try a different spelling or a broader search</span>
        </div>
      )}

      {/* Results header */}
      {results.length > 0 && !loading && (
        <p className="search-results-label">
          <span className="search-results-count">{results.length}</span> results for &ldquo;{query}&rdquo;
        </p>
      )}

      {/* Poster grid */}
      {results.length > 0 && !loading && (
        <div className="search-results-grid">
          {results.map((game, i) => {
            const inLibrary = libraryTitles.has(String(game.title).toLowerCase());
            return (
              <div
                key={game.id}
                className="search-result-card"
                style={{ animationDelay: `${i * 0.045}s` }}
              >
                {/* Cover */}
                {game.coverUrl
                  ? <img src={game.coverUrl} alt={game.title} className="search-result-cover" />
                  : (
                    <div className="search-result-no-cover">
                      <span>🎮</span>
                    </div>
                  )
                }

                {/* In-library badge */}
                {inLibrary && (
                  <div className="search-result-badge">✓ In Library</div>
                )}

                {/* Rating pill */}
                {game.rating && (
                  <div className="search-result-rating">
                    ★ {Math.round(game.rating)}
                  </div>
                )}

                {/* Bottom overlay*/}
                <div className="search-result-overlay">
                  <div className="search-result-title">{game.title}</div>
                  {game.genre && <div className="search-result-genre">{game.genre}</div>}
                </div>

                {/* Hover action */}
                {!inLibrary && (
                  <div className="search-result-hover">
                    <button
                      className="search-result-add-btn"
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

export default SearchView;
