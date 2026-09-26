package com.nextcart.nextcart.checkout_module.exceptions;

public class CheckoutCartEmptyException extends RuntimeException {

    public CheckoutCartEmptyException(String message) {
        super(message);
    }
}