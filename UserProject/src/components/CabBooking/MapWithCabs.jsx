
// import React, { useEffect, useState } from "react";
// import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
// import RideRequestForm from "./RideRequestForm";

// // Your Google Maps API key here
// const apiKey = "AIzaSyDz2h3E18hbaMTjXc4YkFHSBsWed3uM1c8";

// const MapWithCabs = ({
//     userLocation,
//     user,
//     driverLocation,
//     assignedCab,
//     setPickupLocation,
//     setDropLocation,
//     setCurrentPage
// }) => {
//     const { isLoaded } = useLoadScript({ googleMapsApiKey: apiKey });
//     const [cabs, setCabs] = useState([]);
//     const [dropLocation, setDropLoc] = useState(null);

//     // Fetch all available/nearby cabs on map center/init
//     useEffect(() => {
//         if (userLocation) {
//             fetch(
//                 `/api/cabs/nearby?latitude=${userLocation.lat}&longitude=${userLocation.lng}&radiusKm=3`
//             )
//                 .then(res => res.json())
//                 .then(setCabs)
//                 .catch(() => setCabs([]));
//         }
//     }, [userLocation]);

//     // Handler when user clicks on map
//     const handleMapClick = e => {
//         const { latLng } = e;
//         setDropLoc({
//             lat: latLng.lat(),
//             lng: latLng.lng()
//         });
//     };

//     if (!isLoaded) return <div>Loading map...</div>;

//     return (
//         <div>
//             <div style={{ width: "100%", height: "400px" }}>
//                 <GoogleMap
//                     center={userLocation}
//                     zoom={13}
//                     mapContainerStyle={{ width: "100%", height: "100%" }}
//                     onClick={handleMapClick}
//                 >
//                     {/* User marker */}
//                     <Marker
//                         position={userLocation}
//                         icon={{
//                             url: "/user.png",
//                             scaledSize: { width: 40, height: 40 }
//                         }}
//                     />
//                     {/* Assigned driver marker (Uber-like, after ride assigned) */}
//                     {driverLocation && (
//                         <Marker
//                             position={driverLocation}
//                             icon={{
//                                 url: "/cab.png",
//                                 scaledSize: new window.google.maps.Size(38, 38)
//                             }}
//                             label={assignedCab ? "Your Cab" : undefined}
//                         />
//                     )}
//                     {/* Show all other cabs */}
//                     {cabs.map(
//                         cab =>
//                             !assignedCab || cab.id !== assignedCab.cabId || !driverLocation ? (
//                                 <Marker
//                                     key={cab.id}
//                                     position={{
//                                         lat: cab.currentLocation.latitude,
//                                         lng: cab.currentLocation.longitude
//                                     }}
//                                     icon="/cab.png"
//                                 />
//                             ) : null
//                     )}
//                     {/* Drop location marker (user's selected drop) */}
//                     {dropLocation && (
//                         <Marker
//                             position={dropLocation}
//                             icon={{
//                                 url: "/drop.png",
//                                 scaledSize: { width: 40, height: 40 }
//                             }}
//                         />
//                     )}
//                 </GoogleMap>
//             </div>

//             {/* Show ride request form only when drop is selected and before assignment */}
//             {dropLocation && (
//                 <RideRequestForm
//                     user={user}
//                     pickupLocation={userLocation}
//                     dropLocation={dropLocation}
//                     onSuccess={() => {
//                         // THE BELOW ONLY WORKS if these setters exist as props!
//                         setPickupLocation && setPickupLocation(userLocation);
//                         setDropLocation && setDropLocation(dropLocation);
//                         setCurrentPage && setCurrentPage('user-ride');
//                     }}
//                 />
//             )}

//             <p>
//                 <small>
//                     Click on the map to set your <b>drop location</b>.
//                 </small>
//             </p>
//         </div>
//     );
// };

// export default MapWithCabs;

import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, useLoadScript, DirectionsRenderer } from "@react-google-maps/api";
import RideRequestForm from "./RideRequestForm";

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyAvkO47IMYZhyxBi8vo3ZR_B2V35tZay_c";


