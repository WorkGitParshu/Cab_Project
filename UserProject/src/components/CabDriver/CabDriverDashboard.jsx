// import React, { useEffect, useState } from "react";
// import { Client } from "@stomp/stompjs";
// import SockJS from "sockjs-client";

// function haversine(lat1, lon1, lat2, lon2) {
//   const R = 6371;
//   const dLat = (Math.PI / 180) * (lat2 - lat1);
//   const dLon = (Math.PI / 180) * (lon2 - lon1);
//   const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos((lat1 * Math.PI) / 180) *
//       Math.cos((lat2 * Math.PI) / 180) *
//       Math.sin(dLon / 2) ** 2;
//   return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
// }

// export default function CabDriverDashboard({ cab, onLogout }) {
//   const [rideRequests, setRideRequests] = useState([]);
//   const [msg, setMsg] = useState("");
//   const [activeRide, setActiveRide] = useState(null);
//   const [myLoc, setMyLoc] = useState(() =>
//     cab?.currentLocation
//       ? {
//           lat: cab.currentLocation.latitude,
//           lng: cab.currentLocation.longitude,
//         }
//       : { lat: 18.55, lng: 73.91 }
//   );

//   // --- 1. Always update cab location (GPS or simulation) ---
//   useEffect(() => {
//     if (!cab || !cab.id) return;
//     let watchId, interval;

//     function sendLocation(lat, lng) {
//       fetch(`http://localhost:8076/api/cabs/${cab.id}/location`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ latitude: lat, longitude: lng }),
//       });
//     }

//     if ("geolocation" in navigator) {
//       watchId = navigator.geolocation.watchPosition(
//         (pos) => {
//           setMyLoc({
//             lat: pos.coords.latitude,
//             lng: pos.coords.longitude,
//           });
//           sendLocation(pos.coords.latitude, pos.coords.longitude);
//         },
//         (err) => {
//           interval = setInterval(() => {
//             setMyLoc((prev) => {
//               const dlat = (Math.random() - 0.5) * 0.002;
//               const dlng = (Math.random() - 0.5) * 0.002;
//               const newLoc = {
//                 lat: prev.lat + dlat,
//                 lng: prev.lng + dlng,
//               };
//               sendLocation(newLoc.lat, newLoc.lng);
//               return newLoc;
//             });
//           }, 8000);
//         },
//         { enableHighAccuracy: true, maximumAge: 4000, timeout: 15000 }
//       );
//     } else {
//       interval = setInterval(() => {
//         setMyLoc((prev) => {
//           const dlat = (Math.random() - 0.5) * 0.002;
//           const dlng = (Math.random() - 0.5) * 0.002;
//           const newLoc = {
//             lat: prev.lat + dlat,
//             lng: prev.lng + dlng,
//           };
//           sendLocation(newLoc.lat, newLoc.lng);
//           return newLoc;
//         });
//       }, 8000);
//     }
//     return () => {
//       if (watchId && navigator.geolocation) navigator.geolocation.clearWatch(watchId);
//       if (interval) clearInterval(interval);
//     };
//   }, [cab]);

//   // --- 2. WebSocket ride request subscription ---
//   useEffect(() => {
//     if (!cab || !myLoc.lat) return;
//     const ws = new SockJS("http://localhost:8076/ws");
//     const client = new Client({ webSocketFactory: () => ws, reconnectDelay: 5000 });
//     client.onConnect = () => {
//       client.subscribe("/topic/cab-requests", (msg) => {
//         const ride = JSON.parse(msg.body);
//         const d = haversine(myLoc.lat, myLoc.lng, ride.pickupLat, ride.pickupLng);
//         if (d <= 20) {
//           setRideRequests((prev) =>
//             prev.some((r) => r.bookingId === ride.bookingId) ? prev : [ride, ...prev]
//           );
//         }
//       });
//     };
//     client.activate();
//     return () => client.deactivate();
//     // eslint-disable-next-line
//   }, [cab, myLoc.lat, myLoc.lng]);

//########//


// import React, { useEffect, useState } from "react";
// import { Client } from "@stomp/stompjs";
// import SockJS from "sockjs-client";

// // Haversine formula to calculate distance between two points (in km)
// function haversine(lat1, lon1, lat2, lon2) {
//   const R = 6371;
//   const dLat = (Math.PI / 180) * (lat2 - lat1);
//   const dLon = (Math.PI / 180) * (lon2 - lon1);
//   const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
//   return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
// }

