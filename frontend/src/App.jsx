import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Gamepad2, LayoutDashboard, Library, PlusCircle } from 'lucide-react';
import Dashboard from './views/Dashboard';
import GameList from './views/GameList';
import GameForm from './views/GameForm';

function Navigation() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        <Gamepad2 size={28} />
        <span>GameVault</span>
      </Link>
      <div className="nav-links">
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
          <LayoutDashboard size={18} /> Dashboard
        </Link>
        <Link to="/games" className={`nav-link ${location.pathname === '/games' ? 'active' : ''}`}>
          <Library size={18} /> Library
        </Link>
        <Link to="/add" className={`nav-link ${location.pathname === '/add' ? 'active' : ''}`}>
          <PlusCircle size={18} /> Add Game
        </Link>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navigation />
        <main className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/games" element={<GameList />} />
            <Route path="/add" element={<GameForm />} />
            <Route path="/edit/:id" element={<GameForm />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
