package com.nextcart.nextcart.payment_module;

public class PaymentGatewayException extends RuntimeException {

    public PaymentGatewayException(
            String message,
            Throwable cause
    ) {
        super(message, cause);
    }
}