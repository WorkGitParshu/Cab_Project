package com.cabbooking.bookingservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
public class Booking {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    private Long userId;
    
    @NotNull
    private Long cabId;
    
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "pickup_location_id")
    private Location pickupLocation;       // Structured address + coordinates
    
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "drop_location_id")
    private Location dropLocation;         // Structured address + coordinates
    
    // Distance calculated automatically using Haversine formula
    @NotNull
    @Positive
    private Double distance;               // Auto-calculated from coordinates
    
    @NotNull
    @Positive
    private Double fare;
    
    @Enumerated(EnumType.STRING)
    private BookingStatus status = BookingStatus.PENDING;
    
    private LocalDateTime bookingTime = LocalDateTime.now();
    private LocalDateTime pickupTime;
    private LocalDateTime dropTime;
    
    private String driverName;
    private String driverPhone;
    private String cabNumber;
    private String cabType;
    
    public Booking() {}
    
//    public Booking(Long userId, Long cabId, String pickupLocation, String dropLocation, Double distance, Double fare) {
//        this.userId = userId;
//        this.cabId = cabId;
//        this.pickupLocation = pickupLocation;
//        this.dropLocation = dropLocation;
//        this.distance = distance;
//        this.fare = fare;
//    }
    
    public Booking(Long userId, Long cabId, Location pickupLocation, Location dropLocation, Double distance, Double fare) {
        this.userId = userId;
        this.cabId = cabId;
        this.pickupLocation = pickupLocation;
        this.dropLocation = dropLocation;
        this.distance = distance;
        this.fare = fare;
    }
    
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public Long getCabId() { return cabId; }
    public void setCabId(Long cabId) { this.cabId = cabId; }
    
//    public String getPickupLocation() { return pickupLocation; }
//    public void setPickupLocation(String pickupLocation) { this.pickupLocation = pickupLocation; }
//    
//    public String getDropLocation() { return dropLocation; }
//    public void setDropLocation(String dropLocation) { this.dropLocation = dropLocation; }
    
    public Location getPickupLocation() { return pickupLocation; }
    public void setPickupLocation(Location pickupLocation) { this.pickupLocation = pickupLocation; }

    public Location getDropLocation() { return dropLocation; }
    public void setDropLocation(Location dropLocation) { this.dropLocation = dropLocation; }
    
    public Double getDistance() { return distance; }
    public void setDistance(Double distance) { this.distance = distance; }
    
    public Double getFare() { return fare; }
    public void setFare(Double fare) { this.fare = fare; }
    
    public BookingStatus getStatus() { return status; }
    public void setStatus(BookingStatus status) { this.status = status; }
    
    public LocalDateTime getBookingTime() { return bookingTime; }
    public void setBookingTime(LocalDateTime bookingTime) { this.bookingTime = bookingTime; }
    
    public LocalDateTime getPickupTime() { return pickupTime; }
    public void setPickupTime(LocalDateTime pickupTime) { this.pickupTime = pickupTime; }
    
    public LocalDateTime getDropTime() { return dropTime; }
    public void setDropTime(LocalDateTime dropTime) { this.dropTime = dropTime; }
    
    public String getDriverName() { return driverName; }
    public void setDriverName(String driverName) { this.driverName = driverName; }
    
    public String getDriverPhone() { return driverPhone; }
    public void setDriverPhone(String driverPhone) { this.driverPhone = driverPhone; }
    
    public String getCabNumber() { return cabNumber; }
    public void setCabNumber(String cabNumber) { this.cabNumber = cabNumber; }

    public String getCabType() { return cabType; }
    public void setCabType(String cabType) { this.cabType = cabType; }
    
    
    public enum BookingStatus {
        PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, PAID, CANCELLED
    }
} 