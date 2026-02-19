	package com.cabbooking.bookingservice.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cabbooking.bookingservice.dto.AcceptRequestDTO;
import com.cabbooking.bookingservice.dto.BookingRequest;
import com.cabbooking.bookingservice.model.Booking;
import com.cabbooking.bookingservice.service.BookingService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:5173")
public class BookingController {
    
    @Autowired
    private BookingService bookingService;
    
    
    
    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        List<Booking> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(bookings);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Long id) {
        Optional<Booking> booking = bookingService.getBookingById(id);
        return booking.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Booking>> getBookingsByUserId(@PathVariable Long userId) {
        List<Booking> bookings = bookingService.getBookingsByUserId(userId);
        return ResponseEntity.ok(bookings);
    }
    
    @GetMapping("/cab/{cabId}")
    public ResponseEntity<List<Booking>> getBookingsByCabId(@PathVariable Long cabId) {
        List<Booking> bookings = bookingService.getBookingsByCabId(cabId);
        return ResponseEntity.ok(bookings);
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Booking>> getBookingsByStatus(@PathVariable Booking.BookingStatus status) {
        List<Booking> bookings = bookingService.getBookingsByStatus(status);
        return ResponseEntity.ok(bookings);
    }
    
    @GetMapping("/user/{userId}/status/{status}")
    public ResponseEntity<List<Booking>> getBookingsByUserIdAndStatus(
            @PathVariable Long userId, @PathVariable Booking.BookingStatus status) {
        List<Booking> bookings = bookingService.getBookingsByUserIdAndStatus(userId, status);
        return ResponseEntity.ok(bookings);
    }
    
    @PostMapping
    public ResponseEntity<Booking> createBooking(@Valid @RequestBody BookingRequest request) {
        try {
            Booking booking = bookingService.createBooking(request);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Booking> updateBooking(@PathVariable Long id, @RequestBody Booking bookingDetails) {
        try {
            Booking updatedBooking = bookingService.updateBooking(id, bookingDetails);
            return ResponseEntity.ok(updatedBooking);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<Booking> updateBookingStatus(
            @PathVariable Long id, @RequestParam Booking.BookingStatus status) {
        try {
            Booking updatedBooking = bookingService.updateBookingStatus(id, status);
            return ResponseEntity.ok(updatedBooking);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long id) {
        try {
            bookingService.deleteBooking(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelBooking(@PathVariable Long id) {
        try {
            bookingService.cancelBooking(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    @PostMapping("/accept")
    public ResponseEntity<Booking> acceptBooking(@RequestBody AcceptRequestDTO acceptRequest) {
        try {
            Booking accepted = bookingService.acceptBooking(acceptRequest.getBookingId(), acceptRequest.getCabId());
            return ResponseEntity.ok(accepted);
        } catch (RuntimeException e) {
            // You can refine the status codes and error handling as needed
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    // NEW: Driver acceptance when selected from list by user
    @PostMapping("/{bookingId}/accept-by-driver/{cabId}")
    public ResponseEntity<Booking> acceptByDriver(
            @PathVariable Long bookingId,
            @PathVariable Long cabId) {
        try {
            Booking accepted = bookingService.acceptRideByDriver(bookingId, cabId);
            return ResponseEntity.ok(accepted);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(null);
        }
    }
    @Autowired
    private com.cabbooking.bookingservice.service.RideDispatchService rideDispatchService;

    @GetMapping("/dispatch/pending/driver/{driverId}")
    public ResponseEntity<com.cabbooking.bookingservice.dto.RideRequestDTO> getPendingDispatchForDriver(@PathVariable Long driverId) {
        com.cabbooking.bookingservice.dto.RideRequestDTO pending = rideDispatchService.getPendingInviteForDriver(driverId);
        if (pending != null) {
            return ResponseEntity.ok(pending);
        }
        return ResponseEntity.noContent().build();
    }
} 