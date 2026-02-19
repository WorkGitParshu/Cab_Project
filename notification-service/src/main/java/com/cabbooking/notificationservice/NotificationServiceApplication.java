package com.cabbooking.notificationservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import com.cabbooking.notificationservice.service.NotificationBroadcastService;

import java.util.HashMap;
import java.util.Map;

@SpringBootApplication
@EnableDiscoveryClient
@RestController
public class NotificationServiceApplication {

    public static void main(String[] args) {
        System.out.println("🚀 Notification Service starting on port 8083...");
        SpringApplication.run(NotificationServiceApplication.class, args);
    }

    @Autowired
    private NotificationBroadcastService broadcastService;

    // Health Check & Manual Test
    @GetMapping("/test-notification")
    public String test(@RequestParam(defaultValue = "Sample Test Message") String message) {
        System.out.println("🔔 Manual test triggered: " + message);
        
        Map<String, Object> testData = new HashMap<>();
        testData.put("content", message);
        testData.put("userId", 1L);
        
        broadcastService.broadcastNotification(
            "test.notification",
            message,
            1L,
            testData
        );
        
        return "Notification sent successfully to /topic/notifications!";
    }

    @GetMapping("/hello")
    public String hello() {
        return "Notification Service is ACTIVE ✅";
    }
}
