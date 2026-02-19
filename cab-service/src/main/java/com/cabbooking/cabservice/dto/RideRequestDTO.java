package com.cabbooking.cabservice.dto;

public class RideRequestDTO {
    private Long bookingId;
    private Double pickupLat;
    private Double pickupLng;
    private Double dropLat;
    private Double dropLng;
    private Long userId;
    // Add more fields if needed

    // Constructors, getters, setters
    public RideRequestDTO() {}

    public RideRequestDTO(Long bookingId, Double pickupLat, Double pickupLng, Double dropLat, Double dropLng, Long userId) {
        this.bookingId = bookingId;
        this.pickupLat = pickupLat;
        this.pickupLng = pickupLng;
        this.dropLat = dropLat;
        this.dropLng = dropLng;
        this.userId = userId;
    }

	public Long getBookingId() {
		return bookingId;
	}

	public void setBookingId(Long bookingId) {
		this.bookingId = bookingId;
	}

	public Double getPickupLat() {
		return pickupLat;
	}

	public void setPickupLat(Double pickupLat) {
		this.pickupLat = pickupLat;
	}

	public Double getPickupLng() {
		return pickupLng;
	}

	public void setPickupLng(Double pickupLng) {
		this.pickupLng = pickupLng;
	}

	public Double getDropLat() {
		return dropLat;
	}

	public void setDropLat(Double dropLat) {
		this.dropLat = dropLat;
	}

	public Double getDropLng() {
		return dropLng;
	}

	public void setDropLng(Double dropLng) {
		this.dropLng = dropLng;
	}

	public Long getUserId() {
		return userId;
	}

	public void setUserId(Long userId) {
		this.userId = userId;
	}
    
    // getters and setters here
    
}