package com.nextcart.nextcart.payment_module.controller;

import com.nextcart.nextcart.auth_module.security.CustomUserDetails;
import com.nextcart.nextcart.common.dto.CommonResponseDto;
import com.nextcart.nextcart.payment_module.dto.CreatePaymentRequestDTO;
import com.nextcart.nextcart.payment_module.dto.CreatePaymentResponseDTO;
import com.nextcart.nextcart.payment_module.dto.PaymentResponseDTO;
import com.nextcart.nextcart.payment_module.dto.VerifyPaymentRequestDTO;
import com.nextcart.nextcart.payment_module.exceptions.PaymentAuthenticationException;
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
    // CREATE PAYMENT
    // =========================================================

    @PostMapping("/create")
    @Operation(
            summary = "Create Razorpay payment order",
            description = "Creates a Razorpay order for the authenticated user's order"
    )
    public ResponseEntity<CommonResponseDto<CreatePaymentResponseDTO>> createPayment(
            Authentication authentication,
            @Valid @RequestBody CreatePaymentRequestDTO request
    ) {

        CustomUserDetails userDetails =
                getAuthenticatedUser(authentication);

        CreatePaymentResponseDTO response =
                paymentService.createRazorpayOrder(
                        userDetails.getUsername(),
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        new CommonResponseDto<>(
                                true,
                                "Payment order created successfully",
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
    public ResponseEntity<CommonResponseDto<PaymentResponseDTO>> verifyPayment(
            Authentication authentication,
            @Valid @RequestBody VerifyPaymentRequestDTO request
    ) {

        CustomUserDetails userDetails =
                getAuthenticatedUser(authentication);

        PaymentResponseDTO response =
                paymentService.verifyPayment(
                        userDetails.getUsername(),
                        request
                );

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(
                        new CommonResponseDto<>(
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
    public ResponseEntity<CommonResponseDto<PaymentResponseDTO>> getPaymentStatus(
            Authentication authentication,
            @PathVariable
            @Positive(message = "Order ID must be greater than zero")
            Long orderId
    ) {

        CustomUserDetails userDetails =
                getAuthenticatedUser(authentication);

        PaymentResponseDTO response =
                paymentService.getPaymentStatusByOrderId(
                        userDetails.getUsername(),
                        orderId
                );

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(
                        new CommonResponseDto<>(
                                true,
                                "Payment status fetched successfully",
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
            description = "Reconciles local payment status with Razorpay"
    )
    public ResponseEntity<CommonResponseDto<PaymentResponseDTO>> reconcilePayment(
            Authentication authentication,
            @RequestParam
            @Positive(message = "Order ID must be greater than zero")
            Long orderId
    ) {

        CustomUserDetails userDetails =
                getAuthenticatedUser(authentication);

        PaymentResponseDTO response =
                paymentService.reconcilePayment(
                        userDetails.getUsername(),
                        orderId
                );

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(
                        new CommonResponseDto<>(
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
            description = "Creates a full refund for a successful Razorpay payment"
    )
    public ResponseEntity<CommonResponseDto<PaymentResponseDTO>> refundPayment(
            Authentication authentication,
            @PathVariable
            @Positive(message = "Order ID must be greater than zero")
            Long orderId
    ) {

        CustomUserDetails userDetails =
                getAuthenticatedUser(authentication);

        PaymentResponseDTO response =
                paymentService.refundPayment(
                        userDetails.getUsername(),
                        orderId
                );

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(
                        new CommonResponseDto<>(
                                true,
                                "Payment refunded successfully",
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
            description = "Processes Razorpay payment and refund webhook events"
    )
    public ResponseEntity<Void> handleRazorpayWebhook(
            @RequestBody String payload,
            @RequestHeader("X-Razorpay-Signature") String signature
    ) {

        paymentService.handleRazorpayWebhook(
                payload,
                signature
        );

        return ResponseEntity.ok().build();
    }

    // =========================================================
    // AUTHENTICATED USER
    // =========================================================

    private CustomUserDetails getAuthenticatedUser(
            Authentication authentication
    ) {

        if (authentication == null ||
                !authentication.isAuthenticated() ||
                authentication.getPrincipal() == null) {

            throw new PaymentAuthenticationException(
                    "Authenticated user is required"
            );
        }

        if (!(authentication.getPrincipal()
                instanceof CustomUserDetails userDetails)) {

            throw new PaymentAuthenticationException(
                    "Invalid authenticated user"
            );
        }

        return userDetails;
    }
}