// export default function CabDriverDashboard({ cab, onLogout }) {
//   const [rideRequests, setRideRequests] = useState([]);
//   const [msg, setMsg] = useState("");
//   const [activeRide, setActiveRide] = useState(null);
//   const [myLoc, setMyLoc] = useState(() =>
//     cab?.currentLocation
//       ? { lat: cab.currentLocation.latitude, lng: cab.currentLocation.longitude }
//       : { lat: 18.55, lng: 73.91 }
//   );

//   // --- 1. Always update cab location (GPS or simulation) while dashboard loaded ---
//   useEffect(() => {
//     if (!cab || !cab.id) return;

//     let watchId, interval;

//     function sendLocation(lat, lng) {
//       fetch(`http://localhost:8076/api/cabs/${cab.id}/location`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ latitude: lat, longitude: lng })
//       });
//     }

//     // Preferred: live GPS
//     if ("geolocation" in navigator) {
//       watchId = navigator.geolocation.watchPosition(
//         pos => {
//           setMyLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
//           sendLocation(pos.coords.latitude, pos.coords.longitude);
//           console.log("called geolocation pos")
//         },
//         err => {
//           // fallback: simulate random "drive"
//           console.log("called err")
//           interval = setInterval(() => {
//             setMyLoc(prev => {
//               const dlat = (Math.random() - 0.5) * 0.002;
//               const dlng = (Math.random() - 0.5) * 0.002;
//               const newLoc = {
//                 lat: prev.lat + dlat,
//                 lng: prev.lng + dlng
//               };
//               sendLocation(newLoc.lat, newLoc.lng);
//               return newLoc;
//             });
//           }, 8000);
//         },
//         { enableHighAccuracy: true, maximumAge: 4000, timeout: 15000 }
//       );
//     } else {
//       interval = setInterval(() => {
//         setMyLoc(prev => {
//             console.log("Randomly assign")
//           const dlat = (Math.random() - 0.5) * 0.002;
//           const dlng = (Math.random() - 0.5) * 0.002;
//           const newLoc = {
//             lat: prev.lat + dlat,
//             lng: prev.lng + dlng
//           };
//           sendLocation(newLoc.lat, newLoc.lng);
//           return newLoc;
//         });
//       }, 8000);
//     }
//     return () => {
//       if (watchId && navigator.geolocation) navigator.geolocation.clearWatch(watchId);
//       if (interval) clearInterval(interval);
//     };
//   }, [cab]);

//   // --- 2. WebSocket ride request subscription ---
//   useEffect(() => {
//     if (!cab || !myLoc.lat) return;
//     const ws = new SockJS("http://localhost:8076/ws");
//     const client = new Client({ webSocketFactory: () => ws, reconnectDelay: 5000 });
//     client.onConnect = () => {
//       client.subscribe("/topic/cab-requests", msg => {
//         console.log("WebSocket ride message!", msg.body);
//         const ride = JSON.parse(msg.body);
//         console.log(ride)
//         // Only show requests within 10km (use smaller for production)
//         const d = haversine(myLoc.lat, myLoc.lng, ride.pickupLat, ride.pickupLng);
//             if (d <= 20) {
//             setRideRequests(prev => (prev.some(r => r.bookingId === ride.bookingId) ? prev : [ride, ...prev]));
//             }
//         setRideRequests(prev => (prev.some(r => r.bookingId === ride.bookingId) ? prev : [ride, ...prev]));
//       });
//     };
//     client.activate();
//     return () => {
//       client.deactivate();
//     };
//     // eslint-disable-next-line
//   }, [cab, myLoc.lat, myLoc.lng]);

//   // --- 3. Accept Ride and flag as active ---
//   const handleAccept = (ride) => {
//     fetch("http://localhost:8077/api/bookings/accept", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         bookingId: ride.bookingId,
//         cabId: cab.id,
//       }),
//     })
//       .then((res) => {
//         if (res.ok) {
//           setMsg("You accepted the ride. Updating and tracking location...");
//           setActiveRide(ride);
//           setRideRequests((reqs) =>
//             reqs.filter((r) => r.bookingId !== ride.bookingId)
//           );
//         } else {
//           setMsg("Failed to accept ride (maybe already accepted).");
//         }
//       })
//       .catch(() => setMsg("Network error accepting ride!"));
//   };

