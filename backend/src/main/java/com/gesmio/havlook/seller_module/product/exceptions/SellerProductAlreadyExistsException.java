package com.gesmio.havlook.seller_module.product.exceptions;

public class SellerProductAlreadyExistsException extends RuntimeException {

    public SellerProductAlreadyExistsException(String message) {
        super(message);
    }
}