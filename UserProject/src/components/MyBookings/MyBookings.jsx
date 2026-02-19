// import React, { useState, useEffect } from 'react';
// import './MyBookings.css';


// const API_BASE_URL = "http://localhost:8077/api/bookings";

// const MyBookings = ({ user }) => {
//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [filterStatus, setFilterStatus] = useState('ALL');

//   useEffect(() => {
//     if (user) {
//       fetchUserBookings();
//     }
//   }, [user]);

//   const fetchUserBookings = async () => {
//     if (!user) return;
//     setLoading(true);
//     setError('');
//     try {
//       const response = await fetch(`${API_BASE_URL}/user/${user.id}`);
//       if (response.ok) {
//         const userBookings = await response.json();
//         console.log("Bookings fetched from backend:", userBookings); // <-- HERE
//         setBookings(userBookings);
//       } else {
//         setError('Failed to fetch bookings');
//       }
//     } catch (err) {
//       setError('Error fetching bookings');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updateBookingStatus = async (bookingId, newStatus) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/${bookingId}/status?status=${newStatus}`, {
//         method: 'PUT',
//         headers: {'Content-Type': 'application/json'}
//       });
//       if (response.ok) {
//         setBookings(prevBookings =>
//           prevBookings.map(booking =>
//             booking.id === bookingId
//               ? { ...booking, status: newStatus }
//               : booking
//           )
//         );
//       } else {
//         setError('Failed to update booking status');
//       }
//     } catch (err) {
//       setError('Error updating booking status');
//     }
//   };

//   const cancelBooking = async (bookingId) => {
//     if (window.confirm('Are you sure you want to cancel this booking?')) {
//       try {
//         const response = await fetch(`${API_BASE_URL}/${bookingId}/cancel`, {
//           method: 'PUT',
//           headers: {'Content-Type': 'application/json'}
//         });
//         if (response.ok) {
//           setBookings(prevBookings =>
//             prevBookings.map(booking =>
//               booking.id === bookingId
//                 ? { ...booking, status: 'CANCELLED' }
//                 : booking
//             )
//           );
//         } else {
//           setError('Failed to cancel booking');
//         }
//       } catch (err) {
//         setError('Error cancelling booking');
//       }
//     }
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'CONFIRMED':
//         return '#28a745';
//       case 'IN_PROGRESS':
//         return '#ffc107';
//       case 'COMPLETED':
//         return '#17a2b8';
//       case 'CANCELLED':
//         return '#dc3545';
//       case 'PENDING':
//         return '#6c757d';
//       default:
//         return '#6c757d';
//     }
//   };

//   const getStatusLabel = (status) => {
//     return status.replace('_', ' ').toLowerCase();
//   };

//   const filteredBookings = bookings.filter(booking => {
//     if (filterStatus === 'ALL') return true;
//     return booking.status === filterStatus;
//   });

//   if (!user) {
//     return (
//       <div className="my-bookings-container">
//         <div className="no-user-message">
//           <h2>Please login to view your bookings</h2>
//         </div>
//       </div>
//     );
//   }

//   if (loading) {
//     return (
//       <div className="my-bookings-container">
//         <div className="loading-message">
//           <h2>Loading your bookings...</h2>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="my-bookings-container">
//       <div className="bookings-card">
//         <div className="bookings-header">
//           <h2>My Bookings</h2>
//           <div className="filter-controls">
//             <label htmlFor="statusFilter">Filter by Status:</label>
//             <select
//               id="statusFilter"
//               value={filterStatus}
//               onChange={(e) => setFilterStatus(e.target.value)}
//             >
//               <option value="ALL">All Bookings</option>
//               <option value="PENDING">Pending</option>
//               <option value="CONFIRMED">Confirmed</option>
//               <option value="IN_PROGRESS">In Progress</option>
//               <option value="COMPLETED">Completed</option>
//               <option value="CANCELLED">Cancelled</option>
//             </select>
//           </div>
//         </div>

//         {error && <div className="error-message">{error}</div>}

//         {filteredBookings.length === 0 ? (
//           <div className="no-bookings">
//             <h3>No bookings found</h3>
//             <p>You haven't made any bookings yet.</p>
//           </div>
//         ) : (
//           <div className="bookings-list">
//             {filteredBookings.map(booking => (
//               <div key={booking.id} className="booking-item">
//                 <div className="booking-header">
//                   <h3>Booking #{booking.id}</h3>
//                   <span 
//                     className="status-badge"
//                     style={{ backgroundColor: getStatusColor(booking.status) }}
//                   >
//                     {getStatusLabel(booking.status)}
//                   </span>
//                 </div>

//                 <div className="booking-details">
//                   <div className="detail-row">
//                     {/* <div className="detail-group">
//                       <label>Pickup Location:</label>
//                       <span>{booking.pickupLocation}</span>
//                     </div>
//                     <div className="detail-group">
//                       <label>Drop Location:</label>
//                       <span>{booking.dropLocation}</span>
//                     </div> */}
//                     <div className="detail-group">
//                       <label>Pickup Location:</label>
//                       <span>
//                         {booking.pickupLocation
//                           ? `${booking.pickupLocation.address}, ${booking.pickupLocation.city}, ${booking.pickupLocation.state}`
//                           : ''}
//                       </span>
//                     </div>
//                     <div className="detail-group">
//                         <label>Drop Location:</label>
//                         <span>
//                           {booking.dropLocation
//                             ? `${booking.dropLocation.address}, ${booking.dropLocation.city}, ${booking.dropLocation.state}`
//                             : ''}
//                         </span>
//                       </div>
//                   </div>

