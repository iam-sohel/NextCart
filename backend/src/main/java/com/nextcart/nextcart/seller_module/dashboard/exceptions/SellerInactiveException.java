package com.nextcart.nextcart.seller_module.dashboard.exceptions;

public class SellerInactiveException extends RuntimeException {

    public SellerInactiveException(String message) {
        super(message);
    }

    public SellerInactiveException(String message, Throwable cause) {
        super(message, cause);
    }
}