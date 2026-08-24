package com.nextcart.nextcart.product_module.exceptions;

public class ProductVariantPriceNotFoundException
        extends RuntimeException {

    public ProductVariantPriceNotFoundException(String message) {
        super(message);
    }
}