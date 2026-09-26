package com.nextcart.nextcart.product_module.product_base.exceptions;

public class ProductValidationException extends RuntimeException {

    public ProductValidationException(String message) {
        super(message);
    }
}