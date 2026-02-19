import React, { useEffect, useState } from "react";
import "./DriverListingPage.css";
import DestinationInput from "./DestinationInput";
import WaitingForDriverUI from "./WaitingForDriverUI";

const DriverListingPage = ({
  user,
  userLocation,
  setCurrentPage,
  setPickupLocation,
  setDropLocation,
  setAssignedCab
}) => {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [activeRequest, setActiveRequest] = useState(null);
  const [dropLocation, setDropLoc] = useState(null);
  const [tripDistance, setTripDistance] = useState(0);
  const [estimatedFare, setEstimatedFare] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(15);
  const [requestStatus, setRequestStatus] = useState("");
  const [cabType, setCabType] = useState("MINI");
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [messages, setMessages] = useState([]);
  const [showWaitingUI, setShowWaitingUI] = useState(false);

  // Fetch nearby drivers
  useEffect(() => {
    if (userLocation) {
      setLoadingDrivers(true);
      fetch(
        `http://localhost:8076/api/cabs/nearby?latitude=${userLocation.lat}&longitude=${userLocation.lng}&radiusKm=5`
      )
        .then(res => res.json())
        .then(data => {
          // Sort by distance (if available) and filter available cabs
          const sorted = (data || [])
            .filter(cab => cab.status === "AVAILABLE")
            .sort((a, b) => {
              const distA = calculateDistance(
                userLocation.lat,
                userLocation.lng,
                a.currentLocation.latitude,
                a.currentLocation.longitude
              );
              const distB = calculateDistance(
                userLocation.lat,
                userLocation.lng,
                b.currentLocation.latitude,
                b.currentLocation.longitude
              );
              return distA - distB;
            });
          setDrivers(sorted);
        })
        .catch(err => {
          console.error("Error fetching drivers:", err);
          setDrivers([]);
        })
        .finally(() => setLoadingDrivers(false));
    }
  }, [userLocation]);

  // 15-second countdown timer for request
  useEffect(() => {
    if (activeRequest && timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    } else if (activeRequest && timeRemaining === 0) {
      // Request expired
      setRequestStatus("Driver did not respond. Try another driver.");
      setActiveRequest(null);
      setShowWaitingUI(false);
      setTimeRemaining(15);
    }
  }, [activeRequest, timeRemaining]);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // distance in km
  };

  // Calculate fare based on distance
  const calculateFare = (distance) => {
    const baseFare = 50; // Base fare in ₹
    const perKmRate = 10; // ₹ per km
    return baseFare + (distance * perKmRate);
  };

  // Handle destination set with coordinates and distance calculation
  const handleDestinationSet = (destination) => {
    setDropLoc(destination);
    
    // Calculate distance between pickup and drop location
    const dist = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      destination.lat,
      destination.lng
    );
    
    setTripDistance(dist);
    const fare = calculateFare(dist);
    setEstimatedFare(fare);
    
    console.log("🎯 Destination set:", {
      pickup: { lat: userLocation.lat, lng: userLocation.lng },
      dropoff: { lat: destination.lat, lng: destination.lng },
      distance: dist,
      fare: fare
    });
  };

  // Send ride request with proper flow
  const handleSendRequest = async (driver) => {
    if (!dropLocation) {
      alert("Please enter drop location first");
      return;
    }

    setSelectedDriver(driver);
    setActiveRequest({
      driverId: driver.id,
      driverName: driver.driverName,
      driverPhone: driver.driverPhone,
      cabType: driver.cabType,
      cabNumber: driver.cabNumber,
      rating: driver.rating,
      totalRides: driver.totalRides
    });
    
    // Calculate driver's distance to user
    const driverToUserDist = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      driver.currentLocation.latitude,
      driver.currentLocation.longitude
    );
    
    setTimeRemaining(15);
    setShowWaitingUI(true);
    setRequestStatus(`Waiting for driver response... (${15}s)`);

    // Prepare complete ride request with all user details
    const rideRequest = {
      bookingId: Date.now(), // Temporary ID until backend creates booking
      driverId: driver.id,
      
      // User Details
      userId: user?.id,
      userName: user?.name || "User",
      userPhone: user?.phone || "N/A",
      userRating: user?.rating || 4.5,
      userTotalRides: user?.totalRides || 0,
      
      // Location Details
      pickupLocation: `${userLocation.lat?.toFixed(4)}, ${userLocation.lng?.toFixed(4)}`,
      dropoffLocation: dropLocation.description,
      userLocation: {
        lat: userLocation.lat,
        lng: userLocation.lng
      },
      dropoffCoords: {
        lat: dropLocation.lat,
        lng: dropLocation.lng
      },
      
      // Trip Details
      tripDistance: tripDistance,
      estimatedFare: estimatedFare,
      cabType: cabType,
      driverToUserDistance: driverToUserDist,
      
      // Cab Details
      yourCabNumber: driver.cabNumber,
      driverCabType: driver.cabType,
      
      // Timestamps
      requestTime: new Date().toISOString(),
      timeout: 15
    };
    
    // Send to driver via WebSocket if available
    try {
      const stompClient = window.stompClient;
      if (stompClient && stompClient.connected) {
        stompClient.send(
          `/app/ride-request/${driver.id}`,
          {},
          JSON.stringify(rideRequest)
        );
        console.log("📤 Ride request sent to driver via WebSocket:", rideRequest);
      } else {
        console.log("📤 WebSocket not connected. Request details prepared:", rideRequest);
      }
    } catch (err) {
      console.error("Error sending ride request:", err);
    }
  };

  // Driver accepts request - NOW COMES FROM DRIVER SIDE
  const handleDriverAccept = async (driver) => {
    setShowWaitingUI(false);
    setRequestStatus("🎉 Driver accepted! Processing booking...");
    setActiveRequest(null);
    
    // Call backend to create booking and assign driver
    try {
      console.log("✅ Driver confirmed acceptance!");
      
      // First create booking
      const bookingRes = await fetch("http://localhost:8077/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          cabId: driver.id,
          pickupLocation: `${userLocation.lat},${userLocation.lng}`,
          dropLocation: `${dropLocation.lat},${dropLocation.lng}`
        })
      });
      
      if (!bookingRes.ok) throw new Error("Failed to create booking");
      const booking = await bookingRes.json();
      
      console.log("📋 Booking created:", booking.id);
      
      // Then accept by driver
      const acceptRes = await fetch(
        `http://localhost:8077/api/bookings/${booking.id}/accept-by-driver/${driver.id}`,
        { method: "POST" }
      );
      
      if (!acceptRes.ok) throw new Error("Failed to accept booking");
      
      console.log("✅ Booking confirmed with driver");
      
      // Update assigned cab with all details
      const driverToUserDist = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        driver.currentLocation.latitude,
        driver.currentLocation.longitude
      );
      
      setAssignedCab({
        cabId: driver.id,
        bookingId: booking.id,
        driverName: driver.driverName,
        driverPhone: driver.driverPhone,
        cabType: driver.cabType,
        cabNumber: driver.cabNumber,
        rating: driver.rating,
        totalRides: driver.totalRides,
        currentLocation: driver.currentLocation,
        distance: driverToUserDist,
        tripDistance: tripDistance,
        estimatedFare: estimatedFare
      });
      
      setPickupLocation(userLocation);
      setDropLocation(dropLocation);
      
      // Navigate to ride tracking
      setTimeout(() => {
        setCurrentPage("user-ride");
      }, 1000);
      
    } catch (err) {
      console.error("❌ Error in driver acceptance:", err);
      setRequestStatus("Error: Could not complete booking. Try again.");
      setTimeRemaining(15);
      setActiveRequest(null);
      setShowWaitingUI(false);
    }
  };

  // Driver sends message (asks for second chance)
  const handleDriverMessage = (driver, message) => {
    setMessages(prev => [...prev, {
      from: "driver",
      name: driver.driverName,
      driverId: driver.id,
      message,
      timestamp: new Date()
    }]);
  };

  // User gives driver another chance
  const handleGiveChance = (driver) => {
    setMessages(prev => [...prev, {
      from: "user",
      message: `Sure! Sending you another request...`,
      timestamp: new Date()
    }]);
    handleSendRequest(driver);
  };

  return (
    <div className="driver-listing-page">
      {/* Show waiting UI overlay when request is active */}
      {showWaitingUI && activeRequest && (
        <WaitingForDriverUI
          driver={activeRequest}
          distance={calculateDistance(
            userLocation.lat,
            userLocation.lng,
            activeRequest.currentLocation?.latitude || userLocation.lat,
            activeRequest.currentLocation?.longitude || userLocation.lng
          )}
          fare={estimatedFare}
          pickupLocation={userLocation}
          dropLocation={dropLocation}
          timeRemaining={timeRemaining}
          onCancel={() => {
            setActiveRequest(null);
            setShowWaitingUI(false);
            setRequestStatus("");
            setTimeRemaining(15);
          }}
          onTimeout={() => {
            setActiveRequest(null);
            setShowWaitingUI(false);
            setRequestStatus("Request timed out. No driver accepted.");
            setTimeRemaining(15);
          }}
        />
      )}

      {/* Main content when not showing waiting UI */}
      {!showWaitingUI && (
        <>
          <h2>🚗 Book Your Ride</h2>

          {/* Enhanced destination input with coordinate fetching */}
          <DestinationInput
            onDestinationSet={handleDestinationSet}
            userLocation={userLocation}
            pickupLocation={userLocation}
            onDistanceCalculated={setTripDistance}
          />

          {/* Show trip details */}
          {dropLocation && (
            <div className="trip-details-section">
              <div className="detail-card">
                <div className="detail-row">
                  <span className="detail-icon">📏</span>
                  <span className="detail-label">Distance</span>
                  <span className="detail-value">{tripDistance.toFixed(2)} km</span>
                </div>
                <div className="detail-row">
                  <span className="detail-icon">💰</span>
                  <span className="detail-label">Estimated Fare</span>
                  <span className="detail-value fare">₹{estimatedFare.toFixed(0)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Cab type selection */}
          {dropLocation && (
            <div className="cab-type-section">
              <label>Choose cab type:</label>
              <div className="cab-type-options">
                {["MINI", "SEDAN", "SUV"].map((type) => (
                  <button
                    key={type}
                    className={`cab-type-btn ${cabType === type ? "active" : ""}`}
                    onClick={() => setCabType(type)}
                  >
                    <span className="cab-icon">
                      {type === "MINI" ? "🚗" : type === "SEDAN" ? "🚙" : "🚐"}
                    </span>
                    <span>{type}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Request status message */}
          {requestStatus && !activeRequest && (
            <div className={`request-status-message ${requestStatus.includes("Error") ? "error" : ""}`}>
              <p>{requestStatus}</p>
            </div>
          )}

          {/* Drivers list */}
          <h3 className="drivers-heading">Available Drivers Near You</h3>
          {loadingDrivers ? (
            <p className="loading">🔍 Loading nearby drivers...</p>
          ) : drivers.length === 0 ? (
            <p className="no-drivers">No drivers available in your area. Try again in a moment.</p>
          ) : (
            <div className="drivers-list">
              {drivers.map((driver) => {
                const distance = calculateDistance(
                  userLocation.lat,
                  userLocation.lng,
                  driver.currentLocation.latitude,
                  driver.currentLocation.longitude
                ).toFixed(2);

                return (
                  <div key={driver.id} className="driver-card">
                    <div className="driver-info">
                      <h3>{driver.driverName}</h3>
                      <p className="driver-phone">📞 {driver.driverPhone}</p>
                      <p className="cab-details">
                        {driver.cabType} • {driver.cabNumber}
                      </p>
                      <p className="distance">📍 {distance} km away</p>
                      <div className="rating">
                        ⭐ {driver.rating || "N/A"} ({driver.totalRides || 0} rides)
                      </div>
                    </div>

                    <div className="driver-actions">
                      {!activeRequest ? (
                        <button
                          className="request-btn"
                          onClick={() => handleSendRequest(driver)}
                          disabled={!dropLocation}
                        >
                          📤 Send Request
                        </button>
                      ) : (
                        <div className="waiting">
                          <p>Waiting for driver...</p>
                          <button
                            className="simulate-accept-btn"
                            onClick={() => handleDriverAccept(driver)}
                            title="(Simulating driver acceptance from their app)"
                          >
                            ✓ Simulate Driver Accept
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Messages section */}
          {messages.length > 0 && (
            <div className="messages-section">
              <h4>💬 Messages</h4>
              <div className="messages-list">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`message ${msg.from}`}>
                    <strong>{msg.from === "driver" ? msg.name : "You"}:</strong>
                    <p>{msg.message}</p>
                    <small>{msg.timestamp.toLocaleTimeString()}</small>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button className="back-btn" onClick={() => setCurrentPage("cab-booking")}>
            ← Back
          </button>
        </>
      )}
    </div>
  );
};

export default DriverListingPage;
