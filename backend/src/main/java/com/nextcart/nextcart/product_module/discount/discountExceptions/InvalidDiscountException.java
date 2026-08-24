package com.nextcart.nextcart.product_module.discount.discountExceptions;

public class InvalidDiscountException
        extends RuntimeException {

    public InvalidDiscountException(String message) {
        super(message);
    }
}