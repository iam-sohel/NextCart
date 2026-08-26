package com.nextcart.nextcart.checkout_module;

import com.nextcart.nextcart.adcommon.dto.ApiResponse;
import com.nextcart.nextcart.checkout_module.CheckoutRequestDTO;
import com.nextcart.nextcart.checkout_module.CheckoutResponseDTO;
import com.nextcart.nextcart.checkout_module.CheckoutService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/checkout")
@RequiredArgsConstructor
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

        String userEmail =
                authentication.getName();

        CheckoutResponseDTO response =
                checkoutService.checkout(
                        userEmail,
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