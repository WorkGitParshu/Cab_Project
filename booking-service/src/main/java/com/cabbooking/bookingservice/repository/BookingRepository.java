package com.cabbooking.bookingservice.repository;

import com.cabbooking.bookingservice.model.Booking;
//import com.cabbooking.bookingservice.model.BookingStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserId(Long userId);
    List<Booking> findByCabId(Long cabId);
    List<Booking> findByStatus(Booking.BookingStatus status);
    List<Booking> findByUserIdAndStatus(Long userId, Booking.BookingStatus status);
} 