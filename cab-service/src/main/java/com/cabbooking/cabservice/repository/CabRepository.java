package com.cabbooking.cabservice.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.cabbooking.cabservice.model.Cab;

@Repository
public interface CabRepository extends JpaRepository<Cab, Long> {
	Optional<Cab> findByCabNumberAndDriverPhone(String cabNumber, String driverPhone);
    List<Cab> findByStatus(Cab.CabStatus status);
    List<Cab> findByCabType(Cab.CabType cabType);
    List<Cab> findByStatusAndCabType(Cab.CabStatus status, Cab.CabType cabType);
    List<Cab> findByStatusAndCurrentLocationIsNotNull(Cab.CabStatus status);
//    List<Cab> findByCurrentLocationContainingIgnoreCase(String location);
    List<Cab> findByCurrentLocation_AddressContainingIgnoreCase(String address);
    @Query("SELECT c FROM Cab c WHERE c.status = :status AND c.currentLocation.latitude IS NOT NULL AND c.currentLocation.longitude IS NOT NULL")
    List<Cab> findAvailableCabsWithLocation(Cab.CabStatus status);
    
} 