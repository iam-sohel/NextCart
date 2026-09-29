package com.gesmio.havlook.discount_module.discountExceptions;

public class InvalidDiscountException
        extends RuntimeException {

    public InvalidDiscountException(String message) {
        super(message);
    }
}