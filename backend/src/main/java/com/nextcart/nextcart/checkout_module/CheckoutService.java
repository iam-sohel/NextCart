package com.nextcart.nextcart.checkout_module;

public interface CheckoutService {

    CheckoutResponseDTO checkout(
            String userEmail,
            CheckoutRequestDTO request
    );
}