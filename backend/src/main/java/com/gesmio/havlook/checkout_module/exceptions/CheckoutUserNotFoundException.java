package com.gesmio.havlook.checkout_module.exceptions;

public class CheckoutUserNotFoundException extends RuntimeException {

    public CheckoutUserNotFoundException(String message) {
        super(message);
    }
}