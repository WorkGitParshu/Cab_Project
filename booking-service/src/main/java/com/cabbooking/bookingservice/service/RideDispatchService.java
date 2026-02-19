package com.cabbooking.bookingservice.service;

import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.cabbooking.bookingservice.dto.Cab;
import com.cabbooking.bookingservice.dto.RideRequestDTO;
import com.cabbooking.bookingservice.model.Booking;
import com.cabbooking.bookingservice.repository.BookingRepository;

@Service
public class RideDispatchService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;


    
    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${cab.service.url:http://localhost:8076}")
    private String cabServiceUrl;

    // Maps bookingId -> Queue of Driver IDs to try
    private final Map<Long, Queue<Cab>> bookingDriverQueue = new ConcurrentHashMap<>();
    
    // Maps bookingId -> Current Driver ID being waiting on
    private final Map<Long, Long> currentDriverPending = new ConcurrentHashMap<>();

    // Maps bookingId -> Scheduled Timeout Task
    private final Map<Long, ScheduledFuture<?>> dispatchTasks = new ConcurrentHashMap<>();

    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(4);

    /**
     * Start the dispatch process for a new booking.
     * 1. Fetch available drivers suitable for the booking.
     * 2. Add them to a queue.
     * 3. Trigger the first dispatch.
     */
    public void startDispatch(Booking booking) {
        // Fetch available drivers from cab-service
        // Ideally filter by radius and type. keeping it simple for now (all available)
        // You might want to add a query param for radius or filters in the future.
        String url = cabServiceUrl + "/api/cabs/nearby?latitude=" + booking.getPickupLocation().getLatitude() 
                   + "&longitude=" + booking.getPickupLocation().getLongitude() + "&radiusKm=50000.0"; 
        
        try {
            // We use an array because List<Cab> with generics is tricky with RestTemplate
            Cab[] availableCabs = restTemplate.getForObject(url, Cab[].class);
            
            if (availableCabs == null || availableCabs.length == 0) {
                notifyUserNoDrivers(booking.getUserId(), booking.getId());
                return;
            }

            Queue<Cab> drivers = new ConcurrentLinkedQueue<>();
            for (Cab cab : availableCabs) {
                drivers.add(cab);
            }
            bookingDriverQueue.put(booking.getId(), drivers);
            
            // Start attempting drivers
            attemptNextDriver(booking.getId());

        } catch (Exception e) {
            e.printStackTrace();
            notifyUserError(booking.getUserId(), "Failed to fetch drivers: " + e.getMessage());
        }
    }

    /**
     * Try the next driver in the queue.
     */
    private void attemptNextDriver(Long bookingId) {
        Queue<Cab> drivers = bookingDriverQueue.get(bookingId);
        Booking booking = bookingRepository.findById(bookingId).orElse(null);

        if (booking == null || booking.getStatus() != Booking.BookingStatus.PENDING) {
            // Booking cancelled or already accepted
            cleanup(bookingId);
            return;
        }

        if (drivers == null || drivers.isEmpty()) {
            notifyUserNoDrivers(booking.getUserId(), bookingId);
            cleanup(bookingId);
            return;
        }

        Cab nextDriver = drivers.poll();
        currentDriverPending.put(bookingId, nextDriver.getId());

        // Notify Driver via WebSocket
        RideRequestDTO requestDTO = new RideRequestDTO(
            booking.getId(),
            booking.getPickupLocation().getLatitude(),
            booking.getPickupLocation().getLongitude(),
            booking.getDropLocation().getLatitude(),
            booking.getDropLocation().getLongitude(),
            booking.getUserId(),
            booking.getDistance(),
            booking.getFare(),
            booking.getPickupLocation().getAddress(),
            booking.getDropLocation().getAddress()
        );
        // Add fare/distance if DTO supports it or extra fields map
        
        messagingTemplate.convertAndSend("/topic/driver/" + nextDriver.getId() + "/ride-request", requestDTO);
        System.out.println(">>> Dispatching booking " + bookingId + " to driver " + nextDriver.getId());

        // Schedule timeout (120 seconds for testing)
        ScheduledFuture<?> task = scheduler.schedule(() -> {
            handleDriverTimeout(bookingId, nextDriver.getId());
        }, 120, TimeUnit.SECONDS);

        dispatchTasks.put(bookingId, task);
    }

    /**
     * Called when 15s expires for a driver.
     */
    private void handleDriverTimeout(Long bookingId, Long driverId) {
        // If we are still waiting for this driver
        if (currentDriverPending.containsKey(bookingId) && currentDriverPending.get(bookingId).equals(driverId)) {
            System.out.println("!!! Timeout for driver " + driverId + " on booking " + bookingId);
            // Try next
            attemptNextDriver(bookingId);
        }
    }

    /**
     * Called by Controller when driver REJECTS.
     */
    public void processDriverRejection(Long bookingId, Long driverId) {
        // Cancel the timeout task
        cancelTimeoutTask(bookingId);

        // Check if this was the current driver
        if (currentDriverPending.containsKey(bookingId) && currentDriverPending.get(bookingId).equals(driverId)) {
            System.out.println("XXX Driver " + driverId + " REJECTED booking " + bookingId);
            attemptNextDriver(bookingId);
        }
    }

    /**
     * Called by Controller when driver ACCEPTS.
     */
    public void processDriverAcceptance(Long bookingId, Long driverId) {
        cancelTimeoutTask(bookingId);
        cleanup(bookingId);
        
        // The actual booking update is handled by BookingService.acceptRideByDriver
        // We just ensure the dispatch loop stops.
        System.out.println("### Driver " + driverId + " ACCEPTED booking " + bookingId + ". Dispatch loop ended.");
    }
    
    private void cancelTimeoutTask(Long bookingId) {
        ScheduledFuture<?> task = dispatchTasks.get(bookingId);
        if (task != null) {
            task.cancel(false);
            dispatchTasks.remove(bookingId);
        }
    }

    private void cleanup(Long bookingId) {
        bookingDriverQueue.remove(bookingId);
        currentDriverPending.remove(bookingId);
        cancelTimeoutTask(bookingId);
    }

    private void notifyUserNoDrivers(Long userId, Long bookingId) {
        messagingTemplate.convertAndSend("/topic/user/" + userId + "/error", 
            Map.of(
                "status", "NO_DRIVERS",
                "message", "No drivers accepted your request at this time.",
                "bookingId", bookingId
            )
        );
    }

    private void notifyUserError(Long userId, String message) {
        messagingTemplate.convertAndSend("/topic/user/" + userId + "/error", 
            Map.of(
                "status", "ERROR",
                "message", message
            )
        );
    }
    
    public RideRequestDTO getPendingInviteForDriver(Long driverId) {
        // Iterate through active dispatches to see if this driver is currently being requested
        for (Map.Entry<Long, Long> entry : currentDriverPending.entrySet()) {
            if (entry.getValue().equals(driverId)) {
                Long bookingId = entry.getKey();
                // Reconstruct the RideRequestDTO for this booking
                // In a real app, you might cache the DTO or fetch from DB
                Booking booking = bookingRepository.findById(bookingId).orElse(null);
                if (booking != null) {
                     return new RideRequestDTO(
                        booking.getId(),
                        booking.getPickupLocation().getLatitude(),
                        booking.getPickupLocation().getLongitude(),
                        booking.getDropLocation().getLatitude(),
                        booking.getDropLocation().getLongitude(),
                        booking.getUserId(),
                        booking.getDistance(),
                        booking.getFare(),
                        booking.getPickupLocation().getAddress(),
                        booking.getDropLocation().getAddress()
                    );
                }
            }
        }
        return null;
    }
}
