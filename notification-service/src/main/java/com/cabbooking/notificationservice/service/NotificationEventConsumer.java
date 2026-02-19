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
            case "booking.created":
            case "booking.accepted":
            case "booking.cancelled":
            case "ride.completed":
                broadcastService.broadcastNotification(eventType, message, entityId, data);
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
            case "payment.created":
            case "payment.success":
            case "payment.failed":
                broadcastService.broadcastNotification(eventType, message, entityId, data);
                break;
            default:
                System.out.println("⚠️ Unknown payment event type: " + eventType);
        }
    }

    // ==================== CAB EVENTS ====================

    @KafkaListener(topics = "cab-events", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeCabEvent(Map<String, Object> event) {
        String eventType = (String) event.get("eventType");
        String message = (String) event.get("message");
        Long entityId = getLongValue(event.get("entityId"));
        Object data = event.get("data");

        System.out.println("📥 KAFKA: Received Cab Event [" + eventType + "]");

        switch (eventType) {
            case "driver.location.updated":
            case "cab.status.updated":
                broadcastService.broadcastNotification(eventType, message, entityId, data);
                break;
            default:
                System.out.println("⚠️ Unknown cab event type: " + eventType);
        }
    }

    private Long getLongValue(Object value) {
        if (value == null) return null;
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
