package com.nextcart.nextcart.discount_module.discountExceptions;

public class ProductVariantNotFoundException extends RuntimeException {

    public ProductVariantNotFoundException(String message) {
        super(message);
    }
}