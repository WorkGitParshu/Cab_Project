package com.cabbooking.bookingservice.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.cabbooking.bookingservice.dto.AssignedCabInfo;
import com.cabbooking.bookingservice.dto.BookingRequest;
import com.cabbooking.bookingservice.dto.Cab;
import com.cabbooking.bookingservice.dto.RideRequestDTO;
import com.cabbooking.bookingservice.model.Booking;
import com.cabbooking.bookingservice.model.Location;
import com.cabbooking.bookingservice.model.LocationType;
import com.cabbooking.bookingservice.repository.BookingRepository;



@Service
public class BookingService {
    
	@Autowired
	private RestTemplate restTemplate;

	@Value("${cab.service.url:http://localhost:8076}")  // Use your cab-service host/port
	private String cabServiceUrl;
	
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private GeocodingService geocodingService;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private DistanceCalculationService distanceCalculationService;
    
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }
    
    public Optional<Booking> getBookingById(Long id) {
        return bookingRepository.findById(id);
    }
    
    public List<Booking> getBookingsByUserId(Long userId) {
        return bookingRepository.findByUserId(userId);
    }
    
    public List<Booking> getBookingsByCabId(Long cabId) {
        return bookingRepository.findByCabId(cabId);
    }
    
    public List<Booking> getBookingsByStatus(Booking.BookingStatus status) {
        return bookingRepository.findByStatus(status);
    }
    
    public List<Booking> getBookingsByUserIdAndStatus(Long userId, Booking.BookingStatus status) {
        return bookingRepository.findByUserIdAndStatus(userId, status);
    }
    
    private Location parseLocationString(String latLngCommaString, LocationType type) {
        if (latLngCommaString == null || !latLngCommaString.contains(",")) {
            throw new IllegalArgumentException("Invalid location string: " + latLngCommaString);
        }
        String[] parts = latLngCommaString.split(",");
        double lat = Double.parseDouble(parts[0].trim());
        double lng = Double.parseDouble(parts[1].trim());
        Location location = new Location();
        location.setLatitude(lat);
        location.setLongitude(lng);
        location.setType(type);
        return location;
    }
    
    @Autowired
    private RideDispatchService rideDispatchService;
    @Autowired
    private BookingEventProducer bookingEventProducer;

    public Booking createBooking(BookingRequest request) {
        // Geocode addresses to get coordinates
//        Location pickupLocation = geocodingService.geocodeAddress(request.getPickupLocation(), LocationType.PICKUP);
//        Location dropLocation = geocodingService.geocodeAddress(request.getDropLocation(), LocationType.DROP);
        
        Location pickupLocation = parseLocationString(request.getPickupLocation(), LocationType.PICKUP);
        Location dropLocation = parseLocationString(request.getDropLocation(), LocationType.DROP);
        
        // Set human-readable addresses if provided
        if (request.getPickupAddress() != null) {
            pickupLocation.setAddress(request.getPickupAddress());
        }
        if (request.getDropAddress() != null) {
            dropLocation.setAddress(request.getDropAddress());
        }
        
        // Calculate distance automatically using coordinates
        double distance = distanceCalculationService.calculateDistance(pickupLocation, dropLocation);
        
        // Create booking with enhanced location data
        Booking booking = new Booking();
        booking.setUserId(request.getUserId());
        booking.setCabId(request.getCabId());
        booking.setPickupLocation(pickupLocation);
        booking.setDropLocation(dropLocation);
        booking.setDistance(distance);
        
        // Calculate fare based on distance and cab rates
        // In real app, this would call cab service to get rates
        double baseFare = 50.0;
        double perKmRate = 10.0;
        double fare = distanceCalculationService.calculateFare(distance, baseFare, perKmRate);
        booking.setFare(fare);
        
        booking.setStatus(Booking.BookingStatus.PENDING);
        booking.setBookingTime(LocalDateTime.now());
        
        Booking savedBooking = bookingRepository.save(booking);

        // Start the sequential dispatch process
        rideDispatchService.startDispatch(savedBooking);

        // KAFKA: Booking Created Event
        bookingEventProducer.sendBookingEvent(
            "booking.created",
            "New booking created for user #" + savedBooking.getUserId(),
            savedBooking.getId(),
            savedBooking
        );

        return savedBooking;
    }
    
    // NEW: Called when driver accepts the ride request
    public Booking acceptRideByDriver(Long bookingId, Long cabId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        Cab driverCab = null;
        // Fetch driver details from cab-service
        try {
            String cabUrl = cabServiceUrl + "/api/cabs/" + cabId;
            driverCab = restTemplate.getForObject(cabUrl, Cab.class);
            
            if (driverCab != null) {
                booking.setCabNumber(driverCab.getCabNumber());
                booking.setDriverName(driverCab.getDriverName());
                booking.setDriverPhone(driverCab.getDriverPhone());
                booking.setCabType(driverCab.getCabType());
            }
        } catch (Exception e) {
            System.err.println("Error fetching cab details for booking update: " + e.getMessage());
        }

        booking.setCabId(cabId);
        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        
        Booking updatedBooking = bookingRepository.save(booking);
        
        // Stop the dispatch loop as a driver has accepted
        rideDispatchService.processDriverAcceptance(updatedBooking.getId(), cabId);

        // KAFKA: Booking Accepted Event
        bookingEventProducer.sendBookingEvent(
            "booking.accepted",
            "Driver #" + cabId + " accepted booking #" + updatedBooking.getId(),
            updatedBooking.getId(),
            updatedBooking
        );

        // Notify cab-service about assignment
        RideRequestDTO rideReq = new RideRequestDTO(
            updatedBooking.getId(),
            updatedBooking.getPickupLocation().getLatitude(),
            updatedBooking.getPickupLocation().getLongitude(),
            updatedBooking.getDropLocation().getLatitude(),
            updatedBooking.getDropLocation().getLongitude(),
            updatedBooking.getUserId()
        );
        
        try {
            String url = cabServiceUrl + "/api/cabs/" + cabId + "/accept-ride";
            System.out.println("REST ACCEPT: POST to " + url);
            restTemplate.postForEntity(url, rideReq, Void.class);
            System.out.println(">>> DRIVER ASSIGNMENT NOTIFIED.");
        } catch (Exception ex) {
            System.err.println("Failed to notify cab-service about acceptance: " + ex.getMessage());
        }
        
        // Send WebSocket confirmation to User
        AssignedCabInfo assigned = new AssignedCabInfo();
        assigned.setBookingId(updatedBooking.getId());
        assigned.setUserId(updatedBooking.getUserId());
        assigned.setCabId(cabId);
        assigned.setPickupLat(updatedBooking.getPickupLocation().getLatitude());
        assigned.setPickupLng(updatedBooking.getPickupLocation().getLongitude());

        if (driverCab != null) {
            assigned.setDriverName(driverCab.getDriverName());
            assigned.setCabNumber(driverCab.getCabNumber());
            assigned.setModel(driverCab.getModel());
            assigned.setCabType(driverCab.getCabType());
        } else {
            // Fallback if cab service failed
            assigned.setDriverName(updatedBooking.getDriverName());
            assigned.setCabNumber(updatedBooking.getCabNumber());
        }

        System.out.println("Sending User Confirmation: " + assigned);
        
        messagingTemplate.convertAndSend(
            "/topic/user/" + updatedBooking.getUserId() + "/confirmation",
            assigned
        );
        
        return updatedBooking;
    }
    
    public Booking updateBookingStatus(Long id, Booking.BookingStatus status) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        booking.setStatus(status);
        
        if (status == Booking.BookingStatus.IN_PROGRESS) {
            booking.setPickupTime(LocalDateTime.now());
        } else if (status == Booking.BookingStatus.COMPLETED) {
            booking.setDropTime(LocalDateTime.now());
            // stop the dispatch loop
            rideDispatchService.processDriverAcceptance(id, booking.getCabId());
            
            // KAFKA: Ride Completed Event
            bookingEventProducer.sendBookingEvent(
                "ride.completed",
                "Ride #" + id + " completed successfully",
                id,
                booking
            );
        } else if (status == Booking.BookingStatus.CANCELLED) {
            rideDispatchService.processDriverAcceptance(id, null);
            
            // KAFKA: Booking Cancelled Event
            bookingEventProducer.sendBookingEvent(
                "booking.cancelled",
                "Booking #" + id + " has been cancelled",
                id,
                booking
            );
        }
        
        return bookingRepository.save(booking);
    }
    
    public Booking updateBooking(Long id, Booking bookingDetails) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        // Update locations if provided
        if (bookingDetails.getPickupLocation() != null) {
            booking.setPickupLocation(bookingDetails.getPickupLocation());
        }
        if (bookingDetails.getDropLocation() != null) {
            booking.setDropLocation(bookingDetails.getDropLocation());
        }
        
        // Recalculate distance and fare if locations changed
        if (bookingDetails.getPickupLocation() != null || bookingDetails.getDropLocation() != null) {
            double newDistance = distanceCalculationService.calculateDistance(
                booking.getPickupLocation(), booking.getDropLocation());
            booking.setDistance(newDistance);
            
            // Recalculate fare
            double baseFare = 50.0;
            double perKmRate = 10.0;
            double newFare = distanceCalculationService.calculateFare(newDistance, baseFare, perKmRate);
            booking.setFare(newFare);
        }
        
        return bookingRepository.save(booking);
    }
    
