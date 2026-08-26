package com.nextcart.nextcart.order_module.exceptions;

public class OrderCancellationException extends RuntimeException {

    public OrderCancellationException(String message) {
        super(message);
    }
}