//                   <div className="detail-row">
//                     <div className="detail-group">
//                       <label>Cab Type:</label>
//                       <span>{`${booking.cabType}`}</span>
//                     </div>
//                     <div className="detail-group">
//                       <label>Pickup Time:</label>
//                       <span>{new Date(booking.pickupTime).toLocaleString()}</span>
//                     </div>
//                   </div>

//                   {booking.estimatedFare && (
//                     <div className="detail-row">
//                       <div className="detail-group">
//                         <label>Estimated Fare:</label>
//                         <span className="fare">₹{booking.estimatedFare}</span>
//                       </div>
//                       <div className="detail-group">
//                         <label>Booking Date:</label>
//                         <span>{new Date(booking.createdAt || booking.bookingDate).toLocaleDateString()}</span>
//                       </div>
//                     </div>
//                   )}

//                   {booking.specialRequests && (
//                     <div className="detail-group full-width">
//                       <label>Special Requests:</label>
//                       <span>{booking.specialRequests}</span>
//                     </div>
//                   )}
//                 </div>

//                 <div className="booking-actions">
//                   {booking.status === 'PENDING' && (
//                     <>
//                       <button
//                         className="btn-confirm"
//                         onClick={() => updateBookingStatus(booking.id, 'CONFIRMED')}
//                       >
//                         Confirm
//                       </button>
//                       <button
//                         className="btn-cancel"
//                         onClick={() => cancelBooking(booking.id)}
//                       >
//                         Cancel
//                       </button>
//                     </>
//                   )}

//                   {booking.status === 'CONFIRMED' && (
//                     <button
//                       className="btn-cancel"
//                       onClick={() => cancelBooking(booking.id)}
//                     >
//                       Cancel
//                     </button>
//                   )}

//                   {booking.status === 'COMPLETED' && (
//                     <button
//                       className="btn-rate"
//                       onClick={() => alert('Rating feature coming soon!')}
//                     >
//                       Rate Trip
//                     </button>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MyBookings; 

import React, { useState, useEffect } from 'react';
import './MyBookings.css';

const API_BASE_URL = "http://localhost:8077/api/bookings";
//const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/booking`;
const MyBookings = ({ user }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    if (user) {
      fetchUserBookings();
    }
  }, [user]);

  const fetchUserBookings = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/user/${user.id}`);
      if (response.ok) {
        const userBookings = await response.json();
        setBookings(userBookings);
      } else {
        setError('Failed to fetch bookings');
      }
    } catch (err) {
      setError('Error fetching bookings');
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filterStatus === 'ALL') return true;
    return booking.status === filterStatus;
  });

  // --- Util renderers ---
  const safeLoc = loc =>
    loc
      ? (loc.address
        ? loc.address
        : `${(loc.latitude != null ? loc.latitude : "--")}, ${(loc.longitude != null ? loc.longitude : "--")}`)
      : "--";
  // Booking time renderer
  const formatDateTime = dt => dt && new Date(dt).getFullYear() > 1980
    ? new Date(dt).toLocaleString()
    : "--";
  // Distance renderer
  const formatDistance = km => km != null ? `${km.toFixed(2)} km` : "--";

  if (!user) {
    return (
      <div className="my-bookings-container">
        <div className="no-user-message">
          <h2>Please login to view your bookings</h2>
        </div>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="my-bookings-container">
        <div className="loading-message">
          <h2>Loading your bookings...</h2>
        </div>
      </div>
    );
  }
  return (
    <div className="my-bookings-container">
      <div className="bookings-card">
        <div className="bookings-header">
          <h2>My Bookings</h2>
          <div className="filter-controls">
            <label htmlFor="statusFilter">Filter by Status:</label>
            <select
              id="statusFilter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">All Bookings</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
        {error && <div className="error-message">{error}</div>}
        {filteredBookings.length === 0 ? (
          <div className="no-bookings">
            <h3>No bookings found</h3>
            <p>You haven't made any bookings yet.</p>
          </div>
        ) : (
          <div className="bookings-list">
            {filteredBookings.map(booking => (
              <div key={booking.id} className="booking-item">
                <div className="booking-header">
                  <h3>Booking #{booking.id}</h3>
                  <span
                    className={`status-badge status-${booking.status?.toLowerCase() || ""}`}
                  >
                    {booking.status
                      ? booking.status.replace('_', ' ').toLowerCase()
                      : "--"}
                  </span>
                </div>
                <div className="booking-details">
                  <div className="detail-row">
                    <div className="detail-group">
                      <label>Pickup Location:</label>
                      <span>{safeLoc(booking.pickupLocation)}</span>
                    </div>
                    <div className="detail-group">
                      <label>Drop Location:</label>
                      <span>{safeLoc(booking.dropLocation)}</span>
                    </div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-group">
                      <label>Booking Time:</label>
                      <span>{formatDateTime(booking.bookingTime)}</span>
                    </div>
                    <div className="detail-group">
                      <label>Status:</label>
                      <span>
                        {booking.status ? booking.status.replace("_", " ") : "--"}
                      </span>
                    </div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-group">
                      <label>Fare:</label>
                      <span>
                        {booking.fare != null ? `₹${booking.fare.toFixed(2)}` : "--"}
                      </span>
                    </div>
                    <div className="detail-group">
                      <label>Distance:</label>
                      <span>{formatDistance(booking.distance)}</span>
                    </div>
                  </div>
                </div>
                {/* Actions/buttons as per your logic */}
                <div className="booking-actions">
                  {booking.status === 'PENDING' && (
                    <button
                      className="btn-cancel"
                      onClick={() => window.alert('Cancel not implemented')}
                    >
                      Cancel
                    </button>
                  )}
                  {booking.status === 'COMPLETED' && (
                    <button
                      className="btn-rate"
                      onClick={() => window.alert('Rating feature coming soon!')}
                    >
                      Rate Trip
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default MyBookings;