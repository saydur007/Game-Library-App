import { useEffect, useMemo, useState } from 'react';
import { addGame, editHours, getGames, removeGame, searchIgdb } from '../api';
import AlertMessage from '../components/AlertMessage';
import SimilarGamesPanel from './SimilarGamesPanel';
import './LibraryView.css';

function igdbCoverUrl(cover) {
  if (!cover?.url) return '';
  return 'https:' + cover.url.replace('t_thumb', 't_cover_big');
}

function igdbThumbUrl(cover) {
  if (!cover?.url) return '';
  return 'https:' + cover.url.replace('t_thumb', 't_cover_small');
}

function LibraryView() {
  const [games, setGames]           = useState([]);
  const [alert, setAlert]           = useState(null);
  const [sortBy, setSortBy]         = useState('dateAdded');
  const [filterText, setFilterText] = useState('');

  const [editingId, setEditingId]       = useState(null);
  const [editingHours, setEditingHours] = useState('');
  const [similarGame, setSimilarGame]   = useState(null);

  const [searchQuery,   setSearchQuery]   = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchDone,    setSearchDone]    = useState(false);

  function showAlert(message, type) {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  }

  async function loadGames() {
    try {
      const data = await getGames();
      setGames(Array.isArray(data) ? data : []);
    } catch (error) {
      showAlert(error.message, 'error');
      setGames([]);
    }
  }

  async function deleteGame(id) {
    if (!window.confirm('Remove this game from your library?')) return;
    try {
      const result = await removeGame(id);
      showAlert(`${result.title} removed`, 'success');
      loadGames();
    } catch (error) {
      showAlert(error.message, 'error');
    }
  }

  function startEdit(game) {
    setEditingId(game.id);
    setEditingHours(String(game.hoursPlayed || 0));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingHours('');
  }

  async function submitEdit(game) {
    const parsed = Number(editingHours);
    if (Number.isNaN(parsed) || parsed < 0) {
      showAlert('Please enter a valid number', 'error');
      return;
    }
    try {
      await editHours(game.id, parsed);
      showAlert(`Hours updated to ${parsed}!`, 'success');
      setEditingId(null);
      loadGames();
    } catch (error) {
      showAlert(error.message, 'error');
    }
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setSearchDone(false);
    try {
      const results = await searchIgdb(searchQuery.trim());
      setSearchResults(Array.isArray(results) ? results : []);
      setSearchDone(true);
    } catch (error) {
      showAlert(error.message, 'error');
    } finally {
      setSearchLoading(false);
    }
  }

  async function addFromIgdb(igdbGame) {
    try {
      const result = await addGame({
        title: igdbGame.name || 'Unknown Game',
        genre: Array.isArray(igdbGame.genres)
          ? igdbGame.genres.map(g => g.name || g).join(', ')
          : 'Unknown',
        hoursPlayed: 0,
        price: 29.99,
        buyLink: '#',
        coverUrl: igdbCoverUrl(igdbGame.cover),
      });
      showAlert(`${result.title} added to your library!`, 'success');
      loadGames();
    } catch (error) {
      showAlert(error.message, 'error');
    }
  }

  const libraryTitles = useMemo(
    () => new Set(games.map(g => String(g.title).toLowerCase())),
    [games]
  );

  const stats = useMemo(() => {
    const totalHours = games.reduce((s, g) => s + (g.hoursPlayed || 0), 0);
    const totalValue = games.reduce((s, g) => s + (g.price || 0), 0);
    const mostPlayed = games.length
      ? games.reduce((m, g) => (g.hoursPlayed || 0) > (m.hoursPlayed || 0) ? g : m, games[0])
      : null;
    return { totalHours, totalValue, mostPlayed };
  }, [games]);

  const maxHours = useMemo(
    () => Math.max(...games.map(g => g.hoursPlayed || 0), 1),
    [games]
  );

  const displayedGames = useMemo(() => {
    let list = [...games];
    if (filterText.trim()) {
      const q = filterText.toLowerCase();
      list = list.filter(g => g.title.toLowerCase().includes(q) || (g.genre || '').toLowerCase().includes(q));
    }
    switch (sortBy) {
      case 'title':  list.sort((a, b) => a.title.localeCompare(b.title)); break;
      case 'hours':  list.sort((a, b) => (b.hoursPlayed || 0) - (a.hoursPlayed || 0)); break;
      case 'price':  list.sort((a, b) => (b.price || 0) - (a.price || 0)); break;
      default: break;
    }
    return list;
  }, [games, filterText, sortBy]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadGames(); }, []);

  const SORTS = [
    { key: 'dateAdded', label: 'Recent' },
    { key: 'hours',     label: 'Most Played' },
    { key: 'title',     label: 'A–Z' },
    { key: 'price',     label: 'Price' },
  ];

  return (
    <section className="library-page">

      {/* Hero */}
      <div className="library-hero">
        <h1 className="library-hero-title">My Game Library</h1>
        <p className="library-hero-subtitle">Track your collection, hours played, and more</p>
      </div>

      {/* Stats */}
      {games.length > 0 && (
        <div className="library-stats">
          <div className="library-stat-card">
            <div className="library-stat-value">{games.length}</div>
            <div className="library-stat-label">Games</div>
          </div>
          <div className="library-stat-card">
            <div className="library-stat-value">{stats.totalHours.toLocaleString()}</div>
            <div className="library-stat-label">Hours Played</div>
          </div>
          <div className="library-stat-card">
            <div className="library-stat-value">${stats.totalValue.toFixed(0)}</div>
            <div className="library-stat-label">Collection Value</div>
          </div>
          {stats.mostPlayed && (
            <div className="library-stat-card library-stat-card--wide">
              <div className="library-stat-value library-stat-value--sm">{stats.mostPlayed.title}</div>
              <div className="library-stat-label">Most Played</div>
            </div>
          )}
        </div>
      )}

      <AlertMessage alert={alert} />

      <div className="manage-section">

        {/* Left: game list */}
        <div className="library-section">

          {/* Controls */}
          <div className="library-controls">
            <input
              className="library-filter-input"
              type="text"
              placeholder="Filter by title or genre…"
              value={filterText}
              onChange={e => setFilterText(e.target.value)}
            />
            <div className="library-sort-tabs">
              {SORTS.map(s => (
                <button
                  key={s.key}
                  className={`library-sort-btn${sortBy === s.key ? ' active' : ''}`}
                  onClick={() => setSortBy(s.key)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {displayedGames.length === 0 ? (
            <div className="no-library-message">
              {games.length === 0
                ? 'Your library is empty — search for a game to add one!'
                : 'No games match your filter.'}
            </div>
          ) : (
            <div className="library-list">
              {displayedGames.map((game, index) => {
                const isEditing = editingId === game.id;
                const pct = Math.round(((game.hoursPlayed || 0) / maxHours) * 100);
                return (
                  <div key={`local-${game.id}`} className="library-item" style={{ animationDelay: `${index * 0.04}s` }}>
                    {/* Cover */}
                    {game.coverUrl
                      ? <img src={game.coverUrl} alt={game.title} className="library-item-cover" />
                      : <div className="library-item-cover library-item-cover--placeholder">🎮</div>
                    }

                    {/* Main content */}
                    <div className="library-item-content">
                      <div className="library-item-title">{game.title}</div>
                      <div className="library-item-genre">{game.genre}</div>

                      {/* Hours row */}
                      <div className="library-item-hours-row">
                        {isEditing ? (
                          <div className="library-item-hours-edit">
                            <input
                              className="hours-edit-input"
                              type="number"
                              min="0"
                              value={editingHours}
                              onChange={e => setEditingHours(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') submitEdit(game);
                                if (e.key === 'Escape') cancelEdit();
                              }}
                              autoFocus
                            />
                            <button className="hours-save-btn" onClick={() => submitEdit(game)}>Save</button>
                            <button className="hours-cancel-btn" onClick={cancelEdit}>✕</button>
                          </div>
                        ) : (
                          <div className="library-item-hours-display">
                            <span className="hours-value">{game.hoursPlayed || 0}h</span>
                            <div className="hours-bar-track">
                              <div className="hours-bar-fill" style={{ width: `${pct}%` }} />
                            </div>
                            <button className="hours-edit-btn" onClick={() => startEdit(game)}>
                              Edit
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="library-item-price">${game.price?.toFixed(2) || '0.00'}</div>
                    </div>

                    {/* Actions */}
                    <div className="library-item-actions">
                      {game.buyLink && game.buyLink !== '#' && (
                        <a href={game.buyLink} target="_blank" rel="noopener noreferrer" className="lib-buy-btn">Buy</a>
                      )}
                      <button className="lib-similar-btn" onClick={() => setSimilarGame(game)}>Similar</button>
                      <button className="lib-delete-btn" onClick={() => deleteGame(game.id)}>Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: IGDB search panel */}
        <div className="add-form-section">
          <h3 className="panel-title">Add from IGDB</h3>
          <form className="igdb-search-form" onSubmit={handleSearch}>
            <input
              className="igdb-search-input"
              type="text"
              placeholder="Search a game…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button className="igdb-search-btn" type="submit" disabled={searchLoading}>
              {searchLoading ? <span className="igdb-btn-spinner" /> : 'Search'}
            </button>
          </form>

          {searchDone && searchResults.length === 0 && (
            <p className="igdb-no-results">No results found.</p>
          )}

          <div className="igdb-results">
            {searchResults.map(game => {
              const alreadyAdded = libraryTitles.has(String(game.name).toLowerCase());
              const thumb = igdbThumbUrl(game.cover);
              return (
                <div key={game.id} className="igdb-result-item">
                  {thumb
                    ? <img src={thumb} alt={game.name} className="igdb-result-thumb" />
                    : <div className="igdb-result-thumb igdb-result-thumb--empty" />
                  }
                  <div className="igdb-result-info">
                    <span className="igdb-result-title">{game.name}</span>
                    <span className="igdb-result-genre">
                      {Array.isArray(game.genres) ? game.genres.map(g => g.name || g).join(', ') : '—'}
                    </span>
                  </div>
                  <button
                    className={alreadyAdded ? 'igdb-result-added' : 'igdb-result-add'}
                    disabled={alreadyAdded}
                    onClick={() => !alreadyAdded && addFromIgdb(game)}
                  >
                    {alreadyAdded ? '✓' : '+'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>
      {similarGame && (
        <SimilarGamesPanel queryGame={similarGame} onClose={() => setSimilarGame(null)} />
      )}
    </section>
  );
}

export default LibraryView;
