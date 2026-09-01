package com.nextcart.nextcart.order_module.exceptions;

public class OrderValidationException extends RuntimeException {

    public OrderValidationException(String message) {
        super(message);
    }
}