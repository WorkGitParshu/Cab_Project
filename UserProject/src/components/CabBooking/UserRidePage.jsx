import React, { useEffect, useState, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import RideRequestForm from "./RideRequestForm";
import api from "../../services/api";
import Toast from "../Common/Toast";
import "./UserRidePage.css";

export default function UserRidePage({ user, pickupLocation, dropLocation, setCurrentPage, setSelectedBooking }) {
  const [assignedCab, setAssignedCab] = useState(null);
  const [driverLoc, setDriverLoc] = useState(null);
  const [bookingStatus, setBookingStatus] = useState("awaiting"); // awaiting, assigned, completed
  const [fare, setFare] = useState(null);
  const pollIntervalRef = useRef(null);
  const statusPollRef = useRef(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const [pickupLoc, setPickupLoc] = useState(pickupLocation);
  const [dropLoc, setDropLoc] = useState(dropLocation);

  // Restore state from localStorage if available
  useEffect(() => {
    const savedRide = localStorage.getItem('currentUserRide');
    const savedLocs = localStorage.getItem('rideLocations');

    if (savedLocs) {
      try {
        const locs = JSON.parse(savedLocs);
        if (!pickupLocation) setPickupLoc(locs.pickup);
        if (!dropLocation) setDropLoc(locs.drop);
      } catch (e) { }
    }

    if (savedRide) {
      try {
        const ride = JSON.parse(savedRide);
        console.log("🔄 Restoring saved ride:", ride);

        const isAssigned = ride.status === 'CONFIRMED' || ride.status === 'ASSIGNED';
        const isCompleted = ride.status === 'COMPLETED';

        setAssignedCab({
          bookingId: ride.id,
          cabId: ride.cabId,
          driverName: ride.driverName || ride.driver?.name || "Connecting...",
          cabNumber: ride.cabNumber || ride.driver?.cabNumber || "...",
          model: ride.carModel || ride.driver?.model || "Sedan",
          cabType: ride.cabType || ride.driver?.cabType || "Ride"
        });

        if (isAssigned) {
          setBookingStatus('assigned');
        } else if (isCompleted) {
          setBookingStatus('completed');
        } else {
          setBookingStatus('awaiting');
        }

        setFare(ride.estimatedFare || ride.fare);

      } catch (e) {
        console.error("Error restoring ride:", e);
      }
    }
  }, []);

  // Status Polling to detect ride completion by driver
  useEffect(() => {
    if (assignedCab?.bookingId) {
      statusPollRef.current = setInterval(async () => {
        try {
          const res = await api.get(`http://localhost:8077/api/bookings/${assignedCab.bookingId}`);
          if (res.status === 200) {
            const booking = res.data;
            if (booking.status === 'COMPLETED') {
              console.log("🏁 Ride completed detected in UserRidePage! Moving to payment.");
              clearInterval(statusPollRef.current);
              if (setSelectedBooking && setCurrentPage) {
                setSelectedBooking(booking);
                setCurrentPage('payment');
              }
            } else if (['ASSIGNED', 'CONFIRMED', 'ACCEPTED'].includes(booking.status)) {
              if (bookingStatus === 'awaiting') {
                setBookingStatus('assigned');
                setAssignedCab(prev => ({
                  ...prev,
                  driverName: booking.driverName || booking.driver?.name || "Driver",
                  cabNumber: booking.cabNumber || booking.driver?.cabNumber || "...",
                  model: booking.carModel || booking.driver?.model || "Sedan",
                  cabType: booking.cabType || booking.driver?.cabType || "Standard",
                  cabId: booking.cabId
                }));
                if (booking.estimatedFare || booking.fare) {
                  setFare(booking.estimatedFare || booking.fare);
                }
              }
            }
          }
        } catch (err) {
          console.error("Status polling error in UserRidePage:", err);
        }
      }, 3000);
    }
    return () => {
      if (statusPollRef.current) clearInterval(statusPollRef.current);
    };
  }, [assignedCab, setCurrentPage, setSelectedBooking]);

  // 1. WebSocket: listen for assignment
  useEffect(() => {
    const uid = user && user.id;
    if (!uid) return;
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8077/ws"),
      reconnectDelay: 5000,
    });
    client.onConnect = () => {
      // Listen for Confirmation
      client.subscribe(`/topic/user/${uid}/confirmation`, (msg) => {
        const data = JSON.parse(msg.body);
        console.log("✅ Ride Confirmed:", data);
        if (data.status === "CONFIRMED" && data.driver) {
          setAssignedCab({
            ...data.driver,
            cabId: data.driver.id, // Map for polling
            bookingId: data.booking.id,
            driverName: data.driver.driverName || data.driver.name || "Driver",
            cabNumber: data.driver.cabNumber || "Unknown",
            model: data.driver.model || "Sedan",
            cabType: data.driver.cabType || "Standard"
          });
          setBookingStatus("assigned");
          setFare(data.booking.fare);
        }
      });

      // Listen for Errors/No Drivers
      client.subscribe(`/topic/user/${uid}/error`, (msg) => {
        const data = JSON.parse(msg.body);
        console.error("❌ Ride Error:", data);
        // alert(data.message || "An error occurred"); // REMOVED
        showToast(data.message || "An error occurred", "error");
        setBookingStatus("awaiting"); // Reset or keep waiting?
      });
    };
    client.activate();
    return () => client.deactivate();
  }, [user]);

  // 2. Poll driver's latest location when assigned
  useEffect(() => {
    if (!assignedCab?.cabId || bookingStatus === 'completed') {
      setDriverLoc(null);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      return;
    }
    pollIntervalRef.current = setInterval(() => {
      api.get(`http://localhost:8076/api/cabs/${assignedCab.cabId}`)
        .then((res) => res.data)
        .then((cab) => {
          if (cab?.currentLocation)
            setDriverLoc({
              lat: cab.currentLocation.latitude,
              lng: cab.currentLocation.longitude,
            });
        });
    }, 3000);
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [assignedCab]);

  // 3. Fetch fare after assignment
  useEffect(() => {
    if (bookingStatus === "assigned" && assignedCab?.bookingId) {
      api.get(`http://localhost:8077/api/bookings/${assignedCab.bookingId}`)
        .then(res => res.data)
        .then(data => setFare(data.fare));
    }
  }, [bookingStatus, assignedCab]);

  // 4. Razorpay & update ride status
  function handlePayNow() {
    if (!fare) return;
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = openRazorpay;
      document.body.appendChild(script);
    } else {
      openRazorpay();
    }

    function openRazorpay() {
      const options = {
        key: "rzp_test_RKES1KKOMVrBea", // replace with your key
        amount: Math.round(fare * 100),
        currency: "INR",
        name: "CabBook",
        description: "Cab ride payment",
        handler: function (response) {
          // alert("Payment successful! Payment ID: " + response.razorpay_payment_id); // REMOVED
          showToast("Payment successful! ID: " + response.razorpay_payment_id, "success");
          // update backend status to COMPLETED:
          api.post("http://localhost:8077/api/payments", {
            bookingId: assignedCab.bookingId,
            userId: user.id,
            amount: fare,
            paymentId: response.razorpay_payment_id,
            paymentStatus: "SUCCESS"
          });
          console.log("Booling id to update is:", assignedCab.bookingId);
          api.put(`http://localhost:8077/api/bookings/${assignedCab.bookingId}/status?status=COMPLETED`)
            .then(() => {
              setBookingStatus("completed");
            });
        },
        prefill: {
          email: user.email || "",
          contact: user.phone || ""
        },
        theme: { color: "#297bff" }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    }
  }

  // Distance/Progress Simulation based on Driver Location changes
  // For a real app, calculate distance between driverLoc and pickupLoc/dropLoc
  const trackingProgress = 40 + Math.floor(Math.random() * 20); // Simulated 40-60% progress

  const renderMap = (showRouteActive) => (
    <div className="map-container-wrapper" style={{
      height: '300px',
      background: 'var(--bg-secondary)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div className="car-tracking-animation" style={{ width: '100%', padding: '0 40px', position: 'relative', zIndex: 1 }}>
        {/* Route Line */}
        <div style={{ height: '4px', background: 'rgba(128, 128, 128, 0.3)', width: '100%', borderRadius: '2px', position: 'relative' }}>
          {/* Dynamic progress bar */}
          <div style={{ height: '100%', background: 'var(--accent)', width: `${trackingProgress}%`, borderRadius: '2px', transition: 'width 2s ease-in-out', boxShadow: '0 0 10px var(--accent)' }}></div>

          {/* Car Icon */}
          <div style={{ position: 'absolute', top: '-18px', left: `${trackingProgress}%`, transform: 'translateX(-50%)', fontSize: '28px', transition: 'left 2s ease-in-out', textShadow: '0 5px 10px rgba(0,0,0,0.3)' }}>
            🚕
          </div>

          {/* Endpoint markers */}
          <div style={{ position: 'absolute', top: '-6px', left: '0', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--success)', border: '2px solid var(--bg-primary)' }}></div>
          <div style={{ position: 'absolute', top: '-6px', right: '0', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--danger)', border: '2px solid var(--bg-primary)' }}></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          <span style={{ maxWidth: '40%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pickupLoc?.address || 'Pickup Location'}</span>
          <span style={{ maxWidth: '40%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'right' }}>{dropLoc?.address || 'Dropoff Location'}</span>
        </div>
      </div>

      {/* Background Decor */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '400px', height: '400px', borderRadius: '50%', border: '2px dashed var(--accent)', opacity: 0.1, animation: 'spin 30s linear infinite' }}></div>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '250px', height: '250px', borderRadius: '50%', border: '2px dashed var(--accent)', opacity: 0.15, animation: 'spin 20s linear infinite reverse' }}></div>
    </div>
  );

  if (bookingStatus === "awaiting") {
    return (
      <div className="user-ride-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '60vh' }}>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        <div className="ride-info-panel text-center animate-fade-in" style={{ padding: '4rem 2rem', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
          <div className="pulse-loader margin-auto mb-4" style={{ margin: '0 auto 2rem auto', width: '80px', height: '80px' }}></div>
          <h2 style={{ color: "white", marginBottom: "15px", fontSize: '2rem' }}>Finding your driver...</h2>
          <p className="text-muted" style={{ fontSize: '1.1rem' }}>Please wait while we connect you to the nearest available driver.</p>
        </div>
      </div>
    );
  }

  // Tracking & Payment UI
  return (
    <div className="user-ride-container">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {bookingStatus === "assigned" && renderMap(true)}

      {bookingStatus === 'assigned' && assignedCab && (
        <div className="ride-info-panel">
          <div className="ride-status-header">
            <div className="status-icon">🚗</div>
            <div className="status-text">
              <h2>Driver En Route</h2>
              <p>Your ride is confirmed and on the way</p>
            </div>
          </div>

          <div className="driver-details-grid">
            <div className="info-item">
              <span className="info-label">Driver Name</span>
              <span className="info-value">{assignedCab.driverName}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Vehicle</span>
              <span className="info-value">{assignedCab.cabNumber}</span>
              <span className="text-sm text-muted">{assignedCab.model} • {assignedCab.cabType}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Live Location</span>
              <span className="info-value text-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                {driverLoc ? `${driverLoc.lat.toFixed(4)}, ${driverLoc.lng.toFixed(4)}` : "Fetching location..."}
              </span>
            </div>
          </div>

          <div className="mt-4 border-t border-white/10 pt-4 flex justify-between items-end">
            <div>
              <p className="payment-note mb-2">Payment window appears after ride completion</p>
              <div className="fare-badge">
                Fare: ₹{fare !== null ? fare.toFixed(2) : "..."}
              </div>
            </div>

            <button
              onClick={async () => {
                if (assignedCab?.bookingId) {
                  const res = await api.get(`http://localhost:8077/api/bookings/${assignedCab.bookingId}`);
                  const b = res.data;
                  if (b.status === 'COMPLETED' && setSelectedBooking && setCurrentPage) {
                    setSelectedBooking(b);
                    setCurrentPage('payment');
                  } else {
                    // alert("Ride is not yet marked as completed by driver."); // REMOVED
                    showToast("Ride is not yet marked as completed by driver.", "warning");
                  }
                }
              }}
              className="action-btn"
            >
              Check Status / Pay
            </button>
          </div>
        </div>
      )}

      {bookingStatus === 'completed' && (
        <div className="ride-completed-panel animate-fade-in">
          <span className="completed-icon">🎉</span>
          <h2 className="completed-title">Ride Completed!</h2>
          <p className="text-muted">Payment received. Thank you for riding with us.</p>
        </div>
      )}
    </div>
  );
};

// import React, { useEffect, useState, useRef } from "react";
// import { Client } from "@stomp/stompjs";
// import SockJS from "sockjs-client";
// import MapWithCabs from "./MapWithCabs";
// import RideRequestForm from "./RideRequestForm";

// export default function UserRidePage({ user, pickupLocation, dropLocation }) {
//   console.log("UserRidePage mounted, user:", user);
//   const [rideRequested, setRideRequested] = useState(false);
//   const [assignedCab, setAssignedCab] = useState(null);
//   const [driverLoc, setDriverLoc] = useState(null);
//   const [bookingStatus, setBookingStatus] = useState("awaiting"); // awaiting, assigned, completed
//   const [fare, setFare] = useState(null);
//   const pollIntervalRef = useRef(null);

//   // ===== 1. Listen for driver assignment via WebSocket =====
//   useEffect(() => {
//     const uid = user && user.id;
//     if (!uid) return;
//     const client = new Client({
//       webSocketFactory: () => new SockJS("http://localhost:8077/ws"),
//       reconnectDelay: 5000,
//       debug: (str) => console.log("STOMP DEBUG:", str),
//     });
//     client.onConnect = () => {
//       console.log("WS Connected for user", uid);
//       client.subscribe(`/queue/user-${uid}`, (msg) => {
//         console.log("User received cab assignment:", msg.body);
//         const cabData = JSON.parse(msg.body);
//         setAssignedCab(cabData);
//         setBookingStatus("assigned");
//         setRideRequested(true);
//       });
//     };
//     client.activate();
//     return () => client.deactivate();
//   }, [user]);

//   // ===== 2. Poll driver's latest location as soon as assigned =====
//   useEffect(() => {
//     if (!assignedCab?.cabId) {
//       setDriverLoc(null);
//       if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
//       return;
//     }
//     pollIntervalRef.current = setInterval(() => {
//       fetch(`http://localhost:8076/api/cabs/${assignedCab.cabId}`)
//         .then((res) => res.json())
//         .then((cab) => {
//           if (cab?.currentLocation)
//             setDriverLoc({
//               lat: cab.currentLocation.latitude,
//               lng: cab.currentLocation.longitude,
//             });
//         });
//     }, 3000);
//     return () => {
//       if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
//     };
//   }, [assignedCab]);

//   // ===== 3. Fetch fare after assignment =====
//   useEffect(() => {
//     if (bookingStatus === "assigned" && assignedCab?.bookingId) {
//       fetch(`http://localhost:8077/api/bookings/${assignedCab.bookingId}`)
//         .then(res => res.json())
//         .then(data => setFare(data.fare));
//     }
//   }, [bookingStatus, assignedCab]);

//   // ===== 4. Razorpay integration =====
//   function handlePayNow() {
//     if (!fare) return;
//     // Load Razorpay script if not already loaded
//     if (!window.Razorpay) {
//       const script = document.createElement("script");
//       script.src = "https://checkout.razorpay.com/v1/checkout.js";
//       script.onload = openRazorpay;
//       document.body.appendChild(script);
//     } else {
//       openRazorpay();
//     }

//     function openRazorpay() {
//       const options = {
//         key: "rzp_test_RJRDJutyi5DwvB", // Replace with your actual Razorpay key
//         amount: Math.round(fare * 100), // Fare in paise
//         currency: "INR",
//         name: "CabBook",
//         description: "Cab ride payment",
//         handler: function (response) {
//           alert("Payment successful! Payment ID: " + response.razorpay_payment_id);
//           setBookingStatus("completed");
//         },
//         prefill: {
//           email: user.email || "",
//           contact: user.phone || ""
//         },
//         theme: { color: "#297bff" }
//       };
//       const rzp = new window.Razorpay(options);
//       rzp.open();
//     }
//   }

//   function handleRideRequestSuccess() {
//     setRideRequested(true);
//     setBookingStatus("awaiting");
//     setAssignedCab(null);
//     setDriverLoc(null);
//     setFare(null);
//   }

//   return (
//     <div>
//       <MapWithCabs
//         userLocation={pickupLocation}
//         dropLocation={dropLocation}
//         driverLocation={driverLoc}
//         assignedCab={assignedCab}
//         showRoute={bookingStatus === "assigned"} // Show blue line after assigned, until payment
//       />

//       {/* Show Form for ride request before booking is placed */}
//       {!rideRequested && (
//         <RideRequestForm
//           user={user}
//           pickupLocation={pickupLocation}
//           dropLocation={dropLocation}
//           onSuccess={handleRideRequestSuccess}
//         />
//       )}

//       {/* Awaiting assignment */}
//       {rideRequested && bookingStatus === 'awaiting' && (
//         <div style={{margin:"18px", color:"#6848ff"}}>
//           Ride requested. Awaiting driver assignment...
//         </div>
//       )}

//       {/* Driver assigned – show fare + "Pay" */}
//       {bookingStatus === 'assigned' && assignedCab && (
//         <div style={{
//           padding:"18px",
//           background:"#e8e7fd",
//           borderRadius:12,
//           margin:"20px 0",
//           fontSize:"1.10em"
//         }}>
//           <b>Your driver is on the way!</b>
//           <br />
//           <b>Name:</b> {assignedCab.driverName}<br />
//           <b>Vehicle:</b> {assignedCab.cabNumber} ({assignedCab.model}, {assignedCab.cabType})<br />
//           <b>Driver's live location:</b> {driverLoc ? `${driverLoc.lat.toFixed(5)}, ${driverLoc.lng.toFixed(5)}` : "fetching..."}
//           <br />
//           <span style={{color:"green"}}>Watch your cab approach in real time!</span>
//           <br /><br />
//           <span style={{
//             fontWeight: 700,
//             fontSize: 19,
//             background:"#d4f1ea",
//             padding:"8px 16px",
//             borderRadius:8,
//             display:"inline-block",
//             color:"#143c2c"
//           }}>
//             Fare: ₹{fare !== null ? fare.toFixed(2) : "Loading..."}
//           </span>
//           <br /><br />
//           <button
//             style={{
//               fontSize: 18,
//               background: "#0b72e7",
//               color: "#fff",
//               border: "none",
//               padding: "12px 26px",
//               borderRadius: 6
//             }}
//             onClick={handlePayNow}
//           >
//             Complete Ride & Pay
//           </button>
//         </div>
//       )}

//       {/* Payment complete / thanks */}
//       {bookingStatus === 'completed' && (
//         <div style={{
//           padding: "20px",
//           background: "#E1FFE1",
//           borderRadius: 10,
//           margin: "24px 0",
//           color: "#057415",
//           fontWeight: "bold",
//           fontSize: "1.24em"
//         }}>
//           🎉 Thank you for riding! Payment received.
//         </div>
//       )}
//     </div>
//   );
// }