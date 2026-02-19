import React, { useState } from "react";
import "./DriverRideRequest.css";

/**
 * Component to display incoming ride request with user details
 * Shows user information, pickup/dropoff, fare, and action buttons
 * Appears as a card notification on driver's dashboard
 */
const DriverRideRequest = ({
  request,
  onAccept,
  onReject,
  onTimeout,
  timeoutDuration = 15
}) => {
  const [timeRemaining, setTimeRemaining] = useState(timeoutDuration);
  const [hasResponded, setHasResponded] = useState(false);
  const [responseAction, setResponseAction] = useState(null); // 'accept', 'reject', 'timeout'

  // Auto-countdown timer
  React.useEffect(() => {
    if (hasResponded) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasResponded]);

  const handleAccept = () => {
    setHasResponded(true);
    setResponseAction("accept");
    if (onAccept) {
      onAccept(request);
    }
  };

  const handleReject = () => {
    setHasResponded(true);
    setResponseAction("reject");
    if (onReject) {
      onReject(request);
    }
  };

  const handleTimeout = () => {
    setHasResponded(true);
    setResponseAction("timeout");
    if (onTimeout) {
      onTimeout(request);
    }
  };

  // Calculate distance from driver to pickup
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const driverToUserDistance =
    request.driverLocation && request.userLocation
      ? calculateDistance(
          request.driverLocation.lat,
          request.driverLocation.lng,
          request.userLocation.lat,
          request.userLocation.lng
        )
      : 0;

  const timeRemainingPercent = (timeRemaining / timeoutDuration) * 100;

  return (
    <div className={`driver-ride-request-card ${hasResponded ? `responded-${responseAction}` : ""}`}>
      {/* Header with Timer */}
      <div className="request-header">
        <div className="request-title">
          <span className="new-badge">🔔 NEW REQUEST</span>
          <h3>Ride Request Incoming</h3>
        </div>
        <div className={`timer ${timeRemaining <= 5 ? "critical" : ""}`}>
          <div className="timer-display">{timeRemaining}s</div>
          <div className="timer-progress">
            <div
              className="timer-bar"
              style={{ width: `${timeRemainingPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* User Info Section */}
      <div className="user-section">
        <div className="user-header">
          <div className="user-avatar">
            {request.userName?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="user-details">
            <div className="user-name">{request.userName || "User"}</div>
            <div className="user-meta">
              <span className="user-rating">⭐ {request.userRating || 4.5}</span>
              <span className="user-rides">| {request.userTotalRides || 0} rides</span>
            </div>
            <div className="user-phone">
              📞 {request.userPhone || "+91 XXXXXXXXXX"}
            </div>
          </div>
        </div>

        {/* User Feedback Preview */}
        {request.userFeedback && (
          <div className="user-feedback-preview">
            <span className="feedback-icon">💬</span>
            <span className="feedback-text">"{request.userFeedback}"</span>
          </div>
        )}
      </div>

      {/* Location Details */}
      <div className="location-section">
        <div className="location-route">
          <div className="route-point pickup">
            <div className="route-icon">📍</div>
            <div className="route-details">
              <div className="route-label">Pickup Location</div>
              <div className="route-value">{request.pickupLocation}</div>
              {request.userLocation && (
                <div className="route-coords">
                  {request.userLocation.lat?.toFixed(4)},
                  {request.userLocation.lng?.toFixed(4)}
                </div>
              )}
            </div>
          </div>

          <div className="route-divider">
            <div className="divider-line"></div>
            <div className="divider-distance">{driverToUserDistance.toFixed(1)} km</div>
          </div>

          <div className="route-point dropoff">
            <div className="route-icon">🎯</div>
            <div className="route-details">
              <div className="route-label">Dropoff Location</div>
              <div className="route-value">{request.dropoffLocation}</div>
              {request.dropoffCoords && (
                <div className="route-coords">
                  {request.dropoffCoords.lat?.toFixed(4)},
                  {request.dropoffCoords.lng?.toFixed(4)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Trip Details */}
      <div className="trip-details-section">
        <div className="detail-card">
          <span className="detail-icon">📏</span>
          <div className="detail-content">
            <div className="detail-label">Trip Distance</div>
            <div className="detail-value">{request.tripDistance || 0} km</div>
          </div>
        </div>

        <div className="detail-card">
          <span className="detail-icon">⏱️</span>
          <div className="detail-content">
            <div className="detail-label">Est. Duration</div>
            <div className="detail-value">{request.estimatedDuration || "N/A"}</div>
          </div>
        </div>

        <div className="detail-card highlight">
          <span className="detail-icon">💰</span>
          <div className="detail-content">
            <div className="detail-label">Fare Amount</div>
            <div className="detail-value">₹{request.fare || 0}</div>
          </div>
        </div>

        <div className="detail-card">
          <span className="detail-icon">🚗</span>
          <div className="detail-content">
            <div className="detail-label">Cab Type</div>
            <div className="detail-value">{request.cabType || "Economy"}</div>
          </div>
        </div>
      </div>

      {/* Driver Info */}
      <div className="driver-info-section">
        <div className="info-item">
          <span className="info-label">📍 Your Distance to Pickup:</span>
          <span className="info-value">{driverToUserDistance.toFixed(2)} km</span>
        </div>
        <div className="info-item">
          <span className="info-label">🚗 Your Vehicle:</span>
          <span className="info-value">{request.yourCabNumber || "XX XX 0000"}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        {!hasResponded ? (
          <>
            <button
              className="btn btn-reject"
              onClick={handleReject}
              title="Reject this ride request"
            >
              <span className="btn-icon">❌</span>
              <span className="btn-text">Reject</span>
            </button>
            <button
              className="btn btn-accept"
              onClick={handleAccept}
              title="Accept this ride request"
            >
              <span className="btn-icon">✅</span>
              <span className="btn-text">Accept</span>
            </button>
          </>
        ) : (
          <>
            {responseAction === "accept" && (
              <div className="response-message success">
                ✅ Ride accepted! Heading to pickup location...
              </div>
            )}
            {responseAction === "reject" && (
              <div className="response-message rejected">
                ❌ Ride rejected. Moving to next request...
              </div>
            )}
            {responseAction === "timeout" && (
              <div className="response-message timeout">
                ⏱️ Request timed out. Next request loading...
              </div>
            )}
          </>
        )}
      </div>

      {/* Additional Notes */}
      {request.specialRequests && (
        <div className="special-requests">
          <div className="requests-icon">📝</div>
          <div className="requests-content">
            <div className="requests-label">Special Requests:</div>
            <div className="requests-text">{request.specialRequests}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverRideRequest;
