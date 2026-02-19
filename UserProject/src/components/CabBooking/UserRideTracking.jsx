import React, { useState, useEffect } from 'react';
import './UserRideTracking.css';

/**
 * User Ride Tracking Component
 * Shows active ride status and driver details
 * Updates in real-time when driver accepts
 */
const UserRideTracking = ({ onCancel, onRideCompleted }) => {
  const [activeRide, setActiveRide] = useState(null);
  const [driverAccepted, setDriverAccepted] = useState(false);
  const [driverDetails, setDriverDetails] = useState(null);
  const [waitingTime, setWaitingTime] = useState(0);
  const [pollingInterval, setPollingInterval] = useState(null);

  // Initialize active ride and poll for status
  useEffect(() => {
    // Check multiple potential keys to ensure we catch the ride regardless of which component started it
    const savedRide = localStorage.getItem('currentUserRide') || localStorage.getItem('activeRide');
    let rideData = null;
    if (savedRide) {
      rideData = JSON.parse(savedRide);
      setActiveRide(rideData);
    }

    const interval = setInterval(async () => {
      if (!rideData && !activeRide) return;
      const currentRideId = rideData?.id || activeRide?.id;
      if (!currentRideId) return;

      try {
        const response = await fetch(`http://localhost:8077/api/bookings/${currentRideId}`);
        if (response.ok) {
          const booking = await response.json();

          if (booking.status === 'CONFIRMED' || booking.status === 'IN_PROGRESS') {
            setDriverAccepted(true);
            // Enrich with driver details if available in backend
            setDriverDetails({
              name: booking.driverName || 'Driver',
              cabNumber: booking.cabNumber || 'Unknown',
              rating: 4.8,
              totalRides: 120
            });
          }

          if (booking.status === 'COMPLETED') {
            console.log("🏁 Ride completed! Moving to payment.");
            clearInterval(interval);

            // Clear all local storage keys to prevent reappearing
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

      setWaitingTime(prev => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, [onRideCompleted]);

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
      <div className="ride-tracking-header">
        <h2>🚗 Ride Status</h2>
        <button className="cancel-ride-btn" onClick={handleCancelRide}>
          ❌ Cancel Ride
        </button>
      </div>

      {!driverAccepted ? (
        <div className="waiting-for-driver">
          <div className="waiting-animation">
            <div className="pulse-circle"></div>
            <div className="pulse-circle pulse-delay-1"></div>
            <div className="pulse-circle pulse-delay-2"></div>
          </div>
          <h3>⏳ Waiting for driver to accept...</h3>
          <p>Waiting time: {Math.floor(waitingTime / 2)}s</p>

          <div className="ride-details-card">
            <h4>📍 Your Booking Details</h4>
            <div className="detail-row">
              <span className="label">Pickup:</span>
              <span className="value">{typeof activeRide.pickupLocation === 'object' ? activeRide.pickupLocation.address : activeRide.pickupLocation}</span>
            </div>
            <div className="detail-row">
              <span className="label">Dropoff:</span>
              <span className="value">{typeof activeRide.dropoffLocation === 'object' ? activeRide.dropoffLocation.address : activeRide.dropoffLocation}</span>
            </div>
            <div className="detail-row">
              <span className="label">Distance:</span>
              <span className="value">{activeRide.tripDistance.toFixed(1)} km</span>
            </div>
            <div className="detail-row">
              <span className="label">Fare:</span>
              <span className="value highlight">₹{activeRide.estimatedFare.toFixed(0)}</span>
            </div>
            <div className="detail-row">
              <span className="label">Vehicle:</span>
              <span className="value">{activeRide.cabName}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="driver-accepted">
          <div className="acceptance-badge">✅ Driver Accepted!</div>

          <div className="driver-card">
            <div className="driver-header-section">
              <div className="driver-large-avatar">
                {driverDetails?.name?.charAt(0) || '?'}
              </div>
              <div className="driver-main-info">
                <h3>{driverDetails?.name || 'Driver'}</h3>
                <div className="driver-rating">
                  ⭐ {driverDetails?.rating || 4.8} • {driverDetails?.totalRides || 0} rides
                </div>
              </div>
            </div>

            <div className="vehicle-section">
              <div className="vehicle-info">
                <span className="label">🚗 Vehicle:</span>
                <span className="value">{driverDetails?.cabNumber}</span>
              </div>
              <div className="vehicle-info">
                <span className="label">Type:</span>
                <span className="value">{activeRide.cabName}</span>
              </div>
            </div>

            <div className="location-section">
              <h4>📍 Location Details</h4>
              <div className="detail-row">
                <span className="label">Driver Distance:</span>
                <span className="value">{driverDetails?.distanceFromUser?.toFixed(1) || '0'} km away</span>
              </div>
              <div className="detail-row">
                <span className="label">ETA:</span>
                <span className="value">{driverDetails?.responseTime || '2 min'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Driver Current Location:</span>
                <span className="value">Lat: {driverDetails?.currentLocation?.lat?.toFixed(4)}, Lng: {driverDetails?.currentLocation?.lng?.toFixed(4)}</span>
              </div>
              <div className="detail-row">
                <span className="label">Your Location:</span>
                <span className="value">Lat: {activeRide.pickupCoords?.lat?.toFixed(4)}, Lng: {activeRide.pickupCoords?.lng?.toFixed(4)}</span>
              </div>
            </div>

            <div className="trip-section">
              <h4>🛣️ Your Trip</h4>
              <div className="detail-row">
                <span className="label">Pickup:</span>
                <span className="value">{typeof activeRide.pickupLocation === 'object' ? activeRide.pickupLocation.address : activeRide.pickupLocation}</span>
              </div>
              <div className="detail-row">
                <span className="label">Dropoff:</span>
                <span className="value">{activeRide.dropoffLocation}</span>
              </div>
              <div className="detail-row">
                <span className="label">Distance:</span>
                <span className="value">{activeRide.tripDistance?.toFixed(1)} km</span>
              </div>
              <div className="detail-row">
                <span className="label">Estimated Fare:</span>
                <span className="value highlight">₹{activeRide.estimatedFare?.toFixed(0)}</span>
              </div>
            </div>

            <div className="contact-section">
              <h4>📞 Driver Contact</h4>
              <div className="contact-buttons">
                <button className="contact-btn call-btn">📞 Call Driver</button>
                <button className="contact-btn message-btn">💬 Message</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRideTracking;
