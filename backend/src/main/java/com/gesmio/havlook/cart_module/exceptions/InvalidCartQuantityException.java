package com.gesmio.havlook.cart_module.exceptions;

public class InvalidCartQuantityException
        extends RuntimeException {

    public InvalidCartQuantityException(String message) {
        super(message);
    }
}