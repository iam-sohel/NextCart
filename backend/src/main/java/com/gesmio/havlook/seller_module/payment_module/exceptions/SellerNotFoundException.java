package com.gesmio.havlook.seller_module.payment_module.exceptions;

public class SellerNotFoundException extends RuntimeException {

    public SellerNotFoundException(String message) {
        super(message);
    }
}