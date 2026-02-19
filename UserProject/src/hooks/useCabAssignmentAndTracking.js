import { useEffect, useState, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

// Returns: {assignedCab, driverLoc, bookingStatus}
export function useCabAssignmentAndTracking(userId) {
  const [assignedCab, setAssignedCab] = useState(null);
  const [driverLoc, setDriverLoc] = useState(null);
  const [bookingStatus, setBookingStatus] = useState("awaiting"); // awaiting, assigned, completed
  const pollIntervalRef = useRef(null);

  // 1. Listen for assignment when driver accepts ride
  useEffect(() => {
    if (!userId) return;
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8077/ws"),
      reconnectDelay: 5000,
    });
    client.onConnect = () => {
      client.subscribe(`/queue/user-${userId}`, (msg) => {
        console.log("User received cab assignment:", msg.body);
        const cabData = JSON.parse(msg.body);
        setAssignedCab(cabData);
        setBookingStatus("assigned");
      });
    };
    client.activate();
    return () => client.deactivate();
  }, [userId]);

  // 2. Poll driver's latest location as soon as assigned
  useEffect(() => {
    if (!assignedCab?.id) {
      setDriverLoc(null);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      return;
    }
    pollIntervalRef.current = setInterval(() => {
      fetch(`http://localhost:8076/api/cabs/${assignedCab.id}`)
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error('Failed to fetch cab location');
        })
        .then((cab) => {
          if (cab?.currentLocation)
            setDriverLoc({
              lat: cab.currentLocation.latitude,
              lng: cab.currentLocation.longitude,
            });
        })
        .catch(err => console.error("Error polling driver location:", err));
    }, 3000);
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [assignedCab]);

  return { assignedCab, driverLoc, bookingStatus, setBookingStatus };
}