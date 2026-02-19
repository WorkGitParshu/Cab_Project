import React, { useState, useEffect } from "react";
import "./DriverDashboard.css";
import DriverRideRequest from "./DriverRideRequest";
import DriverHistory from "./DriverHistory";

/**
 * Complete Driver Dashboard
 * Features:
 * - Real-time incoming ride requests with notifications
 * - Ride history and performance metrics
 * - Accept/Reject requests
 * - Live status management
 * - Notification sound/alerts
 */
const DriverDashboard = ({ driverId = "DRIVER_001", userName = "John Driver" }) => {
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, history, stats
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [acceptedRide, setAcceptedRide] = useState(null);
  const [driverStatus, setDriverStatus] = useState("online"); // online, busy, offline
  const [earnings, setEarnings] = useState(0);
  const [completedRides, setCompletedRides] = useState(0);
  const [rating, setRating] = useState(4.8);

  // Simulate incoming ride requests
  useEffect(() => {
    const mockRequests = [
      {
        id: "REQ001",
        userId: "USER001",
        userName: "Sarah Johnson",
        userPhone: "+1-555-0101",
        userRating: 4.7,
        userTotalRides: 23,
        userFeedback: "Polite and friendly passenger",
        pickupLocation: "Central Station, Downtown",
        dropoffLocation: "Airport Terminal 2",
        userLocation: { lat: 40.7128, lng: -74.006 },
        dropoffCoords: { lat: 40.7728, lng: -73.9996 },
        tripDistance: 8.5,
        estimatedFare: 145,
        cabType: "comfort",
        driverToUserDistance: 0.8,
        requestTime: new Date().toLocaleTimeString(),
        timeout: 15,
      },
      {
        id: "REQ002",
        userId: "USER002",
        userName: "Mike Chen",
        userPhone: "+1-555-0102",
        userRating: 4.5,
        userTotalRides: 15,
        userFeedback: "Good communication",
        pickupLocation: "Shopping Mall, Westside",
        dropoffLocation: "City Center",
        userLocation: { lat: 40.7380, lng: -73.9855 },
        dropoffCoords: { lat: 40.7489, lng: -73.9680 },
        tripDistance: 3.2,
        estimatedFare: 72,
        cabType: "economy",
        driverToUserDistance: 1.2,
        requestTime: new Date().toLocaleTimeString(),
        timeout: 15,
      },
    ];

    // Simulate receiving requests (in real app, this would come from WebSocket)
    const interval = setInterval(() => {
      if (Math.random() > 0.7 && incomingRequests.length < 3) {
        const newRequest = mockRequests[Math.floor(Math.random() * mockRequests.length)];
        setIncomingRequests((prev) => {
          const exists = prev.some((r) => r.id === newRequest.id);
          return exists ? prev : [...prev, { ...newRequest, id: `REQ${Date.now()}` }];
        });
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [incomingRequests]);

  // Handle request acceptance
  const handleAcceptRequest = (request) => {
    setAcceptedRide(request);
    setIncomingRequests((prev) => prev.filter((r) => r.id !== request.id));
    setDriverStatus("busy");
    setCompletedRides((prev) => prev + 1);
    setEarnings((prev) => prev + request.estimatedFare);

    // Auto-complete ride after 5 seconds for demo
    setTimeout(() => {
      setAcceptedRide(null);
      setDriverStatus("online");
    }, 5000);
  };

  // Handle request rejection
  const handleRejectRequest = (requestId) => {
    setIncomingRequests((prev) => prev.filter((r) => r.id !== requestId));
  };

  // Handle request timeout
  const handleRequestTimeout = (requestId) => {
    setIncomingRequests((prev) =>
      prev.filter((r) => r.id !== requestId)
    );
  };

  // Toggle driver status
  const handleStatusToggle = () => {
    setDriverStatus((prev) =>
      prev === "online" ? "offline" : prev === "offline" ? "online" : "offline"
    );
  };

  return (
    <div className="driver-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="driver-profile">
            <div className="driver-avatar">{userName.charAt(0)}</div>
            <div className="driver-info">
              <div className="driver-name">{userName}</div>
              <div className="driver-id">ID: {driverId}</div>
            </div>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-icon">⭐</span>
              <div className="stat-content">
                <div className="stat-value">{rating}</div>
                <div className="stat-label">Rating</div>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🚗</span>
              <div className="stat-content">
                <div className="stat-value">{completedRides}</div>
                <div className="stat-label">Rides</div>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-icon">💰</span>
              <div className="stat-content">
                <div className="stat-value">₹{earnings}</div>
                <div className="stat-label">Earnings</div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Toggle */}
        <div className="status-toggle">
          <button
            className={`status-btn ${driverStatus}`}
            onClick={handleStatusToggle}
          >
            <span className={`status-indicator ${driverStatus}`}></span>
            {driverStatus === "online" && "🟢 Online"}
            {driverStatus === "busy" && "🔴 Busy"}
            {driverStatus === "offline" && "⚫ Offline"}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          <span className="tab-icon">📋</span>
          Requests ({incomingRequests.length + (acceptedRide ? 1 : 0)})
        </button>
        <button
          className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          <span className="tab-icon">📜</span>
          History
        </button>
        <button
          className={`tab-btn ${activeTab === "stats" ? "active" : ""}`}
          onClick={() => setActiveTab("stats")}
        >
          <span className="tab-icon">📊</span>
          Stats
        </button>
      </div>

      {/* Tab Content */}
      <div className="dashboard-content">
        {/* Dashboard Tab - Current Requests */}
        {activeTab === "dashboard" && (
          <div className="dashboard-section">
            {/* Accepted Ride */}
            {acceptedRide && (
              <div className="accepted-ride-section">
                <h3>🟢 Active Ride</h3>
                <div className="active-ride-card">
                  <div className="ride-status-badge">In Progress</div>
                  <div className="ride-header">
                    <div className="passenger-info">
                      <div className="passenger-avatar">{acceptedRide.userName.charAt(0)}</div>
                      <div>
                        <div className="passenger-name">{acceptedRide.userName}</div>
                        <div className="passenger-rating">
                          ⭐ {acceptedRide.userRating} • {acceptedRide.userTotalRides} rides
                        </div>
                      </div>
                    </div>
                    <div className="ride-fare">
                      <div className="fare-amount">₹{acceptedRide.estimatedFare}</div>
                      <div className="fare-distance">{acceptedRide.tripDistance} km</div>
                    </div>
                  </div>

                  <div className="ride-details">
                    <div className="detail-row">
                      <span className="detail-icon">📍</span>
                      <span className="detail-text">{acceptedRide.pickupLocation}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-icon">🎯</span>
                      <span className="detail-text">{acceptedRide.dropoffLocation}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-icon">📞</span>
                      <span className="detail-text">{acceptedRide.userPhone}</span>
                    </div>
                  </div>

                  <div className="ride-actions">
                    <button className="action-btn arrived">✓ Arrived</button>
                    <button className="action-btn complete">✓ Complete Ride</button>
                  </div>
                </div>
              </div>
            )}

            {/* Incoming Requests */}
            {incomingRequests.length > 0 ? (
              <div className="incoming-requests-section">
                <h3>🔔 Incoming Requests ({incomingRequests.length})</h3>
                <div className="requests-list">
                  {incomingRequests.map((request) => (
                    <DriverRideRequest
                      key={request.id}
                      request={request}
                      onAccept={() => handleAcceptRequest(request)}
                      onReject={() => handleRejectRequest(request.id)}
                      onTimeout={() => handleRequestTimeout(request.id)}
                      timeoutDuration={15}
                    />
                  ))}
                </div>
              </div>
            ) : !acceptedRide ? (
              <div className="no-requests">
                <div className="empty-state">
                  <div className="empty-icon">😴</div>
                  <h3>No Incoming Requests</h3>
                  <p>You're all caught up! New requests will appear here.</p>
                  <button className="refresh-btn" onClick={() => window.location.reload()}>
                    🔄 Refresh
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && <DriverHistory driverId={driverId} />}

        {/* Stats Tab */}
        {activeTab === "stats" && (
          <div className="stats-section">
            <h3>📊 Your Statistics</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-card-icon">🚗</div>
                <div className="stat-card-label">Total Rides</div>
                <div className="stat-card-value">{completedRides}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-icon">⭐</div>
                <div className="stat-card-label">Average Rating</div>
                <div className="stat-card-value">{rating}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-icon">💰</div>
                <div className="stat-card-label">Total Earnings</div>
                <div className="stat-card-value">₹{earnings}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-icon">📏</div>
                <div className="stat-card-label">Distance Covered</div>
                <div className="stat-card-value">{(completedRides * 5.2).toFixed(0)} km</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;
