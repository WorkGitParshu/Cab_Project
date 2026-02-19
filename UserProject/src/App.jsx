window.global = window;
import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation/Navigation';
import MainLayout from './components/Layout/MainLayout';
import RoleSelection from './components/RoleSelection/RoleSelection';
import Home from './components/Home/Home';
import Login from './components/UserAuth/Login';
import UserProfile from './components/UserAuth/UserProfile';
import Register from './components/UserAuth/Register';
import CabBooking from './components/CabBooking/CabBooking';
import BookCabPage from './components/CabBooking/BookCabPage';
import CabRegister from './components/CabDriver/CabRegister';
import CabLogin from './components/CabDriver/CabLogin';
import CabDriverDashboard from './components/CabDriver/CabDriverDashboard';
import MyBookings from './components/MyBookings/MyBookings';
import Payment from './components/Payment/Payment';
import MapPage from './pages/MapPage';
import './App.css';
import UserRidePage from './components/CabBooking/UserRidePage';
import BookingFlow from './components/CabBooking/BookingFlow';
import UserRideTracking from './components/CabBooking/UserRideTracking';
import DriverDashboardSimple from './components/CabDriver/DriverDashboardSimple';
import QuickAccess from './components/QuickAccess/QuickAccess';
import NotificationToast from './components/Notifications/NotificationToast';

function App() {
  const [userRole, setUserRole] = useState(null); // 'passenger' or 'driver'
  const [user, setUser] = useState(null);
  const [cab, setCab] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropLocation, setDropLocation] = useState(null);
  const [driverData, setDriverData] = useState(null);


  useEffect(() => {
    // Check if role is already selected
    const savedRole = localStorage.getItem('userRole');
    if (savedRole) {
      setUserRole(savedRole);
    } else {
      // default to null to show RoleSelection
      // setUserRole('passenger');
      // localStorage.setItem('userRole', 'passenger');
    }

    // Check if user is logged in on app load
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        localStorage.removeItem('user');
      }
    }

    // Check URL parameters for page navigation
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page');
    if (page) {
      setCurrentPage(page);
    }
  }, []);

  const handleRoleSelect = (role) => {
    setUserRole(role);
    localStorage.setItem('userRole', role);
    setCurrentPage('home');
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentPage('home');
  };

  const handleRegister = (userData) => {
    setUser(userData);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setUser(null);
    setUserRole(null);
    localStorage.removeItem('userRole');
    localStorage.removeItem('user'); // Ensure user data is cleared
    setCurrentPage('home');
    setSelectedBooking(null);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedBooking(null);
  };

  const handlePaymentComplete = (payment) => {
    // Handle payment completion
    console.log('Payment completed:', payment);
    setCurrentPage('bookings');
  };

  const handleCabLogout = () => {
    setCab(null);
    setUserRole(null);
    localStorage.removeItem('userRole');
    setCurrentPage('home');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        if (userRole === 'driver') {
          return <DriverDashboardSimple cab={cab} onLogout={handleCabLogout} />;
        }
        return <Home user={user} onPageChange={handlePageChange} />;
      case 'quick-access':
        return <QuickAccess onPageChange={handlePageChange} />;
      case 'login':
        return <Login onLogin={handleLogin} onSwitchToRegister={() => setCurrentPage('register')} />;
      case 'register':
        return <Register onRegister={handleRegister} onSwitchToLogin={() => setCurrentPage('login')} />;
      // case 'book':
      //   return <CabBooking user={user} />;
      case 'book':
        return <BookCabPage
          user={user}
          pickupLocation={pickupLocation}
          dropLocation={dropLocation}
          setPickupLocation={setPickupLocation}
          setDropLocation={setDropLocation}
          setCurrentPage={setCurrentPage}
        />;
      case 'profile':
        return <UserProfile user={user} />;

      case 'user-ride':
        return <UserRidePage
          user={user}
          pickupLocation={pickupLocation}
          dropLocation={dropLocation}
          setCurrentPage={setCurrentPage}
          setSelectedBooking={setSelectedBooking}
        />;
      case 'bookings':
        return <MyBookings user={user} />;
      case 'payment':
        return <Payment booking={selectedBooking} onPaymentComplete={handlePaymentComplete} />;
      case 'cab-register':
        return <CabRegister onRegister={(cabData) => { setCab(cabData); setCurrentPage('driver-dashboard'); }} />;
      case 'cab-login':
        return <CabLogin onLogin={(cabData) => { setCab(cabData); setCurrentPage('driver-dashboard'); }} />;
      case 'cab-dashboard':
        return <DriverDashboardSimple cab={cab} onLogout={handleCabLogout} />;
      case 'booking-flow':
        return <BookingFlow
          user={user}
          setCurrentPage={setCurrentPage}
          setSelectedBooking={setSelectedBooking}
        />;
      case 'ride-tracking':
        return <UserRideTracking
          onCancel={() => setCurrentPage('home')}
          onRideCompleted={(booking) => {
            setSelectedBooking(booking);
            setCurrentPage('payment');
          }}
        />;
      case 'driver-dashboard':
        return <DriverDashboardSimple cab={cab} onLogout={handleCabLogout} />;
      default:
        return <QuickAccess onPageChange={handlePageChange} />;
    }
  };

  // Show role selection if not selected
  if (!userRole) {
    return (
      <div className="App">
        <RoleSelection onSelectRole={handleRoleSelect} />
      </div>
    );
  }

  return (
    <MainLayout
      userRole={userRole}
      user={user}
      cab={cab}
      onLogout={handleLogout}
      onCabLogout={handleCabLogout}
      currentPage={currentPage}
      onPageChange={handlePageChange}
    >
      {renderCurrentPage()}
      <NotificationToast />
    </MainLayout>
  );
}

