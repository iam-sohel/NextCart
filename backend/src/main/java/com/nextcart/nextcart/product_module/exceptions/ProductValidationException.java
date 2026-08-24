package com.nextcart.nextcart.product_module.exceptions;

public class ProductValidationException extends RuntimeException {

    public ProductValidationException(String message) {
        super(message);
    }
}