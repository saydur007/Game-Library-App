import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { connectSteam, getSteamLibrary, addGame } from '../api';
import './ProfileView.css';

function ProfileView() {
  const { user, login } = useAuth();
  const [steamId, setSteamId]           = useState(user?.steamId || '');
  const [steamStatus, setSteamStatus]   = useState('');
  const [steamGames, setSteamGames]     = useState([]);
  const [selected, setSelected]         = useState(new Set());
  const [loadingLib, setLoadingLib]     = useState(false);
  const [importing, setImporting]       = useState(false);
  const [importStatus, setImportStatus] = useState('');

  async function handleSaveSteamId() {
    if (!steamId.trim()) return;
    try {
      const updated = await connectSteam(steamId.trim());
      login(localStorage.getItem('token'), updated);
      setSteamStatus('Steam ID saved!');
    } catch {
      setSteamStatus('Failed to save Steam ID. Please check the ID and try again.');
    }
  }

  async function handleFetchLibrary() {
    setLoadingLib(true);
    setSteamStatus('');
    setImportStatus('');
    setSteamGames([]);
    try {
      const games = await getSteamLibrary();
      setSteamGames(games);
      setSelected(new Set(games.map(g => g.steamAppId)));
    } catch (err) {
      setSteamStatus(err?.response?.data?.message || 'Failed to fetch Steam library.');
    } finally {
      setLoadingLib(false);
    }
  }

  function toggleSelect(appId) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(appId) ? next.delete(appId) : next.add(appId);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === steamGames.length) setSelected(new Set());
    else setSelected(new Set(steamGames.map(g => g.steamAppId)));
  }

  async function handleImport() {
    const toImport = steamGames.filter(g => selected.has(g.steamAppId));
    if (toImport.length === 0) return;
    setImporting(true);
    setImportStatus('');
    let count = 0;
    for (const g of toImport) {
      try {
        await addGame({ title: g.title, genre: 'Unknown', price: 0, hoursPlayed: g.hoursPlayed, coverUrl: g.coverUrl, buyLink: g.buyLink });
        count++;
      } catch { /* skip duplicates */ }
    }
    setImporting(false);
    setSteamGames([]);
    setImportStatus(`✓ ${count} game${count !== 1 ? 's' : ''} imported to your library!`);
  }

  const steamIdValid = /^\d{17}$/.test(steamId.trim());

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : '—';

  return (
    <div className="profile-page">
      <section className="profile-card">
        <div className="profile-card-accent" />
        <h2 className="profile-section-title">Account</h2>
        <div className="profile-fields">
          <div className="profile-field">
            <span className="profile-label">Username</span>
            <span className="profile-value profile-username">{user?.username}</span>
          </div>
          <div className="profile-field">
            <span className="profile-label">Email</span>
            <span className="profile-value">{user?.email}</span>
          </div>
          <div className="profile-field">
            <span className="profile-label">Member since</span>
            <span className="profile-value">{memberSince}</span>
          </div>
        </div>
      </section>

      <section className="profile-card">
        <div className="profile-card-accent steam-accent" />
        <h2 className="profile-section-title">
          <span className="steam-icon">⬡</span> Steam Integration
        </h2>
        <p className="profile-hint">
          Enter your Steam64 ID to import your library.{' '}
          <a href="https://www.steamidfinder.com/" target="_blank" rel="noreferrer" className="profile-link">
            Find your ID →
          </a>
        </p>

        <div className="steam-id-row">
          <input
            type="text"
            placeholder="e.g. 76561198000000000"
            value={steamId}
            onChange={e => setSteamId(e.target.value)}
          />
          <button onClick={handleSaveSteamId} disabled={!steamIdValid} className="profile-btn">Save ID</button>
          {user?.steamId && (
            <button onClick={handleFetchLibrary} disabled={loadingLib} className="profile-btn secondary">
              {loadingLib ? 'Loading…' : 'Load Library'}
            </button>
          )}
        </div>

        {steamStatus && (
          <p className={`profile-status ${steamStatus.includes('saved') ? 'success' : 'error'}`} role="alert">
            {steamStatus}
          </p>
        )}

        {steamGames.length > 0 && (
          <div className="steam-library">
            <div className="steam-library-header">
              <span className="steam-count">{steamGames.length} games found</span>
              <button onClick={toggleAll} className="profile-btn secondary small">
                {selected.size === steamGames.length ? 'Deselect all' : 'Select all'}
              </button>
              <button onClick={handleImport} disabled={importing || selected.size === 0} className="profile-btn">
                {importing ? 'Importing…' : `Import ${selected.size}`}
              </button>
            </div>
            <ul className="steam-game-list">
              {steamGames.map(g => (
                <li key={g.steamAppId} className={`steam-game-item ${selected.has(g.steamAppId) ? 'is-selected' : ''}`}>
                  <input
                    type="checkbox"
                    id={`sg-${g.steamAppId}`}
                    checked={selected.has(g.steamAppId)}
                    onChange={() => toggleSelect(g.steamAppId)}
                  />
                  <label htmlFor={`sg-${g.steamAppId}`} className="steam-game-label">
                    <img src={g.coverUrl} alt={g.title} className="steam-cover" onError={e => e.target.style.display='none'} />
                    <span className="steam-title">{g.title}</span>
                    <span className="steam-hours">{g.hoursPlayed}h</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}

        {importStatus && <p className="profile-status success" role="status">{importStatus}</p>}
      </section>
    </div>
  );
}

export default ProfileView;
