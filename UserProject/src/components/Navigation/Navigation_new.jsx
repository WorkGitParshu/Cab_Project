import React, { useState } from 'react';
import './Navigation.css';

const Navigation = ({
  user,
  cab,
  onLogout,
  onCabLogout,
  currentPage,
  onPageChange,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    onLogout();
    setIsMobileMenuOpen(false);
  };

  const handleCabLogout = () => {
    if (onCabLogout) onCabLogout();
    setIsMobileMenuOpen(false);
  };

  const handlePageChange = (page) => {
    onPageChange(page);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand" onClick={() => handlePageChange('home')}>
          <span className="brand-icon">🚗</span>
          <span className="brand-text">CabBook</span>
        </div>

        <div className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <div className="nav-links">
            {/* Regular User Navigation */}
            <button
              className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
              onClick={() => handlePageChange('home')}
            >
              🏠 Home
            </button>

            <button
              className={`nav-link ${currentPage === 'book' ? 'active' : ''}`}
              onClick={() => handlePageChange(user ? 'book' : 'register')}
            >
              🗺️ Book Cab
            </button>

            {user && (
              <button
                className={`nav-link ${currentPage === 'bookings' ? 'active' : ''}`}
                onClick={() => handlePageChange('bookings')}
              >
                📋 My Bookings
              </button>
            )}

            {user && (
              <button
                className={`nav-link ${currentPage === 'profile' ? 'active' : ''}`}
                onClick={() => handlePageChange('profile')}
              >
                👤 Profile
              </button>
            )}

            {/* Cab Driver Navigation */}
            {!cab && (
              <>
                <div className="nav-divider"></div>
                <button
                  className={`nav-link ${currentPage === 'cab-login' ? 'active' : ''}`}
                  onClick={() => handlePageChange('cab-login')}
                >
                  🚕 Driver Login
                </button>

                <button
                  className={`nav-link ${currentPage === 'cab-register' ? 'active' : ''}`}
                  onClick={() => handlePageChange('cab-register')}
                >
                  ✍️ Register as Driver
                </button>
              </>
            )}

            {cab && (
              <>
                <div className="nav-divider"></div>
                <button
                  className={`nav-link ${currentPage === 'cab-dashboard' ? 'active' : ''}`}
                  onClick={() => handlePageChange('cab-dashboard')}
                >
                  📊 Driver Dashboard
                </button>
              </>
            )}
          </div>

          <div className="nav-auth">
            {user ? (
              <div className="user-info">
                <div className="user-avatar">
                  {user.firstName?.charAt(0).toUpperCase()}
                </div>
                <div className="user-details">
                  <span className="user-name">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="user-email">{user.email}</span>
                </div>
                <button className="btn-logout" onClick={handleLogout}>
                  🔓 Logout
                </button>
              </div>
            ) : cab ? (
              <div className="user-info">
                <div className="user-avatar driver">D</div>
                <div className="user-details">
                  <span className="user-name">{cab.driverName}</span>
                  <span className="user-email">{cab.cabNumber}</span>
                </div>
                <button className="btn-logout" onClick={handleCabLogout}>
                  🔓 Logout
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <button
                  className={`nav-link nav-auth-link ${currentPage === 'login' ? 'active' : ''}`}
                  onClick={() => handlePageChange('login')}
                >
                  Login
                </button>
                <button
                  className={`btn-primary nav-auth-btn`}
                  onClick={() => handlePageChange('register')}
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
