import React, { useEffect, useState } from "react";
import "./WaitingForDriverUI.css";

/**
 * Enhanced waiting UI component with animations while waiting for driver confirmation
 * Shows driver details, distance, fare, and exciting animations
 */
const WaitingForDriverUI = ({ 
  driver, 
  distance, 
  fare, 
  pickupLocation, 
  dropLocation,
  timeRemaining,
  onCancel,
  onTimeout
}) => {
  const [pulseAnimation, setPulseAnimation] = useState(true);
  const [animationStep, setAnimationStep] = useState(0);

  // Handle timeout
  useEffect(() => {
    if (timeRemaining <= 0) {
      onTimeout?.();
    }
  }, [timeRemaining, onTimeout]);

  // Cycle through animation steps
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationStep((prev) => (prev + 1) % 4);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="waiting-ui">
      {/* Background animated gradient */}
      <div className="gradient-background"></div>

      {/* Main waiting card */}
      <div className="waiting-card">
        {/* Top - Status */}
        <div className="waiting-status">
          <div className="pulse-icon">
            <div className={`pulse-ring pulse-${animationStep}`}></div>
            <div className="pulse-center">📡</div>
          </div>
          <h2>Searching for Driver...</h2>
          <p className="status-text">We're sending your request to nearby drivers</p>
        </div>

        {/* Middle - Driver Info Card */}
        {driver && (
          <div className="driver-details-card">
            <div className="driver-header">
              <div className="driver-avatar">
                <span className="avatar-letter">{driver.driverName?.charAt(0).toUpperCase()}</span>
              </div>
              <div className="driver-info-section">
                <h3 className="driver-name">{driver.driverName}</h3>
                <p className="driver-phone">📞 {driver.driverPhone}</p>
              </div>
              <div className="driver-rating">
                <span className="rating-stars">⭐ {driver.rating || "N/A"}</span>
                <span className="rides-count">{driver.totalRides || 0} rides</span>
              </div>
            </div>

            <div className="trip-details">
              <div className="detail-row">
                <span className="detail-label">🚗 Vehicle</span>
                <span className="detail-value">
                  {driver.cabType} • {driver.cabNumber}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">📍 Distance</span>
                <span className="detail-value">{distance?.toFixed(2)} km away</span>
              </div>
              <div className="detail-row highlight">
                <span className="detail-label">💵 Estimated Fare</span>
                <span className="detail-value fare">₹{fare?.toFixed(0)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom - Timer and Actions */}
        <div className="waiting-timer-section">
          <div className="timer-display">
            <div className="timer-value">{timeRemaining}s</div>
            <div className="timer-label">Waiting for response</div>
            <div className="timer-progress">
              <div
                className="timer-bar"
                style={{ width: `${(timeRemaining / 15) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Animated dots */}
          <div className="loading-dots">
            <span className={`dot dot-1`}></span>
            <span className={`dot dot-2`}></span>
            <span className={`dot dot-3`}></span>
          </div>

          {/* Cancel button */}
          <button className="cancel-waiting-btn" onClick={onCancel}>
            ❌ Cancel Request
          </button>
        </div>

        {/* Location info summary */}
        <div className="location-summary">
          <div className="location-item">
            <span className="location-icon">📍</span>
            <span className="location-label">From</span>
            <span className="location-coords">
              {pickupLocation?.lat?.toFixed(4)}, {pickupLocation?.lng?.toFixed(4)}
            </span>
          </div>
          <div className="location-arrow">→</div>
          <div className="location-item">
            <span className="location-icon">🎯</span>
            <span className="location-label">To</span>
            <span className="location-coords">
              {dropLocation?.lat?.toFixed(4)}, {dropLocation?.lng?.toFixed(4)}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom info text */}
      <p className="info-text">
        Your request will be sent to nearby drivers. A driver will confirm soon.
      </p>
    </div>
  );
};

export default WaitingForDriverUI;
