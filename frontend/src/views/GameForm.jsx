import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import api from '../api';

function GameForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    const [formData, setFormData] = useState({
        title: '',
        genre: '',
        hoursPlayed: 0,
        price: 0,
        buyLink: ''
    });
    const [loading, setLoading] = useState(isEditing);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEditing) {
            const fetchGame = async () => {
                try {
                    const response = await api.get(`/games/${id}`);
                    const game = response.data.data;
                    setFormData({
                        title: game.title,
                        genre: game.genre,
                        hoursPlayed: game.hoursPlayed || 0,
                        price: game.price || 0,
                        buyLink: game.buyLink || ''
                    });
                } catch (err) {
                    setError('Failed to fetch game details');
                } finally {
                    setLoading(false);
                }
            };
            fetchGame();
        }
    }, [id, isEditing]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (isEditing) {
                await api.put(`/games/${id}`, formData);
            } else {
                await api.post('/games', formData);
            }
            navigate('/games');
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        }
    };

    if (loading) return <div className="loading" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading game data...</div>;

    return (
        <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <button onClick={() => navigate(-1)} className="btn" style={{ marginBottom: '2rem', background: 'transparent', border: 'none', padding: 0 }}>
                <ArrowLeft size={20} /> Back
            </button>

            <div className="card">
                <h1 className="page-title" style={{ fontSize: '2rem' }}>
                    {isEditing ? 'Edit Game' : 'Add New Game'}
                </h1>
                <p className="page-subtitle">
                    {isEditing ? 'Update the details for this game' : 'Add a new game to your collection'}
                </p>

                {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '4px' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="title">Game Title</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            className="form-control"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="genre">Genre</label>
                        <input
                            type="text"
                            id="genre"
                            name="genre"
                            className="form-control"
                            value={formData.genre}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="price">Price ($)</label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                step="0.01"
                                min="0"
                                className="form-control"
                                value={formData.price}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="hoursPlayed">Hours Played</label>
                            <input
                                type="number"
                                id="hoursPlayed"
                                name="hoursPlayed"
                                min="0"
                                className="form-control"
                                value={formData.hoursPlayed}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="buyLink">Store Link (URL)</label>
                        <input
                            type="url"
                            id="buyLink"
                            name="buyLink"
                            className="form-control"
                            value={formData.buyLink}
                            onChange={handleChange}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                        <Save size={18} /> {isEditing ? 'Save Changes' : 'Add Game'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default GameForm;
