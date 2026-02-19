// import React, { useState } from "react";

// const CAB_TYPES = ["MINI", "SEDAN", "SUV", "LUXURY"];

// export default function CabRegister({ onRegister }) {
//   const [form, setForm] = useState({
//     cabNumber: "",
//     model: "",
//     color: "",
//     capacity: 4,
//     baseFare: 50,
//     perKmRate: 10,
//     cabType: "MINI",
//     driverName: "",
//     driverPhone: ""
//   });
//   const [msg, setMsg] = useState("");

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setMsg("");
//     fetch("http://localhost:8076/api/cabs", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(form)
//     })
//       .then((res) => res.json())
//       .then((data) => {
//         setMsg("Registration successful!");
//         if (onRegister) onRegister(data); // callback with registered cab data
//       })
//       .catch(() => setMsg("Error registering cab!"));
//   };

//   return (
//     <div style={{ maxWidth: 480, margin: "auto" }}>
//       <h2>Cab/Driver Registration</h2>
//       <form onSubmit={handleSubmit}>
//         <label>Cab Number:</label>
//         <input name="cabNumber" value={form.cabNumber} onChange={handleChange} required />
//         <label>Model:</label>
//         <input name="model" value={form.model} onChange={handleChange} required />
//         <label>Color:</label>
//         <input name="color" value={form.color} onChange={handleChange} required />
//         <label>Capacity:</label>
//         <input name="capacity" type="number" min={1} value={form.capacity} onChange={handleChange} required />
//         <label>Base Fare:</label>
//         <input name="baseFare" type="number" min={0} value={form.baseFare} onChange={handleChange} required />
//         <label>Per Km Rate:</label>
//         <input name="perKmRate" type="number" min={0} value={form.perKmRate} onChange={handleChange} required />
//         <label>Cab Type:</label>
//         <select name="cabType" value={form.cabType} onChange={handleChange}>
//           {CAB_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
//         </select>
//         <label>Driver Name:</label>
//         <input name="driverName" value={form.driverName} onChange={handleChange} required />
//         <label>Driver Phone:</label>
//         <input name="driverPhone" value={form.driverPhone} onChange={handleChange} required />
//         <button type="submit">Register</button>
//       </form>
//       {msg && <div style={{ marginTop: 12, color: msg.startsWith("Error") ? "red" : "green" }}>{msg}</div>}
//     </div>
//   );
// }
import React, { useState } from "react";
import "./CabRegister.css";

const CAB_TYPES = ["MINI", "SEDAN", "SUV", "LUXURY"];

//const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/cab`;

export default function CabRegister({ onRegister }) {
  const [form, setForm] = useState({
    cabNumber: "",
    model: "",
    color: "",
    capacity: 4,
    baseFare: 50,
    perKmRate: 10,
    cabType: "MINI",
    driverName: "",
    driverPhone: ""
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: ["capacity", "baseFare", "perKmRate"].includes(name)
        ? Number(value)
        : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    fetch("http://localhost:8076/api/cabs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Error registering cab!");
        return res.json();
      })
      .then((data) => {
        setMsg("✅ Registration successful!");
        setForm({
          cabNumber: "",
          model: "",
          color: "",
          capacity: 4,
          baseFare: 50,
          perKmRate: 10,
          cabType: "MINI",
          driverName: "",
          driverPhone: ""
        });
        if (onRegister) onRegister(data);
      })
      .catch(() => setMsg("❌ Error registering cab!"))
      .finally(() => setLoading(false));
  };

  return (
    <div className="cab-bg">
      <div className="cab-card">
        <div className="cab-register-header">
          <span role="img" aria-label="taxi" style={{ fontSize: 40, marginBottom: 10 }}>🚖</span>
          <h2>Register as Driver</h2>
        </div>
        <form className="cab-form" onSubmit={handleSubmit}>
          <Input label="Cab Number" name="cabNumber" value={form.cabNumber} onChange={handleChange} required />
          <Input label="Model" name="model" value={form.model} onChange={handleChange} required />
          <Input label="Color" name="color" value={form.color} onChange={handleChange} required />

          <div className="cab-row">
            <Input label="Capacity" name="capacity" value={form.capacity} onChange={handleChange} type="number" min={1} required />
            <Input label="Base Fare" name="baseFare" value={form.baseFare} onChange={handleChange} type="number" min={0} required />
            {/* <Input label="Per Km Rate" name="perKmRate" value={form.perKmRate} onChange={handleChange} type="number" min={0} required /> */}
          </div>

          <div className="cab-row1"> 
            <Input label="Per Km Rate" name="perKmRate" value={form.perKmRate} onChange={handleChange} type="number" min={0} required />
          </div>

          <label className="cab-label">Cab Type</label>
          <select
            name="cabType"
            value={form.cabType}
            onChange={handleChange}
            className="cab-input"
            required
          >
            {CAB_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <Input label="Driver Name" name="driverName" value={form.driverName} onChange={handleChange} required />
          <Input label="Driver Phone" name="driverPhone" value={form.driverPhone} onChange={handleChange} required maxLength={15} />

          <button className="cab-btn" type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
          {msg && <div className={`cab-msg ${msg.startsWith("❌") ? "cab-msg-err" : "cab-msg-success"}`}>{msg}</div>}
        </form>
      </div>
    </div>
  );
}

function Input({ label, ...rest }) {
  return (
    <div className="cab-input-group">
      <label className="cab-label">{label}</label>
      <input className="cab-input" {...rest} />
    </div>
  );
}