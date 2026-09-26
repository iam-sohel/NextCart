package com.nextcart.nextcart.seller_module.order_module.exceptions;

public class SellerOrderValidationException extends RuntimeException {

    public SellerOrderValidationException(String message) {
        super(message);
    }

    public SellerOrderValidationException(
            String message,
            Throwable cause
    ) {
        super(message, cause);
    }
}