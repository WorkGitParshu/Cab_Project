export function useUserWebSocket(userId, onCabAssigned) {
  useEffect(() => {
    const socket = new SockJS("/ws");
    const client = new Client({ webSocketFactory: () => socket, reconnectDelay: 5000 });

    client.onConnect = () => {
      client.subscribe(`/queue/user-${userId}`, msg => {
        const cabInfo = JSON.parse(msg.body);
        onCabAssigned(cabInfo);
      });
    };

    client.activate();
    return () => client.deactivate();
  }, [userId, onCabAssigned]);
}