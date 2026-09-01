package com.nextcart.nextcart.cart_module.exceptions;

public class CartUserNotFoundException extends RuntimeException {

    public CartUserNotFoundException(String message) {
        super(message);
    }
}
