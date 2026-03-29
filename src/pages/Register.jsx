import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(username, password);
      nav('/student', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card narrow">
      <h1>Student registration</h1>
      <p className="muted">Creates a student account. Admins are provisioned on the server.</p>
      <form onSubmit={submit} className="form">
        {error && <div className="alert error">{error}</div>}
        <label>
          Username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            minLength={3}
            required
          />
        </label>
        <label>
          Password (min 6 characters)
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>
        <button type="submit" className="btn primary" disabled={loading}>
          {loading ? 'Creating…' : 'Create account'}
        </button>
      </form>
      <p className="muted small">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}
