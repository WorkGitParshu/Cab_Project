import React, { useEffect, useState } from "react";
import "./DriverHistory.css";

/**
 * Component to display driver's ride history and ratings
 * Shows previous rides, user ratings, earnings, and performance metrics
 */
const DriverHistory = ({ driverId }) => {
  const [rideHistory, setRideHistory] = useState([]);
  const [driverStats, setDriverStats] = useState({
    totalRides: 0,
    averageRating: 0,
    totalEarnings: 0,
    totalDistance: 0,
    acceptanceRate: 0,
    cancellationRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("history"); // history, stats, reviews

  useEffect(() => {
    if (!driverId) return;
    fetchDriverHistory();
  }, [driverId]);

  const fetchDriverHistory = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch ride history
      const historyResponse = await fetch(
        `http://localhost:8076/api/drivers/${driverId}/rides`
      );
      if (historyResponse.ok) {
        const history = await historyResponse.json();
        setRideHistory(history || []);
      }

      // Fetch driver statistics
      const statsResponse = await fetch(
        `http://localhost:8076/api/drivers/${driverId}/stats`
      );
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        setDriverStats({
          totalRides: stats.totalRides || 0,
          averageRating: stats.averageRating || 0,
          totalEarnings: stats.totalEarnings || 0,
          totalDistance: stats.totalDistance || 0,
          acceptanceRate: stats.acceptanceRate || 0,
          cancellationRate: stats.cancellationRate || 0,
        });
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching driver history:", err);
      setError("Could not load history. Please try again.");
      
      // Use mock data for demo
      setRideHistory(generateMockRideHistory());
      setDriverStats(generateMockStats());
      setLoading(false);
    }
  };

  // Generate mock data for demo
  const generateMockRideHistory = () => [
    {
      id: 1,
      userName: "Rajesh Kumar",
      userRating: 5,
      distance: 8.5,
      fare: 135,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      pickupLocation: "Delhi Airport",
      dropoffLocation: "Connaught Place",
      duration: 45,
      feedback: "Excellent driver, very courteous!"
    },
    {
      id: 2,
      userName: "Priya Singh",
      userRating: 4,
      distance: 5.2,
      fare: 102,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      pickupLocation: "Mall of India",
      dropoffLocation: "South Extension",
      duration: 32,
      feedback: "Good ride, vehicle was clean"
    },
    {
      id: 3,
      userName: "Amit Patel",
      userRating: 5,
      distance: 12.3,
      fare: 173,
      date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      pickupLocation: "Central Delhi",
      dropoffLocation: "Indira Gandhi International",
      duration: 58,
      feedback: "Professional, on time, comfortable ride"
    },
    {
      id: 4,
      userName: "Neha Sharma",
      userRating: 3,
      distance: 3.8,
      fare: 88,
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      pickupLocation: "Metro Station",
      dropoffLocation: "Corporate Office",
      duration: 22,
      feedback: "Good but a bit of traffic confusion"
    },
    {
      id: 5,
      userName: "Vikram Reddy",
      userRating: 5,
      distance: 15.7,
      fare: 207,
      date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      pickupLocation: "Sector 14",
      dropoffLocation: "Gurgaon Central",
      duration: 72,
      feedback: "Outstanding service, would book again"
    },
  ];

  const generateMockStats = () => ({
    totalRides: 247,
    averageRating: 4.6,
    totalEarnings: 58920,
    totalDistance: 3245.8,
    acceptanceRate: 94.5,
    cancellationRate: 2.1,
  });

  const formatDate = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  const renderStarRating = (rating) => {
    return (
      <div className="star-rating">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={`star ${i < Math.floor(rating) ? "filled" : ""}`}
          >
            ★
          </span>
        ))}
        <span className="rating-value">({rating.toFixed(1)})</span>
      </div>
    );
  };

  if (loading) {
    return <div className="driver-history-container loading">⏳ Loading history...</div>;
  }

  return (
    <div className="driver-history-container">
      {/* Header with Stats Overview */}
      <div className="history-header">
        <h2>📊 Driver Performance</h2>
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-label">Total Rides</div>
            <div className="stat-value">{driverStats.totalRides}</div>
          </div>
          <div className="stat-card highlight">
            <div className="stat-label">Avg Rating</div>
            <div className="stat-value">{driverStats.averageRating.toFixed(1)} ⭐</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Earnings</div>
            <div className="stat-value">₹{driverStats.totalEarnings.toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Acceptance Rate</div>
            <div className="stat-value">{driverStats.acceptanceRate}%</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="history-tabs">
        <button
          className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          🚗 Ride History
        </button>
        <button
          className={`tab-btn ${activeTab === "stats" ? "active" : ""}`}
          onClick={() => setActiveTab("stats")}
        >
          📈 Statistics
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "history" && (
        <div className="ride-history-section">
          <h3>Recent Rides</h3>
          {error && <div className="error-message">{error}</div>}
          
          {rideHistory.length === 0 ? (
            <div className="no-rides">No ride history yet</div>
          ) : (
            <div className="rides-list">
              {rideHistory.map((ride) => (
                <div key={ride.id} className="ride-card">
                  <div className="ride-header">
                    <div className="user-info">
                      <div className="user-name">{ride.userName}</div>
                      <div className="ride-date">
                        📅 {formatDate(ride.date)}
                      </div>
                    </div>
                    <div className="ride-rating">
                      {renderStarRating(ride.userRating)}
                    </div>
                  </div>

                  <div className="ride-details">
                    <div className="location-info">
                      <div className="location-item">
                        <span className="location-icon">📍</span>
                        <div>
                          <div className="location-label">From</div>
                          <div className="location-text">{ride.pickupLocation}</div>
                        </div>
                      </div>
                      <div className="location-arrow">→</div>
                      <div className="location-item">
                        <span className="location-icon">🎯</span>
                        <div>
                          <div className="location-label">To</div>
                          <div className="location-text">{ride.dropoffLocation}</div>
                        </div>
                      </div>
                    </div>

                    <div className="trip-metrics">
                      <div className="metric">
                        <span className="metric-icon">📏</span>
                        <span className="metric-label">Distance:</span>
                        <span className="metric-value">{ride.distance} km</span>
                      </div>
                      <div className="metric">
                        <span className="metric-icon">⏱️</span>
                        <span className="metric-label">Duration:</span>
                        <span className="metric-value">{ride.duration} min</span>
                      </div>
                      <div className="metric">
                        <span className="metric-icon">💰</span>
                        <span className="metric-label">Fare:</span>
                        <span className="metric-value">₹{ride.fare}</span>
                      </div>
                    </div>

                    {ride.feedback && (
                      <div className="user-feedback">
                        <div className="feedback-label">💬 User Feedback</div>
                        <div className="feedback-text">"{ride.feedback}"</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "stats" && (
        <div className="statistics-section">
          <h3>Performance Statistics</h3>
          
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-icon">🚗</div>
              <div className="stat-content">
                <div className="stat-name">Total Rides</div>
                <div className="stat-number">{driverStats.totalRides}</div>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon">⭐</div>
              <div className="stat-content">
                <div className="stat-name">Average Rating</div>
                <div className="stat-number">{driverStats.averageRating.toFixed(1)}</div>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <div className="stat-name">Total Earnings</div>
                <div className="stat-number">₹{driverStats.totalEarnings.toLocaleString()}</div>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon">📏</div>
              <div className="stat-content">
                <div className="stat-name">Total Distance</div>
                <div className="stat-number">{driverStats.totalDistance.toFixed(1)} km</div>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <div className="stat-name">Acceptance Rate</div>
                <div className="stat-number">{driverStats.acceptanceRate}%</div>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon">❌</div>
              <div className="stat-content">
                <div className="stat-name">Cancellation Rate</div>
                <div className="stat-number">{driverStats.cancellationRate}%</div>
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="insights-section">
            <h4>🎯 Performance Insights</h4>
            <div className="insights-list">
              {driverStats.averageRating >= 4.5 && (
                <div className="insight positive">
                  ✨ Excellent rating! You're in the top 10% of drivers.
                </div>
              )}
              {driverStats.acceptanceRate >= 95 && (
                <div className="insight positive">
                  ✅ Outstanding acceptance rate! Users trust you.
                </div>
              )}
              {driverStats.cancellationRate <= 2 && (
                <div className="insight positive">
                  💯 Very low cancellation rate. Keep up the great work!
                </div>
              )}
              {driverStats.totalRides >= 100 && (
                <div className="insight positive">
                  🏆 You've completed {driverStats.totalRides} rides. You're experienced!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverHistory;
