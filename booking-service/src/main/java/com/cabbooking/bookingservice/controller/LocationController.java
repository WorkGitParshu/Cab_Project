package com.cabbooking.bookingservice.controller;

import com.cabbooking.bookingservice.model.Location;
import com.cabbooking.bookingservice.model.LocationType;
import com.cabbooking.bookingservice.repository.LocationRepository;
import com.cabbooking.bookingservice.service.GeocodingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
@CrossOrigin(origins = "http://localhost:5173")
public class LocationController {
    
    @Autowired
    private LocationRepository locationRepository;
    
    @Autowired
    private GeocodingService geocodingService;
    
    /**
     * Search locations by text
     */
    @GetMapping("/search")
    public ResponseEntity<List<Location>> searchLocations(@RequestParam String q) {
        if (q == null || q.trim().length() < 2) {
            return ResponseEntity.badRequest().build();
        }
        
        List<Location> locations = locationRepository
            .findByAddressOrCityOrLandmarkContainingIgnoreCase(q.trim());
        
        return ResponseEntity.ok(locations);
    }
    
    /**
     * Get popular locations
     */
    @GetMapping("/popular")
    public ResponseEntity<List<Location>> getPopularLocations() {
        List<Location> locations = locationRepository.findPopularLocations();
        return ResponseEntity.ok(locations);
    }
    
    /**
     * Get locations by type
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<List<Location>> getLocationsByType(@PathVariable LocationType type) {
        List<Location> locations = locationRepository.findByType(type);
        return ResponseEntity.ok(locations);
    }
    
    /**
     * Get locations by city
     */
    @GetMapping("/city/{city}")
    public ResponseEntity<List<Location>> getLocationsByCity(@PathVariable String city) {
        List<Location> locations = locationRepository.findByCityIgnoreCase(city);
        return ResponseEntity.ok(locations);
    }
    
    /**
     * Find locations within radius
     */
    @GetMapping("/nearby")
    public ResponseEntity<List<Location>> getNearbyLocations(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam(defaultValue = "5.0") Double radius) {
        
        List<Location> locations = locationRepository.findLocationsWithinRadius(lat, lng, radius);
        return ResponseEntity.ok(locations);
    }
    
    /**
     * Geocode an address
     */
    @PostMapping("/geocode")
    public ResponseEntity<Location> geocodeAddress(
            @RequestParam String address,
            @RequestParam(defaultValue = "LANDMARK") LocationType type) {
        
        try {
            Location location = geocodingService.geocodeAddress(address, type);
            return ResponseEntity.ok(location);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Reverse geocode coordinates
     */
    @GetMapping("/reverse-geocode")
    public ResponseEntity<String> reverseGeocode(
            @RequestParam Double lat,
            @RequestParam Double lng) {
        
        try {
            String address = geocodingService.reverseGeocode(lat, lng);
            return ResponseEntity.ok(address);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Validate address
     */
    @PostMapping("/validate")
    public ResponseEntity<Boolean> validateAddress(@RequestParam String address) {
        boolean isValid = geocodingService.isValidAddress(address);
        return ResponseEntity.ok(isValid);
    }
    
    /**
     * Get all locations
     */
    @GetMapping
    public ResponseEntity<List<Location>> getAllLocations() {
        List<Location> locations = locationRepository.findAll();
        return ResponseEntity.ok(locations);
    }
    
    /**
     * Get location by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Location> getLocationById(@PathVariable Long id) {
        return locationRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
} 