package com.cabbooking.paymentservice.controller;

import com.cabbooking.paymentservice.service.PaymentService;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments/webhook")
public class WebhookController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping
    public ResponseEntity<String> handleWebhook(@RequestBody String payload, @RequestHeader("X-Razorpay-Signature") String signature) {
        // In production, verify the webhook signature using the webhook secret
        // For now, we'll process the payload
        
        JSONObject event = new JSONObject(payload);
        String eventType = event.getString("event");

        if ("payment.captured".equals(eventType)) {
            JSONObject paymentEntity = event.getJSONObject("payload").getJSONObject("payment").getJSONObject("entity");
            String orderId = paymentEntity.getString("order_id");
            String paymentId = paymentEntity.getString("id");
            // Razorpay webhook doesn't provide signature here in the entity, 
            // but we can mark as SUCCESS if we trust the source.
            paymentService.verifyPayment(orderId, paymentId, "WEBHOOK_VERIFIED");
        }

        return ResponseEntity.ok("Received");
    }
}
