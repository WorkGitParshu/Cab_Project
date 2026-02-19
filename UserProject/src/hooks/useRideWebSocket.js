import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

/**
 * Custom hook for WebSocket communication with booking service
 * Handles ride requests, confirmations, and real-time updates
 * Optimized for performance with connection pooling and retry logic
 */
export const useRideWebSocket = (userId, driverId = null) => {
  const [connected, setConnected] = useState(false);
  const [rideConfirmation, setRideConfirmation] = useState(null);
  const [rideRejection, setRideRejection] = useState(null);
  const [driverMessage, setDriverMessage] = useState(null);
  const [rideRequest, setRideRequest] = useState(null);
  const [error, setError] = useState(null);
  const stompClient = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 3;
  const reconnectDelay = useRef(1000);
  const subscriptions = useRef([]);

  useEffect(() => {
    // Skip if no userId and no driverId
    if (!userId && !driverId) {
      return;
    }

    let connectionTimer;

    const connectWebSocket = () => {
      try {
        const socket = new SockJS("http://localhost:8077/ws");
        stompClient.current = Stomp.over(socket);
        
        // Disable debug logging for performance
        stompClient.current.debug = () => {};

        const headers = {
          userId: userId || "",
          driverId: driverId || "",
        };

        stompClient.current.connect(headers, onConnected, onError);
      } catch (err) {
        console.error("WebSocket connection error:", err);
        onError(err);
      }
    };

    const onConnected = () => {
      console.log("✅ WebSocket connected!");
      setConnected(true);
      setError(null);
      reconnectAttempts.current = 0;
      reconnectDelay.current = 1000;

      // Subscribe to user-specific topics
      if (userId) {
        const userConfirmationSub = stompClient.current.subscribe(
          `/topic/user/${userId}/confirmation`,
          handleRideConfirmation
        );
        subscriptions.current.push(userConfirmationSub);

        const userRejectionSub = stompClient.current.subscribe(
          `/topic/user/${userId}/rejection`,
          handleRideRejection
        );
        subscriptions.current.push(userRejectionSub);

        const userMessagesSub = stompClient.current.subscribe(
          `/topic/user/${userId}/messages`,
          handleDriverMessage
        );
        subscriptions.current.push(userMessagesSub);

        const userErrorSub = stompClient.current.subscribe(
          `/topic/user/${userId}/error`,
          handleError
        );
        subscriptions.current.push(userErrorSub);
      }

      // Subscribe to driver-specific topics
      if (driverId) {
        const driverRideSub = stompClient.current.subscribe(
          `/topic/driver/${driverId}/ride-request`,
          handleRideRequest
        );
        subscriptions.current.push(driverRideSub);
      }
    };

    const onError = (error) => {
      console.error("❌ WebSocket error:", error);
      setConnected(false);
      setError("Connection lost. Reconnecting...");
      
      // Attempt to reconnect
      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current += 1;
        connectionTimer = setTimeout(() => {
          console.log(`🔄 Reconnect attempt ${reconnectAttempts.current}...`);
          connectWebSocket();
          reconnectDelay.current = Math.min(reconnectDelay.current * 1.5, 5000);
        }, reconnectDelay.current);
      }
    };

    connectWebSocket();

    return () => {
      clearTimeout(connectionTimer);
      // Unsubscribe from all topics
      subscriptions.current.forEach(sub => {
        try {
          sub.unsubscribe();
        } catch (err) {
          console.warn("Error unsubscribing:", err);
        }
      });
      subscriptions.current = [];
      
      // Disconnect gracefully
      if (stompClient.current && stompClient.current.connected) {
        stompClient.current.disconnect(() => {
          console.log("WebSocket disconnected");
        });
      }
    };
  }, [userId, driverId]);

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
