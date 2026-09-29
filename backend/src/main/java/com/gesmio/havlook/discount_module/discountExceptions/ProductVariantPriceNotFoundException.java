package com.gesmio.havlook.discount_module.discountExceptions;

public class ProductVariantPriceNotFoundException extends RuntimeException {

    public ProductVariantPriceNotFoundException(String message) {
        super(message);
    }
}