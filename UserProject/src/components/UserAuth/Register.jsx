import React, { useState } from 'react';
import './UserAuth.css';

const Register = ({ onRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'PASSENGER'
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
      const response = await fetch('http://localhost:8075/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const text = await response.text();
        // Auto login or just notify
        alert("Registration Successful! Please Login.");
        onSwitchToLogin();
      } else {
        setError('Registration failed. Email might be in use.');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-card">
        <div className="auth-header">
          <div className="auth-icon">✨</div>
          <h2>Create Account</h2>
          <p>Join us and start riding today</p>
        </div>

        {error && <div className="auth-alert error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required placeholder="John" />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required placeholder="Doe" />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="name@example.com" />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="+1 234 567 8900" />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Create a strong password" />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? <span className="loader"></span> : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account?</p>
          <button className="btn-link text-primary" onClick={onSwitchToLogin}>
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;