export default App;


// import React, { useState, useEffect } from 'react';
// import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
// import Navigation from './components/Navigation/Navigation';
// import Home from './components/Home/Home';
// import Login from './components/UserAuth/Login';
// import UserProfile from './components/UserAuth/UserProfile';
// import Register from './components/UserAuth/Register';
// import MyBookings from './components/MyBookings/MyBookings';
// import Payment from './components/Payment/Payment';
// import MapPage from './pages/MapPage';
// import UserRidePage from './components/CabBooking/UserRidePage';
// import CabRegister from './components/CabDriver/CabRegister';
// import CabLogin from './components/CabDriver/CabLogin';
// import CabDriverDashboard from './components/CabDriver/CabDriverDashboard';
// import './App.css';

// function App() {
//   const [user, setUser] = useState(null);
//   const [cab, setCab] = useState(null);
//   const [selectedBooking, setSelectedBooking] = useState(null);
//   const [pickupLocation, setPickupLocation] = useState(null);
//   const [dropLocation, setDropLocation] = useState(null);

//   useEffect(() => {
//     const savedUser = localStorage.getItem('user');
//     if (savedUser) {
//       try {
//         setUser(JSON.parse(savedUser));
//       } catch {
//         localStorage.removeItem('user');
//       }
//     }
//   }, []);

//   const handleLogin = (userData) => {
//     setUser(userData);
//     localStorage.setItem('user', JSON.stringify(userData));
//   };

//   const handleRegister = (userData) => {
//     setUser(userData);
//     localStorage.setItem('user', JSON.stringify(userData));
//   };

//   const handleLogout = () => {
//     setUser(null);
//     localStorage.removeItem('user');
//     setSelectedBooking(null);
//   };

//   const handleCabLogout = () => {
//     setCab(null);
//   };

//   const handlePaymentComplete = (payment) => {
//     console.log('Payment completed:', payment);
//     // Consider redirecting after payment if needed
//   };

//   return (
//     <BrowserRouter>
//       <Navigation
//         user={user}
//         cab={cab}
//         onLogout={handleLogout}
//         onCabLogout={handleCabLogout}
//       />
//       <main className="main-content">
//         <Routes>
//           <Route path="/" element={<Home user={user} />} />
//           <Route path="/login" element={<Login onLogin={handleLogin} />} />
//           <Route path="/register" element={<Register onRegister={handleRegister} />} />
//           <Route path="/profile" element={<UserProfile user={user} />} />
//           <Route
//             path="/book"
//             element={
//               <MapPage
//                 user={user}
//                 setPickupLocation={setPickupLocation}
//                 setDropLocation={setDropLocation}
//               />
//             }
//           />
//           <Route
//             path="/user-ride"
//             element={
//               <UserRidePage user={user} pickupLocation={pickupLocation} dropLocation={dropLocation} />
//             }
//           />
//           <Route path="/bookings" element={<MyBookings user={user} />} />
//           <Route
//             path="/payment"
//             element={
//               <Payment
//                 booking={selectedBooking}
//                 onPaymentComplete={handlePaymentComplete}
//               />
//             }
//           />
//           <Route
//             path="/cab-register"
//             element={
//               <CabRegister
//                 onRegister={(cabData) => setCab(cabData)}
//               />
//             }
//           />
//           <Route
//             path="/cab-login"
//             element={
//               <CabLogin
//                 onLogin={(cabData) => setCab(cabData)}
//               />
//             }
//           />
//           <Route
//             path="/cab-dashboard"
//             element={
//               <CabDriverDashboard cab={cab} onLogout={handleCabLogout} />
//             }
//           />
//           {/* Optionally: */}
//           {/* <Route path="*" element={<NotFound />} /> */}
//         </Routes>
//       </main>
//     </BrowserRouter>
//   );
// }

// export default App;