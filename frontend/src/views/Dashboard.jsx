import { useState, useEffect } from 'react';
import { Gamepad2, Clock, DollarSign } from 'lucide-react';
import api from '../api';

function Dashboard() {
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

    if (loading) return <div className="loading" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading dashboard...</div>;

    const totalGames = games.length;
    const totalHours = games.reduce((sum, game) => sum + (game.hoursPlayed || 0), 0);
    const totalValue = games.reduce((sum, game) => sum + (game.price || 0), 0);

    return (
        <div className="animate-fade-in">
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Welcome back to your GameVault</p>

            <div className="stats-grid">
                <div className="card stat-card">
                    <Gamepad2 size={32} color="var(--accent-primary)" style={{ margin: '0 auto 1rem' }} />
                    <div className="stat-value">{totalGames}</div>
                    <div className="stat-label">Games in Library</div>
                </div>
                <div className="card stat-card">
                    <Clock size={32} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
                    <div className="stat-value">{totalHours}</div>
                    <div className="stat-label">Hours Played</div>
                </div>
                <div className="card stat-card">
                    <DollarSign size={32} color="#f59e0b" style={{ margin: '0 auto 1rem' }} />
                    <div className="stat-value">${totalValue.toFixed(2)}</div>
                    <div className="stat-label">Total Value</div>
                </div>
            </div>

            <h2 className="page-title" style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Recently Added</h2>
            <div className="games-grid">
                {games.slice(-3).reverse().map(game => (
                    <div key={game.id} className="card game-card">
                        <h3 className="game-title">{game.title}</h3>
                        <div className="game-meta">
                            <span className="game-meta-tag">{game.genre}</span>
                            <span>{game.hoursPlayed} hours</span>
                        </div>
                        <div style={{ marginTop: 'auto' }}>
                            <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>${game.price}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Dashboard;
