// import React, { useState } from "react";

// export default function CabLogin({ onLogin }) {
//   const [credentials, setCredentials] = useState({ cabNumber: "", driverPhone: "" });
//   const [msg, setMsg] = useState("");

//   const handleChange = (e) => {
//     setCredentials((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setMsg("");
//     fetch(`http://localhost:8076/api/cabs/login?cabNumber=${credentials.cabNumber}&driverPhone=${credentials.driverPhone}`)
//       .then((res) => res.json())
//       .then((data) => {
//         if (data && data.id) {
//           onLogin(data); // Pass cab/driver object up
//         } else {
//           setMsg("Cab not found. Check your details.");
//         }
//       })
//       .catch(() => setMsg("Error logging in!"));
//   };

//   return (
//     <div style={{ maxWidth: 400, margin: "auto" }}>
//       <h2>Cab Driver Login</h2>
//       <form onSubmit={handleSubmit}>
//         <label>Cab Number:</label>
//         <input name="cabNumber" value={credentials.cabNumber} onChange={handleChange} required />
//         <label>Driver Phone:</label>
//         <input name="driverPhone" value={credentials.driverPhone} onChange={handleChange} required />
//         <button type="submit">Login</button>
//       </form>
//       {msg && <div style={{ marginTop: 12, color: "red" }}>{msg}</div>}
//     </div>
//   );
// }

import React, { useState } from "react";
import "./CabLogin.css"; // create this file for custom styles

export default function CabLogin({ onLogin }) {
  const [credentials, setCredentials] = useState({ cabNumber: "", driverPhone: "" });
  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMsg("");
    fetch(`http://localhost:8076/api/cabs/login?cabNumber=${credentials.cabNumber}&driverPhone=${credentials.driverPhone}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.id) {
          onLogin(data); // Pass cab/driver object up
        } else {
          setMsg("Cab not found. Check your details.");
        }
      })
      .catch(() => setMsg("Error logging in!"));
  };

  return (
    <div className="cab-login-container">
      <div className="cab-login-card">
        <h2 className="cab-login-title">Cab Driver Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="cabNumber">Cab Number</label>
            <input
              name="cabNumber"
              id="cabNumber"
              value={credentials.cabNumber}
              onChange={handleChange}
              required
              autoFocus
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label htmlFor="driverPhone">Driver Phone</label>
            <input
              name="driverPhone"
              id="driverPhone"
              value={credentials.driverPhone}
              onChange={handleChange}
              required
              autoComplete="off"
            />
          </div>
          <button className="btn-primary" type="submit">Login</button>
        </form>
        {msg && <div className="error-message">{msg}</div>}
      </div>
    </div>
  );
}