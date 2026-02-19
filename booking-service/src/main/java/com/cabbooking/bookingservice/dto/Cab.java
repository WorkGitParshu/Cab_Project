package com.cabbooking.bookingservice.dto;

public class Cab {
    private Long id;
    private String cabNumber;
    private String model;
    private String color;
    private String driverName;
    private String driverPhone;
    private String cabType;
    // ... add more as needed (should match what cab-service returns)
    // getters and setters
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
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
	public String getColor() {
		return color;
	}
	public void setColor(String color) {
		this.color = color;
	}
	public String getDriverName() {
		return driverName;
	}
	public void setDriverName(String driverName) {
		this.driverName = driverName;
	}
	public String getDriverPhone() {
		return driverPhone;
	}
	public void setDriverPhone(String driverPhone) {
		this.driverPhone = driverPhone;
	}
	public String getCabType() {
		return cabType;
	}
	public void setCabType(String cabType) {
		this.cabType = cabType;
	}
    
    
}