//   // --- 4. Complete Ride and stop tracking, and poll for booking status ---
//   const handleCompleteRide = () => {
//     if (!activeRide) return;
//     fetch(
//       `http://localhost:8077/api/bookings/${activeRide.bookingId}/status?status=COMPLETED`,
//       {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//       }
//     )
//       .then((res) => {
//         if (res.ok) {
//           setMsg("Ride marked as completed! Ready for next ride.");
//           setActiveRide(null);
//         } else {
//           setMsg("Failed to complete ride.");
//         }
//       })
//       .catch(() => setMsg("Network error while completing ride!"));
//   };

  // // Poll booking status during "ride in progress"
  // useEffect(() => {
  //   if (!activeRide) return;
  //   const interval = setInterval(() => {
  //     fetch(`http://localhost:8077/api/bookings/${activeRide.bookingId}`)
  //       .then((res) => res.json())
  //       .then((data) => {
  //         console.log("Polled booking status:", data.status, "for booking", activeRide.bookingId);
  //         if (
  //           data.status &&
  //           data.status.toUpperCase() === "COMPLETED"
  //         ) {
  //           setMsg("Ride completed! Ready for next ride.");
  //           setActiveRide(null);
  //         }
  //       });
  //   }, 4000);
  //   return () => clearInterval(interval);
  // }, [activeRide]);

//   // --- UI Rendering ---
//   return (
//     <div
//       style={{
//         maxWidth: 600,
//         margin: "30px auto",
//         background: "#fff",
//         borderRadius: 12,
//         padding: 28,
//         boxShadow: "0 0 24px #0001",
//       }}
//     >
//       <h2 style={{ marginTop: 0, marginBottom: 18, color: "#29377b" }}>
//         Cab Driver Dashboard
//       </h2>
//       <div style={{ marginBottom: 14, fontSize: "1.1em" }}>
//         <b>Cab:</b> {cab.cabNumber} ({cab.model})<br />
//         <b>Live Location:</b> {myLoc.lat.toFixed(5)}, {myLoc.lng.toFixed(5)}
//         <button
//           onClick={onLogout}
//           style={{
//             float: "right",
//             marginRight: 0,
//             fontWeight: "bold",
//             padding: "6px 18px",
//             borderRadius: 8,
//             border: "none",
//             background: "#eb3766",
//             color: "#fff",
//             cursor: "pointer",
//             fontSize: 15,
//           }}
//         >
//           Logout
//         </button>
//       </div>
//       {msg && (
//         <div
//           style={{
//             color:
//               msg.startsWith("You") ||
//               msg.includes("success") ||
//               msg.includes("completed")
//                 ? "#2ca12c"
//                 : "red",
//             margin: "10px 0",
//             fontWeight: "bold",
//           }}
//         >
//           {msg}
//         </div>
//       )}
//       <hr style={{ margin: "18px 0 18px 0" }} />
//       {activeRide ? (
//         <>
//           <h3 style={{ color: "#3a0dab", marginTop: 0 }}>Current Ride In Progress</h3>
//           <div
//             style={{
//               margin: 10,
//               padding: 16,
//               background: "#f9faff",
//               borderRadius: 8,
//               boxShadow: "0 2px 8px #00000013",
//               fontSize: "1.05em",
//             }}
//           >
//             <b>Booking:</b> {activeRide.bookingId}
//             <br />
//             <b>Pickup:</b> {activeRide.pickupLat}, {activeRide.pickupLng}
//             <br />
//             <b>Drop:</b> {activeRide.dropLat}, {activeRide.dropLng}
//             <br />
//             <b>User Id:</b> {activeRide.userId}
//             <br />
//             <em style={{ color: "#4368d6" }}>
//               Live trip! Location auto-updating...
//             </em>
//             <br />
//             <button
//               style={{
//                 marginTop: 18,
//                 padding: "10px 22px",
//                 background: "#2d58e5",
//                 color: "#fff",
//                 border: "none",
//                 borderRadius: 7,
//                 fontWeight: "bold",
//                 letterSpacing: "1px",
//                 fontSize: "1em",
//               }}
//               onClick={handleCompleteRide}
//             >
//               Complete Ride
//             </button>
//           </div>
//         </>
//       ) : (
//         <>
//           <h3 style={{ color: "#3a0dab", marginTop: 0 }}>New Ride Requests (nearby)</h3>
//           {rideRequests.length === 0 ? (
//             <div style={{ color: "#7a7a7a", padding: "10px 0" }}>
//               {msg ? msg : "No new ride requests in your area."}
//             </div>
//           ) : (
//             rideRequests.map((ride) => (
//               <div
//                 key={ride.bookingId}
//                 style={{
//                   margin: "16px 0",
//                   padding: "13px 15px",
//                   background: "#f3eaff",
//                   borderRadius: 8,
//                   boxShadow: "0 2px 8px #00000007",
//                   fontSize: "1.04em",
//                 }}
//               >
//                 <b>Booking:</b> {ride.bookingId}
//                 <br />
//                 <b>Pickup:</b> {ride.pickupLat}, {ride.pickupLng}
//                 <br />
//                 <b>Drop:</b> {ride.dropLat}, {ride.dropLng}
//                 <br />
//                 <b>User Id:</b> {ride.userId}
//                 <br />
//                 <button
//                   onClick={() => handleAccept(ride)}
//                   style={{
//                     marginTop: 12,
//                     padding: "8px 19px",
//                     background: "#0a8957",
//                     color: "#fff",
//                     border: "none",
//                     borderRadius: 6,
//                     fontWeight: "bold",
//                     fontSize: "1em",
//                   }}
//                 >
//                   Accept Ride
//                 </button>
//               </div>
//             ))
//           )}
//         </>
//       )}
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

