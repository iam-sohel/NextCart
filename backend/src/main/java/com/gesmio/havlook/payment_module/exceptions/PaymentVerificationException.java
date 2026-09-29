package com.gesmio.havlook.payment_module.exceptions;

public class PaymentVerificationException extends RuntimeException {

    public PaymentVerificationException(String message) {
        super(message);
    }
}