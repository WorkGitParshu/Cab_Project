package com.cabbooking.notificationservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class NotificationEventConsumer {

    @Autowired
    private NotificationBroadcastService broadcastService;

    // ==================== BOOKING EVENTS ====================

    @KafkaListener(topics = "booking-events", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeBookingEvent(Map<String, Object> event) {
        String eventType = (String) event.get("eventType");
        String message = (String) event.get("message");
        Long entityId = getLongValue(event.get("entityId"));
        Object data = event.get("data");

        System.out.println("📥 KAFKA: Received Booking Event [" + eventType + "]");

        switch (eventType) {
            // Only notify during active ride phase
            case "booking.created": // Ride requested
            case "booking.accepted": // Driver accepted - cab tracing to pickup
            case "ride.completed": // Ride finished - payment phase starting
                broadcastService.broadcastNotification(eventType, message, entityId, data);
                break;
            case "booking.cancelled":
                System.out.println("⏭️ Skipping notification - booking cancelled");
                break;
            default:
                System.out.println("⚠️ Unknown booking event type: " + eventType);
        }
    }

    // ==================== PAYMENT EVENTS ====================

    @KafkaListener(topics = "payment-events", groupId = "${spring.kafka.consumer.group-id}")
    public void consumePaymentEvent(Map<String, Object> event) {
        String eventType = (String) event.get("eventType");
        String message = (String) event.get("message");
        Long entityId = getLongValue(event.get("entityId"));
        Object data = event.get("data");

        System.out.println("📥 KAFKA: Received Payment Event [" + eventType + "]");

        switch (eventType) {
            case "payment.created": // Entering payment phase
            case "payment.success": // Payment complete - FINAL NOTIFICATION
                broadcastService.broadcastNotification(eventType, message, entityId, data);
                break;
            case "payment.failed":
                // Log failure but don't notify user (stops notifications after payment phase)
                System.out.println("❌ Payment failed - notification suppressed");
                break;
            default:
                System.out.println("⚠️ Unknown payment event type: " + eventType);
        }
    }

    // ==================== CAB EVENTS ====================

    @KafkaListener(topics = "cab-events", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeCabEvent(Map<String, Object> event) {
        String eventType = (String) event.get("eventType");

        System.out.println("📥 KAFKA: Received Cab Event [" + eventType + "] - IGNORED (no notifications)");
        // No cab event notifications are broadcast
    }

    // ==================== USER EVENTS ====================

    @KafkaListener(topics = "user-events", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeUserEvent(Map<String, Object> event) {
        String eventType = (String) event.get("eventType");
        String message = (String) event.get("message");
        Long entityId = getLongValue(event.get("entityId"));
        Object data = event.get("data");

        System.out.println("📥 KAFKA: Received User Event [" + eventType + "]");

        switch (eventType) {
            case "user.registered": // New user registration
            case "user.login": // User successfully logged in
                broadcastService.broadcastNotification(eventType, message, entityId, data);
                break;
            default:
                System.out.println("⚠️ Unknown user event type: " + eventType);
        }
    }

    private Long getLongValue(Object value) {
        if (value == null)
            return null;
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
