package com.gesmio.havlook.checkout_module.exceptions;

public class CheckoutCartNotFoundException extends RuntimeException {

    public CheckoutCartNotFoundException(String message) {
        super(message);
    }
}