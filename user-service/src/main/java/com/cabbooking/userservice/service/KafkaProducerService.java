package com.cabbooking.userservice.service;

import com.cabbooking.userservice.config.KafkaConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class KafkaProducerService {

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    public void publishUserRegistrationEvent(Long userId, String firstName, String email) {
        Map<String, Object> event = new HashMap<>();
        event.put("eventType", "user.registered");
        event.put("message", "User " + firstName + " registered successfully");
        event.put("entityId", userId);
        event.put("timestamp", System.currentTimeMillis());

        Map<String, Object> data = new HashMap<>();
        data.put("userId", userId);
        data.put("firstName", firstName);
        data.put("email", email);
        event.put("data", data);

        kafkaTemplate.send(KafkaConfig.USER_EVENTS_TOPIC, event);
        System.out.println("📤 KAFKA: Published user.registered event for user #" + userId);
    }

    public void publishUserLoginEvent(Long userId, String firstName, String email) {
        Map<String, Object> event = new HashMap<>();
        event.put("eventType", "user.login");
        event.put("message", firstName + " logged in successfully");
        event.put("entityId", userId);
        event.put("timestamp", System.currentTimeMillis());

        Map<String, Object> data = new HashMap<>();
        data.put("userId", userId);
        data.put("firstName", firstName);
        data.put("email", email);
        event.put("data", data);

        kafkaTemplate.send(KafkaConfig.USER_EVENTS_TOPIC, event);
        System.out.println("📤 KAFKA: Published user.login event for user #" + userId);
    }
}
