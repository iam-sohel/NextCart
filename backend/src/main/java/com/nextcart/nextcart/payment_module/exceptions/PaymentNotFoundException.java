package com.nextcart.nextcart.payment_module.exceptions;

public class PaymentNotFoundException extends RuntimeException {

    public PaymentNotFoundException(String message) {
        super(message);
    }
}