package com.cabbooking.bookingservice.service;

import com.cabbooking.bookingservice.model.Location;
import org.springframework.stereotype.Service;

@Service
public class DistanceCalculationService {
    
    private static final int EARTH_RADIUS_KM = 6371; // Earth's radius in kilometers
    private static final double AVERAGE_SPEED_KMH = 30.0; // Average city speed in km/h
    
    /**
     * Calculate distance between two locations using Haversine formula
     */
    public double calculateDistance(Location location1, Location location2) {
        if (location1 == null || location2 == null) {
            throw new IllegalArgumentException("Both locations must not be null");
        }
        
        return calculateDistance(
            location1.getLatitude(), location1.getLongitude(),
            location2.getLatitude(), location2.getLongitude()
        );
    }
    
    /**
     * Calculate distance between two coordinate pairs using Haversine formula
     */
    public double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        // Convert to radians
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        
        // Haversine formula
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return EARTH_RADIUS_KM * c; // Distance in kilometers
    }
    
    /**
     * Calculate estimated travel time in minutes
     */
    public int calculateTravelTime(double distanceKm) {
        return calculateTravelTime(distanceKm, AVERAGE_SPEED_KMH);
    }
    
    /**
     * Calculate estimated travel time with custom speed
     */
    public int calculateTravelTime(double distanceKm, double averageSpeedKmh) {
        if (distanceKm <= 0 || averageSpeedKmh <= 0) {
            return 0;
        }
        
        // Time = Distance / Speed (convert to minutes)
        return (int) Math.ceil(distanceKm / averageSpeedKmh * 60);
    }
    
    /**
     * Calculate fare based on distance and cab type
     */
    public double calculateFare(double distanceKm, double baseFare, double perKmRate) {
        if (distanceKm <= 0) {
            return baseFare;
        }
        
        return baseFare + (distanceKm * perKmRate);
    }
    
    /**
     * Check if two locations are within specified radius
     */
    public boolean isWithinRadius(Location location1, Location location2, double radiusKm) {
        double distance = calculateDistance(location1, location2);
        return distance <= radiusKm;
    }
    
    /**
     * Get distance in different units
     */
    public String getFormattedDistance(double distanceKm) {
        if (distanceKm < 1) {
            return String.format("%.0f m", distanceKm * 1000);
        } else if (distanceKm < 10) {
            return String.format("%.1f km", distanceKm);
        } else {
            return String.format("%.0f km", distanceKm);
        }
    }
    
    /**
     * Get travel time in human-readable format
     */
    public String getFormattedTravelTime(int minutes) {
        if (minutes < 60) {
            return minutes + " min";
        } else {
            int hours = minutes / 60;
            int remainingMinutes = minutes % 60;
            if (remainingMinutes == 0) {
                return hours + " hr";
            } else {
                return hours + " hr " + remainingMinutes + " min";
            }
        }
    }
} 