package com.gesmio.havlook.discount_module.discountExceptions;

public class ProductVariantDiscountAlreadyExistsException
        extends RuntimeException {

    public ProductVariantDiscountAlreadyExistsException(String message) {
        super(message);
    }
}