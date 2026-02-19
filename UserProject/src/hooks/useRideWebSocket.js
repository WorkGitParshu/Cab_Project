import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

/**
 * Custom hook for WebSocket communication with booking service
 * Handles ride requests, confirmations, and real-time updates
 */
export const useRideWebSocket = (userId, driverId = null) => {
  const [connected, setConnected] = useState(false);
  const [rideConfirmation, setRideConfirmation] = useState(null);
  const [rideRejection, setRideRejection] = useState(null);
  const [driverMessage, setDriverMessage] = useState(null);
  const [rideRequest, setRideRequest] = useState(null); // New state for ride requests
  const [error, setError] = useState(null);
  const stompClient = useRef(null);

  useEffect(() => {
    // Initialize WebSocket connection
    const socket = new SockJS("http://localhost:8077/ws");
    stompClient.current = Stomp.over(socket);

    // Set session attributes for tracking
    const headers = {
      userId: userId,
      driverId: driverId,
    };

    stompClient.current.connect(headers, onConnected, onError);

    return () => {
      if (stompClient.current && stompClient.current.connected) {
        stompClient.current.disconnect();
      }
    };
  }, [userId, driverId]);

  const onConnected = () => {
    console.log("✅ WebSocket connected!");
    setConnected(true);
    setError(null);

    // Subscribe to user-specific confirmation topic
    if (userId) {
      stompClient.current.subscribe(
        `/topic/user/${userId}/confirmation`,
        handleRideConfirmation
      );

      stompClient.current.subscribe(
        `/topic/user/${userId}/rejection`,
        handleRideRejection
      );

      stompClient.current.subscribe(
        `/topic/user/${userId}/messages`,
        handleDriverMessage
      );

      stompClient.current.subscribe(
        `/topic/user/${userId}/error`,
        handleError
      );
    }

    // Driver subscriptions
    if (driverId) {
      stompClient.current.subscribe(
        `/topic/driver/${driverId}/ride-request`,
        handleRideRequest
      );
    }
  };

  const onError = (error) => {
    console.error("❌ WebSocket error:", error);
    setConnected(false);
    setError("Failed to establish WebSocket connection");
  };

  const handleRideConfirmation = (message) => {
    const data = JSON.parse(message.body);
    console.log("✅ Ride confirmed:", data);
    setRideConfirmation(data);
  };

  const handleRideRejection = (message) => {
    const data = JSON.parse(message.body);
    console.log("❌ Ride rejected:", data);
    setRideRejection(data);
  };

  const handleDriverMessage = (message) => {
    const data = JSON.parse(message.body);
    console.log("💬 Driver message:", data);
    setDriverMessage(data);
  };

  const handleRideRequest = (message) => {
    const data = JSON.parse(message.body);
    console.log("📥 Ride request received:", data);
    setRideRequest(data);
  };

  const handleError = (message) => {
    const data = JSON.parse(message.body);
    console.error("⚠️ Error:", data.message);
    setError(data.message);
  };

  // Send ride request to driver
  const sendRideRequest = (bookingId, driverId, rideDetails) => {
    if (!connected || !stompClient.current) {
      console.error("WebSocket not connected");
      return;
    }

    const request = {
      bookingId: bookingId,
      driverId: driverId,
      pickupLat: rideDetails.pickupLocation.lat,
      pickupLng: rideDetails.pickupLocation.lng,
      dropLat: rideDetails.dropLocation.lat,
      dropLng: rideDetails.dropLocation.lng,
      distance: rideDetails.distance,
      fare: rideDetails.fare,
      userId: userId,
    };

    stompClient.current.send(
      `/app/ride-request/${driverId}`,
      {},
      JSON.stringify(request)
    );

    console.log("📤 Ride request sent via WebSocket:", request);
  };

  // Send driver confirmation
  const sendDriverConfirmation = (bookingId, driverId, status, reason = null) => {
    if (!connected || !stompClient.current) {
      console.error("WebSocket not connected");
      return;
    }

    const confirmation = {
      bookingId: bookingId,
      driverId: driverId,
      status: status, // "ACCEPTED" or "REJECTED"
      reason: reason,
    };

    stompClient.current.send(
      `/app/driver-confirmation`,
      {},
      JSON.stringify(confirmation)
    );

    console.log("📤 Driver confirmation sent:", confirmation);
  };

  // Send message to user
  const sendMessageToUser = (userId, message) => {
    if (!connected || !stompClient.current) {
      console.error("WebSocket not connected");
      return;
    }

    const msgData = {
      from: "driver",
      text: message,
      timestamp: new Date().toISOString(),
    };

    stompClient.current.send(
      `/app/driver-message/${userId}`,
      {},
      JSON.stringify(msgData)
    );

    console.log("💬 Message sent to user:", message);
  };

  // Clear current ride request (to prevent reappearing in UI)
  const clearRideRequest = () => {
    setRideRequest(null);
  };

  return {
    connected,
    error,
    rideConfirmation,
    rideRejection,
    driverMessage,
    rideRequest,
    sendRideRequest,
    sendDriverConfirmation,
    sendMessageToUser,
    clearRideRequest,
  };
};
