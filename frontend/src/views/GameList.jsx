import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, ExternalLink } from 'lucide-react';
import api from '../api';

function GameList() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGames();
    }, []);

    const fetchGames = async () => {
        try {
            const response = await api.get('/games');
            setGames(response.data.data);
        } catch (error) {
            console.error('Error fetching games:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this game?')) {
            try {
                await api.delete(`/games/${id}`);
                fetchGames(); // Refresh the list
            } catch (error) {
                console.error('Error deleting game:', error);
            }
        }
    };

    if (loading) return <div className="loading" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading library...</div>;

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: 0 }}>My Library</h1>
                    <p className="page-subtitle" style={{ marginBottom: 0 }}>Manage your entire game collection</p>
                </div>
                <Link to="/add" className="btn btn-primary">Add New Game</Link>
            </div>

            {games.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Your library is empty</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Get started by adding your first game!</p>
                </div>
            ) : (
                <div className="games-grid">
                    {games.map(game => (
                        <div key={game.id} className="card game-card">
                            <h3 className="game-title">{game.title}</h3>
                            <div className="game-meta">
                                <span className="game-meta-tag">{game.genre}</span>
                                <span>{game.hoursPlayed} hrs played</span>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <span style={{ fontWeight: 600, color: 'var(--success)' }}>${game.price}</span>
                            </div>

                            <div className="game-actions">
                                <a href={game.buyLink} target="_blank" rel="noopener noreferrer" className="btn" style={{ flex: 1, padding: '0.4rem' }}>
                                    <ExternalLink size={16} /> Link
                                </a>
                                <Link to={`/edit/${game.id}`} className="btn" style={{ padding: '0.4rem', background: 'rgba(99, 102, 241, 0.1)' }}>
                                    <Edit size={16} color="var(--accent-primary)" />
                                </Link>
                                <button onClick={() => handleDelete(game.id)} className="btn btn-danger" style={{ padding: '0.4rem' }}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default GameList;
