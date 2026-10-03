package com.gesmio.havlook.seller_module.payment_module.exceptions;

public class UnauthorizedSellerException extends RuntimeException {

    public UnauthorizedSellerException(String message) {
        super(message);
    }
}