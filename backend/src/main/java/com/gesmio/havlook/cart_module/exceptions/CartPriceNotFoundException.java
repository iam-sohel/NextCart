package com.gesmio.havlook.cart_module.exceptions;

public class CartPriceNotFoundException extends RuntimeException {

    public CartPriceNotFoundException(String message) {
        super(message);
    }
}