package com.nextcart.nextcart.seller_module.payment_module.exceptions;

public class InvalidOrderException extends RuntimeException {

    public InvalidOrderException(String message) {
        super(message);
    }
}