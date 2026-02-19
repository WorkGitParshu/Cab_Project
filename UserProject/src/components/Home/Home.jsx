import React from 'react';
import './Home.css';

const Home = ({ user, onPageChange }) => {
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const recentDestinations = [
    { name: 'Office', address: 'Tech Park, Sector 5', icon: '🏢' },
    { name: 'Home', address: 'Green Valley Apts', icon: '🏠' },
    { name: 'Gym', address: 'FitMax Center', icon: '💪' },
  ];

  const featuredRides = [
    { type: 'Standard', price: '₹10/km', eta: '4 min', icon: '🚙' },
    { type: 'Premium', price: '₹15/km', eta: '6 min', icon: '🚘' },
    { type: 'SUV', price: '₹18/km', eta: '8 min', icon: '🚐' },
  ];

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <header className="dashboard-header">
        <div className="header-greeting">
          <h1>{greeting()}, <span style={{color: 'var(--accent)'}}>{user ? user.firstName : 'Traveler'}</span></h1>
          <p>Where would you like to go today?</p>
        </div>
        {user &&
          <div className="header-stats">
            <div className="stat-pill glass-panel">
              <span className="stat-label">Rides</span>
              <span className="stat-value">12</span>
            </div>
            <div className="stat-pill glass-panel">
              <span className="stat-label">Rating</span>
              <span className="stat-value">4.8 ★</span>
            </div>
          </div>
        }
      </header>

      {/* Main Action Area */}
      <div className="dashboard-grid">
        {/* Quick Book Widget */}
        <section className="dashboard-widget glass-card large-widget">
          <div className="widget-header">
            <h3>Quick Book</h3>
            <button className="btn-link" onClick={() => onPageChange('book')}>View Map &rarr;</button>
          </div>
          <div className="quick-destinations">
            {recentDestinations.map((dest, idx) => (
              <div key={idx} className="dest-card" onClick={() => onPageChange('book')}>
                <div className="dest-icon glass-panel">{dest.icon}</div>
                <div className="dest-info">
                  <h4>{dest.name}</h4>
                  <span>{dest.address}</span>
                </div>
              </div>
            ))}
            <div className="dest-card add-new" onClick={() => onPageChange('book')}>
              <div className="dest-icon glass-panel">+</div>
              <div className="dest-info">
                <h4>New Trip</h4>
                <span>Select destination</span>
              </div>
            </div>
          </div>
        </section>

        {/* Active Promotions / Banner */}
        <section className="dashboard-widget promo-widget glass-card">
          <div className="promo-content">
            <span className="badge badge-primary">PROMO</span>
            <h3>50% OFF</h3>
            <p>On your first Premium ride this week.</p>
            <button className="btn btn-primary btn-small" onClick={() => onPageChange('book')}>Claim Now</button>
          </div>
          <div className="promo-visual">🎁</div>
        </section>

        {/* Ride Selector Preview */}
        <section className="dashboard-widget glass-card full-width">
          <div className="widget-header">
            <h3>Available Rides Nearby</h3>
          </div>
          <div className="ride-types-grid">
            {featuredRides.map((ride, idx) => (
              <div key={idx} className="ride-preview-card glass-panel">
                <div className="ride-icon">{ride.icon}</div>
                <div className="ride-details">
                  <h4>{ride.type}</h4>
                  <span className="eta">{ride.eta} away</span>
                </div>
                <div className="ride-price">{ride.price}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {!user && (
        <div className="guest-overlay flex-center flex-col">
          <div className="glass-card p-4 text-center" style={{ maxWidth: '400px' }}>
            <h2>Join CabBook</h2>
            <p className="m-2">Sign in to unlock all features and manage your rides.</p>
            <div className="flex-center gap-2 m-2">
              <button className="btn btn-primary" onClick={() => onPageChange('login')}>Sign In</button>
              <button className="btn btn-secondary" onClick={() => onPageChange('register')}>Register</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
