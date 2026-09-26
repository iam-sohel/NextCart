package com.nextcart.nextcart.discount_module.discountExceptions;

public class ProductVariantPriceNotFoundException extends RuntimeException {

    public ProductVariantPriceNotFoundException(String message) {
        super(message);
    }
}