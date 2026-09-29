package com.gesmio.havlook.product_module.product_base.exceptions;

public class ProductAlreadyExistsException extends RuntimeException {

    public ProductAlreadyExistsException(String message) {
        super(message);
    }
}