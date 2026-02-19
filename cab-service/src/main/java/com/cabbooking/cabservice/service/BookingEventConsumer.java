package com.cabbooking.cabservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import com.cabbooking.cabservice.model.Cab;
import com.cabbooking.cabservice.repository.CabRepository;

import java.util.Map;

@Service
public class BookingEventConsumer {

    @Autowired
    private CabRepository cabRepository;

    @Autowired
    private CabEventProducer cabEventProducer;

    @KafkaListener(topics = "booking-events", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeBookingEvent(Map<String, Object> event) {
        String eventType = (String) event.get("eventType");
        System.out.println("📥 KAFKA: Received Booking Event [" + eventType + "]");

        try {
            if ("booking.accepted".equals(eventType)) {
                handleBookingAccepted(event);
            } else if ("ride.completed".equals(eventType)) {
                handleRideCompleted(event);
            }
        } catch (Exception e) {
            System.err.println("❌ Error processing booking event: " + e.getMessage());
        }
    }

    private void handleBookingAccepted(Map<String, Object> event) {
        Map<String, Object> data = (Map<String, Object>) event.get("data");
        if (data != null && data.containsKey("cabId")) {
            Long cabId = getLongValue(data.get("cabId"));
            
            cabRepository.findById(cabId).ifPresent(cab -> {
                cab.setStatus(Cab.CabStatus.BUSY);
                cabRepository.save(cab);
                System.out.println("✅ Cab #" + cabId + " status set to BUSY");
                
                // Emit cab status updated event
                cabEventProducer.sendCabEvent(
                    "cab.status.updated",
                    "Cab #" + cabId + " is now BUSY",
                    cabId,
                    cab
                );
            });
        }
    }

    private void handleRideCompleted(Map<String, Object> event) {
        Map<String, Object> data = (Map<String, Object>) event.get("data");
        if (data != null && data.containsKey("cabId")) {
            Long cabId = getLongValue(data.get("cabId"));
            
            cabRepository.findById(cabId).ifPresent(cab -> {
                cab.setStatus(Cab.CabStatus.AVAILABLE);
                cabRepository.save(cab);
                System.out.println("✅ Cab #" + cabId + " status set to AVAILABLE");
                
                // Emit cab status updated event
                cabEventProducer.sendCabEvent(
                    "cab.status.updated",
                    "Cab #" + cabId + " is now AVAILABLE",
                    cabId,
                    cab
                );
            });
        }
    }

    private Long getLongValue(Object value) {
        if (value instanceof Integer) {
            return ((Integer) value).longValue();
        } else if (value instanceof Long) {
            return (Long) value;
        }
        return Long.parseLong(value.toString());
    }
}
