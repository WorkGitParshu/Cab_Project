import React, { useState, useEffect } from 'react';
import './UserRideTracking.css';

/**
 * Enhanced User Ride Tracking Component with Beautiful UI
 * Shows active ride status and driver details with popups
 */
const UserRideTracking = ({ onCancel, onRideCompleted }) => {
  const [activeRide, setActiveRide] = useState(null);
  const [driverAccepted, setDriverAccepted] = useState(false);
  const [driverDetails, setDriverDetails] = useState(null);
  const [waitingTime, setWaitingTime] = useState(0);
  const [_pollingInterval, _setPollingInterval] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState(null);

  // Initialize active ride and poll for status - OPTIMIZED FOR SPEED
  useEffect(() => {
    const savedRide = localStorage.getItem('currentUserRide') || localStorage.getItem('activeRide');
    let rideData = null;
    if (savedRide) {
      rideData = JSON.parse(savedRide);
      setActiveRide(rideData);
    }

    // Check immediately on mount for faster response
    const checkRideStatus = async () => {
      if (!rideData && !activeRide) return;
      const currentRideId = rideData?.id || activeRide?.id;
      if (!currentRideId) return;

      try {
        const response = await fetch(`http://localhost:8077/api/bookings/${currentRideId}`);
        if (response.ok) {
          const booking = await response.json();

          if (booking.status === 'CONFIRMED' || booking.status === 'IN_PROGRESS') {
            if (!driverAccepted) {
              setDriverAccepted(true);
              const driverInfo = {
                name: booking.driverName || 'Driver',
                cabNumber: booking.cabNumber || 'Unknown',
                rating: 4.8,
                totalRides: 120,
                cabType: booking.cabType || 'SEDAN',
                model: booking.model || 'Comfort',
                currentLocation: {
                  lat: 14.6053,
                  lng: 73.2903
                }
              };
              setDriverDetails(driverInfo);

              // Show acceptance notification
              if (!showNotification) {
                setNotificationData({
                  type: 'accepted',
                  title: 'Driver Accepted Your Ride! 🎉',
                  message: `${driverInfo.name} is on the way to pick you up!`,
                  driver: driverInfo
                });
                setShowNotification(true);
              }
            }
          }

          if (booking.status === 'COMPLETED') {
            console.log("🏁 Ride completed! Moving to payment.");
            localStorage.removeItem('currentUserRide');
            localStorage.removeItem('activeRide');
            localStorage.removeItem('driverAcceptedRide');
            localStorage.removeItem('currentRideId');

            if (onRideCompleted) {
              onRideCompleted(booking);
            }
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    // Check immediately
    checkRideStatus();

    // Then check every 1 second (reduced from 3 seconds for faster updates)
    const interval = setInterval(() => {
      checkRideStatus();
      setWaitingTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [onRideCompleted, showNotification, activeRide, driverAccepted]);

  const handleCancelRide = () => {
    localStorage.removeItem('currentUserRide');
    localStorage.removeItem('activeRide');
    localStorage.removeItem('driverAcceptedRide');
    localStorage.removeItem('currentRideId');
    if (onCancel) onCancel();
  };

  if (!activeRide) {
    return (
      <div className="ride-tracking-container">
        <div className="empty-state">
          <div className="empty-icon">🚕</div>
          <h2>No Active Ride</h2>
          <p>Start a new booking to see your ride status</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ride-tracking-container">
      {/* Notification Popup */}
      {showNotification && notificationData && (
        <div className="notification-overlay">
          <div className="notification-popup">
            <div className="notification-close" onClick={() => setShowNotification(false)}>✕</div>
            
            {notificationData.type === 'accepted' && (
              <div className="popup-content">
                <div className="success-animation">
                  <div className="success-icon">✓</div>
                </div>
                
                <h2>{notificationData.title}</h2>
                <p className="notification-message">{notificationData.message}</p>

                <div className="driver-info-popup">
                  <div className="driver-avatar-large">
                    {notificationData.driver?.name?.charAt(0) || '?'}
                  </div>
                  <div className="driver-quick-info">
                    <h3>{notificationData.driver?.name}</h3>
                    <div className="rating-stars">⭐ {notificationData.driver?.rating}</div>
                  </div>
                </div>

                <div className="vehicle-details-popup">
                  <div className="detail-item">
                    <span className="detail-icon">🚗</span>
                    <div>
                      <span className="detail-label">Vehicle</span>
                      <span className="detail-value">{notificationData.driver?.cabNumber}</span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">🏷️</span>
                    <div>
                      <span className="detail-label">Type</span>
                      <span className="detail-value">{notificationData.driver?.model}</span>
                    </div>
                  </div>
                </div>

                <div className="popup-actions">
                  <button className="action-btn primary-btn" onClick={() => setShowNotification(false)}>
                    Got It! Track Ride
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="ride-tracking-header">
        <h2>🚗 Your Ride</h2>
        <button className="cancel-ride-btn" onClick={handleCancelRide}>
          ❌ Cancel Ride
        </button>
      </div>

      {!driverAccepted ? (
        <div className="waiting-section">
          <div className="waiting-card">
            <div className="waiting-header">
              <h3>Looking for drivers...</h3>
              <div className="waiting-animation">
                <div className="pulse-dot"></div>
                <div className="pulse-dot pulse-delay-1"></div>
                <div className="pulse-dot pulse-delay-2"></div>
              </div>
            </div>

            <div className="waiting-timer">
              <span className="timer-label">Waiting for</span>
              <span className="timer-value">{Math.floor(waitingTime / 2)}s</span>
            </div>

            <div className="ride-summary-card">
              <div className="summary-row">
                <div className="summary-item">
                  <span className="summary-icon">📍</span>
                  <div>
                    <span className="summary-label">From</span>
                    <span className="summary-value">{typeof activeRide.pickupLocation === 'object' ? activeRide.pickupLocation.address : activeRide.pickupLocation}</span>
                  </div>
                </div>
              </div>

              <div className="summary-divider">↓</div>

              <div className="summary-row">
                <div className="summary-item">
                  <span className="summary-icon">🎯</span>
                  <div>
                    <span className="summary-label">To</span>
                    <span className="summary-value">{typeof activeRide.dropoffLocation === 'object' ? activeRide.dropoffLocation.address : activeRide.dropoffLocation}</span>
                  </div>
                </div>
              </div>

              <div className="summary-stats">
                <div className="stat">
                  <span className="stat-label">Distance</span>
                  <span className="stat-value">{activeRide.tripDistance?.toFixed(1) || '0'} km</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Estimated Fare</span>
                  <span className="stat-value fare">₹{activeRide.estimatedFare?.toFixed(0) || '0'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="driver-accepted-section">
          {/* Acceptance Badge */}
          <div className="acceptance-banner">
            <div className="banner-icon">✅</div>
            <div className="banner-text">
              <h3>Driver Accepted!</h3>
              <p>Heading towards you</p>
            </div>
          </div>

          {/* Driver Card - Main */}
          <div className="driver-hero-card">
            <div className="driver-hero-background"></div>
            
            <div className="driver-profile">
              <div className="driver-avatar-hero">
                {driverDetails?.name?.charAt(0) || '?'}
              </div>
              <div className="driver-info-hero">
                <h2>{driverDetails?.name || 'Driver'}</h2>
                <div className="driver-meta">
                  <span className="rating">⭐ {driverDetails?.rating || 4.8}</span>
                  <span className="rides">• {driverDetails?.totalRides || 120} rides</span>
                </div>
              </div>
            </div>

            <div className="driver-stats">
              <div className="stat-badge">
                <span className="label">Vehicle</span>
                <span className="value">{driverDetails?.cabNumber}</span>
              </div>
              <div className="stat-badge">
                <span className="label">Type</span>
                <span className="value">{driverDetails?.model}</span>
              </div>
              <div className="stat-badge">
                <span className="label">ETA</span>
                <span className="value">2 min</span>
              </div>
            </div>
          </div>

          {/* Trip Details Cards */}
          <div className="trip-details-grid">
            <div className="trip-card location-card">
              <div className="card-icon">📍</div>
              <div className="card-content">
                <h4>Driver Location</h4>
                <p className="location-coords">
                  {driverDetails?.currentLocation?.lat?.toFixed(4)}°, {driverDetails?.currentLocation?.lng?.toFixed(4)}°
                </p>
              </div>
            </div>

            <div className="trip-card fare-card">
              <div className="card-icon">💰</div>
              <div className="card-content">
                <h4>Estimated Fare</h4>
                <p className="fare-amount">₹{activeRide.estimatedFare?.toFixed(0) || '0'}</p>
              </div>
            </div>

            <div className="trip-card distance-card">
              <div className="card-icon">🛣️</div>
              <div className="card-content">
                <h4>Trip Distance</h4>
                <p className="distance-value">{activeRide.tripDistance?.toFixed(1) || '0'} km</p>
              </div>
            </div>

            <div className="trip-card route-card">
              <div className="card-icon">🗺️</div>
              <div className="card-content">
                <h4>Your Route</h4>
                <p className="route-info">Live tracking enabled</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="action-btn call-action">
              <span>📞</span> Call Driver
            </button>
            <button className="action-btn message-action">
              <span>💬</span> Message
            </button>
            <button className="action-btn share-action">
              <span>📍</span> Share Trip
            </button>
          </div>

          {/* Route Details */}
          <div className="route-details-card">
            <h3>🛣️ Your Trip Details</h3>
            <div className="route-item">
              <span className="route-label">Pickup Location</span>
              <span className="route-value">{typeof activeRide.pickupLocation === 'object' ? activeRide.pickupLocation.address : activeRide.pickupLocation}</span>
            </div>
            <div className="route-item">
              <span className="route-label">Dropoff Location</span>
              <span className="route-value">{activeRide.dropoffLocation}</span>
            </div>
            <div className="route-item">
              <span className="route-label">Distance</span>
              <span className="route-value">{activeRide.tripDistance?.toFixed(1) || '0'} km</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRideTracking;
