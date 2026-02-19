package com.cabbooking.cabservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "cabs")
public class Cab {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    private String cabNumber;
    
    @NotBlank
    private String model;
    
    @NotBlank
    private String color;
    
    @NotNull
    private Integer capacity;
    
    @NotNull
    private Double baseFare;
    
    @NotNull
    private Double perKmRate;
    
    @Enumerated(EnumType.STRING)
    private CabType cabType;
    
    @Enumerated(EnumType.STRING)
    private CabStatus status = CabStatus.AVAILABLE;
    
    private String driverName;
    private String driverPhone;
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "current_location_id")
    private Location currentLocation;
    
    public Cab() {}
    
    public Cab(String cabNumber, String model, String color, Integer capacity, 
               Double baseFare, Double perKmRate, CabType cabType) {
        this.cabNumber = cabNumber;
        this.model = model;
        this.color = color;
        this.capacity = capacity;
        this.baseFare = baseFare;
        this.perKmRate = perKmRate;
        this.cabType = cabType;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getCabNumber() { return cabNumber; }
    public void setCabNumber(String cabNumber) { this.cabNumber = cabNumber; }
    
    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }
    
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    
    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    
    public Double getBaseFare() { return baseFare; }
    public void setBaseFare(Double baseFare) { this.baseFare = baseFare; }
    
    public Double getPerKmRate() { return perKmRate; }
    public void setPerKmRate(Double perKmRate) { this.perKmRate = perKmRate; }
    
    public CabType getCabType() { return cabType; }
    public void setCabType(CabType cabType) { this.cabType = cabType; }
    
    public CabStatus getStatus() { return status; }
    public void setStatus(CabStatus status) { this.status = status; }
    
    public String getDriverName() { return driverName; }
    public void setDriverName(String driverName) { this.driverName = driverName; }
    
    public String getDriverPhone() { return driverPhone; }
    public void setDriverPhone(String driverPhone) { this.driverPhone = driverPhone; }
    
    public Location getCurrentLocation() { return currentLocation; }
    public void setCurrentLocation(Location currentLocation) { this.currentLocation = currentLocation; }
    
    public enum CabType {
        MINI, SEDAN, SUV, LUXURY
    }
    
    public enum CabStatus {
        AVAILABLE, BUSY, OFFLINE, MAINTENANCE
    }
} 