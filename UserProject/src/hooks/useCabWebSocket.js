import { useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export function useCabWebSocket(onCabRequest) {
  useEffect(() => {
    const socket = new SockJS("/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000
    });

    client.onConnect = () => {
      // Subscribe to "/topic/cab-requests" for ride notifications
      client.subscribe("/topic/cab-requests", msg => {
        const rideRequest = JSON.parse(msg.body);
        onCabRequest(rideRequest);
      });
    };

    client.activate();
    return () => client.deactivate();
  }, [onCabRequest]);
}