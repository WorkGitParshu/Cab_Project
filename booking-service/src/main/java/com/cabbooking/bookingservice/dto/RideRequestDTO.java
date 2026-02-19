package com.cabbooking.bookingservice.dto;

public class RideRequestDTO {
	 	private Long bookingId;
	    private Double pickupLat;
	    private Double pickupLng;
	    private Double dropLat;
	    private Double dropLng;
	    private Long userId;
	    private Double distance;
	    private Double fare;
	    private String pickupAddress;
	    private String dropAddress;
	    
		public RideRequestDTO(Long bookingId, Double pickupLat, Double pickupLng, Double dropLat, Double dropLng,
				Long userId) {
			super();
			this.bookingId = bookingId;
			this.pickupLat = pickupLat;
			this.pickupLng = pickupLng;
			this.dropLat = dropLat;
			this.dropLng = dropLng;
			this.userId = userId;
		}

		public RideRequestDTO(Long bookingId, Double pickupLat, Double pickupLng, Double dropLat, Double dropLng,
				Long userId, Double distance, Double fare, String pickupAddress, String dropAddress) {
			super();
			this.bookingId = bookingId;
			this.pickupLat = pickupLat;
			this.pickupLng = pickupLng;
			this.dropLat = dropLat;
			this.dropLng = dropLng;
			this.userId = userId;
			this.distance = distance;
			this.fare = fare;
			this.pickupAddress = pickupAddress;
			this.dropAddress = dropAddress;
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
		public Double getDistance() {
			return distance;
		}
		public void setDistance(Double distance) {
			this.distance = distance;
		}
		public Double getFare() {
			return fare;
		}
		public void setFare(Double fare) {
			this.fare = fare;
		}
		public String getPickupAddress() {
			return pickupAddress;
		}
		public void setPickupAddress(String pickupAddress) {
			this.pickupAddress = pickupAddress;
		}
		public String getDropAddress() {
			return dropAddress;
		}
		public void setDropAddress(String dropAddress) {
			this.dropAddress = dropAddress;
		}
	    
	    
}
