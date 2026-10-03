package com.gesmio.havlook.seller_module.payment_module.exceptions;

public class SellerInactiveException extends RuntimeException {

    public SellerInactiveException(String message) {
        super(message);
    }
}