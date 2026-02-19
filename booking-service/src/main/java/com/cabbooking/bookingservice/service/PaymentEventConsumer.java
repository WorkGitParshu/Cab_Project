package com.cabbooking.bookingservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import com.cabbooking.bookingservice.model.Booking;
import com.cabbooking.bookingservice.repository.BookingRepository;

import java.util.Map;

@Service
public class PaymentEventConsumer {

    @Autowired
    private BookingRepository bookingRepository;

    @KafkaListener(topics = "payment-events", groupId = "${spring.kafka.consumer.group-id}")
    public void consumePaymentEvent(Map<String, Object> event) {
        String eventType = (String) event.get("eventType");
        System.out.println("📥 KAFKA: Received Payment Event [" + eventType + "]");

        try {
            if ("payment.success".equals(eventType)) {
                handlePaymentSuccess(event);
            } else if ("payment.failed".equals(eventType)) {
                handlePaymentFailed(event);
            }
        } catch (Exception e) {
            System.err.println("❌ Error processing payment event: " + e.getMessage());
        }
    }

    private void handlePaymentSuccess(Map<String, Object> event) {
        Map<String, Object> data = (Map<String, Object>) event.get("data");
        if (data != null && data.containsKey("rideId")) {
            Long rideId = getLongValue(data.get("rideId"));
            
            bookingRepository.findById(rideId).ifPresent(booking -> {
                booking.setStatus(Booking.BookingStatus.COMPLETED);
                bookingRepository.save(booking);
                System.out.println("✅ Booking #" + rideId + " marked as COMPLETED after payment success");
            });
        }
    }

    private void handlePaymentFailed(Map<String, Object> event) {
        Map<String, Object> data = (Map<String, Object>) event.get("data");
        if (data != null && data.containsKey("rideId")) {
            Long rideId = getLongValue(data.get("rideId"));
            
            bookingRepository.findById(rideId).ifPresent(booking -> {
                booking.setStatus(Booking.BookingStatus.CANCELLED);
                bookingRepository.save(booking);
                System.out.println("⚠️ Booking #" + rideId + " cancelled due to payment failure");
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
