import React, { useEffect, useState } from 'react';
import './LocationRequest.css';

const LocationRequest = ({ onLocationReceived, user }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [manualLocation, setManualLocation] = useState({ latitude: '', longitude: '' });
  const [useManual, setUseManual] = useState(false);

  // Auto-request location on component mount
  useEffect(() => {
    requestUserLocation();
  }, []);

  const requestUserLocation = () => {
    setLoading(true);
    setError(null);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log(`📍 Location obtained: Lat=${latitude}, Lng=${longitude}`);
          onLocationReceived({
            lat: latitude,
            lng: longitude,
            source: 'gps'
          });
          setLoading(false);
        },
        (err) => {
          console.error('Geolocation error:', err);
          setError(`Unable to get location: ${err.message}. Please enable location access.`);
          setLoading(false);
          setUseManual(true);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      setUseManual(true);
    }
  };

  const handleManualLocationSubmit = (e) => {
    e.preventDefault();
    const lat = parseFloat(manualLocation.latitude);
    const lng = parseFloat(manualLocation.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      setError('Please enter valid latitude and longitude');
      return;
    }

    if (lat < -90 || lat > 90) {
      setError('Latitude must be between -90 and 90');
      return;
    }

    if (lng < -180 || lng > 180) {
      setError('Longitude must be between -180 and 180');
      return;
    }

    console.log(`📍 Manual location: Lat=${lat}, Lng=${lng}`);
    onLocationReceived({
      lat,
      lng,
      source: 'manual'
    });
  };

  if (loading) {
    return (
      <div className="location-request-container">
        <div className="location-request-card">
          <div className="location-spinner"></div>
          <h2>Getting Your Location...</h2>
          <p>Please allow location access when prompted</p>
          <p className="location-hint">We need your GPS coordinates to find nearby drivers</p>
        </div>
      </div>
    );
  }

  return (
    <div className="location-request-container">
      <div className="location-request-card">
        <div className="location-icon">📍</div>
        <h2>Confirm Your Location</h2>
        <p className="location-subtitle">We need your current location to find nearby drivers</p>

        {error && (
          <div className="location-error">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {!useManual ? (
          <div className="location-auto">
            <button className="location-btn-primary" onClick={requestUserLocation}>
              🔄 Try Getting Location Again
            </button>
            <button
              className="location-btn-secondary"
              onClick={() => setUseManual(true)}
            >
              Enter Location Manually
            </button>
          </div>
        ) : (
          <form onSubmit={handleManualLocationSubmit} className="location-manual-form">
            <div className="form-group">
              <label htmlFor="latitude">Latitude</label>
              <input
                id="latitude"
                type="number"
                step="0.0001"
                placeholder="e.g., 28.6139"
                value={manualLocation.latitude}
                onChange={(e) =>
                  setManualLocation({ ...manualLocation, latitude: e.target.value })
                }
                required
              />
              <small>Range: -90 to 90</small>
            </div>

            <div className="form-group">
              <label htmlFor="longitude">Longitude</label>
              <input
                id="longitude"
                type="number"
                step="0.0001"
                placeholder="e.g., 77.2090"
                value={manualLocation.longitude}
                onChange={(e) =>
                  setManualLocation({ ...manualLocation, longitude: e.target.value })
                }
                required
              />
              <small>Range: -180 to 180</small>
            </div>

            <button type="submit" className="location-btn-primary">
              Confirm Location
            </button>
            <button
              type="button"
              className="location-btn-secondary"
              onClick={() => setUseManual(false)}
            >
              Use GPS Instead
            </button>
          </form>
        )}

        <p className="location-note">
          ℹ️ Your location data helps us show drivers nearest to you
        </p>
      </div>
    </div>
  );
};

export default LocationRequest;
