// Manage Library Page - Handle adding and deleting games

const addGameForm = document.getElementById('addGameForm');
const libraryContainer = document.getElementById('libraryContainer');
const alertContainer = document.getElementById('alertContainer');

// Show alert messages
function showAlert(message, type = 'success') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;
  alertContainer.innerHTML = '';
  alertContainer.appendChild(alertDiv);
  setTimeout(() => alertDiv.remove(), 3000);
}

// Load and display user's library
async function loadLibrary() {
  try {
    const response = await fetch('/api/games');
    if (!response.ok) throw new Error('Failed to load games');
    
    const { data: games } = await response.json();
    
    if (!games || games.length === 0) {
      libraryContainer.innerHTML = '<div class="no-library-message">No games in your library yet. Add one to get started!</div>';
      return;
    }

    libraryContainer.innerHTML = '';
    games.forEach(game => {
      const gameEl = document.createElement('div');
      gameEl.className = 'library-item';
      gameEl.innerHTML = `
        <div class="library-item-title">${game.title}</div>
        <div class="library-item-detail">Genre: ${game.genre}</div>
        <div class="library-item-detail">Hours Played: <span class="hours-display" data-id="${game.id}" data-hours="${game.hoursPlayed}">${game.hoursPlayed}</span> <button class="edit-hours-btn" data-id="${game.id}">✏️ Edit</button></div>
        <div class="library-item-detail">Price: $${game.price.toFixed(2)}</div>
        <div class="library-item-actions">
          <button class="delete-btn" data-id="${game.id}">🗑️ Delete</button>
          <a href="${game.buyLink}" target="_blank" class="btn btn-buy">🛒 Buy</a>
        </div>
      `;
      libraryContainer.appendChild(gameEl);
    });

    // Add delete event listeners
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const gameId = e.target.getAttribute('data-id');
        await deleteGame(gameId);
      });
    });

    // Add edit event listeners
    document.querySelectorAll('.edit-hours-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const gameId = e.target.getAttribute('data-id');
        const hoursDisplay = document.querySelector(`[data-id="${gameId}"]`);
        const currentHours = hoursDisplay.getAttribute('data-hours');
        
        const newHours = prompt(`Update hours played for this game (current: ${currentHours}):`, currentHours);
        
        if (newHours !== null) {
          const hoursValue = parseInt(newHours);
          if (!isNaN(hoursValue) && hoursValue >= 0) {
            await updateHoursPlayed(gameId, hoursValue);
          } else {
            showAlert('Please enter a valid number', 'error');
          }
        }
      });
    });
  } catch (error) {
    console.error('Error loading library:', error);
    showAlert('Failed to load library', 'error');
  }
}

// Add new game to library
addGameForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = {
    title: document.getElementById('title').value,
    genre: document.getElementById('genre').value,
    hoursPlayed: parseInt(document.getElementById('hoursPlayed').value) || 0,
    price: parseFloat(document.getElementById('price').value),
    buyLink: document.getElementById('buyLink').value || '#'
  };

  try {
    const response = await fetch('/api/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (!response.ok) {
      showAlert(result.message || 'Failed to add game', 'error');
      return;
    }

    showAlert(`✅ ${result.data.title} added to your library!`, 'success');
    addGameForm.reset();
    loadLibrary();
  } catch (error) {
    console.error('Error adding game:', error);
    showAlert('Failed to add game', 'error');
  }
});

// Delete game from library
async function deleteGame(gameId) {
  if (!confirm('Are you sure you want to delete this game?')) return;

  try {
    const response = await fetch(`/api/games/${gameId}`, {
      method: 'DELETE'
    });

    const result = await response.json();

    if (!response.ok) {
      showAlert(result.message || 'Failed to delete game', 'error');
      return;
    }

    showAlert(`✅ ${result.data.title} removed from your library`, 'success');
    loadLibrary();
  } catch (error) {
    console.error('Error deleting game:', error);
    showAlert('Failed to delete game', 'error');
  }
}

// Update hours played for a game
async function updateHoursPlayed(gameId, hours) {
  try {
    const response = await fetch(`/api/games/${gameId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hoursPlayed: hours })
    });

    const result = await response.json();

    if (!response.ok) {
      showAlert(result.message || 'Failed to update hours', 'error');
      return;
    }

    showAlert(`✅ Hours played updated to ${hours}!`, 'success');
    loadLibrary();
  } catch (error) {
    console.error('Error updating hours:', error);
    showAlert('Failed to update hours', 'error');
  }
}

// Load library on page load
loadLibrary();
