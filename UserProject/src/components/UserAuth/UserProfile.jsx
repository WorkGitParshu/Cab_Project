// import React from "react";
// import "./UserProfile.css"; // Optional: for custom styling

// export default function UserProfile({ user }) {
//   if (!user) {
//     // If user isn't logged in, show a prompt to login/register
//     return (
//       <div className="user-profile-container">
//         <h2>User Profile</h2>
//         <div className="profile-message">Please login to view your profile.</div>
//       </div>
//     );
//   }

//   return (
//     <div className="user-profile-container">
//       <h2 style={{ marginBottom: "22px" }}>Welcome, {user.firstName} {user.lastName}</h2>
//       <div className="profile-details">
//         <div><b>Email:</b> {user.email}</div>
//         {user.phone && <div><b>Phone:</b> {user.phone}</div>}
//         {/* Add more user fields as needed */}
//       </div>
//       {/* Optional: Edit Profile Button */}
//       {/* <button className="edit-profile-btn" onClick={...}>Edit Profile</button> */}
//     </div>
//   );
// }


import React, { useState } from "react";
import "./UserProfile.css";

export default function UserProfile({ user }) {
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState(user);
  const [savedMsg, setSavedMsg] = useState("");

  if (!user) {
    return (
      <div className="user-profile-container">
        <h2>User Profile</h2>
        <div className="profile-message">Please login to view your profile.</div>
      </div>
    );
  }

  // Handle field changes
  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // Save profile changes (calls backend PUT)
  const handleSave = async () => {
    try {
      // Replace this endpoint with your real profile update endpoint!
      const res = await fetch(`http://localhost:8075/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile)
      });
      if (res.ok) {
        setSavedMsg("Profile updated!");
        setEditMode(false);
      } else {
        setSavedMsg("Failed to save changes.");
      }
    } catch {
      setSavedMsg("Failed to save changes.");
    }
    setTimeout(() => setSavedMsg(""), 2000);
  };

  // UI rendering for profile fields
  return (
    <div className="user-profile-container">
      <h2 style={{ marginBottom: "22px" }}>Welcome, {user.firstName} {user.lastName}</h2>

      <div className="profile-details">
        <div><b>Email:</b> {editMode ?
          <input name="email" value={profile.email} onChange={handleChange} className="profile-input" />
          : profile.email}
        </div>
        <div><b>Phone:</b> {editMode ?
          <input name="phoneNumber" value={profile.phoneNumber || ""} onChange={handleChange} className="profile-input" />
          : (profile.phoneNumber || <em>—</em>)}
        </div>
        <div><b>Address:</b> {editMode ?
          <input name="address" value={profile.address || ""} onChange={handleChange} className="profile-input" />
          : (profile.address || <em>—</em>)}
        </div>
        <div><b>Role:</b> <span>{profile.role || <em>—</em>}</span></div>
        <div><b>Status:</b> {profile.active ? <span style={{color:'#07a463'}}>Active</span> : <span style={{color:'#a50b0b'}}>Inactive</span>}</div>
      </div>
      <div style={{marginTop:30}}>
        {!editMode ? (
          <button className="edit-profile-btn" onClick={() => setEditMode(true)}>
            ✏️ Edit Profile
          </button>
        ) : (
          <>
            <button className="edit-profile-btn" style={{background:'#34934d'}} onClick={handleSave}>
              💾 Save
            </button>
            <button className="edit-profile-btn" style={{background:'#9e9e9e'}} onClick={() => {setEditMode(false);setProfile(user);}}>
              Cancel
            </button>
          </>
        )}
        {savedMsg && <div style={{marginTop:10, color:"#248dfd",fontWeight:600}}>{savedMsg}</div>}
      </div>
    </div>
  );
}

// import React from "react";
// import "./UserProfile.css";

// export default function UserProfile({ user }) {
//   if (!user) {
//     return (
//       <div className="user-profile-container">
//         <h2>User Profile</h2>
//         <div className="profile-message">Please login to view your profile.</div>
//       </div>
//     );
//   }

//   // Optional placeholder fields for phone, joined date (adapt as needed)
//   const { firstName, lastName, email, phone, joinedAt, totalBookings } = user;
//   const avatarUrl = user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${firstName||'User'}`;

//   return (
//     <div className="user-profile-container">
//       <div className="user-avatar-wrapper">
//         <img className="user-avatar" src={avatarUrl} alt="avatar" />
//       </div>
//       <h2 style={{ marginTop: 10, marginBottom: "18px" }}>
//         {firstName} {lastName}
//       </h2>
//       <div className="user-info-list">
//         <div className="info-row">
//           <span className="info-label">Email:</span>
//           <span>{email}</span>
//         </div>
//         <div className="info-row">
//           <span className="info-label">Phone:</span>
//           <span>{phone || <em>—</em>}</span>
//         </div>
//         <div className="info-row">
//           <span className="info-label">Member Since:</span>
//           <span>{joinedAt ? new Date(joinedAt).toLocaleDateString() : <em>—</em>}</span>
//         </div>
//         <div className="info-row">
//           <span className="info-label">Total Bookings:</span>
//           <span>{totalBookings != null ? totalBookings : <em>—</em>}</span>
//         </div>
//       </div>
//       {/* Optional: Edit profile, My Bookings button, Feedback, etc */}
//       {/* <button className="edit-profile-btn">Edit Profile</button> */}
//     </div>
//   );
// }