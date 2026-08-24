package com.nextcart.nextcart.product_module.discount.discountExceptions;

public class ProductVariantDiscountAlreadyExistsException
        extends RuntimeException {

    public ProductVariantDiscountAlreadyExistsException(String message) {
        super(message);
    }
}