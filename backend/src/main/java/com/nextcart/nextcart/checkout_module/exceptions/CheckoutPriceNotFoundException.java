package com.nextcart.nextcart.checkout_module.exceptions;

public class CheckoutPriceNotFoundException extends RuntimeException {

    public CheckoutPriceNotFoundException(String message) {
        super(message);
    }
}