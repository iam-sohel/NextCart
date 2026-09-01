package com.nextcart.nextcart.payment_module.controller;

import com.nextcart.nextcart.adcommon.dto.ApiResponse;
import com.nextcart.nextcart.payment_module.dto.CreatePaymentRequestDTO;
import com.nextcart.nextcart.payment_module.dto.CreatePaymentResponseDTO;
import com.nextcart.nextcart.payment_module.dto.PaymentResponseDTO;
import com.nextcart.nextcart.payment_module.dto.VerifyPaymentRequestDTO;
import com.nextcart.nextcart.payment_module.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Validated
@Tag(
        name = "Payment Management",
        description = "APIs for Razorpay payment creation, verification, reconciliation and webhooks"
)
public class PaymentController {

    private final PaymentService paymentService;


    // =========================================================
    // CREATE RAZORPAY ORDER
    // =========================================================

    @PostMapping("/create")
    @Operation(
            summary = "Create Razorpay payment order",
            description = "Creates a Razorpay order for an existing pending NextCart order"
    )
    public ResponseEntity<ApiResponse<CreatePaymentResponseDTO>> createPayment(
            Authentication authentication,
            @Valid @RequestBody CreatePaymentRequestDTO requestDto
    ) {

        String userEmail =
                getAuthenticatedUser(authentication);

        CreatePaymentResponseDTO response =
                paymentService.createRazorpayOrder(
                        userEmail,
                        requestDto
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        new ApiResponse<>(
                                true,
                                "Payment initialized successfully",
                                response
                        )
                );
    }


    // =========================================================
    // VERIFY PAYMENT
    // =========================================================

    @PostMapping("/verify")
    @Operation(
            summary = "Verify Razorpay payment",
            description = "Verifies Razorpay payment signature and confirms the order"
    )
    public ResponseEntity<ApiResponse<PaymentResponseDTO>> verifyPayment(
            Authentication authentication,
            @Valid @RequestBody VerifyPaymentRequestDTO requestDto
    ) {

        String userEmail =
                getAuthenticatedUser(authentication);

        PaymentResponseDTO response =
                paymentService.verifyPayment(
                        userEmail,
                        requestDto
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Payment verified successfully",
                        response
                )
        );
    }


    // =========================================================
    // GET PAYMENT STATUS
    // =========================================================

    @GetMapping("/order/{orderId}")
    @Operation(
            summary = "Get payment status",
            description = "Returns payment status for the authenticated user's order"
    )
    public ResponseEntity<ApiResponse<PaymentResponseDTO>> getPaymentStatus(
            Authentication authentication,
            @PathVariable("orderId")
            @Positive(message = "Order ID must be greater than zero")
            Long orderId
    ) {

        String userEmail =
                getAuthenticatedUser(authentication);

        PaymentResponseDTO response =
                paymentService.getPaymentStatusByOrderId(
                        userEmail,
                        orderId
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Payment status retrieved successfully",
                        response
                )
        );
    }


    // =========================================================
    // RECONCILE PAYMENT
    // =========================================================

    @PostMapping("/reconcile")
    @Operation(
            summary = "Reconcile payment",
            description = "Synchronizes local payment state with Razorpay"
    )
    public ResponseEntity<ApiResponse<PaymentResponseDTO>> reconcilePayment(
            Authentication authentication,
            @RequestParam("orderId")
            @Positive(message = "Order ID must be greater than zero")
            Long orderId
    ) {

        String userEmail =
                getAuthenticatedUser(authentication);

        PaymentResponseDTO response =
                paymentService.reconcilePayment(
                        userEmail,
                        orderId
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Payment reconciled successfully",
                        response
                )
        );
    }


    // =========================================================
    // REFUND PAYMENT
    // =========================================================

    @PostMapping("/order/{orderId}/refund")
    @Operation(
            summary = "Refund payment",
            description = "Initiates a full refund for an eligible successful payment"
    )
    public ResponseEntity<ApiResponse<PaymentResponseDTO>> refundPayment(
            Authentication authentication,
            @PathVariable("orderId")
            @Positive(message = "Order ID must be greater than zero")
            Long orderId
    ) {

        String userEmail =
                getAuthenticatedUser(authentication);

        PaymentResponseDTO response =
                paymentService.refundPayment(
                        userEmail,
                        orderId
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Refund initiated successfully",
                        response
                )
        );
    }


    // =========================================================
    // RAZORPAY WEBHOOK
    // =========================================================

    @PostMapping("/webhook/razorpay")
    @Operation(
            summary = "Handle Razorpay webhook",
            description = "Receives asynchronous payment and refund events from Razorpay"
    )
    public ResponseEntity<Void> handleWebhook(
            @RequestBody String payload,
            @RequestHeader(
                    name = "X-Razorpay-Signature",
                    required = true
            )
            String signature
    ) {

        paymentService.handleRazorpayWebhook(
                payload,
                signature
        );

        /*
         * Razorpay only needs an HTTP success response.
         */
        return ResponseEntity.ok().build();
    }


    // =========================================================
    // AUTHENTICATED USER
    // =========================================================

    private String getAuthenticatedUser(
            Authentication authentication
    ) {

        if (authentication == null ||
                !authentication.isAuthenticated() ||
                authentication.getName() == null ||
                authentication.getName().isBlank()) {

            throw new IllegalStateException(
                    "Authenticated user is required"
            );
        }

        return authentication.getName();
    }
}

