import React, { useState } from 'react';
import Navigation from '../Navigation/Navigation';
import './MainLayout.css';

const MainLayout = ({ children, userRole, user, cab, onLogout, onCabLogout, onSwitchRole, currentPage, onPageChange, theme, onToggleTheme }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="main-layout">
      {/* Sidebar Navigation */}
      <Navigation 
        userRole={userRole}
        user={user}
        cab={cab}
        onLogout={onLogout}
        onCabLogout={onCabLogout}
        onSwitchRole={onSwitchRole}
        currentPage={currentPage}
        onPageChange={onPageChange}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

      {/* Main Content Area */}
      <main className={`content-wrapper ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="content-container">
            {children}
        </div>
      </main>
      
      {/* Mobile Bottom Nav Spacer (if needed) */}
      <div className="mobile-nav-spacer"></div>
    </div>
  );
};

export default MainLayout;
