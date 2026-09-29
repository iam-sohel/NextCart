package com.gesmio.havlook.product_module.productVariant.exceptions;

public class ProductVariantNotFoundException extends RuntimeException {

    public ProductVariantNotFoundException(String message) {
        super(message);
    }
}