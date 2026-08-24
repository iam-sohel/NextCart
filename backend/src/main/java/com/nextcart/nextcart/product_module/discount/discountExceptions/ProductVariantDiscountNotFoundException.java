package com.nextcart.nextcart.product_module.discount.discountExceptions;

public class ProductVariantDiscountNotFoundException
        extends RuntimeException {

    public ProductVariantDiscountNotFoundException(String message) {
        super(message);
    }
}