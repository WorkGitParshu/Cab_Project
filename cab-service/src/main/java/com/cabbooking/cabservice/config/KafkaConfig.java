package com.cabbooking.cabservice.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    // Topic names
    public static final String CAB_TOPIC = "cab-events";
    public static final String BOOKING_TOPIC = "booking-events";

    @Bean
    public NewTopic cabEventsTopic() {
        return TopicBuilder.name(CAB_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }
}
