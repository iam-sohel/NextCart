package com.nextcart.nextcart.checkout_module;

import com.nextcart.nextcart.adcommon.dto.ApiResponse;
import com.nextcart.nextcart.auth_module.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/checkout")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class CheckoutController {

    private final CheckoutService checkoutService;

    /**
     * Checkout preview.
     *
     * Validates the customer's cart and addresses and
     * calculates the current checkout totals.
     *
     * This endpoint does NOT:
     * - create an order
     * - reserve inventory
     * - create a payment
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CheckoutResponseDTO>> checkout(
            Authentication authentication,
            @Valid @RequestBody CheckoutRequestDTO request
    ) {

        // -----------------------------------------------------
        // GET AUTHENTICATED CUSTOMER
        // -----------------------------------------------------

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new IllegalArgumentException(
                    "Authenticated customer is required"
            );
        }

        Object principal =
                authentication.getPrincipal();

        if (!(principal instanceof CustomUserDetails userDetails)) {

            throw new IllegalArgumentException(
                    "Authenticated customer details are unavailable"
            );
        }

        Long userId =
                userDetails.getUserId();

        if (userId == null ||
                userId <= 0) {

            throw new IllegalArgumentException(
                    "Authenticated customer ID is invalid"
            );
        }

        // -----------------------------------------------------
        // CHECKOUT
        // -----------------------------------------------------

        CheckoutResponseDTO response =
                checkoutService.checkout(
                        String.valueOf(userId),
                        request
                );

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(
                        new ApiResponse<>(
                                true,
                                "Checkout details calculated successfully",
                                response
                        )
                );
    }
}