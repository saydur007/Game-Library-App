import { Link } from 'react-router-dom';
import './HomeView.css';

const features = [
  {
    title: 'Personal Library',
    text: 'Keep track of your games, hours played, and purchase links.',
    image: '/images/library.png',
    to: '/library',
  },
  {
    title: 'Track Hours',
    text: 'Update playtime quickly and keep your stats current.',
    image: '/images/time-tracking.png',
    to: '/library',
  },
  {
    title: 'Trending Games',
    text: 'Discover popular titles from IGDB and add them to your collection.',
    image: '/images/trending.png',
    to: '/trending',
  },
  {
    title: 'Buy Links',
    text: 'Use direct links to buy games from your preferred store.',
    image: '/images/game-store.png',
    to: '/trending',
  },
];

function HomeView() {
  return (
    <section>
      <div className="hero">
        <h1>Game Library Hub</h1>
        <p>Track your collection, manage playtime, and discover trending games.</p>
        <div className="hero-buttons">
          <Link to="/library" className="hero-btn-primary">
            Manage My Library
          </Link>
          <Link to="/trending" className="hero-btn-secondary">
            View Trending Games
          </Link>
        </div>
      </div>
      <div className="feature-grid">
        {features.map((feature) => (
          <Link className="feature-card" to={feature.to} key={feature.title}>
            <img src={feature.image} alt={feature.title} />
            <h3>{feature.title}</h3>
            <p>{feature.text}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default HomeView;