const MapWithCabs = ({
  userLocation,
  user,
  driverLocation,
  assignedCab,
  setPickupLocation,
  setDropLocation,
  setCurrentPage,
  dropLocation: propDropLocation,
  showRoute = false                // <-- Show blue line when true
}) => {
  const { isLoaded, loadError } = useLoadScript({ googleMapsApiKey: apiKey });
  const [cabs, setCabs] = useState([]);
  const [dropLocation, setDropLoc] = useState(null);
  const [directions, setDirections] = useState(null);

  // Determine which drop to use (for booking or tracking mode)
  const activeDrop = showRoute && propDropLocation ? propDropLocation : dropLocation;

  // Fetch all available/nearby cabs
  useEffect(() => {
    if (userLocation) {
      fetch(`http://localhost:8076/api/cabs/nearby?latitude=${userLocation.lat}&longitude=${userLocation.lng}&radiusKm=3`)
        .then(res => {
          if (res.ok) return res.json();
          throw new Error("Failed to fetch cabs");
        })
        .then(setCabs)
        .catch(() => setCabs([]));
    }
  }, [userLocation]);

  // Handle setting drop via map in booking mode only
  const handleMapClick = e => {
    if (showRoute) return; // Don't allow editing drop in tracking mode!
    const { latLng } = e;
    setDropLoc({ lat: latLng.lat(), lng: latLng.lng() });
  };

  // DirectionsService: draw route from pickup to drop on "showRoute"
  useEffect(() => {
    if (
      isLoaded && !loadError && showRoute && userLocation && propDropLocation // only in tracking mode
    ) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: userLocation,
          destination: propDropLocation,
          travelMode: window.google.maps.TravelMode.DRIVING
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
          } else {
            setDirections(null);
          }
        }
      );
    } else {
      setDirections(null);
    }
  }, [isLoaded, loadError, showRoute, userLocation, propDropLocation]);

  if (loadError) {
    const lat = userLocation?.lat || 20.2961;
    const lng = userLocation?.lng || 85.8245;
    return (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", position: 'relative' }}>
        {/* OpenStreetMap Fallback */}
        <div style={{ width: "100%", height: "400px", background: "#e0e0e0" }}>
          <iframe
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            marginHeight="0"
            marginWidth="0"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.05}%2C${lat - 0.05}%2C${lng + 0.05}%2C${lat + 0.05}&layer=mapnik&marker=${lat}%2C${lng}`}
            style={{ border: 1 }}
          ></iframe>
          <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.7)', color: 'white', padding: '5px 10px', borderRadius: '4px', fontSize: '10px' }}>
            Map Data © OpenStreetMap
          </div>
        </div>
        {!showRoute && dropLocation && (
          <RideRequestForm
            user={user}
            pickupLocation={userLocation}
            dropLocation={dropLocation}
            onSuccess={() => {
              setPickupLocation && setPickupLocation(userLocation);
              setDropLocation && setDropLocation(dropLocation);
              setCurrentPage && setCurrentPage('user-ride');
            }}
          />
        )}
      </div>
    );
  }

  if (!isLoaded) return <div style={{ color: "white", padding: "20px" }}>Loading map...</div>;

  return (
    <div>
      <div style={{ width: "100%", height: "400px" }}>
        <GoogleMap
          center={driverLocation || userLocation || { lat: 20.2961, lng: 85.8245 }}
          zoom={14}
          mapContainerStyle={{ width: "100%", height: "100%" }}
          onClick={handleMapClick}
          options={{
            mapTypeControl: true,
            fullscreenControl: true,
          }}
        >
          {/* User marker using standard Marker */}
          {userLocation && (
            <Marker
              position={userLocation}
              title="Pickup Location"
            />
          )}
          {/* Driver marker */}
          {driverLocation && (
            <Marker
              position={driverLocation}
              title={assignedCab ? "Your Cab" : "Cab"}
            />
          )}
          {/* Show all other cabs in booking mode only */}
          {!showRoute && cabs.map(cab =>
            <Marker
              key={cab.id}
              position={{
                lat: cab.currentLocation.latitude,
                lng: cab.currentLocation.longitude
              }}
              title={`Cab ${cab.id}`}
            />
          )}
          {/* Drop marker */}
          {activeDrop && (
            <Marker
              position={activeDrop}
              title="Drop Location"
            />
          )}
          {/* Directions/blue line polyline */}
          {showRoute && directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: "#297bff",
                  strokeOpacity: 0.9,
                  strokeWeight: 6,
                }
              }}
            />
          )}
        </GoogleMap>
      </div>
      {/* Ride request form should show only in booking mode, before route is shown! */}
      {!showRoute && dropLocation && (
        <RideRequestForm
          user={user}
          pickupLocation={userLocation}
          dropLocation={dropLocation}
          onSuccess={() => {
            setPickupLocation && setPickupLocation(userLocation);
            setDropLocation && setDropLocation(dropLocation);
            setCurrentPage && setCurrentPage('user-ride');
          }}
        />
      )}
      <p>
        <small>
          {!showRoute &&
            <>Click on the map to set your <b>drop location</b>.</>
          }
        </small>
      </p>
    </div>
  );
};

export default MapWithCabs;