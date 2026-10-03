package com.gesmio.havlook.seller_module.inventory_module.exceptions;

public class InsufficientStockException extends RuntimeException {

    public InsufficientStockException(String message) {
        super(message);
    }
}