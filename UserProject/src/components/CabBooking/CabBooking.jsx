import React, { useState, useEffect } from 'react';
import './CabBooking.css';

const CAB_API_BASE_URL = "http://localhost:8076/api/cabs";
const BOOKING_API_BASE_URL = "http://localhost:8077/api/bookings";

const CabBooking = ({ user }) => {
  const [formData, setFormData] = useState({
    pickupLocation: '',
    dropLocation: '',
    cabType: 'STANDARD',
    pickupTime: '',
    specialRequests: ''
  });
  const [availableCabs, setAvailableCabs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [estimatedFare, setEstimatedFare] = useState(null);

  const cabTypes = [
    { value: 'STANDARD', label: 'Standard', price: 1.0 },
    { value: 'PREMIUM', label: 'Premium', price: 1.5 },
    { value: 'LUXURY', label: 'Luxury', price: 2.0 },
    { value: 'SUV', label: 'SUV', price: 1.8 }
  ];

  useEffect(() => {
    if (formData.pickupLocation && formData.dropLocation && formData.cabType) {
      calculateEstimatedFare();
    }
  }, [formData.pickupLocation, formData.dropLocation, formData.cabType]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const calculateEstimatedFare = async () => {
    try {
      // This would typically call your backend service to calculate fare
      // For now, we'll use a simple calculation
      const baseFare = 50; // Base fare
      const distance = Math.random() * 20 + 5; // Random distance 5-25 km
      const selectedCabType = cabTypes.find(type => type.value === formData.cabType);
      const fare = baseFare + (distance * 10 * selectedCabType.price);
      
      setEstimatedFare(Math.round(fare));
    } catch (err) {
      console.error('Error calculating fare:', err);
    }
  };

  // const searchAvailableCabs = async () => {
  //   if (!formData.pickupLocation) {
  //     setError('Please enter pickup location');
  //     return;
  //   }

  //   setLoading(true);
  //   setError('');

  //   try {
  //     const response = await fetch(`/api/cabs/search/location?location=${encodeURIComponent(formData.pickupLocation)}`);
      
  //     if (response.ok) {
  //       const cabs = await response.json();
  //       setAvailableCabs(cabs.filter(cab => cab.status === 'AVAILABLE'));
  //     } else {
  //       setError('Failed to search for cabs');
  //     }
  //   } catch (err) {
  //     setError('Error searching for cabs');
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const searchAvailableCabs = async () => {
  if (!formData.pickupLocation) {
    setError('Please enter pickup location');
    return;
  }
  setLoading(true);
  setError('');
  try {
    const response = await fetch(`${CAB_API_BASE_URL}/search/location?location=${encodeURIComponent(formData.pickupLocation)}`);
    if (response.ok) {
      const cabs = await response.json();
      setAvailableCabs(cabs.filter(cab => cab.status === 'AVAILABLE'));
    } else {
      setError('Failed to search for cabs');
    }
  } catch (err) {
    setError('Error searching for cabs');
  } finally {
    setLoading(false);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('Please login to book a cab');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const bookingData = {
        userId: user.id,
        pickupLocation: formData.pickupLocation,
        dropLocation: formData.dropLocation,
        cabType: formData.cabType,
        pickupTime: formData.pickupTime || new Date().toISOString(),
        specialRequests: formData.specialRequests,
        estimatedFare: estimatedFare
      };

      const response = await fetch(`${BOOKING_API_BASE_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      });

      if (response.ok) {
        const booking = await response.json();
        setSuccess(`Booking created successfully! Booking ID: ${booking.id}`);
        setFormData({
          pickupLocation: '',
          dropLocation: '',
          cabType: 'STANDARD',
          pickupTime: '',
          specialRequests: ''
        });
        setEstimatedFare(null);
        setAvailableCabs([]);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create booking');
      }
    } catch (err) {
      setError('Error creating booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cab-booking-container">
      <div className="booking-card">
        <h2>Book Your Cab</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pickupLocation">Pickup Location</label>
              <input
                type="text"
                id="pickupLocation"
                name="pickupLocation"
                value={formData.pickupLocation}
                onChange={handleChange}
                required
                placeholder="Enter pickup address"
              />
            </div>

            <div className="form-group">
              <label htmlFor="dropLocation">Drop Location</label>
              <input
                type="text"
                id="dropLocation"
                name="dropLocation"
                value={formData.dropLocation}
                onChange={handleChange}
                required
                placeholder="Enter destination address"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cabType">Cab Type</label>
              <select
                id="cabType"
                name="cabType"
                value={formData.cabType}
                onChange={handleChange}
                required
              >
                {cabTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label} (${type.price}x)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="pickupTime">Pickup Time</label>
              <input
                type="datetime-local"
                id="pickupTime"
                name="pickupTime"
                value={formData.pickupTime}
                onChange={handleChange}
                placeholder="Select pickup time"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="specialRequests">Special Requests</label>
            <textarea
              id="specialRequests"
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleChange}
              placeholder="Any special requests or notes..."
              rows="3"
            />
          </div>

          {estimatedFare && (
            <div className="fare-estimate">
              <h3>Estimated Fare: ₹{estimatedFare}</h3>
            </div>
          )}

          <div className="button-group">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={searchAvailableCabs}
              disabled={loading || !formData.pickupLocation}
            >
              Search Available Cabs
            </button>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating Booking...' : 'Book Cab'}
            </button>
          </div>
        </form>

        {availableCabs.length > 0 && (
          <div className="available-cabs">
            <h3>Available Cabs Near You</h3>
            <div className="cabs-grid">
              {availableCabs.map(cab => (
                <div key={cab.id} className="cab-card">
                  <h4>{cab.cabType}</h4>
                  <p>Driver: {cab.driverName}</p>
                  <p>Rating: {cab.rating || 'N/A'}</p>
                  <p>Distance: {cab.distance || 'N/A'} km</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CabBooking; 