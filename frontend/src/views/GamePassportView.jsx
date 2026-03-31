import { useEffect, useState, useMemo } from 'react';
import Globe from 'react-globe.gl';
import { getGames, editGame } from '../api';
import './GamePassportView.css';

const COUNTRY_COORDS = {
  AU: { lat: -25.3,  lng: 133.8,  name: 'Australia'      },
  AT: { lat: 47.5,   lng: 14.5,   name: 'Austria'         },
  BE: { lat: 50.5,   lng: 4.5,    name: 'Belgium'         },
  BR: { lat: -14.2,  lng: -51.9,  name: 'Brazil'          },
  CA: { lat: 56.1,   lng: -106.3, name: 'Canada'          },
  CN: { lat: 35.9,   lng: 104.2,  name: 'China'           },
  CZ: { lat: 49.8,   lng: 15.5,   name: 'Czech Republic'  },
  DK: { lat: 56.3,   lng: 9.5,    name: 'Denmark'         },
  FI: { lat: 64.0,   lng: 26.0,   name: 'Finland'         },
  FR: { lat: 46.2,   lng: 2.2,    name: 'France'          },
  DE: { lat: 51.2,   lng: 10.5,   name: 'Germany'         },
  HU: { lat: 47.2,   lng: 19.5,   name: 'Hungary'         },
  IN: { lat: 20.6,   lng: 78.9,   name: 'India'           },
  IE: { lat: 53.4,   lng: -8.2,   name: 'Ireland'         },
  IT: { lat: 41.9,   lng: 12.6,   name: 'Italy'           },
  JP: { lat: 36.2,   lng: 138.3,  name: 'Japan'           },
  KR: { lat: 35.9,   lng: 127.8,  name: 'South Korea'     },
  NL: { lat: 52.1,   lng: 5.3,    name: 'Netherlands'     },
  NZ: { lat: -40.9,  lng: 174.9,  name: 'New Zealand'     },
  NO: { lat: 60.5,   lng: 8.5,    name: 'Norway'          },
  PL: { lat: 51.9,   lng: 19.1,   name: 'Poland'          },
  PT: { lat: 39.4,   lng: -8.2,   name: 'Portugal'        },
  RU: { lat: 61.5,   lng: 105.3,  name: 'Russia'          },
  ES: { lat: 40.5,   lng: -3.7,   name: 'Spain'           },
  SE: { lat: 60.1,   lng: 18.6,   name: 'Sweden'          },
  CH: { lat: 46.8,   lng: 8.2,    name: 'Switzerland'     },
  UA: { lat: 48.4,   lng: 31.2,   name: 'Ukraine'         },
  GB: { lat: 55.4,   lng: -3.4,   name: 'United Kingdom'  },
  US: { lat: 37.1,   lng: -95.7,  name: 'United States'   },
};

const COUNTRY_OPTIONS = Object.entries(COUNTRY_COORDS)
  .map(([code, { name }]) => ({ code, name }))
  .sort((a, b) => a.name.localeCompare(b.name));

function GamePassportView() {
  const [games, setGames]       = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => { getGames().then(setGames); }, []);

  const points = useMemo(() => {
    const grouped = {};
    games
      .filter(g => g.countryOfOrigin && COUNTRY_COORDS[g.countryOfOrigin])
      .forEach(g => {
        const code = g.countryOfOrigin;
        if (!grouped[code]) grouped[code] = { ...COUNTRY_COORDS[code], code, games: [] };
        grouped[code].games.push(g);
      });
    return Object.values(grouped);
  }, [games]);

  const unassigned = games.filter(g => !g.countryOfOrigin);

  async function assignCountry(gameId, countryCode) {
    await editGame(gameId, { countryOfOrigin: countryCode });
    setGames(prev => prev.map(g => g._id === gameId ? { ...g, countryOfOrigin: countryCode } : g));
  }

  return (
    <div className="passport-layout">
      <div className="passport-globe-wrap">
        <div className="passport-globe-title">
          <h2>Game Passport</h2>
          <p className="passport-globe-subtitle">
            {points.length} countr{points.length !== 1 ? 'ies' : 'y'} · {games.filter(g => g.countryOfOrigin).length} games pinned
          </p>
        </div>
        <Globe
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          pointsData={points}
          pointLat="lat"
          pointLng="lng"
          pointColor={() => '#dc2626'}
          pointAltitude={0.015}
          pointRadius={d => Math.min(0.3 + d.games.length * 0.2, 1.2)}
          pointLabel={d => `<div style="background:rgba(15,23,34,0.95);padding:8px 12px;border-radius:8px;border:1px solid rgba(220,38,38,0.4);font-size:13px"><b>${d.name}</b><br/><span style="color:#fca5a5">${d.games.length} game${d.games.length > 1 ? 's' : ''}</span></div>`}
          onPointClick={setSelected}
          width={700}
          height={560}
        />
      </div>

      <aside className="passport-sidebar">
        {selected ? (
          <div className="passport-detail">
            <button className="passport-back-btn" onClick={() => setSelected(null)}>← Back</button>
            <h3 className="passport-country-name">{selected.name}</h3>
            <p className="passport-count">{selected.games.length} game{selected.games.length > 1 ? 's' : ''} from here</p>
            <ul className="passport-game-list">
              {selected.games.map(g => (
                <li key={g._id} className="passport-game-item">
                  {g.coverUrl
                    ? <img src={g.coverUrl} alt={g.title} className="passport-cover" />
                    : <div className="passport-cover-placeholder">{g.title.charAt(0)}</div>}
                  <span>{g.title}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="passport-overview">
            <h3>Your Atlas</h3>
            {unassigned.length > 0 && (
              <div className="passport-unassigned-section">
                <h4 className="passport-unassigned-title">
                  <span className="unassigned-count">{unassigned.length}</span> Unassigned
                </h4>
                <p className="passport-unassigned-hint">Pick a country to pin each game on the globe.</p>
                <ul className="passport-unassigned-list">
                  {unassigned.map(g => (
                    <li key={g._id} className="passport-unassigned-item">
                      <span className="unassigned-game-title">{g.title}</span>
                      <select
                        defaultValue=""
                        onChange={e => e.target.value && assignCountry(g._id, e.target.value)}
                      >
                        <option value="" disabled>Pick country…</option>
                        {COUNTRY_OPTIONS.map(c => (
                          <option key={c.code} value={c.code}>{c.name}</option>
                        ))}
                      </select>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {unassigned.length === 0 && games.length > 0 && (
              <p className="passport-all-pinned">🌍 All games are pinned on the globe!</p>
            )}
            {games.length === 0 && (
              <p className="passport-empty">Add games to your library to see them on the map.</p>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}

export default GamePassportView;
