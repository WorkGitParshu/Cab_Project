package com.cabbooking.paymentservice.controller;

import com.cabbooking.paymentservice.service.PaymentService;
import com.razorpay.Order;
import com.razorpay.RazorpayException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/create")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> data) {
        try {
            Long rideId = Long.parseLong(data.get("rideId").toString());
            Long userId = Long.parseLong(data.get("userId").toString());
            Double amount = Double.parseDouble(data.get("amount").toString());

            Order order = paymentService.createOrder(rideId, userId, amount);
            return ResponseEntity.ok(order.toString());
        } catch (RazorpayException | NumberFormatException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> data) {
        String orderId = data.get("razorpay_order_id");
        String paymentId = data.get("razorpay_payment_id");
        String signature = data.get("razorpay_signature");

        boolean isValid = paymentService.verifyPayment(orderId, paymentId, signature);

        if (isValid) {
            return ResponseEntity.ok(Map.of("status", "success"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("status", "failure"));
        }
    }
}
