package com.nextcart.nextcart.cart_module.exceptions;

public class CartNotFoundException extends RuntimeException {

    public CartNotFoundException(String message) {
        super(message);
    }
}