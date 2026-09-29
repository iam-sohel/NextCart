package com.gesmio.havlook.checkout_module;

public interface CheckoutService {

    CheckoutResponseDTO checkout(
            String userEmail,
            CheckoutRequestDTO request
    );
}