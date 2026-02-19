import React, { useState } from "react";
import "./DestinationInput.css";

/**
 * Enhanced destination input component that fetches coordinates
 * Supports both text input with geocoding and manual coordinate entry
 */
const DestinationInput = ({ 
  onDestinationSet, 
  userLocation, 
  pickupLocation,
  onDistanceCalculated 
}) => {
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [useManualCoords, setUseManualCoords] = useState(false);
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  // Simple geocoding simulation - in production, use Google Places API or similar
  const geocodeAddress = async (address) => {
    setLoading(true);
    setError("");

    try {
      // Simulated geocoding - replace with real API in production
      // Using OpenStreetMap Nominatim for free geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );

      if (!response.ok) throw new Error("Geocoding failed");

      const results = await response.json();

      if (results.length === 0) {
        setError("Location not found. Please try another search.");
        setSuggestions([]);
        setLoading(false);
        return;
      }

      // Show suggestions
      setSuggestions(
        results.slice(0, 5).map((result) => ({
          name: result.display_name,
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          distance: calculateDistance(
            pickupLocation.lat,
            pickupLocation.lng,
            parseFloat(result.lat),
            parseFloat(result.lon)
          ),
        }))
      );

      setLoading(false);
    } catch (err) {
      console.error("Geocoding error:", err);
      setError("Could not fetch location. Try manual entry.");
      setSuggestions([]);
      setLoading(false);
    }
  };

  // Calculate distance using Haversine formula
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
    return R * c;
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setDestination(value);
    setSuggestions([]);

    // Allow any input - no character restrictions
    // Search happens as user types (even 1 character)
    if (value.length > 0) {
      geocodeAddress(value);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const destinationCoords = {
      lat: suggestion.lat,
      lng: suggestion.lng,
      description: suggestion.name,
    };

    setDestination(suggestion.name);
    setSuggestions([]);
    
    // Calculate distance
    const dist = calculateDistance(
      pickupLocation.lat,
      pickupLocation.lng,
      suggestion.lat,
      suggestion.lng
    );

    onDistanceCalculated?.(dist);
    onDestinationSet(destinationCoords);
  };

  const handleManualCoordSubmit = () => {
    if (!manualLat || !manualLng) {
      setError("Please enter both latitude and longitude");
      return;
    }

    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);

    if (isNaN(lat) || isNaN(lng)) {
      setError("Invalid coordinates");
      return;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setError("Coordinates out of range");
      return;
    }

    const destinationCoords = {
      lat,
      lng,
      description: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    };

    // Calculate distance
    const dist = calculateDistance(
      pickupLocation.lat,
      pickupLocation.lng,
      lat,
      lng
    );

    onDistanceCalculated?.(dist);
    onDestinationSet(destinationCoords);
    setManualLat("");
    setManualLng("");
    setUseManualCoords(false);
  };

  return (
    <div className="destination-input-container">
      {!useManualCoords ? (
        <>
          <div className="search-section">
            <div className="search-input-wrapper">
              <span className="search-icon">🎯</span>
              <input
                type="text"
                className="destination-search"
                placeholder="Enter drop location or coordinates"
                value={destination}
                onChange={handleSearchChange}
                disabled={loading}
              />
              {loading && <span className="loading-spinner">⏳</span>}
            </div>

            {error && <div className="error-message">{error}</div>}

            {suggestions.length > 0 && (
              <div className="suggestions-list">
                <div className="suggestions-header">
                  <span className="suggestion-count">
                    {suggestions.length} result{suggestions.length !== 1 ? "s" : ""}
                  </span>
                </div>
                {suggestions.map((suggestion, idx) => (
                  <div
                    key={idx}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="suggestion-main">
                      <div className="suggestion-name">{suggestion.name}</div>
                      <div className="suggestion-distance">
                        📍 {suggestion.distance.toFixed(2)} km from pickup
                      </div>
                    </div>
                    <div className="suggestion-coords">
                      {suggestion.lat.toFixed(4)}, {suggestion.lng.toFixed(4)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            className="manual-coords-toggle"
            onClick={() => setUseManualCoords(true)}
          >
            📋 Enter Coordinates Manually
          </button>
        </>
      ) : (
        <>
          <div className="manual-coords-section">
            <h4>Enter Destination Coordinates</h4>
            <div className="coords-input-group">
              <input
                type="number"
                className="coord-input"
                placeholder="Latitude (e.g., 28.6139)"
                value={manualLat}
                onChange={(e) => setManualLat(e.target.value)}
                min="-90"
                max="90"
                step="0.0001"
              />
              <input
                type="number"
                className="coord-input"
                placeholder="Longitude (e.g., 77.2090)"
                value={manualLng}
                onChange={(e) => setManualLng(e.target.value)}
                min="-180"
                max="180"
                step="0.0001"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="manual-coords-actions">
              <button
                className="confirm-coords-btn"
                onClick={handleManualCoordSubmit}
              >
                ✓ Confirm Coordinates
              </button>
              <button
                className="back-to-search-btn"
                onClick={() => {
                  setUseManualCoords(false);
                  setManualLat("");
                  setManualLng("");
                  setError("");
                }}
              >
                ← Back to Search
              </button>
            </div>
          </div>
        </>
      )}

      {/* Current location info */}
      <div className="location-info-box">
        <div className="info-item">
          <span className="info-label">📍 From:</span>
          <span className="info-value">
            {pickupLocation?.lat?.toFixed(4)}, {pickupLocation?.lng?.toFixed(4)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DestinationInput;
