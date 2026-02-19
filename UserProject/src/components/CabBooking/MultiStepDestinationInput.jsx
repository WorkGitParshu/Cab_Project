import React, { useState, useEffect } from "react";
import "./MultiStepDestinationInput.css";

/**
 * Multi-step destination input component
 * Step 1: Select pickup location (manual or current)
 * Step 2: Enter & get pickup location suggestions
 * Step 3: Enter & get destination suggestions
 * Step 4: Select final destination
 * Step 5: Confirm and proceed
 */
const MultiStepDestinationInput = ({
  onDestinationSet,
  userLocation,
  onComplete
}) => {
  const [step, setStep] = useState(1); // 1: Pickup, 2: Confirm Pickup, 3: Destination, 4: Confirm Destination, 5: Done
  const [pickupInput, setPickupInput] = useState("");
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [destinationInput, setDestinationInput] = useState("");
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [confirmDisabled, setConfirmDisabled] = useState(false);
  const [confirmCountdown, setConfirmCountdown] = useState(0);

  // Haversine distance calculation
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

  // Step 1: Use current location or enter pickup manually
  const handleUseCurrentLocation = () => {
    if (!userLocation) {
      setError("Location not available yet");
      return;
    }
    setSelectedPickup({
      lat: userLocation.lat,
      lng: userLocation.lng,
      description: "Current Location",
    });
    setStep(2);
  };

  // Helper: Geocode fallback (Local -> OSM)
  const fetchGeocode = async (query) => {
    try {
      // Try Local Backend First
      const response = await fetch(
        `http://localhost:8077/api/geocode?query=${encodeURIComponent(query)}`
      );
      if (response.ok) {
        return await response.json();
      }
      throw new Error("Local backend failed");
    } catch (localErr) {
      console.warn("Local geocode failed, trying OSM...", localErr);
      // Fallback to OpenStreetMap (Nominatim)
      try {
        const osmRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}`
        );
        if (osmRes.ok) {
          const osmData = await osmRes.json();
          // Map OSM format to our expected format
          return osmData.map((item) => ({
            display_name: item.display_name,
            lat: item.lat,
            lon: item.lon,
          }));
        }
      } catch (osmErr) {
        console.error("OSM geocode failed", osmErr);
      }
    }
    return [];
  };

  // Step 1: Search for pickup location with debounce
  const handlePickupSearch = async (input) => {
    setPickupInput(input);
    setError("");

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (input.length === 0) {
      setPickupSuggestions([]);
      return;
    }

    // Debounce search - only search after user stops typing for 500ms
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await fetchGeocode(input);
        setPickupSuggestions(
          results.slice(0, 5).map((result) => ({
            name: result.display_name,
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon),
          }))
        );
        setLoading(false);
      } catch (err) {
        console.error("Error searching location:", err);
        setError("Could not fetch location suggestions");
        setPickupSuggestions([]);
        setLoading(false);
      }
    }, 500); // Wait 500ms after user stops typing

    setSearchTimeout(timeout);
  };

  // Confirm pickup location selection
  const handleConfirmPickup = (suggestion) => {
    setSelectedPickup({
      lat: suggestion.lat,
      lng: suggestion.lng,
      description: suggestion.name,
    });
    setStep(2);
  };

  // Step 3: Search for destination with debounce
  const handleDestinationSearch = async (input) => {
    setDestinationInput(input);
    setError("");

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (input.length === 0) {
      setDestinationSuggestions([]);
      return;
    }

    // Debounce search - only search after user stops typing for 500ms
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await fetchGeocode(input);
        setDestinationSuggestions(
          results.slice(0, 5).map((result) => ({
            name: result.display_name,
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon),
            distance: calculateDistance(
              selectedPickup.lat,
              selectedPickup.lng,
              parseFloat(result.lat),
              parseFloat(result.lon)
            ),
          }))
        );
        setLoading(false);
      } catch (err) {
        console.error("Error searching destination:", err);
        setError("Could not fetch destination suggestions");
        setDestinationSuggestions([]);
        setLoading(false);
      }
    }, 500); // Wait 500ms after user stops typing

    setSearchTimeout(timeout);
  };

  // Step 4: Confirm destination and complete
  const handleConfirmDestination = (suggestion) => {
    setSelectedDestination({
      lat: suggestion.lat,
      lng: suggestion.lng,
      description: suggestion.name,
      distance: suggestion.distance,
    });
    setStep(4);
  };

  // Step 5: Final confirmation and send request
  const handleFinalConfirm = () => {
    if (!selectedPickup || !selectedDestination) {
      setError("Please select both pickup and destination");
      return;
    }

    onDestinationSet({
      pickup: selectedPickup,
      destination: selectedDestination,
    });

    if (onComplete) {
      onComplete();
    }
  };

  const handleEdit = (stepToEdit) => {
    setStep(stepToEdit);
  };

  return (
    <div className="multi-step-container">
      {/* Progress Indicator */}
      <div className="progress-indicator">
        <div className={`step ${step >= 1 ? "active" : ""}`}>
          <div className="step-number">1</div>
          <div className="step-label">Pickup</div>
        </div>
        <div className={`connector ${step >= 3 ? "active" : ""}`}></div>
        <div className={`step ${step >= 3 ? "active" : ""}`}>
          <div className="step-number">2</div>
          <div className="step-label">Destination</div>
        </div>
        <div className={`connector ${step >= 4 ? "active" : ""}`}></div>
        <div className={`step ${step >= 4 ? "active" : ""}`}>
          <div className="step-number">3</div>
          <div className="step-label">Review</div>
        </div>
      </div>

      {/* Step 1: Pickup Location */}
      {step === 1 && (
        <div className="step-content pickup-step">
          <h3>📍 Where are you now?</h3>
          <p className="step-description">Select your pickup location (v2.0)</p>

          {/* Use Current Location Button */}
          <button
            className="location-btn current"
            onClick={handleUseCurrentLocation}
            disabled={!userLocation}
          >
            <span className="btn-icon">📍</span>
            <div>
              <div className="btn-title">Use Current Location</div>
              <div className="btn-subtitle">
                {userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : "Fetching location..."}
              </div>
            </div>
          </button>

          {/* OR */}
          <div className="or-divider">OR</div>

          {/* Manual Location Search */}
          <div className="search-section">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="location-search-input"
                placeholder="Search pickup location..."
                value={pickupInput}
                onChange={(e) => handlePickupSearch(e.target.value)}
                disabled={loading}
              />
              {loading && <span className="loading-spinner">⏳</span>}
            </div>

            {error && <div className="error-message">{error}</div>}

            {/* Suggestions */}
            {pickupSuggestions.length > 0 && (
              <div className="suggestions-list">
                {pickupSuggestions.map((suggestion, idx) => (
                  <div
                    key={idx}
                    className="suggestion-item"
                    onClick={() => handleConfirmPickup(suggestion)}
                  >
                    <div className="suggestion-icon">📌</div>
                    <div className="suggestion-info">
                      <div className="suggestion-name">{suggestion.name}</div>
                      <div className="suggestion-coords">
                        {suggestion.lat.toFixed(4)}, {suggestion.lng.toFixed(4)}
                      </div>
                    </div>
                    <div className="suggestion-arrow">→</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Confirm Pickup */}
      {step === 2 && selectedPickup && (
        <div className="step-content confirm-step">
          <h3>✅ Pickup Confirmed</h3>
          <div className="location-card">
            <div className="location-header">📍 From</div>
            <div className="location-name">{selectedPickup.description}</div>
            <div className="location-coords">
              {selectedPickup.lat.toFixed(4)}, {selectedPickup.lng.toFixed(4)}
            </div>
            <button
              className="edit-btn"
              onClick={() => {
                setStep(1);
                setPickupInput("");
                setPickupSuggestions([]);
              }}
            >
              ✏️ Edit
            </button>
          </div>
          <button
            className="proceed-btn"
            onClick={() => setStep(3)}
          >
            Next: Select Destination →
          </button>
        </div>
      )}

      {/* Step 3: Destination Location */}
      {step === 3 && selectedPickup && (
        <div className="step-content destination-step">
          <h3>🎯 Where are you going?</h3>
          <p className="step-description">Search and select destination</p>

          <div className="search-section">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="location-search-input"
                placeholder="Search destination..."
                value={destinationInput}
                onChange={(e) => handleDestinationSearch(e.target.value)}
                disabled={loading}
              />
              {loading && <span className="loading-spinner">⏳</span>}
            </div>

            {error && <div className="error-message">{error}</div>}

            {/* Suggestions */}
            {destinationSuggestions.length > 0 && (
              <div className="suggestions-list">
                {destinationSuggestions.map((suggestion, idx) => (
                  <div
                    key={idx}
                    className="suggestion-item"
                    onClick={() => handleConfirmDestination(suggestion)}
                  >
                    <div className="suggestion-icon">🎯</div>
                    <div className="suggestion-info">
                      <div className="suggestion-name">{suggestion.name}</div>
                      <div className="suggestion-distance">
                        📏 {suggestion.distance.toFixed(2)} km from pickup
                      </div>
                    </div>
                    <div className="suggestion-arrow">→</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            className="back-btn"
            onClick={() => setStep(2)}
          >
            ← Back
          </button>
        </div>
      )}

      {/* Step 4: Review & Confirm */}
      {step === 4 && selectedPickup && selectedDestination && (
        <div className="step-content review-step">
          <h3>✅ Review Your Ride</h3>

          {/* Route Summary */}
          <div className="route-summary">
            <div className="route-item pickup">
              <div className="route-icon">📍</div>
              <div className="route-content">
                <div className="route-label">FROM</div>
                <div className="route-value">{selectedPickup.description}</div>
              </div>
            </div>

            <div className="route-divider">↓</div>

            <div className="route-item destination">
              <div className="route-icon">🎯</div>
              <div className="route-content">
                <div className="route-label">TO</div>
                <div className="route-value">{selectedDestination.description}</div>
              </div>
            </div>
          </div>

          {/* Trip Details */}
          <div className="trip-info">
            <div className="info-item">
              <span className="info-icon">📏</span>
              <span className="info-label">Distance:</span>
              <span className="info-value">{selectedDestination.distance.toFixed(2)} km</span>
            </div>
            <div className="info-item">
              <span className="info-icon">💰</span>
              <span className="info-label">Estimated Fare:</span>
              <span className="info-value">₹{(50 + selectedDestination.distance * 10).toFixed(0)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              className="edit-location-btn"
              onClick={() => {
                setSelectedDestination(null);
                setDestinationInput("");
                setDestinationSuggestions([]);
                setStep(3);
              }}
            >
              ✏️ Change Destination
            </button>
            <button
              className="confirm-btn"
              onClick={handleFinalConfirm}
            >
              ✅ Continue to Vehicle Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiStepDestinationInput;
