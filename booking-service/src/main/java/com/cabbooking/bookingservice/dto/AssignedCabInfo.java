package com.cabbooking.bookingservice.dto;

public class AssignedCabInfo {
	private Long bookingId;
    private Long userId;
    private Long cabId;
    private String driverName;
    private String cabNumber;
    private String model;
    private String cabType;
    private Double pickupLat;
    private Double pickupLng;
	public Long getBookingId() {
		return bookingId;
	}
	public void setBookingId(Long bookingId) {
		this.bookingId = bookingId;
	}
	public Long getUserId() {
		return userId;
	}
	public void setUserId(Long userId) {
		this.userId = userId;
	}
	public Long getCabId() {
		return cabId;
	}
	public void setCabId(Long cabId) {
		this.cabId = cabId;
	}
	public String getDriverName() {
		return driverName;
	}
	public void setDriverName(String driverName) {
		this.driverName = driverName;
	}
	public String getCabNumber() {
		return cabNumber;
	}
	public void setCabNumber(String cabNumber) {
		this.cabNumber = cabNumber;
	}
	public String getModel() {
		return model;
	}
	public void setModel(String model) {
		this.model = model;
	}
	public String getCabType() {
		return cabType;
	}
	public void setCabType(String cabType) {
		this.cabType = cabType;
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
    
	@Override
	public String toString() {
	    return "AssignedCabInfo{" +
	            "bookingId=" + bookingId +
	            ", userId=" + userId +
	            ", cabId=" + cabId +
	            ", driverName='" + driverName + '\'' +
	            ", cabNumber='" + cabNumber + '\'' +
	            ", model='" + model + '\'' +
	            ", cabType='" + cabType + '\'' +
	            // Add more fields as needed!
	            '}';
	}
    
}
