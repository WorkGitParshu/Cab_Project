package com.cabbooking.bookingservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Entity
@Table(name = "locations")
public class Location {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    private Double latitude;           // Latitude coordinate
    
    @NotNull
    private Double longitude;          // Longitude coordinate
    
    @NotBlank
    private String address;            // Full address string
    
    private String street;             // Street name
    private String city;               // City name
    private String state;              // State/Province
    private String country;            // Country
    private String postalCode;         // Postal/ZIP code
    
    private String landmark;           // Nearby landmark
    private String area;               // Area/Neighborhood
    
    @Enumerated(EnumType.STRING)
    private LocationType type;         // PICKUP, DROP, CAB_LOCATION
    
    private LocalDateTime lastUpdated; // Last update timestamp
    
    // Default constructor
    public Location() {
        this.lastUpdated = LocalDateTime.now();
    }
    
    // Constructor with coordinates and address
    public Location(Double latitude, Double longitude, String address) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.address = address;
        this.lastUpdated = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Double getLatitude() {
        return latitude;
    }
    
    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }
    
    public Double getLongitude() {
        return longitude;
    }
    
    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }
    
    public String getAddress() {
        return address;
    }
    
    public void setAddress(String address) {
        this.address = address;
    }
    
    public String getStreet() {
        return street;
    }
    
    public void setStreet(String street) {
        this.street = street;
    }
    
    public String getCity() {
        return city;
    }
    
    public void setCity(String city) {
        this.city = city;
    }
    
    public String getState() {
        return state;
    }
    
    public void setState(String state) {
        this.state = state;
    }
    
    public String getCountry() {
        return country;
    }
    
    public void setCountry(String country) {
        this.country = country;
    }
    
    public String getPostalCode() {
        return postalCode;
    }
    
    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }
    
    public String getLandmark() {
        return landmark;
    }
    
    public void setLandmark(String landmark) {
        this.landmark = landmark;
    }
    
    public String getArea() {
        return area;
    }
    
    public void setArea(String area) {
        this.area = area;
    }
    
    public LocationType getType() {
        return type;
    }
    
    public void setType(LocationType type) {
        this.type = type;
    }
    
    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }
    
    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
    
    // Update timestamp when location changes
    @PreUpdate
    public void preUpdate() {
        this.lastUpdated = LocalDateTime.now();
    }
    
    @Override
    public String toString() {
        return "Location{" +
                "id=" + id +
                ", latitude=" + latitude +
                ", longitude=" + longitude +
                ", address='" + address + '\'' +
                ", city='" + city + '\'' +
                ", type=" + type +
                '}';
    }
} 