import { useState } from 'react';

const initialForm = {
  title: '',
  genre: '',
  hoursPlayed: 0,
  price: '',
  buyLink: '',
};

function GameForm({ onSubmit }) {
  const [formData, setFormData] = useState(initialForm);

  function updateField(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function submit(event) {
    event.preventDefault();

    onSubmit({
      title: formData.title.trim(),
      genre: formData.genre.trim(),
      hoursPlayed: Number(formData.hoursPlayed || 0),
      price: Number(formData.price),
      buyLink: formData.buyLink.trim() || '#',
    });

    setFormData(initialForm);
  }

  return (
    <form className="game-form" onSubmit={submit}>
      <h2>Add New Game</h2>
      <label>
        Game Title *
        <input name="title" value={formData.title} onChange={updateField} required />
      </label>
      <label>
        Genre *
        <input name="genre" value={formData.genre} onChange={updateField} required />
      </label>
      <div className="form-row">
        <label>
          Hours Played
          <input
            name="hoursPlayed"
            type="number"
            min="0"
            value={formData.hoursPlayed}
            onChange={updateField}
          />
        </label>
        <label>
          Price *
          <input
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={updateField}
            required
          />
        </label>
      </div>
      <label>
        Buy Link
        <input name="buyLink" type="url" value={formData.buyLink} onChange={updateField} />
      </label>
      <button type="submit" className="btn-primary">
        Add to Library
      </button>
    </form>
  );
}

export default GameForm;