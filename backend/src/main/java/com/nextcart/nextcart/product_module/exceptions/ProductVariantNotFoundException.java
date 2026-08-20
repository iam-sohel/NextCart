package com.nextcart.nextcart.product_module.exceptions;

public class ProductVariantNotFoundException extends RuntimeException {

    public ProductVariantNotFoundException(String message) {
        super(message);
    }
}