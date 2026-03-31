import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as loginApi } from '../api';
import { useAuth } from '../context/AuthContext';
import './LoginView.css';

function LoginView() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await loginApi(form);
      login(token, user);
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <div className="auth-card-accent" />
        <h2 className="auth-title">Sign In</h2>
        <p className="auth-subtitle">Welcome back to your game vault</p>
        {error && <p className="auth-error" role="alert">{error}</p>}

        <div className="auth-field">
          <label htmlFor="email">Email</label>
          <input
            id="email" type="email" autoComplete="email" required
            placeholder="you@example.com"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div className="auth-field">
          <label htmlFor="password">Password</label>
          <input
            id="password" type="password" autoComplete="current-password" required
            placeholder="••••••••"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <button type="submit" disabled={loading} className="auth-btn">
          {loading ? <span className="auth-spinner" /> : null}
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
        <p className="auth-switch">
          No account? <Link to="/register">Create one</Link>
        </p>
      </form>
    </div>
  );
}

export default LoginView;
