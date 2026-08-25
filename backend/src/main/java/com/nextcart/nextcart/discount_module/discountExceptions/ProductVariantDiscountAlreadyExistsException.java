package com.nextcart.nextcart.discount_module.discountExceptions;

public class ProductVariantDiscountAlreadyExistsException
        extends RuntimeException {

    public ProductVariantDiscountAlreadyExistsException(String message) {
        super(message);
    }
}