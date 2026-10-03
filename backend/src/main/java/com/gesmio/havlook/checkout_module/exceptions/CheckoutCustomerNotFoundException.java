package com.gesmio.havlook.checkout_module.exceptions;

public class CheckoutCustomerNotFoundException extends RuntimeException {

    public CheckoutCustomerNotFoundException(String message) {
        super(message);
    }
}