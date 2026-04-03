import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="top-nav">
      <div className="brand">
        <img src="/images/Icon.png" alt="Game Library Hub" className="brand-icon" />
        <span>Game Library Hub</span>
      </div>
      <nav>
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/trending">Trending</NavLink>
        <NavLink to="/search">Search</NavLink>

        {user ? (
          <>
            <NavLink to="/library">My Library</NavLink>
            <NavLink to="/mood">Mood</NavLink>
            <NavLink to="/passport">Passport</NavLink>
            <NavLink to="/tierlist">Tier List</NavLink>
            <NavLink to="/chat">Chat</NavLink>
            <NavLink to="/profile" className="nav-username">{user.username}</NavLink>
            <button onClick={handleLogout} className="nav-logout-btn">Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
