package com.nextcart.nextcart.checkout_module.exceptions;

public class CheckoutCustomerNotFoundException extends RuntimeException {

    public CheckoutCustomerNotFoundException(String message) {
        super(message);
    }
}