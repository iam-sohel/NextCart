package com.nextcart.nextcart.product_module.productPrice.exceptions;

public class ProductVariantPriceAlreadyExistsException
        extends RuntimeException {

    public ProductVariantPriceAlreadyExistsException(String message) {
        super(message);
    }
}