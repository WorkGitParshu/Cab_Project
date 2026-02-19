package com.cabbooking.paymentservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "booking-service")
public interface BookingServiceClient {
    
    @PutMapping("/api/bookings/{id}/status")
    void updateBookingStatus(@PathVariable("id") Long id, @RequestParam("status") String status);
}
