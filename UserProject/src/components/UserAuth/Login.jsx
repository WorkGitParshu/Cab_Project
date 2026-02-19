import React, { useState } from 'react';
import './UserAuth.css';
import api from '../../services/api';

const Login = ({ onLogin, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Use the api instance which points to localhost:8075/api/users (need to append /users/login)
      const response = await api.post('http://localhost:8075/api/users/login', formData);

      if (response.status === 200) {
        const user = response.data;
        // Ensure we store the token. The backend sends it as 'token' in the JSON body.
        if (user.token) {
          localStorage.setItem('user', JSON.stringify(user));
          onLogin(user);
        } else {
          setError('Login successful but no token received.');
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-card">
        <div className="auth-header">
          <div className="auth-icon">🔐</div>
          <h2>Welcome Back</h2>
          <p>Login to continue your journey</p>
        </div>

        {error && <div className="auth-alert error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="name@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? <span className="loader"></span> : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account?</p>
          <button className="btn-link text-primary" onClick={onSwitchToRegister}>
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;