//    public Booking acceptBooking(Long bookingId, Long cabId) {
//        Booking booking = bookingRepository.findById(bookingId)
//                .orElseThrow(() -> new RuntimeException("Booking not found"));
//
//        // You might want to check booking status: if already accepted, throw/reject
//        if (booking.getCabId() != null && booking.getStatus() != Booking.BookingStatus.PENDING) {
//            throw new RuntimeException("Booking already accepted");
//        }
//
//        // Assign the cab and mark as CONFIRMED (or appropriate)
//        booking.setCabId(cabId);
//        booking.setStatus(Booking.BookingStatus.CONFIRMED); // or .IN_PROGRESS
//        return bookingRepository.save(booking);
//    }
    
    public Booking acceptBooking(Long bookingId, Long cabId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getCabId() != null && booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new RuntimeException("Booking already accepted");
        }

        booking.setCabId(cabId);
        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        Booking saved = bookingRepository.save(booking);
        
        // Stop the dispatch loop
        rideDispatchService.processDriverAcceptance(saved.getId(), cabId);
        
        System.out.println("**********Booking saved********");

        // ------------ Fetch real cab/driver info ------------ //
        String cabUrl = cabServiceUrl + "/api/cabs/" + cabId; // cabServiceUrl from config

        Cab driverCab = null;
        try {
            driverCab = restTemplate.getForObject(cabUrl, Cab.class);
        } catch (Exception e) {
            System.err.println("Error fetching cab info: "+e.getMessage());
        }

        AssignedCabInfo assigned = new AssignedCabInfo();
        assigned.setBookingId(saved.getId());
        assigned.setUserId(saved.getUserId());
        assigned.setCabId(cabId);

        if (driverCab != null) {
            assigned.setDriverName(driverCab.getDriverName());
            assigned.setCabNumber(driverCab.getCabNumber());
            assigned.setModel(driverCab.getModel());
            assigned.setCabType(driverCab.getCabType().toString());
            // ...add any field you like!
        }
        System.out.println("AssignedCabInfo to user: " + assigned);
        
        // send WebSocket to user as before:
        messagingTemplate.convertAndSend(
            "/topic/user/" + saved.getUserId() + "/confirmation",
            assigned
        );
        System.out.println("Notify user: /queue/user-" + saved.getUserId() + " " + assigned);
        return saved;
    }
    
    public void deleteBooking(Long id) {
        bookingRepository.deleteById(id);
    }
    
    public void cancelBooking(Long id) {
        updateBookingStatus(id, Booking.BookingStatus.CANCELLED);
    }
} 