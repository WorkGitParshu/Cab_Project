package com.cabbooking.bookingservice.dto;

/**
 * DTO for driver confirmation/rejection of a ride request
 * Sent from driver app through WebSocket
 */
public class DriverConfirmationDTO {
    
    private Long bookingId;
    private Long driverId;
    private String status; // "ACCEPTED" or "REJECTED"
    private String reason; // Optional reason for rejection
    private Long timestamp;
    
    // Constructors
    public DriverConfirmationDTO() {
        this.timestamp = System.currentTimeMillis();
    }
    
    public DriverConfirmationDTO(Long bookingId, Long driverId, String status) {
        this();
        this.bookingId = bookingId;
        this.driverId = driverId;
        this.status = status;
    }
    
    public DriverConfirmationDTO(Long bookingId, Long driverId, String status, String reason) {
        this();
        this.bookingId = bookingId;
        this.driverId = driverId;
        this.status = status;
        this.reason = reason;
    }
    
    // Getters and Setters
    public Long getBookingId() {
        return bookingId;
    }
    
    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }
    
    public Long getDriverId() {
        return driverId;
    }
    
    public void setDriverId(Long driverId) {
        this.driverId = driverId;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getReason() {
        return reason;
    }
    
    public void setReason(String reason) {
        this.reason = reason;
    }
    
    public Long getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(Long timestamp) {
        this.timestamp = timestamp;
    }
    
    @Override
    public String toString() {
        return "DriverConfirmationDTO{" +
                "bookingId=" + bookingId +
                ", driverId=" + driverId +
                ", status='" + status + '\'' +
                ", reason='" + reason + '\'' +
                ", timestamp=" + timestamp +
                '}';
    }
}
