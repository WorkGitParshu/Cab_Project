import React from 'react';
import './RoleSelection.css';

const RoleSelection = ({ onSelectRole }) => {
  return (
    <div className="role-selection-container">
      <div className="role-selection-content">
        <h1>Welcome to CabBook</h1>
        <p className="role-subtitle">Choose how you'd like to use CabBook</p>
        
        <div className="role-options">
          <div className="role-card" onClick={() => onSelectRole('passenger')}>
            <div className="role-icon">🚗</div>
            <h2>Passenger</h2>
            <p>Book rides, track drivers, and reach your destination</p>
            <button className="role-btn">Continue as Passenger</button>
          </div>

          <div className="role-card" onClick={() => onSelectRole('driver')}>
            <div className="role-icon">🚙</div>
            <h2>Driver</h2>
            <p>Earn money by accepting ride requests from passengers</p>
            <button className="role-btn">Continue as Driver</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
