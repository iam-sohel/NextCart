package com.nextcart.nextcart.cart_module.exceptions;

public class CartProductNotFoundException extends RuntimeException {

    public CartProductNotFoundException(String message) {
        super(message);
    }
}