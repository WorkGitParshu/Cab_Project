package com.cabbooking.bookingservice.repository;

import com.cabbooking.bookingservice.model.Location;
import com.cabbooking.bookingservice.model.LocationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {
    
    /**
     * Find locations by type
     */
    List<Location> findByType(LocationType type);
    
    /**
     * Find locations by city
     */
    List<Location> findByCityIgnoreCase(String city);
    
    /**
     * Find locations by address containing text
     */
    List<Location> findByAddressContainingIgnoreCase(String address);
    
    /**
     * Find locations by city containing text
     */
    List<Location> findByCityContainingIgnoreCase(String city);
    
    /**
     * Find locations by address or city containing text
     */
    @Query("SELECT l FROM Location l WHERE " +
           "LOWER(l.address) LIKE LOWER(CONCAT('%', :searchText, '%')) OR " +
           "LOWER(l.city) LIKE LOWER(CONCAT('%', :searchText, '%')) OR " +
           "LOWER(l.landmark) LIKE LOWER(CONCAT('%', :searchText, '%'))")
    List<Location> findByAddressOrCityOrLandmarkContainingIgnoreCase(@Param("searchText") String searchText);
    
    /**
     * Find popular locations (most frequently used)
     */
    @Query("SELECT l FROM Location l WHERE l.type IN ('PICKUP', 'DROP') " +
           "ORDER BY l.lastUpdated DESC")
    List<Location> findPopularLocations();
    
    /**
     * Find locations within a radius (using approximate calculation)
     */
    @Query("SELECT l FROM Location l WHERE " +
           "ABS(l.latitude - :lat) <= :radius AND " +
           "ABS(l.longitude - :lng) <= :radius")
    List<Location> findLocationsWithinRadius(
        @Param("lat") Double latitude,
        @Param("lng") Double longitude,
        @Param("radius") Double radius
    );
} 