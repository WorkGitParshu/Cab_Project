package com.cabbooking.notificationservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class NotificationBroadcastService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void broadcastNotification(String eventType, String message, Long entityId, Object data) {
        Map<String, Object> notification = new HashMap<>();
        notification.put("eventType", eventType);
        notification.put("message", message);
        notification.put("timestamp", System.currentTimeMillis());
        notification.put("entityId", entityId);
        notification.put("data", data);

        // Broadcast to global notifications topic
        messagingTemplate.convertAndSend("/topic/notifications", notification);
        System.out.println("📡 WebSocket: Broadcasted [" + eventType + "] to /topic/notifications");

        // Also send to user-specific topic if userId is available
        if (data instanceof Map) {
            Map<String, Object> dataMap = (Map<String, Object>) data;
            if (dataMap.containsKey("userId")) {
                Long userId = getLongValue(dataMap.get("userId"));
                messagingTemplate.convertAndSend("/topic/user/" + userId + "/notifications", notification);
                System.out.println("📡 WebSocket: Sent [" + eventType + "] to user #" + userId);
            }
        }
    }

    private Long getLongValue(Object value) {
        if (value instanceof Integer) {
            return ((Integer) value).longValue();
        } else if (value instanceof Long) {
            return (Long) value;
        }
        try {
            return Long.parseLong(value.toString());
        } catch (Exception e) {
            return null;
        }
    }
}
