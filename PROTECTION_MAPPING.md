# Page Protection Mapping

## User-Protected Pages

These pages require a valid user login:

| Page Route | Protected | Component | Protection | Redirect If Unauth |
|-----------|-----------|-----------|------------|------------------|
| `book` | ✅ Yes | BookCabPage | ProtectedPage | → login |
| `profile` | ✅ Yes | UserProfile | ProtectedPage | → login |
| `user-ride` | ✅ Yes | UserRidePage | ProtectedPage | → login |
| `bookings` | ✅ Yes | MyBookings | ProtectedPage | → login |
| `payment` | ✅ Yes | Payment | ProtectedPage | → login |
| `booking-flow` | ✅ Yes | BookingFlow | ProtectedPage | → login |
| `ride-tracking` | ✅ Yes | UserRideTracking | ProtectedPage | → login |

## Driver-Protected Pages

These pages require a valid driver login:

| Page Route | Protected | Component | Protection | Redirect If Unauth |
|-----------|-----------|-----------|------------|------------------|
| `cab-dashboard` | ✅ Yes | DriverDashboardSimple | DriverProtected | → cab-login |
| `driver-dashboard` | ✅ Yes | DriverDashboardSimple | DriverProtected | → cab-login |

## Public Pages (No Authentication Required)

These pages are accessible without login:

| Page Route | Component | Auth Required |
|-----------|-----------|---------------|
| `home` | Home or DriverDashboardSimple | ❌ No |
| `login` | Login | ❌ No |
| `register` | Register | ❌ No |
| `cab-login` | CabLogin | ❌ No |
| `cab-register` | CabRegister | ❌ No |
| `quick-access` | QuickAccess | ❌ No |

## Authentication State Management

### User Login Flow
```
User not logged in (user === null)
         ↓
Try to access protected page
         ↓
ProtectedPage guard checks user
         ↓
user === null → Show "Sign In Required" message
         ↓
User clicks "Go to Sign In"
         ↓
Navigate to login page
         ↓
User enters credentials
         ↓
handleLogin() called with userData
         ↓
localStorage.setItem('user', JSON.stringify(userData))
         ↓
setUser(userData)
         ↓
Navigate to home
         ↓
User now has access to all protected pages ✅
```

### Driver Login Flow
```
Driver not logged in (cab === null)
         ↓
Try to access protected page
         ↓
DriverProtected guard checks cab
         ↓
cab === null → Show "Driver Login Required" message
         ↓
User clicks "Go to Driver Login"
         ↓
Navigate to cab-login page
         ↓
Driver enters credentials
         ↓
handleLogin() callback with cabData
         ↓
localStorage.setItem('cab', JSON.stringify(cabData))
         ↓
setCab(cabData)
         ↓
Navigate to driver-dashboard
         ↓
Driver now has access to all driver pages ✅
```

### Persistence on Page Reload
```
Page Reloaded
         ↓
App.jsx useEffect() runs on mount
         ↓
Check localStorage.getItem('user')
         ↓
If exists → setUser(JSON.parse(savedUser))
         ↓
Check localStorage.getItem('cab')
         ↓
If exists → setCab(JSON.parse(savedCab))
         ↓
User/Driver remains authenticated ✅
         ↓
Protected pages are accessible ✅
```

### Logout Flow
```
User clicks Logout
         ↓
handleLogout() or handleCabLogout() called
         ↓
setUser(null) or setCab(null)
         ↓
localStorage.removeItem('user') or localStorage.removeItem('cab')
         ↓
Navigate to home
         ↓
localStorage cleared ✅
         ↓
Next page reload → user/driver will need to log in again ✅
```

## Error States

### Accessing Protected Page Without Auth
```
❌ Try to access: /book (without user login)
   ↓
   Show: "🔐 Sign in required"
   Show: "Please sign in to access this page"
   Button: "Go to Sign In"
```

```
❌ Try to access: /cab-dashboard (without driver login)
   ↓
   Show: "🚗 Driver login required"
   Show: "Please sign in as a driver to access this page"
   Button: "Go to Driver Login"
```

## localStorage Keys Used

| Key | Purpose | Structure | Cleared On |
|-----|---------|-----------|-----------|
| `userRole` | Stores 'passenger' or 'driver' | String | Logout / Role Switch |
| `user` | Stores user data | JSON | User Logout |
| `cab` | Stores driver/cab data | JSON | Driver Logout |

---

**Note:** All guard components are implemented in the `/src/Routing/` directory and imported in App.jsx.
