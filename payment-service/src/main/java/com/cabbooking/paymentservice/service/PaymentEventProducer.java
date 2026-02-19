package com.cabbooking.paymentservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import com.cabbooking.paymentservice.config.KafkaConfig;

import java.util.HashMap;
import java.util.Map;

@Service
public class PaymentEventProducer {

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    public void sendPaymentEvent(String eventType, String message, Long entityId, Object data) {
        Map<String, Object> event = new HashMap<>();
        event.put("eventType", eventType);
        event.put("message", message);
        event.put("timestamp", System.currentTimeMillis());
        event.put("entityId", entityId);
        event.put("data", data);

        try {
            kafkaTemplate.send(KafkaConfig.PAYMENT_TOPIC, eventType, event);
            System.out.println("✅ KAFKA: Produced [" + eventType + "] - " + message);
        } catch (Exception e) {
            System.err.println("❌ KAFKA ERROR: Failed to produce [" + eventType + "]: " + e.getMessage());
        }
    }
}
