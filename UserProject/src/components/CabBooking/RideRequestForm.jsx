import React, { useState } from "react";

export default function RideRequestForm({ user, pickupLocation, dropLocation , onSuccess}) {
    const [requesting, setRequesting] = useState(false);
    const [msg, setMsg] = useState("");

    const handleSubmit = (e) => {
        console.log("Booking submitted!", { user, pickupLocation, dropLocation });

        e.preventDefault();

        console.log("Booking submission started: ", {
            user, pickupLocation, dropLocation, onSuccess
        });
        setRequesting(true);
        setMsg("");
        //     fetch("http://localhost:8077/api/bookings", {
        //       method: "POST",
        //       headers: { "Content-Type": "application/json" },
        //       body: JSON.stringify({
        //         userId: user?.id,
        //         pickupLocation,
        //         dropLocation
        //       })
        //     })
        const pickupLocationStr = `${pickupLocation.lat},${pickupLocation.lng}`;
        const dropLocationStr = `${dropLocation.lat},${dropLocation.lng}`;

        fetch("http://localhost:8077/api/bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: user?.id,
                cabId: null, // Or omit if backend allows, or require selection
                pickupLocation: pickupLocationStr,
                dropLocation: dropLocationStr
            })
        })
            //   .then((res) => res.json())
            //   .then((data) => {setMsg("Ride requested! Awaiting driver.");
            //                     if (onSuccess) onSuccess();  
            //   })

            //   .catch(() => setMsg("Error requesting ride."))
            .then(async (res) => {
                if (!res.ok) {
                    const errText = await res.text();
                    setMsg(`Error requesting ride: ${errText}`);
                    throw new Error(errText);
                }
                return res.json();
            })
            .then((data) => {
                setMsg("Ride requested! Awaiting driver.");
                if (onSuccess) {
                    console.log("onSuccess is being called");
                    onSuccess();
                } else {
                    console.warn("onSuccess is NOT defined!");
                }
            })
            .catch((err) => {
                // already set error above
            })
            .finally(() => setRequesting(false));
    };

    return (
        <div style={{ marginTop: 20 }}>
            <form onSubmit={handleSubmit}>
                <h3>Book Your Ride</h3>
                <div>
                    <b>Pickup:</b> {pickupLocation.lat}, {pickupLocation.lng}
                </div>
                <div>
                    <b>Drop:</b> {dropLocation.lat}, {dropLocation.lng}
                </div>
                <button type="submit" disabled={requesting}>
                    {requesting ? "Requesting..." : "Request Ride"}
                </button>
                {msg && <div style={{ color: msg.startsWith("Error") ? 'red' : 'green' }}>{msg}</div>}
            </form>
        </div>
    );
}