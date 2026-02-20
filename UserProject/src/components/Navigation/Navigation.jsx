import React from 'react';
import './Navigation.css';
import NotificationBell from '../Notifications/NotificationBell';

const Navigation = ({
  userRole,
  user,
  cab,
  onLogout,
  onCabLogout,
  onSwitchRole,
  currentPage,
  onPageChange,
  isOpen,
  setIsOpen,
  theme,
  onToggleTheme
}) => {

  const handleLogout = () => {
    localStorage.removeItem('user');
    onLogout();
  };

  const handleCabLogout = () => {
    if (onCabLogout) onCabLogout();
  };

  const handleSwitchRole = () => {
    if (onSwitchRole) onSwitchRole();
  };

  const NavItem = ({ page, icon, label, onClick }) => (
    <button
      className={`nav-item ${currentPage === page ? 'active' : ''}`}
      onClick={() => onClick ? onClick() : onPageChange(page)}
      title={label}
    >
      <span className="nav-icon">{icon}</span>
      <span className="nav-label">{label}</span>
      {currentPage === page && <div className="active-indicator"></div>}
    </button>
  );

  // Render content based on role
  const renderNavItems = () => {
    if (!userRole) return null;

    if (userRole === 'passenger') {
      return (
        <>
          <div className="nav-section">
            <h4 className="nav-section-title">Menu</h4>
            <NavItem page="home" icon="🏠" label="Dashboard" />
            <NavItem page="book" icon="🗺️" label="Book Ride" />
            {user && <NavItem page="bookings" icon="📅" label="My Rides" />}
            {user && <NavItem page="profile" icon="👤" label="Profile" />}
          </div>

          <div className="nav-section mt-auto">
            {user ? (
              <>
                <div className="user-profile-widget">
                  <div className="user-avatar">{user.firstName[0]}</div>
                  <div className="user-details">
                    <span className="user-name">{user.firstName}</span>
                    <button className="btn-text-logout" onClick={handleLogout}>Logout</button>
                  </div>
                </div>
              </>
            ) : (
              <div className="auth-widget">
                <NavItem page="login" icon="🔐" label="Sign In" />
                <NavItem page="register" icon="✨" label="Sign Up" />
                <button className="nav-item" onClick={handleSwitchRole} style={{ borderTop: '1px solid var(--border-light)', marginTop: '0.5rem' }}>
                  <span className="nav-icon">🔄</span>
                  <span className="nav-label">Switch Role</span>
                </button>
              </div>
            )}
          </div>
        </>
      );
    }

    if (userRole === 'driver') {
      return (
        <>
          <div className="nav-section">
            <h4 className="nav-section-title">Driver Panel</h4>
            <NavItem page="home" icon="🏠" label="Home" />
            {cab && <NavItem page="cab-dashboard" icon="🎛️" label="Dashboard" />}
          </div>

          <div className="nav-section mt-auto">
            {cab ? (
              <>
                <div className="user-profile-widget">
                  <div className="user-avatar driver">D</div>
                  <div className="user-details">
                    <span className="user-name">{cab.driverName}</span>
                    <button className="btn-text-logout" onClick={handleCabLogout}>Logout</button>
                  </div>
                </div>
              </>
            ) : (
              <div className="auth-widget">
                <NavItem page="cab-login" icon="🔑" label="Login" />
                <NavItem page="cab-register" icon="📝" label="Register" />
                <button className="nav-item" onClick={handleSwitchRole} style={{ borderTop: '1px solid var(--border-light)', marginTop: '0.5rem' }}>
                  <span className="nav-icon">🔄</span>
                  <span className="nav-label">Switch Role</span>
                </button>
              </div>
            )}
          </div>
        </>
      );
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <span className="logo-icon">🚕</span>
            <span className="logo-text">Cab<span className="text-primary">Book</span></span>
          </div>
          <div className="header-actions">
            <NotificationBell />
            <button 
              className="theme-toggle-btn" 
              onClick={onToggleTheme}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>

        <div className="sidebar-content">
          {renderNavItems()}
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        {userRole === 'passenger' && (
          <>
            <NavItem page="home" icon="🏠" label="Home" />
            <NavItem page="book" icon="🗺️" label="Book" />
            {user && <NavItem page="bookings" icon="📅" label="Rides" />}
            {user ? (
              <NavItem page="profile" icon="👤" label="Profile" />
            ) : (
              <NavItem page="login" icon="🔐" label="Login" />
            )}
          </>
        )}
        {userRole === 'driver' && (
          <>
            <NavItem page="home" icon="🏠" label="Home" />
            {cab ? (
              <NavItem page="cab-dashboard" icon="🎛️" label="Dash" />
            ) : (
              <NavItem page="cab-login" icon="🔑" label="Login" />
            )}
          </>
        )}
      </nav>
    </>
  );
};

export default Navigation;
