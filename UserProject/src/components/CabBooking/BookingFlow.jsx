import React, { useState, useEffect } from "react";
import { useRideWebSocket } from "../../hooks/useRideWebSocket";
import "./BookingFlow.css";
import MultiStepDestinationInput from "./MultiStepDestinationInput";
import CabTypeSelection from "./CabTypeSelection";
import api from "../../services/api";

const BookingFlow = ({
  user,
  userLocation = { lat: 40.7128, lng: -74.006 },
  userName = "User",
  setCurrentPage,
  setSelectedBooking,
  onLocationUpdate,
  onBookingSuccess
}) => {
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedLocations, setSelectedLocations] = useState(null);
  const [selectedCabType, setSelectedCabType] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [estimatedFare, setEstimatedFare] = useState(0);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmCountdown, setConfirmCountdown] = useState(0);

  // WebSocket integration
  const { rideConfirmation } = useRideWebSocket(user?.id);

  useEffect(() => {
    if (rideConfirmation) {
      const driverDetails = {
        id: rideConfirmation.cabId,
        name: rideConfirmation.driverName || "Unknown Driver",
        rating: 4.8,
        totalRides: 0,
        cabType: rideConfirmation.cabType,
        cabNumber: rideConfirmation.cabNumber,
        model: rideConfirmation.model,
        currentLocation: { lat: rideConfirmation.pickupLat || 0, lng: rideConfirmation.pickupLng || 0 },
        distanceFromUser: 0.5,
        responseTime: "2 min"
      };
      setSelectedDriver(driverDetails);
      setBookingStep(6);
    }
  }, [rideConfirmation]);

  // Handle destination completion
  const handleDestinationComplete = (destinations) => {
    setSelectedLocations(destinations);
    if (onLocationUpdate) {
      onLocationUpdate(destinations.pickup, destinations.destination);
    }
    setBookingStep(2);
  };

  const handleCabSelect = (cabType) => {
    setSelectedCabType(cabType);
    setBookingStep(3);
  };

  // Real fetch drivers
  const fetchDrivers = async () => {
    try {
      if (!selectedLocations) return;
      const { lat, lng } = selectedLocations.pickup;

      const response = await api.get(`http://localhost:8076/api/cabs/nearby?latitude=${lat}&longitude=${lng}&radiusKm=100`);
      // if (!response.ok) throw new Error("Failed to fetch drivers"); // axios throws on error status

      const nearbyCabs = response.data;
      console.log("📍 Nearby Cabs from Backend:", nearbyCabs);

      const typeMapping = {
        'economy': 'MINI',
        'comfort': 'SEDAN',
        'premium': 'LUXURY',
        'suv': 'SUV'
      };

      const backendType = typeMapping[selectedCabType.id] || selectedCabType.id.toUpperCase();

      const mappedDrivers = nearbyCabs
        .filter(cab => cab.cabType === backendType && cab.status === 'AVAILABLE')
        .map(cab => {
          // Calculate distance manually
          const dist = Math.sqrt(Math.pow(cab.currentLocation.latitude - lat, 2) + Math.pow(cab.currentLocation.longitude - lng, 2)) * 111;
          return {
            id: cab.id,
            name: cab.driverName || "Unknown Driver",
            rating: (3.5 + Math.random() * 1.5).toFixed(1),
            totalRides: Math.floor(Math.random() * 500) + 50,
            cabType: selectedCabType.id,
            backendCabType: cab.cabType,
            cabNumber: cab.cabNumber,
            model: cab.model,
            currentLocation: {
              lat: cab.currentLocation.latitude,
              lng: cab.currentLocation.longitude
            },
            distanceFromUser: dist,
            responseTime: Math.ceil(dist * 3) + " min"
          };
        }).sort((a, b) => a.distanceFromUser - b.distanceFromUser);

      setAvailableDrivers(mappedDrivers);

    } catch (error) {
      console.error("Error fetching drivers:", error);
      setAvailableDrivers([]);
    }
  };

  useEffect(() => {
    if (selectedLocations && selectedCabType) {
      fetchDrivers();
      setEstimatedFare(Math.round(50 + (selectedLocations.destination.distance || 5) * 15));
    }
  }, [selectedCabType, selectedLocations]);

  const handleConfirmBooking = async () => {
    // Prevent multiple requests
    if (isConfirming || confirmCountdown > 0) {
      return;
    }

    try {
      if (!selectedLocations || !selectedCabType || !selectedDriver) return;

      // Set confirming state and start 30-second lockout
      setIsConfirming(true);
      setConfirmCountdown(30);

      const bookingRequest = {
        userId: user?.id || 1,
        userName: userName,
        pickupLocation: selectedLocations.pickup.description,
        dropLocation: selectedLocations.destination.description,
        pickupLat: selectedLocations.pickup.lat,
        pickupLng: selectedLocations.pickup.lng,
        dropLat: selectedLocations.destination.lat,
        dropLng: selectedLocations.destination.lng,
        cabId: selectedDriver.id,
        estimatedFare: estimatedFare,
        requestTime: new Date().toISOString(),
      };

      console.log("Booking Request:", bookingRequest);

      // Using api.post for authenticated request
      const response = await api.post("http://localhost:8077/api/bookings", {
        userId: user?.id,
        cabId: bookingRequest.cabId,
        pickupLocation: `${bookingRequest.pickupLat},${bookingRequest.pickupLng}`,
        dropLocation: `${bookingRequest.dropLat},${bookingRequest.dropLng}`,
        pickupAddress: bookingRequest.pickupLocation,
        dropAddress: bookingRequest.dropLocation
      });

      // if (!response.ok) throw new Error("Booking creation failed"); // axios handles this

      const booking = response.data;
      console.log("✅ Backend Booking Created:", booking);

      // Store in local storage for persistence
      localStorage.setItem('currentUserRide', JSON.stringify(booking));
      alert("✅ Booking Confirmed! Waiting for driver...");

      // Notify parent to switch to tracking page
      if (setSelectedBooking) {
        setSelectedBooking(booking);
      }

      if (onBookingSuccess) {
        onBookingSuccess(booking);
      } else if (setCurrentPage) {
        setCurrentPage('user-ride');
      }
      setBookingStep(5);

      // Start countdown timer
      const countdownInterval = setInterval(() => {
        setConfirmCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            setIsConfirming(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (e) {
      console.error("Booking Error:", e);
      alert("Failed to create booking: " + e.message);
      setIsConfirming(false);
      setConfirmCountdown(0);
    }
  };

  return (
    <div className="booking-flow-container">
      {/* Stepper Header */}
      <div className="booking-stepper">
        <div className={`step-dot ${bookingStep >= 1 ? 'active' : ''}`}>1</div>
        <div className="step-line"></div>
        <div className={`step-dot ${bookingStep >= 2 ? 'active' : ''}`}>2</div>
        <div className="step-line"></div>
        <div className={`step-dot ${bookingStep >= 3 ? 'active' : ''}`}>3</div>
        <div className="step-line"></div>
        <div className={`step-dot ${bookingStep >= 4 ? 'active' : ''}`}>4</div>
      </div>

      <div className="step-content">
        {bookingStep === 1 && (
          <div className="animate-fade-in">
            <h3>Where to?</h3>
            <MultiStepDestinationInput
              userLocation={userLocation}
              onDestinationSet={handleDestinationComplete}
            />
          </div>
        )}

        {/* Step 2: Select Cab Type */}
        {bookingStep === 2 && selectedLocations && (
          <div className="booking-step-container animate-fade-in">
            <div className="step-header">
              <h3>Select Ride</h3>
            </div>
            <CabTypeSelection
              onCabTypeSelect={handleCabSelect}
              tripDistance={selectedLocations.destination.distance || 0}
              estimatedFare={estimatedFare}
            />
            <button
              className="back-btn"
              onClick={() => setBookingStep(1)}
              style={{ marginTop: "20px" }}
            >
              ← Back to Destination
            </button>
          </div>
        )}

        {bookingStep === 3 && selectedCabType && (
          <div className="animate-fade-in">
            <div className="step-header">
              <h3>Choose Driver</h3>
              <button className="btn-link" onClick={() => setBookingStep(2)}>Change Vehicle</button>
            </div>
            <div className="drivers-list">
              {availableDrivers.length === 0 ? <p>No drivers found nearby.</p> : availableDrivers.map(driver => (
                <div key={driver.id} className="driver-card glass-card" onClick={() => { setSelectedDriver(driver); setBookingStep(4); }}>
                  <div className="driver-avatar">{driver.name[0]}</div>
                  <div className="driver-info">
                    <h4>{driver.name}</h4>
                    <p>{driver.cabNumber} • ⭐ {driver.rating}</p>
                  </div>
                  <div className="driver-meta">
                    <span>{driver.responseTime}</span>
                    <button className="btn-icon">→</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {bookingStep === 4 && selectedDriver && (
          <div className="animate-fade-in">
            <h3>Confirm Ride</h3>
            <div className="fare-summary glass-card">
              <div className="fare-row">
                <span>Vehicle</span>
                <span>{selectedCabType.name}</span>
              </div>
              <div className="fare-row">
                <span>Distance</span>
                <span>{selectedLocations.destination.distance?.toFixed(1) || 5.0} km</span>
              </div>
              <div className="fare-total">
                <span>Total Fare</span>
                <span>₹{estimatedFare}</span>
              </div>
            </div>
            <div className="driver-summary glass-card mt-3">
              <p>Driver: <strong>{selectedDriver.name}</strong></p>
              <p>Cab: <strong>{selectedDriver.cabNumber}</strong></p>
            </div>

            <div className="action-buttons mt-4">
              <button className="btn btn-secondary w-full" onClick={() => setBookingStep(3)} disabled={isConfirming}>Back</button>
              <button 
                className="btn btn-primary w-full" 
                onClick={handleConfirmBooking}
                disabled={isConfirming || confirmCountdown > 0}
                style={{
                  opacity: (isConfirming || confirmCountdown > 0) ? 0.6 : 1,
                  cursor: (isConfirming || confirmCountdown > 0) ? 'not-allowed' : 'pointer'
                }}
              >
                {isConfirming ? (
                  <>✓ Request Sent! ({confirmCountdown}s)</>
                ) : confirmCountdown > 0 ? (
                  <>Please wait... ({confirmCountdown}s)</>
                ) : (
                  <>Confirm & Request</>
                )}
              </button>
            </div>
          </div>
        )}

        {bookingStep === 5 && (
          <div className="animate-flip text-center p-4">
            <div className="pulse-loader"></div>
            <h3>Requesting Ride...</h3>
            <p>Contacting nearby drivers</p>
          </div>
        )}

        {bookingStep === 6 && selectedDriver && (
          <div className="ride-active-panel text-center">
            <h3>Driver En Route!</h3>
            <div className="driver-avatar-large mx-auto">{selectedDriver.name[0]}</div>
            <h2>{selectedDriver.cabNumber}</h2>
            <p>{selectedDriver.model || 'Toyota Etios'}</p>
            <div className="ride-status glass-panel p-3 mt-3">
              <p>Arriving in <strong>{selectedDriver.responseTime}</strong></p>
            </div>
            <button className="btn btn-danger w-full mt-4" onClick={() => { setBookingStep(1); alert("Ride Cancelled"); }}>Cancel Ride</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingFlow;