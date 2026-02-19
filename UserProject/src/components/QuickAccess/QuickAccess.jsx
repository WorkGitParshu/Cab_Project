import React from 'react';
import './QuickAccess.css';

const QuickAccess = ({ onPageChange }) => {
  const handleNavigation = (page) => {
    if (onPageChange) {
      onPageChange(page);
    } else {
      window.location.href = `/?page=${page}`;
    }
  };

  return (
    <div className="quick-access-container">
      <div className="quick-access-card">
        <h1>🎯 Quick Access</h1>
        <p>Jump to any section instantly</p>

        <div className="access-grid">
          {/* User Features */}
          <div className="access-section">
            <h2>👤 User Features</h2>
            
            <button onClick={() => handleNavigation('booking-flow')} className="access-button booking-btn">
              <span className="button-icon">📍</span>
              <span className="button-text">Book a Ride</span>
              <span className="button-desc">New booking interface - no restrictions!</span>
            </button>

            <button onClick={() => handleNavigation('ride-tracking')} className="access-button tracking-btn">
              <span className="button-icon">🚗</span>
              <span className="button-text">Track Ride</span>
              <span className="button-desc">See real-time driver updates</span>
            </button>

            <button onClick={() => handleNavigation('bookings')} className="access-button bookings-btn">
              <span className="button-icon">📋</span>
              <span className="button-text">My Bookings</span>
              <span className="button-desc">View booking history</span>
            </button>
          </div>

          {/* Driver Features */}
          <div className="access-section">
            <h2>👨‍💼 Driver Features</h2>
            
            <button onClick={() => handleNavigation('driver-dashboard')} className="access-button driver-btn">
              <span className="button-icon">📊</span>
              <span className="button-text">Driver Dashboard</span>
              <span className="button-desc">Accept rides, see history & stats</span>
            </button>

            <button onClick={() => handleNavigation('cab-login')} className="access-button login-btn">
              <span className="button-icon">🔑</span>
              <span className="button-text">Driver Login</span>
              <span className="button-desc">Login as driver</span>
            </button>

            <button onClick={() => handleNavigation('cab-register')} className="access-button register-btn">
              <span className="button-icon">✍️</span>
              <span className="button-text">Driver Register</span>
              <span className="button-desc">Create driver account</span>
            </button>
          </div>

          {/* Test Features */}
          <div className="access-section">
            <h2>🧪 Test Scenario</h2>
            <div className="test-card">
              <h3>Two-Tab Real-Time Test</h3>
              <p><strong>How to test real-time notifications:</strong></p>
              <ol>
                <li>Tab 1: Click "Book a Ride" → Complete booking → See "Waiting for driver..."</li>
                <li>Tab 2: Open new tab → Go to Driver Dashboard</li>
                <li>Tab 2: Click "Online" → Wait 8 seconds → Click "Accept"</li>
                <li>Tab 1: ⚡ INSTANTLY see driver details (name, vehicle, location, ETA)</li>
              </ol>
              <div className="quick-test-buttons">
                <button onClick={() => handleNavigation('booking-flow')} className="test-btn user-tab">📍 Open User Tab</button>
                <button onClick={() => handleNavigation('driver-dashboard')} className="test-btn driver-tab">🚙 Open Driver Tab</button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Showcase */}
        <div className="features-showcase">
          <h2>✨ Key Features</h2>
          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-icon">📝</span>
              <h4>No Restrictions</h4>
              <p>Enter any destination text, no character limits</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <h4>Real-Time Sync</h4>
              <p>Driver acceptance updates in 2 seconds</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📍</span>
              <h4>Live Tracking</h4>
              <p>See driver location with lat/lng coordinates</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💾</span>
              <h4>Data Persistence</h4>
              <p>All rides saved to localStorage (no backend needed)</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎨</span>
              <h4>Beautiful UI</h4>
              <p>Professional design with smooth animations</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚙️</span>
              <h4>Lightning Fast</h4>
              <p>Instant feedback and instant page loads</p>
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="quick-tips">
          <h3>💡 Quick Tips</h3>
          <ul>
            <li>First time? Click "Book a Ride" to start</li>
            <li>Test requires two browser tabs (driver & user)</li>
            <li>Driver acceptance happens every 5-8 seconds</li>
            <li>Check browser localStorage (F12 → Application) to see saved data</li>
            <li>All bookings work without any backend server</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QuickAccess;
