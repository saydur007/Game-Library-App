import { NavLink } from 'react-router-dom';

function Navbar() {
  return (
    <header className="top-nav">
      <div className="brand">
        <img src="/images/Icon.png" alt="Game Library Hub" className="brand-icon" />
        <span>Game Library Hub</span>
      </div>
      <nav>
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/library">My Library</NavLink>
        <NavLink to="/trending">Trending</NavLink>
      </nav>
    </header>
  );
}

export default Navbar;