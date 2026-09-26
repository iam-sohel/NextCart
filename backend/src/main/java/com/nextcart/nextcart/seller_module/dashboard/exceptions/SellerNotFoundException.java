package com.nextcart.nextcart.seller_module.dashboard.exceptions;

public class SellerNotFoundException extends RuntimeException {

    public SellerNotFoundException(String message) {
        super(message);
    }

    public SellerNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}