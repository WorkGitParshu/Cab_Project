import React, { useState, useEffect } from "react";
import { useCabAssignmentAndTracking } from "../../hooks/useCabAssignmentAndTracking";
import MapWithCabs from "./MapWithCabs";
import BookingFlow from "./BookingFlow";
import LocationRequest from "./LocationRequest";
import "./BookCabPage.css";

export default function BookCabPage({
  user,
  pickupLocation,
  dropLocation,
  setCurrentPage,
  setPickupLocation,
  setDropLocation
}) {
  const [assignedCab, setAssignedCab] = useState(null);

  // Auto-redirect if an active ride exists in local storage
  useEffect(() => {
    const savedRide = localStorage.getItem('currentUserRide');
    if (savedRide) {
      try {
        const ride = JSON.parse(savedRide);
        if (ride && (!ride.status || ride.status === 'PENDING' || ride.status === 'ASSIGNED' || ride.status === 'CONFIRMED' || ride.status === 'ACCEPTED')) {
          // If the ride is older than 5 minutes and stuck without a status, ignore it
          const rideTime = new Date(ride.requestTime || ride.createdAt || Date.now()).getTime();
          const now = Date.now();
          if (now - rideTime < 5 * 60 * 1000) {
            setCurrentPage('user-ride');
          } else {
            localStorage.removeItem('currentUserRide');
          }
        }
      } catch (e) {
        console.error("Failed to parse saved ride on BookCabPage load", e);
      }
    }
  }, [setCurrentPage]);

  const { driverLoc } = useCabAssignmentAndTracking(user?.id);

  // This function is passed to BookingFlow to update the parent state/map
  const handleLocationUpdate = (pickup, drop) => {
    if (pickup) setPickupLocation(pickup);
    if (drop) setDropLocation(drop);
  };

  // If no pickup location is set, show the location request screen
  if (!pickupLocation) {
    return (
      <LocationRequest
        user={user}
        onLocationReceived={(loc) => setPickupLocation(loc)}
      />
    );
  }

  return (
    <div className="book-cab-page">
      {/* Left Panel: Booking Controls */}
      <div className="booking-sidebar glass-panel">
        <div style={{ position: 'absolute', top: 5, right: 10, fontSize: '0.7em', opacity: 0.5 }}>v2.0</div>
        <BookingFlow
          user={user}
          userLocation={pickupLocation}
          userName={user?.firstName}
          setCurrentPage={setCurrentPage}
          onLocationUpdate={handleLocationUpdate}
          setAssignedCab={setAssignedCab}
        />
      </div>

      {/* Right Panel: Map */}
      <div className="booking-map-container">
        <MapWithCabs
          userLocation={pickupLocation}
          driverLocation={driverLoc}
          assignedCab={assignedCab}
          dropLocation={dropLocation}
        />
      </div>
    </div>
  );
}