package com.gesmio.havlook.order_module.exceptions;

public class OrderCancellationException extends RuntimeException {

    public OrderCancellationException(String message) {
        super(message);
    }
}