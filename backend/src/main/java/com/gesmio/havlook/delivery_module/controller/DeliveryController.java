
package com.gesmio.havlook.delivery_module.controller;

import com.gesmio.havlook.delivery_module.service.DeliveryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/delivery")
public class DeliveryController {

    private final DeliveryService deliveryService;

    public DeliveryController(DeliveryService deliveryService) {
        this.deliveryService = deliveryService;
    }

    @GetMapping("/charge")
    public ResponseEntity<DeliveryChargeResponse> calculateDeliveryCharge(
            @RequestParam BigDecimal orderAmount) {

        BigDecimal deliveryFee =
                deliveryService.calculateDeliveryFee(orderAmount);

        DeliveryChargeResponse response =
                new DeliveryChargeResponse(orderAmount, deliveryFee);

        return ResponseEntity.ok(response);
    }

    public record DeliveryChargeResponse(
            BigDecimal orderAmount,
            BigDecimal deliveryFee) {
    }
}
