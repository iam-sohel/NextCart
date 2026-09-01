package com.nextcart.nextcart.payment_module;


public class PaymentVerificationException extends RuntimeException {

    public PaymentVerificationException(String message) {
        super(message);
    }

    public PaymentVerificationException(
            String message,
            Throwable cause
    ) {
        super(message, cause);
    }
}