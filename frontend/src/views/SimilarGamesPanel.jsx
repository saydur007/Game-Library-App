import { useEffect, useState } from 'react';
import { explainSimilarity, getSimilarGames } from '../api';
import './SimilarGamesPanel.css';

function SimilarGamesPanel({ queryGame, onClose }) {
  const [similar, setSimilar]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [explaining, setExplaining]   = useState(false);

  useEffect(() => {
    getSimilarGames(queryGame._id || queryGame.id)
      .then(data => {
        const games = Array.isArray(data) ? data : [];
        setSimilar(games);
        // Auto-load explanation like GameOverviewPanel
        if (games.length > 0) {
          setExplaining(true);
          explainSimilarity(queryGame._id || queryGame.id, games)
            .then(result => setExplanation(result.explanation))
            .catch(err => setExplanation('Failed to generate analysis. ' + err.message))
            .finally(() => setExplaining(false));
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [queryGame]);

  return (
    <div className="sgp-overlay" onClick={onClose}>
      <div className="sgp-panel" onClick={e => e.stopPropagation()}>

        {/* Header — matches GameOverviewPanel layout */}
        <div className="sgp-header">
          {queryGame.coverUrl && (
            <img src={queryGame.coverUrl} alt={queryGame.title} className="sgp-header-cover" />
          )}
          <div className="sgp-header-info">
            <span className="sgp-eyebrow">Neural Similarity</span>
            <h3 className="sgp-title">{queryGame.title}</h3>
            {queryGame.genre && <span className="sgp-header-genre">{queryGame.genre}</span>}
            {queryGame.hoursPlayed > 0 && (
              <span className="sgp-header-hours">{queryGame.hoursPlayed}h played</span>
            )}
          </div>
          <button className="sgp-close" onClick={onClose}>✕</button>
        </div>

        <div className="sgp-body">
          {loading && (
            <div className="sgp-loading">
              <div className="sgp-scan-anim">
                <div className="sgp-scan-ring" />
                <div className="sgp-scan-ring" />
                <div className="sgp-scan-dot" />
              </div>
              <span className="sgp-loading-text">Scanning database...</span>
            </div>
          )}
          {error && <div className="sgp-error">{error}</div>}

          {!loading && !error && (
            <>
              <ul className="sgp-list">
                {similar.map((game, index) => {
                  const scorePct = `${Math.round(game.similarityScore * 100)}%`;
                  return (
                    <li
                      key={game._id}
                      className="sgp-item"
                      style={{ '--i': index, '--score-pct': scorePct }}
                    >
                      {game.coverUrl
                        ? <img src={game.coverUrl} alt={game.title} className="sgp-cover" />
                        : <div className="sgp-cover sgp-cover--placeholder">?</div>
                      }
                      <div className="sgp-item-info">
                        <span className="sgp-item-title">{game.title}</span>
                        <span className="sgp-item-genre">{game.genre}</span>
                      </div>
                      <div className="sgp-item-right">
                        <span className="sgp-score">{scorePct}</span>
                        <div className="sgp-bar-track">
                          <div className="sgp-bar-fill" />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* AI Analysis — auto-loaded, same card style as GameOverviewPanel */}
              <div className="sgp-analysis-section">
                {explaining && (
                  <div className="sgp-loading" style={{ padding: '1.25rem 0' }}>
                    <div className="sgp-scan-anim">
                      <div className="sgp-scan-ring" />
                      <div className="sgp-scan-ring" />
                      <div className="sgp-scan-dot" />
                    </div>
                    <span className="sgp-loading-text">Generating analysis...</span>
                  </div>
                )}
                {explanation && !explaining && (
                  <div className="sgp-explanation-card">
                    <div className="sgp-analysis-header">
                      <span className="sgp-analysis-dot" />
                      <span className="sgp-analysis-label">AI Analysis</span>
                    </div>
                    <p className="sgp-explanation">{explanation}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SimilarGamesPanel;
