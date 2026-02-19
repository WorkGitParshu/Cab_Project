package com.cabbooking.notificationservice.config;

import org.springframework.context.annotation.Configuration;

@Configuration
public class KafkaConfig {

    // Topic names
    public static final String BOOKING_TOPIC = "booking-events";
    public static final String PAYMENT_TOPIC = "payment-events";
    public static final String CAB_TOPIC = "cab-events";
}
