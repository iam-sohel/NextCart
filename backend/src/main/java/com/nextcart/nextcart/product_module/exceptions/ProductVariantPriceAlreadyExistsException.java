package com.nextcart.nextcart.product_module.exceptions;

public class ProductVariantPriceAlreadyExistsException
        extends RuntimeException {

    public ProductVariantPriceAlreadyExistsException(String message) {
        super(message);
    }
}