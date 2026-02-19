package com.cabbooking.bookingservice.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;

public class BookingRequest {
    
    @NotNull(message = "User ID is required")
    private Long userId;
    
    @NotNull(message = "Cab ID is required")
    private Long cabId;
    
    @NotBlank(message = "Pickup location is required")
    private String pickupLocation; // Format: "lat,lng"
    
    @NotBlank(message = "Drop location is required")
    private String dropLocation; // Format: "lat,lng"
    
    private String pickupAddress; // Human readable address
    private String dropAddress;   // Human readable address
    
    // Distance will be calculated automatically from coordinates
    // No need for manual distance input
    
    public BookingRequest() {}
    
    public BookingRequest(Long userId, Long cabId, String pickupLocation, String dropLocation) {
        this.userId = userId;
        this.cabId = cabId;
        this.pickupLocation = pickupLocation;
        this.dropLocation = dropLocation;
    }

    public BookingRequest(Long userId, Long cabId, String pickupLocation, String dropLocation, String pickupAddress, String dropAddress) {
        this.userId = userId;
        this.cabId = cabId;
        this.pickupLocation = pickupLocation;
        this.dropLocation = dropLocation;
        this.pickupAddress = pickupAddress;
        this.dropAddress = dropAddress;
    }
    
    // Getters and Setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public Long getCabId() { return cabId; }
    public void setCabId(Long cabId) { this.cabId = cabId; }
    
    public String getPickupLocation() { return pickupLocation; }
    public void setPickupLocation(String pickupLocation) { this.pickupLocation = pickupLocation; }
    
    public String getDropLocation() { return dropLocation; }
    public void setDropLocation(String dropLocation) { this.dropLocation = dropLocation; }
    
    public String getPickupAddress() { return pickupAddress; }
    public void setPickupAddress(String pickupAddress) { this.pickupAddress = pickupAddress; }
    
    public String getDropAddress() { return dropAddress; }
    public void setDropAddress(String dropAddress) { this.dropAddress = dropAddress; }
    
    // Distance is calculated automatically, no getter/setter needed
} 