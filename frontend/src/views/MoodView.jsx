import { useState } from 'react';
import { getMoodMatches, getGlobalMoodMatches, addGame } from '../api';
import './MoodView.css';

const MOOD_CHIPS = [
  { label: 'Chill & story-driven' },
  { label: 'High adrenaline action' },
  { label: 'Dark & atmospheric' },
  { label: 'Something emotional' },
  { label: 'Strategic challenge' },
  { label: 'Casual & fun' },
  { label: 'Brutal & punishing' },
  { label: 'Open world exploration' },
];

function vibeLabel(score) {
  if (score >= 0.55) return { text: 'Perfect Match', color: '#00d4aa' };
  if (score >= 0.42) return { text: 'Strong Vibe',   color: '#34d399' };
  if (score >= 0.30) return { text: 'Good Fit',      color: '#a3e635' };
  return               { text: 'Worth a Shot',        color: '#fbbf24' };
}

function MoodView() {
  const [input, setInput]       = useState('');
  const [results, setResults]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [scanned, setScanned]   = useState(false);

  const [globalResults, setGlobalResults] = useState(null);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [globalError, setGlobalError]     = useState(null);
  const [addingGameId, setAddingGameId]   = useState(null);
  const [addedGameIds, setAddedGameIds]   = useState(new Set());

  async function handleScan(moodText) {
    const mood = (moodText ?? input).trim();
    if (!mood) return;
    setLoading(true);
    setError(null);
    setResults(null);
    setScanned(false);
    try {
      const data = await getMoodMatches(mood);
      setResults(Array.isArray(data) ? data : []);
      setScanned(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleChip(chip) {
    setInput(chip.label);
    handleScan(chip.label);
  }

  function handleKey(e) {
    if (e.key === 'Enter') handleScan();
  }

  async function handleGlobalDiscover() {
    if (!input.trim()) return;
    setGlobalLoading(true);
    setGlobalError(null);
    setGlobalResults(null);
    try {
      const data = await getGlobalMoodMatches(input.trim());
      setGlobalResults(Array.isArray(data) ? data : []);
    } catch (err) {
      setGlobalError(err.message);
    } finally {
      setGlobalLoading(false);
    }
  }

  async function handleAddToLibrary(game) {
    setAddingGameId(game.igdbId);
    try {
      await addGame({
        id: game.igdbId,
        title: game.title,
        genre: game.genre ?? 'Unknown',
        coverUrl: game.coverUrl ?? '',
        price: 0,
        hoursPlayed: 0,
      });
      setAddedGameIds(prev => new Set(prev).add(game.igdbId));
    } catch (err) {
      console.error('Add to library failed:', err.message);
    } finally {
      setAddingGameId(null);
    }
  }

  return (
    <section className="mood-page">

      {/* Hero */}
      <div className="mood-hero">
        <div className="mood-hero-badge">
          <span className="mood-hero-dot" />
          <span>Neural Vibe Scanner</span>
        </div>
        <h1 className="mood-hero-title">What are you in the mood for?</h1>
        <p className="mood-hero-sub">
          Describe how you're feeling tonight and we'll match it against your library.
        </p>
      </div>

      {/* Input */}
      <div className="mood-input-wrap">
        <div className={`mood-input-box${loading ? ' mood-input-box--scanning' : ''}`}>
          <span className="mood-input-icon">✦</span>
          <input
            className="mood-input"
            type="text"
            placeholder="e.g. something chill and emotional with great writing..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={loading}
          />
          <button
            className="mood-scan-btn"
            onClick={() => handleScan()}
            disabled={loading || !input.trim()}
          >
            {loading ? <span className="mood-btn-spinner" /> : 'Scan'}
          </button>
        </div>
        {loading && (
          <div className="mood-scanning-bar">
            <div className="mood-scanning-beam" />
          </div>
        )}
      </div>

      {/* Quick chips */}
      {!scanned && !loading && (
        <div className="mood-chips-section">
          <p className="mood-chips-label">Quick picks</p>
          <div className="mood-chips">
            {MOOD_CHIPS.map(chip => (
              <button
                key={chip.label}
                className="mood-chip"
                onClick={() => handleChip(chip)}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && <div className="mood-error">{error}</div>}

      {/* Results */}
      {scanned && results !== null && (
        <div className="mood-results-section">
          <div className="mood-results-header">
            <span className="mood-results-dot" />
            <span className="mood-results-label">
              {results.length > 0
                ? `${results.length} vibe matches found for "${input}"`
                : `No matches found — your library might need more games!`}
            </span>
          </div>

          {results.length > 0 && (
            <div className="mood-results-grid">
              {results.map((game, i) => {
                const vibe = vibeLabel(game.vibeScore);
                const pct  = Math.round(game.vibeScore * 100);
                return (
                  <div
                    key={game._id}
                    className="mood-result-card"
                    style={{ '--i': i, '--vibe-color': vibe.color }}
                  >
                    {/* Cover */}
                    <div className="mood-card-cover-wrap">
                      {game.coverUrl
                        ? <img src={game.coverUrl} alt={game.title} className="mood-card-cover" />
                        : <div className="mood-card-cover mood-card-cover--placeholder">?</div>
                      }
                      <div className="mood-card-rank">#{i + 1}</div>
                    </div>

                    {/* Info */}
                    <div className="mood-card-body">
                      <div className="mood-card-title">{game.title}</div>
                      <div className="mood-card-genre">{game.genre || '—'}</div>

                      {/* Vibe score bar */}
                      <div className="mood-card-score-row">
                        <div className="mood-card-bar-track">
                          <div
                            className="mood-card-bar-fill"
                            style={{ '--pct': `${pct}%`, animationDelay: `${i * 0.1 + 0.2}s` }}
                          />
                        </div>
                        <span className="mood-card-pct">{pct}%</span>
                      </div>

                      <span className="mood-card-vibe-label">{vibe.text}</span>

                      <div className="mood-card-hours">
                        {game.hoursPlayed > 0
                          ? `${game.hoursPlayed}h played`
                          : 'Not started'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Discover Globally */}
          <div className="mood-global-section">
            {globalResults === null && !globalLoading && (
              <button
                className="mood-global-btn"
                onClick={handleGlobalDiscover}
                disabled={globalLoading}
              >
                Discover Globally
              </button>
            )}

            {globalLoading && (
              <div className="mood-global-loading">
                <div className="mood-scanning-bar" style={{ width: '100%', margin: 0 }}>
                  <div className="mood-scanning-beam" />
                </div>
                <span className="mood-global-loading-label">Scanning IGDB...</span>
              </div>
            )}

            {globalError && <div className="mood-error">{globalError}</div>}

            {globalResults !== null && !globalLoading && (
              <>
                <div className="mood-results-header">
                  <span className="mood-results-dot" style={{ background: '#7c6af7', boxShadow: '0 0 8px #7c6af7' }} />
                  <span className="mood-results-label">
                    {globalResults.length > 0
                      ? `${globalResults.length} games from IGDB matching "${input}"`
                      : 'No global results found'}
                  </span>
                </div>

                {globalResults.length > 0 && (
                  <div className="mood-results-grid">
                    {globalResults.map((game, i) => (
                      <div
                        key={game.igdbId}
                        className="mood-result-card mood-result-card--global"
                        style={{ '--i': i, '--vibe-color': '#7c6af7' }}
                      >
                        <span className="mood-igdb-badge">IGDB</span>

                        <div className="mood-card-cover-wrap">
                          {game.coverUrl
                            ? <img src={game.coverUrl} alt={game.title} className="mood-card-cover" />
                            : <div className="mood-card-cover mood-card-cover--placeholder">?</div>
                          }
                          <div className="mood-card-rank" style={{ background: '#7c6af7' }}>#{i + 1}</div>
                        </div>

                        <div className="mood-card-body">
                          <div className="mood-card-title">{game.title}</div>
                          <div className="mood-card-genre">{game.genre ?? '—'}</div>
                          {game.rating != null && (
                            <div className="mood-card-rating">
                              {Math.round(game.rating)}<span className="mood-card-rating-denom">/100</span>
                            </div>
                          )}
                          <button
                            className={`mood-add-btn${addedGameIds.has(game.igdbId) ? ' mood-add-btn--added' : ''}`}
                            onClick={() => handleAddToLibrary(game)}
                            disabled={addingGameId === game.igdbId || addedGameIds.has(game.igdbId)}
                          >
                            {addedGameIds.has(game.igdbId)
                              ? 'Added'
                              : addingGameId === game.igdbId
                                ? 'Adding...'
                                : '+ Add to Library'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Try again */}
          <button
            className="mood-retry-btn"
            onClick={() => {
              setScanned(false); setResults(null); setInput('');
              setGlobalResults(null); setGlobalError(null);
            }}
          >
            ← Try a different mood
          </button>
        </div>
      )}
    </section>
  );
}

export default MoodView;