// Haversine formula to calculate distance between two points (in km)
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (Math.PI / 180) * (lat2 - lat1);
  const dLon = (Math.PI / 180) * (lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function CabDriverDashboard({ cab, onLogout }) {
  const [rideRequests, setRideRequests] = useState([]);
  const [msg, setMsg] = useState("");
  const [activeRide, setActiveRide] = useState(null);
  const [myLoc, setMyLoc] = useState(() =>
    cab?.currentLocation
      ? { lat: cab.currentLocation.latitude, lng: cab.currentLocation.longitude }
      : { lat: 18.55, lng: 73.91 }
  );

  // --- 1. Always update cab location (GPS or simulation) while dashboard loaded ---
  useEffect(() => {
    if (!cab || !cab.id) return;

    let watchId, interval;

    function sendLocation(lat, lng) {
      fetch(`http://localhost:8076/api/cabs/${cab.id}/location`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: lat, longitude: lng })
      });
    }

    // Preferred: live GPS
    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        pos => {
          setMyLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          sendLocation(pos.coords.latitude, pos.coords.longitude);
          console.log("called geolocation pos")
        },
        err => {
          // fallback: simulate random "drive"
          console.log("called err")
          interval = setInterval(() => {
            setMyLoc(prev => {
              const dlat = (Math.random() - 0.5) * 0.002;
              const dlng = (Math.random() - 0.5) * 0.002;
              const newLoc = {
                lat: prev.lat + dlat,
                lng: prev.lng + dlng
              };
              sendLocation(newLoc.lat, newLoc.lng);
              return newLoc;
            });
          }, 8000);
        },
        { enableHighAccuracy: true, maximumAge: 4000, timeout: 15000 }
      );
    } else {
      interval = setInterval(() => {
        setMyLoc(prev => {
            console.log("Randomly assign")
          const dlat = (Math.random() - 0.5) * 0.002;
          const dlng = (Math.random() - 0.5) * 0.002;
          const newLoc = {
            lat: prev.lat + dlat,
            lng: prev.lng + dlng
          };
          sendLocation(newLoc.lat, newLoc.lng);
          return newLoc;
        });
      }, 8000);
    }
    return () => {
      if (watchId && navigator.geolocation) navigator.geolocation.clearWatch(watchId);
      if (interval) clearInterval(interval);
    };
  }, [cab]);

  // --- 2. WebSocket ride request subscription ---
  useEffect(() => {
    if (!cab || !myLoc.lat) return;
    const ws = new SockJS("http://localhost:8076/ws");
    const client = new Client({ webSocketFactory: () => ws, reconnectDelay: 5000 });
    client.onConnect = () => {
      client.subscribe("/topic/cab-requests", msg => {
        console.log("WebSocket ride message!", msg.body);
        const ride = JSON.parse(msg.body);
        console.log(ride)
        // Only show requests within 10km (use smaller for production)
        const d = haversine(myLoc.lat, myLoc.lng, ride.pickupLat, ride.pickupLng);
            if (d <= 20) {
            setRideRequests(prev => (prev.some(r => r.bookingId === ride.bookingId) ? prev : [ride, ...prev]));
            }
        setRideRequests(prev => (prev.some(r => r.bookingId === ride.bookingId) ? prev : [ride, ...prev]));
      });
    };
    client.activate();
    return () => {
      client.deactivate();
    };
    // eslint-disable-next-line
  }, [cab, myLoc.lat, myLoc.lng]);

  // --- 3. Accept Ride and flag as active ---
  const handleAccept = ride => {
    fetch("http://localhost:8077/api/bookings/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: ride.bookingId, cabId: cab.id })
    })
      .then(res => {
        if (res.ok) {
          setMsg("You accepted the ride. Updating and tracking location...");
          setActiveRide(ride);
          setRideRequests(reqs => reqs.filter(r => r.bookingId !== ride.bookingId));
          console.log("Successfully accepted the ride")
        } else {
          setMsg("Failed to accept ride (maybe already accepted).");
        }
      })
      .catch(() => setMsg("Network error accepting ride!"));
  };

  // --- 4. Optionally: Complete Ride and stop tracking ---
  const handleCompleteRide = () => {
    // You should implement this endpoint in your backend!
    if (!activeRide) return;
    fetch(`http://localhost:8077/api/bookings/${activeRide.bookingId}/status?status=COMPLETED`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    })
      .then(res => {
        if (res.ok) {
          setMsg("Ride marked as completed!");
          setActiveRide(null);
        } else {
          setMsg("Failed to complete ride.");
        }
      })
      .catch(() => setMsg("Network error while completing ride!"));
  };
    // Poll booking status during "ride in progress"
  useEffect(() => {
    if (!activeRide) return;
    const interval = setInterval(() => {
      fetch(`http://localhost:8077/api/bookings/${activeRide.bookingId}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Polled booking status:", data.status, "for booking", activeRide.bookingId);
          if (
            data.status &&
            data.status.toUpperCase() === "COMPLETED"
          ) {
            setMsg("Ride completed! Ready for next ride.");
            setActiveRide(null);
          }
        });
    }, 4000);
    return () => clearInterval(interval);
  }, [activeRide]);

  return (
    <div style={{ maxWidth: 600, margin: "30px auto", background: "#FFF", borderRadius: 10, padding: 32, boxShadow: "0 0 24px #0001" }}>
      <h2>Cab Driver Dashboard</h2>
      <div style={{ marginBottom: 12 }}>
        <b>Cab:</b> {cab.cabNumber} ({cab.model})<br />
        <b>Live Location:</b> {myLoc.lat.toFixed(5)}, {myLoc.lng.toFixed(5)}
        <button onClick={onLogout} style={{ float: "right" }}>Logout</button>
      </div>
      {msg && <div style={{ color: msg.startsWith("You") || msg.includes("success") ? "green" : "red", margin: "10px 0" }}>{msg}</div>}
      <hr />
      {activeRide ? (
        <>
          <h3>Current Ride In Progress</h3>
          <div style={{ margin: 10, padding: 10, background: "#f5f5f9", borderRadius: 6 }}>
            <b>Booking:</b> {activeRide.bookingId}<br />
            <b>Pickup:</b> {activeRide.pickupLat}, {activeRide.pickupLng}<br />
            <b>Drop:</b> {activeRide.dropLat}, {activeRide.dropLng}<br />
            <b>User Id:</b> {activeRide.userId}<br />
            <em>Live trip! Location auto-updating...</em><br />
            <button style={{marginTop:12}} onClick={handleCompleteRide}>Complete Ride</button>
          </div>
        </>
      ) : (
        <>
          <h3>New Ride Requests (nearby)</h3>
          {rideRequests.length === 0 ? (
            <div>No new ride requests in your area.</div>
          ) : (
            rideRequests.map(ride => (
              <div key={ride.bookingId}
                   style={{ margin: 10, padding: 10, background: "#f9f9f9", borderRadius: 6, boxShadow: "0 2px 8px #00000011" }}>
                <b>Booking:</b> {ride.bookingId}<br />
                <b>Pickup:</b> {ride.pickupLat}, {ride.pickupLng}<br />
                <b>Drop:</b> {ride.dropLat}, {ride.dropLng}<br />
                <b>User Id:</b> {ride.userId}<br />
                <button onClick={() => handleAccept(ride)}>Accept Ride</button>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}