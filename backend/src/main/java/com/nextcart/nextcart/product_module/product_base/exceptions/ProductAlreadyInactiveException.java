package com.nextcart.nextcart.product_module.product_base.exceptions;

public class ProductAlreadyInactiveException extends RuntimeException {

    public ProductAlreadyInactiveException(String message) {
        super(message);
    }
}