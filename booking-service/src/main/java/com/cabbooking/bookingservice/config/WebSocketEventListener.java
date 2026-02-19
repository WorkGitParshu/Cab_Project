package com.cabbooking.bookingservice.config;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

/**
 * Manages WebSocket session connections and disconnections
 * Tracks active user and driver connections for real-time features
 */
@Component
public class WebSocketEventListener {
    
    // Store active connections: sessionId -> userId
    private static final Map<String, Long> userSessions = new ConcurrentHashMap<>();
    private static final Map<String, Long> driverSessions = new ConcurrentHashMap<>();
    
    @EventListener
    public void handleSessionConnected(SessionConnectedEvent event) {
        StompHeaderAccessor headers = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headers.getSessionId();
        
        // Extract user/driver ID from session attributes if available
        Map<String, Object> sessionAttributes = headers.getSessionAttributes();
        
        if (sessionAttributes != null) {
            Long userId = (Long) sessionAttributes.get("userId");
            Long driverId = (Long) sessionAttributes.get("driverId");
            
            if (userId != null) {
                userSessions.put(sessionId, userId);
                System.out.println("✅ User " + userId + " connected. Session: " + sessionId);
            }
            
            if (driverId != null) {
                driverSessions.put(sessionId, driverId);
                System.out.println("✅ Driver " + driverId + " connected. Session: " + sessionId);
            }
        }
    }
    
    @EventListener
    public void handleSessionDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor headers = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headers.getSessionId();
        
        Long userId = userSessions.remove(sessionId);
        Long driverId = driverSessions.remove(sessionId);
        
        if (userId != null) {
            System.out.println("❌ User " + userId + " disconnected. Session: " + sessionId);
        }
        
        if (driverId != null) {
            System.out.println("❌ Driver " + driverId + " disconnected. Session: " + sessionId);
        }
    }
    
    // Public methods to check connection status
    public static boolean isUserConnected(Long userId) {
        return userSessions.values().contains(userId);
    }
    
    public static boolean isDriverConnected(Long driverId) {
        return driverSessions.values().contains(driverId);
    }
    
    public static int getTotalActiveUsers() {
        return userSessions.size();
    }
    
    public static int getTotalActiveDrivers() {
        return driverSessions.size();
    }
}
