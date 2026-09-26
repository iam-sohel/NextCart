package com.nextcart.nextcart.product_module.productVariant.exceptions;

public class ProductVariantAlreadyExistsException
        extends RuntimeException {

    public ProductVariantAlreadyExistsException(String message) {
        super(message);
    }
}