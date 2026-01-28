function GameCard({ game, source, inLibrary, onAddToLibrary, onDelete, onEditHours }) {
  const title = game.title || game.name || 'Unknown Game';
  const genre = game.genre || (Array.isArray(game.genres) ? game.genres.join(', ') : 'Unknown');
  const hours = Number(game.hoursPlayed || 0);
  const price = Number(game.price || 29.99);
  const rating = typeof game.rating === 'number' ? game.rating.toFixed(1) : null;
  const buyLink = game.buyLink || '#';

  return (
    <article className="game-card">
      <div className="game-header">
        <h3>{title}</h3>
        <span className={`badge ${source === 'igdb' ? 'badge-igdb' : 'badge-local'}`}>
          {source === 'igdb' ? 'IGDB' : 'Your Library'}
        </span>
      </div>
      <p className="muted">{genre}</p>
      {rating && <p>Rating: {rating}/100</p>}
      <p>Hours Played: {hours}</p>
      <p className="price">${price.toFixed(2)}</p>
      <div className="card-actions">
        {source === 'local' && onEditHours && (
          // pass numeric id rather than Mongo _id so backend can locate by 'id' field
          <button onClick={() => onEditHours(game)} className="btn-secondary">
            Edit Hours
          </button>
        )}
        {source === 'local' && onDelete && (
          <button onClick={() => onDelete(game.id)} className="btn-danger">
            Delete
          </button>
        )}
        {source === 'igdb' && !inLibrary && onAddToLibrary && (
          <button onClick={() => onAddToLibrary(game)} className="btn-primary">
            Add to Library
          </button>
        )}
        <a href={buyLink} target="_blank" rel="noreferrer" className="btn-secondary">
          Buy Now
        </a>
      </div>
    </article>
  );
}

export default GameCard;
