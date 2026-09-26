package com.nextcart.nextcart.checkout_module.exceptions;

public class CheckoutCartNotFoundException extends RuntimeException {

    public CheckoutCartNotFoundException(String message) {
        super(message);
    }
}