package com.nextcart.nextcart.product_module.product_base.exceptions;

public class ProductAlreadyActiveException extends RuntimeException {

    public ProductAlreadyActiveException(String message) {
        super(message);
    }
}