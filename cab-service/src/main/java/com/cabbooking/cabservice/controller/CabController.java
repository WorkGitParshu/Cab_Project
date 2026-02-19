package com.cabbooking.cabservice.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cabbooking.cabservice.dto.LocationUpdateRequest;
import com.cabbooking.cabservice.dto.RideRequestDTO;
import com.cabbooking.cabservice.model.Cab;
import com.cabbooking.cabservice.repository.CabRepository;
import com.cabbooking.cabservice.service.CabService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/cabs")
@CrossOrigin(origins = "http://localhost:5173")
public class CabController {
    
    @Autowired
    private CabService cabService;
    
    @Autowired
    private CabRepository cabRepository;
    
    @GetMapping
    public ResponseEntity<List<Cab>> getAllCabs() {
        List<Cab> cabs = cabService.getAllCabs();
        return ResponseEntity.ok(cabs);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Cab> getCabById(@PathVariable Long id) {
        Optional<Cab> cab = cabService.getCabById(id);
        return cab.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/available")
    public ResponseEntity<List<Cab>> getAvailableCabs() {
        List<Cab> cabs = cabService.getAvailableCabs();
        return ResponseEntity.ok(cabs);
    }
    
    @GetMapping("/type/{cabType}")
    public ResponseEntity<List<Cab>> getCabsByType(@PathVariable Cab.CabType cabType) {
        List<Cab> cabs = cabService.getCabsByType(cabType);
        return ResponseEntity.ok(cabs);
    }
    
    @GetMapping("/available/type/{cabType}")
    public ResponseEntity<List<Cab>> getAvailableCabsByType(@PathVariable Cab.CabType cabType) {
        List<Cab> cabs = cabService.getAvailableCabsByType(cabType);
        return ResponseEntity.ok(cabs);
    }
    
    @GetMapping("/search/location")
    public ResponseEntity<List<Cab>> searchCabsByLocation(@RequestParam String location) {
        List<Cab> cabs = cabService.searchCabsByLocation(location);
        return ResponseEntity.ok(cabs);
    }
    
    @PostMapping
    public ResponseEntity<Cab> addCab(@Valid @RequestBody Cab cab) {
        Cab newCab = cabService.addCab(cab);
        return ResponseEntity.ok(newCab);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Cab> updateCab(@PathVariable Long id, @RequestBody Cab cabDetails) {
        try {
            Cab updatedCab = cabService.updateCab(id, cabDetails);
            return ResponseEntity.ok(updatedCab);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<Cab> updateCabStatus(@PathVariable Long id, @RequestParam Cab.CabStatus status) {
        try {
            Cab updatedCab = cabService.updateCabStatus(id, status);
            return ResponseEntity.ok(updatedCab);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCab(@PathVariable Long id) {
        try {
            cabService.deleteCab(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/{id}/fare")
    public ResponseEntity<Double> calculateFare(@PathVariable Long id, @RequestParam Double distance) {
        try {
            Double fare = cabService.calculateFare(id, distance);
            return ResponseEntity.ok(fare);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    //I started
    
    @PutMapping("/{cabId}/location")
    public ResponseEntity<Void> updateLocation(@PathVariable Long cabId, @RequestBody LocationUpdateRequest loc) {
        cabService.updateLocation(cabId, loc.getLatitude(), loc.getLongitude());
        return ResponseEntity.ok().build();
    }
    
    
    @GetMapping("/nearby")
    public List<Cab> getNearbyCabs(
        @RequestParam double latitude,
        @RequestParam double longitude,
        @RequestParam(required = false, defaultValue = "3") double radiusKm
    ) {
        return cabService.findAvailableCabsNear(latitude, longitude, radiusKm);
    }
    
    @PostMapping("/notify/request")
    public ResponseEntity<?> notifyRequest(@RequestBody RideRequestDTO request) {
    	System.out.println("➡️ Received notify request: " + request);
        cabService.sendRideRequestToCabs(request);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/login")
    public ResponseEntity<Cab> loginCab(@RequestParam String cabNumber, @RequestParam String driverPhone) {
        Optional<Cab> cab = cabRepository.findByCabNumberAndDriverPhone(cabNumber, driverPhone);
        if (cab.isPresent()) {
            Cab cabToLogin = cab.get();
            cabToLogin.setStatus(Cab.CabStatus.AVAILABLE);
            Cab updatedCab = cabRepository.save(cabToLogin);
            return ResponseEntity.ok(updatedCab);
        }
        return ResponseEntity.notFound().build();
    }
    
} 