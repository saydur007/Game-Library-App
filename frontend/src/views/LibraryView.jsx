import { useEffect, useState } from 'react';
import { addGame, editHours, getGames, removeGame } from '../api';
import AlertMessage from '../components/AlertMessage';
import GameForm from '../components/GameForm';
import './LibraryView.css';

function LibraryView() {
  const [games, setGames] = useState([]);
  const [alert, setAlert] = useState(null);

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

  async function createGame(payload) {
    try {
      const result = await addGame(payload);
      showAlert(`${result.title} added to your library!`, 'success');
      loadGames();
    } catch (error) {
      showAlert(error.message, 'error');
    }
  }

  async function deleteGame(id) {
    // confirm then call backend using numeric id field
    if (!window.confirm('Are you sure you want to delete this game?')) return;

    try {
      const result = await removeGame(id);
      showAlert(`${result.title} removed from your library`, 'success');
      loadGames();
    } catch (error) {
      showAlert(error.message, 'error');
    }
  }

  async function updateHours(game) {
    const currentHours = Number(game.hoursPlayed || 0);
    const nextHours = window.prompt('Update hours played for this game:', String(currentHours));

    if (nextHours === null) return;

    const parsed = Number(nextHours);
    if (Number.isNaN(parsed) || parsed < 0) {
      showAlert('Please enter a valid number', 'error');
      return;
    }

    try {
      // pass the numeric id property (not _id)
      await editHours(game.id, parsed);
      showAlert(`Hours played updated to ${parsed}!`, 'success');
      loadGames();
    } catch (error) {
      showAlert(error.message, 'error');
    }
  }

  useEffect(() => {
    loadGames();
  }, []);

  return (
    <section>
      <h1>My Game Library</h1>
      <AlertMessage alert={alert} />
      
      <div className="manage-section">
        <div className="library-section">
          <h3>Your Games</h3>
          {!Array.isArray(games) || games.length === 0 ? (
            <div className="no-library-message">No games in your library yet. Add one to get started!</div>
          ) : (
            <div className="library-list">
              {games.map((game) => (
                <div key={`local-${game.id}`} className="library-item">
                  <div className="library-item-title">{game.title}</div>
                  <div className="library-item-detail">Genre: {game.genre}</div>
                  <div className="library-item-detail">
                    Hours Played: {game.hoursPlayed}{' '}
                    <button 
                      className="edit-hours-btn" 
                      onClick={() => updateHours(game)}
                    >
                      Edit
                    </button>
                  </div>
                  <div className="library-item-detail">Price: ${game.price?.toFixed(2) || '0.00'}</div>
                  <div className="library-item-actions">
                    <button 
                      className="delete-btn"
                      onClick={() => deleteGame(game.id)}
                    >
                      Delete
                    </button>
                    {game.buyLink && (
                      <a href={game.buyLink} target="_blank" rel="noopener noreferrer" className="btn btn-buy">
                        Buy
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="add-form-section">
          <h3>Add New Game</h3>
          <GameForm onSubmit={createGame} />
        </div>
      </div>
    </section>
  );
}

export default LibraryView;