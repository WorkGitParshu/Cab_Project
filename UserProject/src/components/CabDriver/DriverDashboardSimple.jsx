import React, { useState, useEffect } from 'react';
import './DriverDashboardSimple.css';

import { useRideWebSocket } from '../../hooks/useRideWebSocket';

const DriverDashboardSimple = ({ cab, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [acceptedRide, setAcceptedRide] = useState(null);
  const [driverStatus, setDriverStatus] = useState('online'); // online, offline, busy
  const [rideHistory, setRideHistory] = useState([]);
  const [earnings, setEarnings] = useState(2450);
  const [completedRides, setCompletedRides] = useState(256);
  const [rating, setRating] = useState(4.8);

  console.log("🎨 DriverDashboard Render. Requests:", incomingRequests.length, "Accepted:", acceptedRide ? "Yes" : "No");

  // WebSocket Hook
  const { rideRequest, sendDriverConfirmation, sendMessageToUser, clearRideRequest } = useRideWebSocket(null, cab?.id);

  // Mock rides for history
  const mockRideHistory = [
    {
      id: 'RIDE001',
      passengerName: 'Rajesh Kumar',
      pickupLocation: 'MG Road, Bangalore',
      dropLocation: 'Koramangala, Bangalore',
      fare: 245,
      distance: 8.5,
      time: '45 mins',
      rating: 5,
      date: '2025-02-10 10:30 AM'
    },
    // ... keep other history if needed
  ];

  // Initialize history
  useEffect(() => {
    // Load from localStorage if available
    const savedHistory = localStorage.getItem('driverRideHistory');
    const savedEarnings = localStorage.getItem('driverEarnings');
    const savedCompletedRides = localStorage.getItem('driverCompletedRides');
    const savedRating = localStorage.getItem('driverRating');

    if (savedHistory) {
      setRideHistory(JSON.parse(savedHistory));
    } else {
      setRideHistory(mockRideHistory);
    }

    if (savedEarnings) setEarnings(parseInt(savedEarnings));
    if (savedCompletedRides) setCompletedRides(parseInt(savedCompletedRides));
    if (savedRating) setRating(parseFloat(savedRating));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 📍 Geolocation Tracking: Send updates to backend every 10s
  useEffect(() => {
    if (!cab?.id || driverStatus !== 'online') return;

    const updateLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            console.log("📍 Sending Location Update:", latitude, longitude);

            // Send to backend
            fetch(`http://localhost:8076/api/cabs/${cab.id}/location`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ latitude, longitude })
            }).catch(err => console.error("Failed to update location:", err));
          },
          (error) => console.error("Geolocation error:", error),
          { enableHighAccuracy: true }
        );
      }
    };

    // Initial update
    updateLocation();

    // Periodic updates
    const locationInterval = setInterval(updateLocation, 10000);
    return () => clearInterval(locationInterval);
  }, [cab, driverStatus]);

  // Handle pending requests - only fetch once when coming online
  useEffect(() => {
    if (!cab?.id || driverStatus !== 'online' || acceptedRide) {
      return;
    }

    // Only fetch pending requests once per online session
    let isMounted = true;
    
    fetch(`http://localhost:8077/api/bookings/dispatch/pending/driver/${cab.id}`)
      .then(res => {
        if (res.ok && res.status !== 204) return res.json();
        return null;
      })
      .then(data => {
        if (!isMounted) return;
        
        if (data) {
          console.log("📥 Found pending request on load:", data);
          const newRequest = {
            id: data.bookingId,
            passengerName: 'User ' + data.userId,
            passengerRating: '4.8',
            pickupLocation: data.pickupAddress || `Lat: ${data.pickupLat}`,
            dropLocation: data.dropAddress || `Lat: ${data.dropLat}`,
            fare: data.fare || 0,
            distance: data.distance || 0,
            receivedTime: new Date(),
            timeLeft: 120
          };
          setIncomingRequests(prev => {
            if (prev.find(r => r.id === newRequest.id)) return prev;
            return [...prev, newRequest];
          });
        }
      })
      .catch(err => console.error("Error checking pending requests:", err));

    return () => {
      isMounted = false;
    };
  }, [cab?.id, driverStatus, acceptedRide]);

  // Handle new ride requests from WebSocket
  useEffect(() => {
    if (!rideRequest || driverStatus !== 'online' || acceptedRide) {
      return;
    }

    console.log("New Ride Request in Dashboard:", rideRequest);

    const newRequest = {
      id: rideRequest.bookingId,
      passengerName: 'User ' + rideRequest.userId,
      passengerRating: '4.8',
      pickupLocation: rideRequest.pickupAddress || `Lat: ${rideRequest.pickupLat}`,
      dropLocation: rideRequest.dropAddress || `Lat: ${rideRequest.dropLat}`,
      fare: rideRequest.fare || 0,
      distance: rideRequest.distance || 0,
      receivedTime: new Date(),
      timeLeft: 120
    };

    setIncomingRequests([newRequest]);

    // Auto-reject (clear UI) after 120 seconds
    const rejectTimer = setTimeout(() => {
      setIncomingRequests(prev => prev.filter(r => r.id !== newRequest.id));
    }, 120000);

    return () => clearTimeout(rejectTimer);
  }, [rideRequest, driverStatus, acceptedRide]);

  // Countdown timer for incoming requests
  useEffect(() => {
    if (incomingRequests.length > 0) {
      const countdownTimer = setInterval(() => {
        setIncomingRequests(prev =>
          prev.map(req => ({
            ...req,
            timeLeft: Math.max(0, req.timeLeft - 1)
          })).filter(req => req.timeLeft > 0)
        );
      }, 1000);

      return () => clearInterval(countdownTimer);
    }
  }, [incomingRequests]);

  const handleAcceptRide = (request) => {
    // Send WebSocket Confirmation
    sendDriverConfirmation(request.id, cab.id, "ACCEPTED");

    setAcceptedRide(request);
    setIncomingRequests([]);
    setDriverStatus('busy');

    // Clear the WebSocket request state so it doesn't re-trigger
    if (clearRideRequest) clearRideRequest();

    // Save driver acceptance so user can see it (if using polling/localstorage sync)
    // But now we use WebSocket for real time!

    console.log('✅ Ride Accepted via WebSocket!');
  };

  const handleRejectRide = (requestId) => {
    // Send WebSocket Rejection
    sendDriverConfirmation(requestId, cab.id, "REJECTED");

    setIncomingRequests(prev => prev.filter(req => req.id !== requestId));
  };

  const handleCompleteRide = async () => {
    if (acceptedRide) {
      try {
        // 1. Update status in backend
        const response = await fetch(`http://localhost:8077/api/bookings/${acceptedRide.id}/status?status=COMPLETED`, {
          method: 'PUT'
        });

        if (!response.ok) {
          throw new Error('Failed to update ride status in backend');
        }

        // 2. Notify user via WebSocket message (optional but good for real-time)
        const recipientId = acceptedRide.userId
          ? String(acceptedRide.userId).replace('User ', '')
          : null;

        if (recipientId && sendMessageToUser) {
          sendMessageToUser(recipientId, "Your ride has been completed. Please proceed to payment.");
        }

        const ride = {
          ...acceptedRide,
          date: new Date().toLocaleString(),
          rating: 5
        };
        const updatedHistory = [ride, ...rideHistory];
        const updatedEarnings = earnings + acceptedRide.fare;
        const updatedRides = completedRides + 1;

        // Save to localStorage
        setRideHistory(updatedHistory);
        setEarnings(updatedEarnings);
        setCompletedRides(updatedRides);

        localStorage.setItem('driverRideHistory', JSON.stringify(updatedHistory));
        localStorage.setItem('driverEarnings', String(updatedEarnings));
        localStorage.setItem('driverCompletedRides', String(updatedRides));
        localStorage.setItem('driverRating', String(rating));

        localStorage.removeItem('activeRide');
        localStorage.removeItem('acceptedRide');
        localStorage.removeItem('currentRideId');
        localStorage.removeItem('currentUserRide');

        // Clear WebSocket request state
        if (clearRideRequest) clearRideRequest();

        setAcceptedRide(null);
        setDriverStatus('online');
      } catch (err) {
        console.error("Error completing ride:", err);
        alert("Failed to complete ride: " + err.message);
      }
    }
  };

  const toggleStatus = () => {
    if (driverStatus === 'online') {
      setDriverStatus('offline');
    } else if (driverStatus === 'offline') {
      setDriverStatus('busy');
    } else {
      setDriverStatus('online');
    }
  };

  const getStatusColor = () => {
    switch (driverStatus) {
      case 'online': return '#4CAF50';
      case 'offline': return '#999';
      case 'busy': return '#FF9800';
      default: return '#999';
    }
  };

  return (
    <div className="driver-dashboard-simple">
      {/* Header */}
      <div className="dashboard-header">
        <div className="driver-profile">
          <div className="driver-avatar">👨‍💼</div>
          <div className="driver-info">
            <h2>Driver Dashboard</h2>
            <p>Welcome back!</p>
          </div>
        </div>

        <div className="header-actions">
          <button
            className="status-button"
            onClick={toggleStatus}
            style={{ backgroundColor: getStatusColor() }}
          >
            {driverStatus === 'online' && '🟢 Online'}
            {driverStatus === 'offline' && '⚪ Offline'}
            {driverStatus === 'busy' && '🔴 Busy'}
          </button>
          {onLogout && (
            <button
              className="logout-button"
              onClick={onLogout}
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <div className="stat-label">Rating</div>
            <div className="stat-value">{rating}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🚗</div>
          <div className="stat-content">
            <div className="stat-label">Rides</div>
            <div className="stat-value">{completedRides}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-label">Earnings</div>
            <div className="stat-value">₹{earnings}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📋 Dashboard
        </button>
        <button
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📜 History
        </button>
      </div>

      {/* Dashboard Tab - Incoming Requests */}
      {activeTab === 'dashboard' && (
        <div className="tab-content">
          {!acceptedRide ? (
            <>
              {incomingRequests.length > 0 ? (
                <div className="incoming-requests">
                  {incomingRequests.map(request => (
                    <div key={request.id} className="request-card">
                      <div className="request-header">
                        <h3>{request.passengerName}</h3>
                        <div className="request-timer">
                          <span className={`timer ${request.timeLeft <= 5 ? 'critical' : ''}`}>
                            ⏱ {request.timeLeft}s
                          </span>
                        </div>
                      </div>

                      <div className="request-details">
                        <div className="detail-row">
                          <span className="label">📍 Pickup:</span>
                          <span className="value">{request.pickupLocation}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">🎯 Dropoff:</span>
                          <span className="value">{request.dropLocation}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">📏 Distance:</span>
                          <span className="value">{request.distance} km</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">💵 Fare:</span>
                          <span className="value highlight">₹{request.fare}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">⭐ Rating:</span>
                          <span className="value">{request.passengerRating}</span>
                        </div>
                      </div>

                      <div className="request-actions">
                        <button
                          className="btn-accept"
                          onClick={() => handleAcceptRide(request)}
                        >
                          ✅ Accept
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleRejectRide(request.id)}
                        >
                          ❌ Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">🚕</div>
                  <h3>No incoming rides</h3>
                  <p>You'll receive ride requests when they're available</p>
                </div>
              )}
            </>
          ) : (
            <div className="active-ride">
              <div className="ride-header">🚗 Active Ride</div>
              <div className="ride-details">
                <div className="detail-row">
                  <span className="label">👤 Passenger:</span>
                  <span className="value">{acceptedRide.passengerName}</span>
                </div>
                <div className="detail-row">
                  <span className="label">📍 Pickup:</span>
                  <span className="value">{acceptedRide.pickupLocation}</span>
                </div>
                <div className="detail-row">
                  <span className="label">🎯 Dropoff:</span>
                  <span className="value">{acceptedRide.dropLocation}</span>
                </div>
                <div className="detail-row">
                  <span className="label">📏 Distance:</span>
                  <span className="value">{acceptedRide.distance} km</span>
                </div>
                <div className="detail-row">
                  <span className="label">💵 Fare:</span>
                  <span className="value highlight">₹{acceptedRide.fare}</span>
                </div>
              </div>

              <button className="btn-complete" onClick={handleCompleteRide}>
                ✅ Complete Ride
              </button>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="tab-content">
          <div className="history-list">
            {rideHistory.length > 0 ? (
              rideHistory.map((ride, idx) => (
                <div key={idx} className="history-item">
                  <div className="history-header">
                    <h4>{ride.passengerName}</h4>
                    <span className="history-rating">⭐ {ride.rating}</span>
                  </div>
                  <div className="history-details">
                    <div className="detail-row">
                      <span className="label">📍</span>
                      <span className="value">{ride.pickupLocation} → {ride.dropLocation}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">📏</span>
                      <span className="value">{ride.distance} km</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">💵</span>
                      <span className="value">₹{ride.fare}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">📅</span>
                      <span className="value">{ride.date}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📜</div>
                <h3>No ride history</h3>
                <p>Your completed rides will appear here</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDashboardSimple;
