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
import ProtectedPage from './Routing/ProtectedPage';
import DriverProtected from './Routing/DriverProtected';

function App() {
  const [userRole, setUserRole] = useState(null); // 'passenger' or 'driver'
  const [user, setUser] = useState(null);
  const [cab, setCab] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropLocation, setDropLocation] = useState(null);
  const [_driverData, _setDriverData] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');


  useEffect(() => {
    // Check if role is already selected
    const savedRole = localStorage.getItem('userRole');
    if (savedRole) {
      setUserRole(savedRole);
    }

    // Check if user is logged in on app load
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }

    // Check if cab (driver) is logged in on app load
    const savedCab = localStorage.getItem('cab');
    if (savedCab) {
      try {
        setCab(JSON.parse(savedCab));
      } catch {
        localStorage.removeItem('cab');
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
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentPage('home');
  };

  const handleRegister = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
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
    localStorage.removeItem('cab');
    setCurrentPage('home');
  };

  const handleSwitchRole = () => {
    setUserRole(null);
    setUser(null);
    setCab(null);
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    localStorage.removeItem('cab');
    setCurrentPage('home');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        if (userRole === 'driver') {
          if (!cab) {
            return <CabLogin onLogin={(cabData) => { 
              setCab(cabData);
              localStorage.setItem('cab', JSON.stringify(cabData));
              setCurrentPage('driver-dashboard'); 
            }} />;
          }
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
        return <ProtectedPage user={user} onNavigate={setCurrentPage}>
          <BookCabPage
            user={user}
            pickupLocation={pickupLocation}
            dropLocation={dropLocation}
            setPickupLocation={setPickupLocation}
            setDropLocation={setDropLocation}
            setCurrentPage={setCurrentPage}
          />
        </ProtectedPage>;
      case 'profile':
        return <ProtectedPage user={user} onNavigate={setCurrentPage}>
          <UserProfile user={user} />
        </ProtectedPage>;

      case 'user-ride':
        return <ProtectedPage user={user} onNavigate={setCurrentPage}>
          <UserRidePage
            user={user}
            pickupLocation={pickupLocation}
            dropLocation={dropLocation}
            setCurrentPage={setCurrentPage}
            setSelectedBooking={setSelectedBooking}
          />
        </ProtectedPage>;
      case 'bookings':
        return <ProtectedPage user={user} onNavigate={setCurrentPage}>
          <MyBookings user={user} />
        </ProtectedPage>;
      case 'payment':
        return <ProtectedPage user={user} onNavigate={setCurrentPage}>
          <Payment booking={selectedBooking} onPaymentComplete={handlePaymentComplete} />
        </ProtectedPage>;
      case 'cab-register':
        return <CabRegister onRegister={(cabData) => { 
          setCab(cabData);
          localStorage.setItem('cab', JSON.stringify(cabData));
          setCurrentPage('driver-dashboard'); 
        }} />;
      case 'cab-login':
        return <CabLogin onLogin={(cabData) => { 
          setCab(cabData);
          localStorage.setItem('cab', JSON.stringify(cabData));
          setCurrentPage('driver-dashboard'); 
        }} />;
      case 'cab-dashboard':
        return <DriverProtected cab={cab} onNavigate={setCurrentPage}>
          <DriverDashboardSimple cab={cab} onLogout={handleCabLogout} />
        </DriverProtected>;
      case 'booking-flow':
        return <ProtectedPage user={user} onNavigate={setCurrentPage}>
          <BookingFlow
            user={user}
            setCurrentPage={setCurrentPage}
            setSelectedBooking={setSelectedBooking}
          />
        </ProtectedPage>;
      case 'ride-tracking':
        return <ProtectedPage user={user} onNavigate={setCurrentPage}>
          <UserRideTracking
            onCancel={() => setCurrentPage('home')}
            onRideCompleted={(booking) => {
              setSelectedBooking(booking);
              setCurrentPage('payment');
            }}
          />
        </ProtectedPage>;
      case 'driver-dashboard':
        return <DriverProtected cab={cab} onNavigate={setCurrentPage}>
          <DriverDashboardSimple cab={cab} onLogout={handleCabLogout} />
        </DriverProtected>;
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
      onSwitchRole={handleSwitchRole}
      currentPage={currentPage}
      onPageChange={handlePageChange}
      theme={theme}
      onToggleTheme={toggleTheme}
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
