package com.cabbooking.paymentservice.service;

import com.cabbooking.paymentservice.client.BookingServiceClient;
import com.cabbooking.paymentservice.model.Payment;
import com.cabbooking.paymentservice.repository.PaymentRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class PaymentService {

    @Value("${razorpay.api.key}")
    private String apiKey;

    @Value("${razorpay.api.secret}")
    private String apiSecret;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingServiceClient bookingServiceClient;

    @Autowired
    private com.cabbooking.paymentservice.service.PaymentEventProducer paymentEventProducer;

    public Order createOrder(Long rideId, Long userId, Double amount) throws RazorpayException {
        RazorpayClient razorpay = new RazorpayClient(apiKey, apiSecret);

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", (int) (amount * 100)); // amount in paise
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "ride_" + rideId);

        Order order = razorpay.orders.create(orderRequest);

        Payment payment = new Payment();
        payment.setRideId(rideId);
        payment.setUserId(userId);
        payment.setAmount(amount);
        payment.setRazorpayOrderId(order.get("id"));
        payment.setStatus(Payment.PaymentStatus.CREATED);
        paymentRepository.save(payment);

        // KAFKA: Payment Created Event
        paymentEventProducer.sendPaymentEvent(
            "payment.created",
            "Payment order created for ride #" + rideId,
            rideId,
            payment
        );

        return order;
    }

    @Transactional
    public boolean verifyPayment(String orderId, String paymentId, String signature) {
        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", orderId);
            options.put("razorpay_payment_id", paymentId);
            options.put("razorpay_signature", signature);

            boolean isVerified = Utils.verifyPaymentSignature(options, apiSecret);

            if (isVerified) {
                updatePaymentStatus(orderId, paymentId, signature, Payment.PaymentStatus.SUCCESS);
                return true;
            } else {
                updatePaymentStatus(orderId, paymentId, signature, Payment.PaymentStatus.FAILED);
                return false;
            }
        } catch (Exception e) {
            // KAFKA: Payment Failed Event (on exception)
            Optional<Payment> paymentOpt = paymentRepository.findByRazorpayOrderId(orderId);
            paymentOpt.ifPresent(payment -> {
                paymentEventProducer.sendPaymentEvent(
                    "payment.failed",
                    "Payment verification failed for ride #" + payment.getRideId(),
                    payment.getRideId(),
                    payment
                );
            });
            return false;
        }
    }

    private void updatePaymentStatus(String orderId, String paymentId, String signature, Payment.PaymentStatus status) {
        Optional<Payment> paymentOpt = paymentRepository.findByRazorpayOrderId(orderId);
        if (paymentOpt.isPresent()) {
            Payment payment = paymentOpt.get();
            payment.setRazorpayPaymentId(paymentId);
            payment.setRazorpaySignature(signature);
            payment.setStatus(status);
            payment.setUpdatedAt(LocalDateTime.now());
            paymentRepository.save(payment);

            if (status == Payment.PaymentStatus.SUCCESS) {
                // KAFKA: Payment Success Event
                paymentEventProducer.sendPaymentEvent(
                    "payment.success",
                    "Payment successful for ride #" + payment.getRideId(),
                    payment.getRideId(),
                    payment
                );

                // Update ride status in Booking Service
                try {
                    bookingServiceClient.updateBookingStatus(payment.getRideId(), "PAID");
                } catch (Exception e) {
                    // Log error but payment is already successful
                    System.err.println("Failed to update booking status for ride " + payment.getRideId());
                }
            } else if (status == Payment.PaymentStatus.FAILED) {
                // KAFKA: Payment Failed Event
                paymentEventProducer.sendPaymentEvent(
                    "payment.failed",
                    "Payment failed for ride #" + payment.getRideId(),
                    payment.getRideId(),
                    payment
                );
            }
        }
    }
}
