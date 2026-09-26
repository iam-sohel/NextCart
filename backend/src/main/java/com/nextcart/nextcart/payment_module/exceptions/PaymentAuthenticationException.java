package com.nextcart.nextcart.payment_module.exceptions;

public class PaymentAuthenticationException extends RuntimeException {

    public PaymentAuthenticationException(String message) {
        super(message);
    }
}