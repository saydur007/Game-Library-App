import { useEffect, useState } from 'react';
import { getGameOverview } from '../api';
import './GameOverviewPanel.css';

function GameOverviewPanel({ game, library, onClose, onAdd, inLibrary }) {
  const [overview, setOverview]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    getGameOverview(
      { title: game.title, genre: game.genre, rating: game.rating },
      library.map(g => ({ title: g.title, genre: g.genre, hoursPlayed: g.hoursPlayed }))
    )
      .then(data => setOverview(data.overview))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [game, library]);

  return (
    <div className="gop-overlay" onClick={onClose}>
      <div className="gop-panel" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="gop-header">
          {game.coverUrl && (
            <img src={game.coverUrl} alt={game.title} className="gop-cover" />
          )}
          <div className="gop-header-info">
            <span className="gop-eyebrow">Library Fit Analysis</span>
            <h3 className="gop-title">{game.title}</h3>
            {game.genre && <span className="gop-genre">{game.genre}</span>}
            {game.rating && (
              <span className="gop-rating">★ {Math.round(game.rating)}</span>
            )}
          </div>
          <button className="gop-close" onClick={onClose}>✕</button>
        </div>

        {/* AI Analysis body */}
        <div className="gop-body">
          {loading && (
            <div className="gop-loading">
              <div className="gop-scan-anim">
                <div className="gop-scan-ring" />
                <div className="gop-scan-ring" />
                <div className="gop-scan-dot" />
              </div>
              <span className="gop-loading-text">Analyzing your library...</span>
            </div>
          )}

          {error && <div className="gop-error">{error}</div>}

          {!loading && !error && overview && (
            <div className="gop-analysis-card">
              <div className="gop-analysis-header">
                <span className="gop-analysis-dot" />
                <span className="gop-analysis-label">AI Verdict</span>
              </div>
              <p className="gop-overview-text">{overview}</p>
            </div>
          )}
        </div>

        {/* Footer action */}
        {!inLibrary && (
          <div className="gop-footer">
            <button className="gop-add-btn" onClick={() => { onAdd(game); onClose(); }}>
              + Add to Library
            </button>
          </div>
        )}
        {inLibrary && (
          <div className="gop-footer">
            <span className="gop-already-saved">✓ Already in your library</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default GameOverviewPanel;
