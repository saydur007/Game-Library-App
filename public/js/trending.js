// Trending Page - Display games from IGDB API and local library

const trendingContainer = document.getElementById('trendingContainer');
const alertContainer = document.getElementById('alertContainer');
const filterBtns = document.querySelectorAll('.filter-btn');

let allGames = [];
let igdbGames = [];
let currentFilter = 'all';

// Show alert messages
function showAlert(message, type = 'success') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;
  alertContainer.innerHTML = '';
  alertContainer.appendChild(alertDiv);
  setTimeout(() => alertDiv.remove(), 3000);
}

// Fetch trending games from IGDB
async function loadTrendingGamesFromIGDB() {
  try {
    const response = await fetch('/api/igdb/trending');
    if (!response.ok) throw new Error('Failed to load IGDB games');
    
    const { data: games } = await response.json();
    
    // Transform IGDB data to match our format
    igdbGames = games.map(game => ({
      id: game.id,
      title: game.name || 'Unknown Game',
      genre: game.genres ? game.genres.join(', ') : 'Unknown',
      hoursPlayed: 0,
      price: 29.99, // Default price since IGDB doesn't always have it
      buyLink: '#',
      rating: game.rating || 'N/A',
      dateAdded: new Date().toISOString(),
      source: 'igdb' // Mark as from IGDB
    }));

    return igdbGames;
  } catch (error) {
    console.error('Error loading IGDB games:', error);
    showAlert('Failed to load trending games from IGDB', 'error');
    return [];
  }
}

// Load local games from your library
async function loadLocalLibraryGames() {
  try {
    const response = await fetch('/api/games');
    if (!response.ok) throw new Error('Failed to load local games');
    
    const { data: games } = await response.json();
    
    if (!games) return [];
    
    // Mark as from local library
    return games.map(game => ({
      ...game,
      source: 'local'
    }));
  } catch (error) {
    console.error('Error loading local games:', error);
    return [];
  }
}

// Load all games
async function loadAllGames() {
  try {
    const igdbData = await loadTrendingGamesFromIGDB();
    const localData = await loadLocalLibraryGames();
    
    // Combine IGDB trending with local library
    allGames = [...igdbData, ...localData];
    displayGames(allGames);
  } catch (error) {
    console.error('Error loading games:', error);
    showAlert('Failed to load games', 'error');
  }
}

// Display games based on filter
function displayGames(games) {
  if (!games || games.length === 0) {
    trendingContainer.innerHTML = `
      <div class="empty-state">
        <h3>No Games Available</h3>
        <p>Check back soon for new games to add to your collection!</p>
      </div>
    `;
    return;
  }

  // Get list of game titles already in library for comparison
  const localGameTitles = allGames
    .filter(g => g.source === 'local')
    .map(g => g.title.toLowerCase());

  trendingContainer.innerHTML = '';
  games.forEach(game => {
    const gameCard = document.createElement('div');
    gameCard.className = 'game-card';
    
    // Show rating if available
    const ratingDisplay = game.rating && game.rating !== 'N/A' 
      ? `<div class="game-info"><span class="game-info-label">Rating:</span> ${game.rating.toFixed(1)}/100</div>` 
      : '';
    
    // Show source badge
    const sourceBadge = game.source === 'igdb' 
      ? '<span class="trending-badge">IGDB</span>' 
      : '<span class="new-badge">Your Library</span>';
    
    // Check if game is already in library
    const isInLibrary = localGameTitles.includes(game.title.toLowerCase());
    
    // Only show "Add to Library" button if game is from IGDB and not already in library
    const actionButtons = game.source === 'local' || isInLibrary
      ? `<a href="${game.buyLink}" target="_blank" class="btn btn-buy">Buy Now</a>`
      : `<button class="btn btn-primary add-to-library-btn" data-game='${JSON.stringify(game)}'>
          Add to Library
        </button>
        <a href="${game.buyLink}" target="_blank" class="btn btn-buy">Buy Now</a>`;
    
    gameCard.innerHTML = `
      <div class="game-card-header">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <div class="game-card-title">${game.title}</div>
            <div class="game-card-genre">${game.genre}</div>
          </div>
          <div style="font-size: 12px;">${sourceBadge}</div>
        </div>
      </div>
      <div class="game-card-body">
        <div class="game-info">
          <span class="game-info-label">Genre:</span> ${game.genre}
        </div>
        ${ratingDisplay}
        <div class="game-info">
          <span class="game-info-label">Hours Played:</span> ${game.hoursPlayed}
        </div>
        <div class="game-price">$${game.price.toFixed(2)}</div>
        <div class="game-card-actions">
          ${actionButtons}
        </div>
      </div>
    `;
    
    trendingContainer.appendChild(gameCard);
  });

  // Add event listeners for "Add to Library" buttons
  document.querySelectorAll('.add-to-library-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const gameData = JSON.parse(e.target.getAttribute('data-game'));
      await addGameToLibrary(gameData);
    });
  });
}

// Add game to user's library
async function addGameToLibrary(game) {
  try {
    const gameToAdd = {
      title: game.title,
      genre: game.genre,
      hoursPlayed: game.hoursPlayed || 0,
      price: game.price || 29.99,
      buyLink: game.buyLink || '#'
    };

    const response = await fetch('/api/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gameToAdd)
    });

    const result = await response.json();

    if (!response.ok) {
      showAlert(result.message || 'Failed to add game', 'error');
      return;
    }

    showAlert(`✅ ${result.data.title} added to your library!`, 'success');
    
    // Reload to show updated state
    loadAllGames();
  } catch (error) {
    console.error('Error adding game:', error);
    showAlert('Failed to add game to library', 'error');
  }
}

// Filter button event listeners
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Update active button
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    currentFilter = btn.getAttribute('data-filter');
    
    // Filter and display games
    let filteredGames = allGames;
    
    if (currentFilter === 'trending') {
      filteredGames = allGames.filter(g => g.source === 'igdb');
    } else if (currentFilter === 'new') {
      filteredGames = allGames.filter(g => g.source === 'local');
    }
    
    displayGames(filteredGames);
  });
});

// Load games on page load
loadAllGames();
