package com.cabbooking.bookingservice.service;

import com.cabbooking.bookingservice.model.Location;
import com.cabbooking.bookingservice.model.LocationType;

public interface GeocodingService {
    
    /**
     * Convert address to coordinates and create Location entity
     */
    Location geocodeAddress(String address);
    
    /**
     * Convert address to coordinates with specific type
     */
    Location geocodeAddress(String address, LocationType type);
    
    /**
     * Convert coordinates to address (reverse geocoding)
     */
    String reverseGeocode(Double latitude, Double longitude);
    
    /**
     * Validate address format
     */
    boolean isValidAddress(String address);
    
    /**
     * Create a mock location for development/testing
     */
    Location createMockLocation(String address, LocationType type);
} 