import React, { useEffect, useState, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import MapWithCabs from "./MapWithCabs";
import RideRequestForm from "./RideRequestForm";
import api from "../../services/api";

export default function UserRidePage({ user, pickupLocation, dropLocation, setCurrentPage, setSelectedBooking }) {
  const [assignedCab, setAssignedCab] = useState(null);
  const [driverLoc, setDriverLoc] = useState(null);
  const [bookingStatus, setBookingStatus] = useState("awaiting"); // awaiting, assigned, completed
  const [fare, setFare] = useState(null);
  const pollIntervalRef = useRef(null);
  const statusPollRef = useRef(null);

  // Restore state from localStorage if available
  useEffect(() => {
    const savedRide = localStorage.getItem('currentUserRide');
    if (savedRide) {
      try {
        const ride = JSON.parse(savedRide);
        console.log("🔄 Restoring saved ride:", ride);

        // Map backend booking object to assignedCab format
        // Expected ride structure: { id, cabId, cabDetails: {...}, driver: {...}, status, ... }
        // Or if it's the raw booking response: { id, cabId, fare, ... }

        // We assume ride has cabId. We might need to fetch driver details if not in ride object.
        // For now, let's try to set what we have.

        setAssignedCab({
          bookingId: ride.id,
          cabId: ride.cabId,
          // Fallbacks if detailed info isn't in the booking response immediately
          driverName: ride.driverName || "Driver",
          cabNumber: ride.cabNumber || "CAB-1234",
          model: ride.carModel || "Sedan",
          cabType: ride.cabType || "Comfort"
        });

        setBookingStatus('assigned');
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
            bookingId: data.booking.id
          });
          setBookingStatus("assigned");
          setFare(data.booking.fare);
        }
      });

      // Listen for Errors/No Drivers
      client.subscribe(`/topic/user/${uid}/error`, (msg) => {
        const data = JSON.parse(msg.body);
        console.error("❌ Ride Error:", data);
        alert(data.message || "An error occurred");
        setBookingStatus("awaiting"); // Reset or keep waiting?
      });
    };
    client.activate();
    return () => client.deactivate();
  }, [user]);

  // 2. Poll driver's latest location when assigned
  useEffect(() => {
    if (!assignedCab?.cabId) {
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
          alert("Payment successful! Payment ID: " + response.razorpay_payment_id);
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

  if (!assignedCab && bookingStatus === "awaiting") {
    return (
      <div>
        <MapWithCabs
          userLocation={pickupLocation}
          setDropLocation={() => { }}
          setPickupLocation={() => { }}
          setCurrentPage={() => { }}
        />
        <RideRequestForm
          user={user}
          pickupLocation={pickupLocation}
          dropLocation={dropLocation}
          onSuccess={() => setBookingStatus("awaiting")}
        />
        <div style={{ margin: "18px", color: "#6848ff" }}>Ride requested. Awaiting driver assignment...</div>
      </div>
    );
  }

  // Tracking & Payment UI
  return (
    <div>
      <MapWithCabs
        userLocation={pickupLocation}
        dropLocation={dropLocation}
        driverLocation={driverLoc}
        assignedCab={assignedCab}
        showRoute={bookingStatus === "assigned"} // Show blue line after assigned, until payment
      />
      {bookingStatus === 'assigned' && assignedCab && (
        <div style={{
          padding: "18px",
          background: "#e8e7fd",
          borderRadius: 12,
          margin: "20px 0",
          fontSize: "1.10em"
        }}>
          <b>Your driver is on the way!</b>
          <br />
          <b>Name:</b> {assignedCab.driverName}<br />
          <b>Vehicle:</b> {assignedCab.cabNumber} ({assignedCab.model}, {assignedCab.cabType})<br />
          <b>Driver's live location:</b> {driverLoc ? `${driverLoc.lat.toFixed(5)}, ${driverLoc.lng.toFixed(5)}` : "fetching..."}
          <br />
          <span style={{ color: "green" }}>Watch your cab approach in real time!</span>
          <br /><br />
          <span style={{
            fontWeight: 700,
            fontSize: 19,
            background: "#d4f1ea",
            padding: "8px 16px",
            borderRadius: 8,
            display: "inline-block",
            color: "#143c2c"
          }}>
            Fare: ₹{fare !== null ? fare.toFixed(2) : "Loading..."}
          </span>
          <br /><br />
          <div style={{ color: "green", marginTop: "10px" }}>
            The payment window will appear automatically once the driver completes the ride.
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
                  alert("Ride is not yet marked as completed by driver.");
                }
              }
            }}
            className="btn btn-sm btn-primary mt-2"
          >
            Check Ride Status / Pay
          </button>
        </div>
      )}

      {bookingStatus === 'completed' && (
        <div style={{
          padding: "20px",
          background: "#E1FFE1",
          borderRadius: 10,
          margin: "24px 0",
          color: "#057415",
          fontWeight: "bold",
          fontSize: "1.24em"
        }}>
          🎉 Thank you for riding! Payment received.
        </div>
      )}
    </div>
  );
}

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