package com.nextcart.nextcart.seller_module.payment_module.exceptions;

public class InvalidOrderItemException extends RuntimeException {

    public InvalidOrderItemException(String message) {
        super(message);
    }
}