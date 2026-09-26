package com.nextcart.nextcart.checkout_module.exceptions;

public class CheckoutUserNotFoundException extends RuntimeException {

    public CheckoutUserNotFoundException(String message) {
        super(message);
    }
}