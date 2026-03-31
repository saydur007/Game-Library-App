import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as registerApi } from '../api';
import { useAuth } from '../context/AuthContext';
import './LoginView.css';

function RegisterView() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [form, setForm]       = useState({ username: '', email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const { token, user } = await registerApi(form);
      login(token, user);
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <div className="auth-card-accent" />
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join the hub and build your collection</p>
        {error && <p className="auth-error" role="alert">{error}</p>}

        <div className="auth-field">
          <label htmlFor="username">Username</label>
          <input id="username" type="text" autoComplete="username" required
            placeholder="your_gamertag"
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })} />
        </div>

        <div className="auth-field">
          <label htmlFor="reg-email">Email</label>
          <input id="reg-email" type="email" autoComplete="email" required
            placeholder="you@example.com"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })} />
        </div>

        <div className="auth-field">
          <label htmlFor="reg-password">
            Password <span className="auth-hint">min 6 characters</span>
          </label>
          <input id="reg-password" type="password" autoComplete="new-password" required
            placeholder="••••••••"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })} />
        </div>

        <button type="submit" disabled={loading} className="auth-btn">
          {loading ? <span className="auth-spinner" /> : null}
          {loading ? 'Creating account…' : 'Register'}
        </button>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}

export default RegisterView;
