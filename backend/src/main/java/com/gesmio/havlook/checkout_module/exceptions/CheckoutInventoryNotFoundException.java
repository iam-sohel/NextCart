package com.gesmio.havlook.checkout_module.exceptions;

public class CheckoutInventoryNotFoundException extends RuntimeException {

    public CheckoutInventoryNotFoundException(String message) {
        super(message);
    }
}