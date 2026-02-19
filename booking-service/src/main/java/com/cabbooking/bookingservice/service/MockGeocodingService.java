package com.cabbooking.bookingservice.service;

import com.cabbooking.bookingservice.model.Location;
import com.cabbooking.bookingservice.model.LocationType;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class MockGeocodingService implements GeocodingService {
    
    private final Random random = new Random();
    
    // Mock coordinates for common cities (for development/testing)
    private final Map<String, double[]> cityCoordinates = new HashMap<>();
    
    public MockGeocodingService() {
        // Initialize with some common city coordinates
        cityCoordinates.put("mumbai", new double[]{19.0760, 72.8777});
        cityCoordinates.put("delhi", new double[]{28.7041, 77.1025});
        cityCoordinates.put("bangalore", new double[]{12.9716, 77.5946});
        cityCoordinates.put("chennai", new double[]{13.0827, 80.2707});
        cityCoordinates.put("kolkata", new double[]{22.5726, 88.3639});
        cityCoordinates.put("hyderabad", new double[]{17.3850, 78.4867});
        cityCoordinates.put("pune", new double[]{18.5204, 73.8567});
        cityCoordinates.put("ahmedabad", new double[]{23.0225, 72.5714});
        cityCoordinates.put("jaipur", new double[]{26.9124, 75.7873});
        cityCoordinates.put("lucknow", new double[]{26.8467, 80.9462});
    }
    
    @Override
    public Location geocodeAddress(String address) {
        return geocodeAddress(address, LocationType.LANDMARK);
    }
    
    @Override
    public Location geocodeAddress(String address, LocationType type) {
        if (address == null || address.trim().isEmpty()) {
            throw new IllegalArgumentException("Address cannot be null or empty");
        }
        
        String addressLower = address.toLowerCase();
        
        // Try to find city coordinates
        double[] coordinates = findCityCoordinates(addressLower);
        
        if (coordinates == null) {
            // Generate random coordinates if city not found
            coordinates = generateRandomCoordinates();
        }
        
        // Add some random offset to make it more realistic
        double lat = coordinates[0] + (random.nextDouble() - 0.5) * 0.01; // ±0.005 degrees
        double lng = coordinates[1] + (random.nextDouble() - 0.5) * 0.01; // ±0.005 degrees
        
        Location location = new Location(lat, lng, address);
        location.setType(type);
        
        // Parse address components
        parseAddressComponents(address, location);
        
        return location;
    }
    
    @Override
    public String reverseGeocode(Double latitude, Double longitude) {
        if (latitude == null || longitude == null) {
            return "Unknown Location";
        }
        
        // Find nearest city
        String nearestCity = findNearestCity(latitude, longitude);
        return nearestCity + " Area";
    }
    
    @Override
    public boolean isValidAddress(String address) {
        return address != null && address.trim().length() > 5;
    }
    
    @Override
    public Location createMockLocation(String address, LocationType type) {
        return geocodeAddress(address, type);
    }
    
    private double[] findCityCoordinates(String address) {
        for (Map.Entry<String, double[]> entry : cityCoordinates.entrySet()) {
            if (address.contains(entry.getKey())) {
                return entry.getValue();
            }
        }
        return null;
    }
    
    private double[] generateRandomCoordinates() {
        // Generate coordinates within India bounds
        double lat = 8.0 + random.nextDouble() * 37.0; // 8°N to 37°N
        double lng = 68.0 + random.nextDouble() * 97.0; // 68°E to 97°E
        return new double[]{lat, lng};
    }
    
    private String findNearestCity(double lat, double lng) {
        String nearestCity = "Unknown";
        double minDistance = Double.MAX_VALUE;
        
        for (Map.Entry<String, double[]> entry : cityCoordinates.entrySet()) {
            double[] cityCoords = entry.getValue();
            double distance = calculateDistance(lat, lng, cityCoords[0], cityCoords[1]);
            
            if (distance < minDistance) {
                minDistance = distance;
                nearestCity = entry.getKey();
            }
        }
        
        return nearestCity.substring(0, 1).toUpperCase() + nearestCity.substring(1);
    }
    
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        // Simple distance calculation for finding nearest city
        double latDiff = lat2 - lat1;
        double lonDiff = lon2 - lon1;
        return Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);
    }
    
    private void parseAddressComponents(String address, Location location) {
        String[] parts = address.split(",");
        
        if (parts.length >= 1) {
            location.setStreet(parts[0].trim());
        }
        
        if (parts.length >= 2) {
            location.setArea(parts[1].trim());
        }
        
        if (parts.length >= 3) {
            location.setCity(parts[2].trim());
        }
        
        if (parts.length >= 4) {
            location.setState(parts[3].trim());
        }
        
        // Set country as India for mock data
        location.setCountry("India");
        
        // Set landmark if it's a landmark type
        if (location.getType() == LocationType.LANDMARK) {
            location.setLandmark(location.getStreet());
        }
    }
} 