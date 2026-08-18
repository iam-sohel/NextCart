package com.nextcart.nextcart.product_module.exceptions;

public class ProductVariantAlreadyExistsException
        extends RuntimeException {

    public ProductVariantAlreadyExistsException(String message) {
        super(message);
    }
}