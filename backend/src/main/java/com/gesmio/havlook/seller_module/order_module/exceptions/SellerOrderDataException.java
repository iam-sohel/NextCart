package com.gesmio.havlook.seller_module.order_module.exceptions;

public class SellerOrderDataException extends RuntimeException {

    public SellerOrderDataException(String message) {
        super(message);
    }

    public SellerOrderDataException(
            String message,
            Throwable cause
    ) {
        super(message, cause);
    }
}