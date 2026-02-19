package com.cabbooking.cabservice.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.cabbooking.cabservice.dto.RideRequestDTO;
import com.cabbooking.cabservice.model.Cab;
import com.cabbooking.cabservice.model.Cab.CabStatus;
import com.cabbooking.cabservice.model.Location;
import com.cabbooking.cabservice.repository.CabRepository;

@Service
public class CabService {
    
    @Autowired
    private CabRepository cabRepository;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private CabEventProducer cabEventProducer;
    
    public List<Cab> getAllCabs() {
        return cabRepository.findAll();
    }
    
    public Optional<Cab> getCabById(Long id) {
        return cabRepository.findById(id);
    }
    
    public List<Cab> getAvailableCabs() {
        return cabRepository.findByStatus(Cab.CabStatus.AVAILABLE);
    }
    
    public List<Cab> getCabsByType(Cab.CabType cabType) {
        return cabRepository.findByCabType(cabType);
    }
    
    public List<Cab> getAvailableCabsByType(Cab.CabType cabType) {
        return cabRepository.findByStatusAndCabType(Cab.CabStatus.AVAILABLE, cabType);
    }
    
    public List<Cab> searchCabsByLocation(String address) {
        return cabRepository.findByCurrentLocation_AddressContainingIgnoreCase(address);
    }
    
    public Cab addCab(Cab cab) {
        return cabRepository.save(cab);
    }
    
    public Cab updateCab(Long id, Cab cabDetails) {
        Cab cab = cabRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cab not found"));
        
        cab.setCabNumber(cabDetails.getCabNumber());
        cab.setModel(cabDetails.getModel());
        cab.setColor(cabDetails.getColor());
        cab.setCapacity(cabDetails.getCapacity());
        cab.setBaseFare(cabDetails.getBaseFare());
        cab.setPerKmRate(cabDetails.getPerKmRate());
        cab.setCabType(cabDetails.getCabType());
        cab.setDriverName(cabDetails.getDriverName());
        cab.setDriverPhone(cabDetails.getDriverPhone());
        cab.setCurrentLocation(cabDetails.getCurrentLocation());
        
        return cabRepository.save(cab);
    }
    
    public Cab updateCabStatus(Long id, Cab.CabStatus status) {
        Cab cab = cabRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cab not found"));
        cab.setStatus(status);
        Cab updatedCab = cabRepository.save(cab);
        
        // KAFKA: Cab Status Updated Event
        cabEventProducer.sendCabEvent(
            "cab.status.updated",
            "Cab #" + id + " status changed to " + status,
            id,
            updatedCab
        );
        
        return updatedCab;
    }
    
    public void deleteCab(Long id) {
        cabRepository.deleteById(id);
    }
    
    public Double calculateFare(Long cabId, Double distance) {
        Cab cab = cabRepository.findById(cabId)
                .orElseThrow(() -> new RuntimeException("Cab not found"));
        return cab.getBaseFare() + (cab.getPerKmRate() * distance);
    }
    
    public void updateLocation(Long cabId, Double latitude, Double longitude) {
        Cab cab = cabRepository.findById(cabId).orElseThrow();
        Location location = cab.getCurrentLocation();
        if (location == null) location = new Location();
        location.setLatitude(latitude);
        location.setLongitude(longitude);
        cab.setCurrentLocation(location);
        cabRepository.save(cab);
        
        // KAFKA: Driver Location Updated Event
        cabEventProducer.sendCabEvent(
            "driver.location.updated",
            "Driver #" + cabId + " location updated to (" + latitude + ", " + longitude + ")",
            cabId,
            cab
        );
    }
    
    public List<Cab> findAvailableCabsNear(double lat, double lng, double radiusKm) {
        return cabRepository.findAll().stream()
            .filter(cab -> cab.getStatus() == CabStatus.AVAILABLE)
            .filter(cab -> cab.getCurrentLocation() != null)
            .filter(cab -> {
                Location loc = cab.getCurrentLocation();
                double dist = haversine(lat, lng, loc.getLatitude(), loc.getLongitude());
                return dist <= radiusKm;
            })
            .collect(Collectors.toList());
    }
    // Haversine (in KM)
    public static double haversine(double lat1, double lng1, double lat2, double lng2) {
        double R = 6371; // Radius earth in KM
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat/2) * Math.sin(dLat/2)
                 + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                 * Math.sin(dLng/2) * Math.sin(dLng/2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }
    
    public void sendRideRequestToCabs(RideRequestDTO rideRequest) {
    	System.out.println("Publishing ride request to /topic/cab-requests: " + rideRequest);
        messagingTemplate.convertAndSend("/topic/cab-requests", rideRequest);
        // Optionally log or restrict by geolocation
    }
    
} 