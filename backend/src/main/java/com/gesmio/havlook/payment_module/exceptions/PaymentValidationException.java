package com.gesmio.havlook.payment_module.exceptions;

public class PaymentValidationException extends RuntimeException {

    public PaymentValidationException(String message) {
        super(message);
    }
}