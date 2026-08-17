package com.nextcart.nextcart.payment_module.controller;

import com.nextcart.nextcart.adcommon.dto.ApiResponse;
import com.nextcart.nextcart.payment_module.dto.*;
import com.nextcart.nextcart.payment_module.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Payment Management", description = "APIs for Razorpay Payment Integration & Verification")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create")
    @Operation(summary = "Create Razorpay Order for Checkout")
    public ResponseEntity<ApiResponse<CreatePaymentResponseDTO>> createPayment(
            Authentication authentication,
            @Valid @RequestBody CreatePaymentRequestDTO requestDto) {

        CreatePaymentResponseDTO response = paymentService.createRazorpayOrder(authentication.getName(), requestDto);
        return new ResponseEntity<>(
                new ApiResponse<>(true, "Payment initialized successfully", response),
                HttpStatus.CREATED
        );
    }

    @PostMapping("/verify")
    @Operation(summary = "Verify Razorpay Payment Signature")
    public ResponseEntity<ApiResponse<PaymentResponseDTO>> verifyPayment(
            Authentication authentication,
            @Valid @RequestBody VerifyPaymentRequestDTO requestDto) {

        PaymentResponseDTO response = paymentService.verifyPayment(authentication.getName(), requestDto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Payment verified successfully", response));
    }

    @GetMapping("/order/{orderId}")
    @Operation(summary = "Get Payment Status by Order ID")
    public ResponseEntity<ApiResponse<PaymentResponseDTO>> getPaymentStatus(
            Authentication authentication,
            @PathVariable("orderId") Long orderId) {

        PaymentResponseDTO response = paymentService.getPaymentStatusByOrderId(authentication.getName(), orderId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Payment status retrieved successfully", response));
    }

    @PostMapping("/reconcile")
    @Operation(summary = "Reconcile payment status directly from Razorpay Gateway")
    public ResponseEntity<ApiResponse<PaymentResponseDTO>> reconcilePayment(
            Authentication authentication,
            @RequestParam("orderId") Long orderId) {

        PaymentResponseDTO response = paymentService.reconcilePayment(authentication.getName(), orderId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Payment reconciled successfully", response));
    }

    @PostMapping("/webhook/razorpay")
    @Operation(summary = "Razorpay Webhook listener for asynchronous events")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("X-Razorpay-Signature") String signature) {

        paymentService.handleRazorpayWebhook(payload, signature);
        return ResponseEntity.ok("Webhook processed");
    }
}
