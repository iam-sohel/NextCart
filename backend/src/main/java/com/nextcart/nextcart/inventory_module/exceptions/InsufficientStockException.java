package com.nextcart.nextcart.inventory_module.exceptions;

public class InsufficientStockException extends RuntimeException {

    public InsufficientStockException(String message) {
        super(message);
    }
}