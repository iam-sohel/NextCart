package com.nextcart.nextcart.cart_module.exceptions;

public class CartItemNotFoundException extends RuntimeException {

    public CartItemNotFoundException(String message) {
        super(message);
    }
}