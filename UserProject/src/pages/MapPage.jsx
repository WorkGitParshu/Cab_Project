import React, { useEffect, useState } from "react";
import MapWithCabs from "../components/CabBooking/MapWithCabs";

// export default function MapPage({ user }) {
//   const [userLocation, setUserLocation] = useState(null);
//   const [locationError, setLocationError] = useState(null);

//   useEffect(() => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         pos => {
//           setUserLocation({
//             lat: pos.coords.latitude,
//             lng: pos.coords.longitude
//           });
//         },
//         err => setLocationError(err.message)
//       );
//     } else {
//       setLocationError("Geolocation is not supported in your browser.");
//     }
//   }, []);

//   if (locationError) {
//     return <div>{locationError}</div>;
//   }
//   if (!userLocation) {
//     return <div>Detecting your location...</div>;
//   }

//   return (
//     <div>
//       <h2>Nearby Cabs and Book Ride</h2>
//       <MapWithCabs userLocation={userLocation} user={user} />
//     </div>
//   );
// }
export default function MapPage({ user, setPickupLocation, setDropLocation, setCurrentPage }) {
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserLocation({lat: pos.coords.latitude, lng: pos.coords.longitude}),
        err => setLocationError(err.message)
      );
    } else {
      setLocationError("Geolocation is not supported in your browser.");
    }
  }, []);

  if (locationError) return <div>{locationError}</div>;
  if (!userLocation) return <div>Detecting your location...</div>;

  return (
    <div>
      <h2>Nearby Cabs and Book Ride</h2>
      <MapWithCabs
        userLocation={userLocation}
        user={user}
        setPickupLocation={setPickupLocation}
        setDropLocation={setDropLocation}
        setCurrentPage={setCurrentPage}
        showRoute={false} //
      />
    </div>
  );
}