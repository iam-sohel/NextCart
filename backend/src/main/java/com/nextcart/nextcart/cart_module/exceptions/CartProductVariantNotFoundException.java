package com.nextcart.nextcart.cart_module.exceptions;

public class CartProductVariantNotFoundException extends RuntimeException {

    public CartProductVariantNotFoundException(String message) {
        super(message);
    }
}