package com.cabbooking.userservice.config;

import org.springframework.context.annotation.Configuration;

@Configuration
public class KafkaConfig {

    // Topic names
    public static final String USER_EVENTS_TOPIC = "user-events";
    public static final String DRIVER_EVENTS_TOPIC = "driver-events";

}
