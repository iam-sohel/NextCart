package com.nextcart.nextcart.discount_module.discountExceptions;

public class ProductVariantDiscountNotFoundException
        extends RuntimeException {

    public ProductVariantDiscountNotFoundException(String message) {
        super(message);
    }
}